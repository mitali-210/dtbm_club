import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { User, TrendingUp, Trophy, Award, MapPin, Zap, Target, Flag, ExternalLink, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { fetchEventCertificate, fetchEventTicket, fetchEvents } from '../lib/api';
import { QRTicket } from '../components/QRTicket';
import { toast } from 'sonner';

const GOOGLE_FORM_URL = 'https://forms.gle/irdm9MH6L6Hy2Fpy5';
const MILES_PER_KILOMETER = 0.621371;
const FIVE_K_MILES = 5 * MILES_PER_KILOMETER;
const TEN_K_MILES = 10 * MILES_PER_KILOMETER;
const HALF_MARATHON_MILES = 13.1094;

type ActivityLike = {
  distance?: number | string;
  duration?: number | string;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getMedalUnlocks(activities: ActivityLike[]) {
  const hasFirst5K = activities.some((activity) => toNumber(activity.distance) >= FIVE_K_MILES);
  const hasFirst10K = activities.some((activity) => toNumber(activity.distance) >= TEN_K_MILES);
  const hasSub25FiveK = activities.some(
    (activity) => toNumber(activity.distance) >= FIVE_K_MILES && toNumber(activity.duration) > 0 && toNumber(activity.duration) <= 25
  );
  const hasHalfMarathon = activities.some((activity) => toNumber(activity.distance) >= HALF_MARATHON_MILES);

  return {
    hasFirst5K,
    hasFirst10K,
    hasSub25FiveK,
    hasHalfMarathon,
  };
}

export function Profile() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user) {
      refreshProfile();
    }
  }, [loading, user?.id]);

  const registeredEventIds = useMemo(() => profile?.registeredEvents || [], [profile?.registeredEvents]);

  const downloadCertificate = async (eventId: string) => {
    try {
      const result = await fetchEventCertificate(eventId);
      const certificate = result?.certificate;
      const content = [
        'DTBM RUN CLUB - FINISHER CERTIFICATE',
        `Certificate ID: ${certificate?.certificateId || ''}`,
        `Runner: ${certificate?.runnerName || ''}`,
        `Event: ${certificate?.eventName || ''}`,
        `Distance: ${certificate?.distance || ''}`,
        `Level: ${certificate?.level || ''}`,
        `Checked In: ${certificate?.checkedInAt || ''}`,
        `Issued At: ${certificate?.issuedAt || ''}`,
      ].join('\n');

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificate?.certificateId || 'dtbm-certificate'}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Certificate downloaded');
    } catch (error: any) {
      toast.error(error?.message || 'Certificate not available yet');
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadTickets = async () => {
      if (!user || registeredEventIds.length === 0) {
        if (isActive) {
          setTickets([]);
          setTicketsLoading(false);
        }
        return;
      }

      setTicketsLoading(true);

      try {
        const events = await fetchEvents();
        const eventsMap = new Map((events || []).map((event: any) => [event.id, event]));

        const ticketResults = await Promise.all(
          registeredEventIds.map(async (eventId) => {
            try {
              const ticket = await fetchEventTicket(eventId);
              if (!ticket) return null;
              return {
                ...ticket,
                event: eventsMap.get(eventId) || null,
              };
            } catch {
              return null;
            }
          })
        );

        if (isActive) {
          setTickets(ticketResults.filter(Boolean));
        }
      } finally {
        if (isActive) {
          setTicketsLoading(false);
        }
      }
    };

    loadTickets();

    return () => {
      isActive = false;
    };
  }, [user?.id, registeredEventIds.join(',')]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl font-['Bebas_Neue'] tracking-wider">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Create a default profile if none exists
  const userProfile = profile || {
    id: user.id,
    name: user.name || 'Runner',
    email: user.email,
    joinedAt: new Date().toISOString(),
    totalMiles: 0,
    totalRuns: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyMiles: 0,
    fastest5k: null,
    longestRun: 0,
    medals: [],
    registeredEvents: [],
    activities: []
  };

  const activities = userProfile.activities || [];
  const attendedActivities = useMemo(
    () => (userProfile.activities || []).filter((activity: any) => activity?.source === 'event-attendance').slice().reverse(),
    [userProfile.activities]
  );
  const medalUnlocks = getMedalUnlocks(activities);
  const medals = [
    {
      id: 'first-5k',
      title: 'First 5K',
      subtitle: 'Complete your first 5K run',
      unlocked: medalUnlocks.hasFirst5K,
      accent: 'from-white to-[#B3B3B3] text-black',
      icon: <Award size={26} />,
    },
    {
      id: 'first-10k',
      title: 'First 10K',
      subtitle: 'Finish your first 10K distance',
      unlocked: medalUnlocks.hasFirst10K,
      accent: 'from-[#E6E6E6] to-[#8A8A8A] text-black',
      icon: <Trophy size={26} />,
    },
    {
      id: '5k-under-25',
      title: '5K Under 25',
      subtitle: 'Run 5K in 25 minutes or less',
      unlocked: medalUnlocks.hasSub25FiveK,
      accent: 'from-[#D9D9D9] to-[#707070] text-black',
      icon: <Zap size={26} />,
    },
    {
      id: 'first-half-marathon',
      title: 'First Half Marathon',
      subtitle: 'Complete 21.1K / 13.1 mi',
      unlocked: medalUnlocks.hasHalfMarathon,
      accent: 'from-[#CCCCCC] to-[#5A5A5A] text-black',
      icon: <Flag size={26} />,
    },
  ];
  const unlockedCount = medals.filter((medal) => medal.unlocked).length;

  return (
    <div className="min-h-screen bg-black pt-28 md:pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-[1440px] mx-auto">
        {/* PROFILE HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6 md:p-12 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            {/* Profile Photo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#111111] border-2 border-white flex items-center justify-center flex-shrink-0">
              <User size={48} className="text-white md:w-16 md:h-16" />
            </div>
            
            {/* Runner Info */}
            <div className="flex-1">
              <h1 className="font-['Bebas_Neue'] text-4xl md:text-6xl text-white mb-2 tracking-wide">{userProfile.name}</h1>
              <div className="flex flex-wrap items-center gap-3 md:gap-6 text-[#B3B3B3] text-sm md:text-lg mb-3">
                <span className="flex items-center gap-2">
                  <MapPin size={18} />
                  Location Not Set
                </span>
                <span>•</span>
                <span>Member since {new Date(userProfile.joinedAt).getFullYear()}</span>
              </div>
              <div className="inline-block px-4 py-2 bg-white text-black font-medium rounded-lg text-sm">
                {userProfile.totalMiles > 100 ? 'Advanced Runner' : userProfile.totalMiles > 50 ? 'Intermediate Runner' : 'Beginner Runner'}
              </div>
            </div>

            {/* Submit Activity Button */}
            <div className="w-full md:w-auto">
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-black rounded-lg font-medium transition-all hover:bg-[#B3B3B3] flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <ExternalLink size={16} />
                Submit Activity
              </a>
              <p className="text-[#B3B3B3] text-xs mt-2 text-center">via Google Form</p>
            </div>
          </div>
        </motion.div>

        {/* PERSONAL RUNNING STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
          <LargeStatCard
            label="Total Miles"
            value={userProfile.totalMiles || 0}
            suffix="mi"
            delay={0.1}
          />
          <LargeStatCard
            label="Events"
            value={userProfile.registeredEvents?.length || 0}
            suffix=""
            delay={0.15}
          />
          <LargeStatCard
            label="Total Runs"
            value={userProfile.totalRuns || 0}
            suffix=""
            delay={0.2}
          />
          <LargeStatCard
            label="Fastest 5K"
            value={userProfile.fastest5k || '--:--'}
            suffix=""
            delay={0.25}
            small
          />
          <LargeStatCard
            label="Longest Run"
            value={userProfile.longestRun || 0}
            suffix="mi"
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {/* RUNNING STREAK TRACKER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-8"
          >
            <h2 className="font-['Bebas_Neue'] text-3xl text-white mb-8 tracking-wide">Running Streak</h2>
            
            <div className="space-y-6">
              <StreakItem
                label="Current Streak"
                value={userProfile.currentStreak || 0}
                suffix="days"
                icon={<Zap size={20} />}
              />
              <StreakItem
                label="Longest Streak"
                value={userProfile.longestStreak || 0}
                suffix="days"
                icon={<Target size={20} />}
              />
              <StreakItem
                label="Weekly Miles"
                value={userProfile.weeklyMiles || 0}
                suffix="mi"
                icon={<TrendingUp size={20} />}
              />
            </div>
          </motion.div>

          {/* CLUB LEADERBOARD RANK */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 lg:col-span-2"
          >
            <h2 className="font-['Bebas_Neue'] text-3xl text-white mb-8 tracking-wide">Club Ranking</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
              <RankItem label="Club Rank" value={userProfile.clubRank || '--'} />
              <RankItem label="Miles Rank" value={userProfile.milesRank || '--'} />
              <RankItem label="Events Rank" value={userProfile.eventsRank || '--'} />
            </div>
          </motion.div>
        </div>

        {/* RECENT ACTIVITIES */}
        {activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-8 mb-8"
          >
            <h2 className="font-['Bebas_Neue'] text-3xl text-white mb-6 tracking-wide">Recent Activities</h2>
            
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity: any, index: number) => (
                <ActivityCard key={index} activity={activity} />
              ))}
            </div>
          </motion.div>
        )}

        {/* DIGITAL MEDAL WALL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-8 mb-8"
        >
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-['Bebas_Neue'] text-3xl text-white tracking-wide">Digital Medal Wall</h2>
            <p className="text-sm text-[#B3B3B3] uppercase tracking-wider">{unlockedCount}/4 unlocked</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {medals.map((medal, index) => (
              <MedalCard
                key={medal.id}
                title={medal.title}
                subtitle={medal.subtitle}
                unlocked={medal.unlocked}
                accent={medal.accent}
                icon={medal.icon}
                delay={0.56 + index * 0.05}
              />
            ))}
          </div>
        </motion.div>

        {/* MY TICKETS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-8"
        >
          <h2 className="font-['Bebas_Neue'] text-3xl text-white mb-6 tracking-wide">My Tickets</h2>

          {ticketsLoading ? (
            <div className="text-center py-12 text-[#B3B3B3]">Loading tickets...</div>
          ) : tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div key={ticket.ticketId} className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6 hover:border-white/20 transition-all group">
                  <div className="w-12 h-12 rounded-lg bg-white mb-4 flex items-center justify-center">
                    <Flag size={24} className="text-black" />
                  </div>
                  <h3 className="font-['Bebas_Neue'] text-2xl text-white mb-2 tracking-wide">
                    {ticket?.event?.name || 'Event Ticket'}
                  </h3>
                  <p className="text-[#B3B3B3] text-sm mb-1">Bib: {ticket.bibNumber || '--'}</p>
                  <p className="text-[#B3B3B3] text-sm mb-1">{ticket?.event?.distance || 'Distance TBD'}</p>
                  <p className="text-[#B3B3B3] text-xs mb-4">{ticket?.checkedInAt ? `Present at ${new Date(ticket.checkedInAt).toLocaleString()}` : 'Not marked present yet'}</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setSelectedEvent(ticket?.event || null);
                      }}
                      className="w-full py-2 bg-white text-black rounded-lg font-medium hover:bg-[#E6E6E6] transition-colors"
                    >
                      View Ticket
                    </button>
                    <button
                      onClick={() => downloadCertificate(ticket.eventId)}
                      disabled={!ticket?.checkedInAt}
                      className="w-full py-2 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors disabled:opacity-40"
                    >
                      Download Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Flag size={48} className="text-[#2A2A2A] mx-auto mb-4" />
              <p className="text-[#B3B3B3] text-lg">No tickets yet</p>
              <p className="text-[#2A2A2A] text-sm mt-2">Register for an event to get your ticket here</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58 }}
          className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-8"
        >
          <h2 className="font-['Bebas_Neue'] text-3xl text-white mb-6 tracking-wide">Attended Events Timeline</h2>
          {attendedActivities.length > 0 ? (
            <div className="space-y-3">
              {attendedActivities.map((activity: any) => (
                <div key={activity.id} className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">{activity.name}</p>
                    <p className="text-[#B3B3B3] text-xs">{new Date(activity.date).toLocaleString()} • {activity.level ? String(activity.level).toUpperCase() : 'LEVEL N/A'}</p>
                  </div>
                  <p className="font-['Bebas_Neue'] text-2xl text-white">{activity.distance} mi</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#B3B3B3]">No attended events yet.</p>
          )}
        </motion.div>

        {selectedTicket && (
          <QRTicket
            eventId={String(selectedTicket?.eventId || selectedEvent?.id || '')}
            userId={String(selectedTicket?.userId || user?.id || '')}
            ticketId={String(selectedTicket?.ticketId || `${selectedTicket?.eventId || selectedEvent?.id || ''}-${selectedTicket?.userId || user?.id || ''}`)}
            qrSignature={String(selectedTicket?.qrSignature || '')}
            eventName={selectedEvent?.name || 'Event'}
            runnerName={selectedTicket?.userName || userProfile.name || user?.name || user?.email || 'Runner'}
            bibNumber={String(selectedTicket?.bibNumber || '1')}
            distance={selectedTicket?.selectedDistance || selectedEvent?.distance || 'TBD'}
            date={selectedEvent?.date || 'TBD'}
            location={selectedEvent?.location || 'TBD'}
            onClose={() => {
              setSelectedTicket(null);
              setSelectedEvent(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Large Stat Card Component
function LargeStatCard({ label, value, suffix, delay, small = false }: { label: string; value: number | string; suffix: string; delay: number; small?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 hover:border-white/20 transition-all group"
    >
      <div className={`font-['Bebas_Neue'] ${small ? 'text-4xl' : 'text-6xl'} text-white mb-2 tracking-wide`}>
        {value}
        {suffix && <span className="text-2xl text-[#B3B3B3] ml-1">{suffix}</span>}
      </div>
      <div className="text-[#B3B3B3] text-sm uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

// Streak Item Component
function StreakItem({ label, value, suffix, icon }: { label: string; value: number; suffix: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#2A2A2A] flex items-center justify-center text-white">
          {icon}
        </div>
        <span className="text-[#B3B3B3]">{label}</span>
      </div>
      <div className="font-['Bebas_Neue'] text-3xl text-white tracking-wide">
        {value} <span className="text-lg text-[#B3B3B3]">{suffix}</span>
      </div>
    </div>
  );
}

// Rank Item Component
function RankItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#B3B3B3]">{label}</span>
      <div className="font-['Bebas_Neue'] text-5xl text-white tracking-wide">#{value}</div>
    </div>
  );
}

// Medal Card Component
function MedalCard({
  title,
  subtitle,
  unlocked,
  accent,
  icon,
  delay,
}: {
  title: string;
  subtitle: string;
  unlocked: boolean;
  accent: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`rounded-2xl border p-5 transition-all ${
        unlocked
          ? 'bg-[#111111] border-white/25 shadow-[0_0_20px_rgba(255,255,255,0.08)]'
          : 'bg-[#0F0F0F] border-[#2A2A2A] opacity-80'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-14 h-14 rounded-full border flex items-center justify-center ${
            unlocked ? `bg-gradient-to-br ${accent} border-white/40` : 'bg-[#0A0A0A] border-[#2A2A2A] text-[#666666]'
          }`}
        >
          {unlocked ? icon : <Lock size={22} />}
        </div>
        <span className={`text-xs uppercase tracking-wider ${unlocked ? 'text-white' : 'text-[#666666]'}`}>
          {unlocked ? 'Unlocked' : 'Locked'}
        </span>
      </div>

      <h3 className="font-['Bebas_Neue'] text-2xl text-white tracking-wide mb-1">{title}</h3>
      <p className="text-sm text-[#B3B3B3] leading-relaxed">{subtitle}</p>
    </motion.div>
  );
}

// Activity Card Component
function ActivityCard({ activity }: { activity: any }) {
  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 hover:border-white/20 transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-white font-medium text-lg mb-1">{activity.name || 'Morning Run'}</h3>
          <div className="flex items-center gap-4 text-[#B3B3B3] text-sm">
            <span>{new Date(activity.date).toLocaleDateString()}</span>
            <span>•</span>
            <span>{activity.distance} mi</span>
            <span>•</span>
            <span>{activity.duration} min</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-['Bebas_Neue'] text-3xl text-white tracking-wide">{activity.pace}</div>
          <div className="text-[#B3B3B3] text-xs uppercase">min/mi</div>
        </div>
      </div>
    </div>
  );
}
