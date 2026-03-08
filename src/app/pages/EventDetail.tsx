import { motion } from "motion/react";
import { useParams, Link, useNavigate } from "react-router";
import { Calendar, MapPin, Users, Award, ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { QRTicket } from "../components/QRTicket";
import { useEffect, useState } from "react";
import { fetchEventTicket, fetchEvents, registerForEvent } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";

const CONSENT_LABEL = "I confirm that I am voluntarily participating in this DTBM event at my own risk. If any injury, accident, illness, loss, or damage happens to me during this activity, I take personal responsibility and I will not hold DTBM Run Club, organizers, volunteers, partners, or venue owners liable. I also grant permission to DTBM to capture and use my photos/videos from this event for social media, promotional, and content purposes.";

const FORCED_PAST_EVENT_NAMES = new Set([
  "women's day run (womens only)",
  "one more loop",
]);

function isForcedPastEvent(event: any): boolean {
  const name = String(event?.name || '').trim().toLowerCase();
  return FORCED_PAST_EVENT_NAMES.has(name);
}

function parseEventTime(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN;
  }

  if (typeof value !== "string") {
    return Number.NaN;
  }

  const trimmed = value.trim();
  if (!trimmed) return Number.NaN;

  const legacyMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?)?$/);
  if (legacyMatch) {
    const day = Number(legacyMatch[1]);
    const monthIndex = Number(legacyMatch[2]) - 1;
    const year = Number(legacyMatch[3]);
    let hour = Number(legacyMatch[4] ?? 0);
    const minute = Number(legacyMatch[5] ?? 0);
    const meridiem = (legacyMatch[6] ?? "").toUpperCase();

    if (meridiem === "PM" && hour < 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;

    return new Date(year, monthIndex, day, hour, minute).getTime();
  }

  const parsedDirect = new Date(trimmed).getTime();
  if (Number.isFinite(parsedDirect)) return parsedDirect;

  const normalized = trimmed.includes(" ") ? trimmed.replace(" ", "T") : trimmed;
  return new Date(normalized).getTime();
}

export function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, user, refreshProfile, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTicket, setShowTicket] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [registering, setRegistering] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: id ? `/event/${id}` : '/events' }, replace: true });
      toast.error('Please login to view event details.');
    }
  }, [authLoading, user, navigate, id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchEvents()
      .then((data) => {
        const matchedEvent = (data || []).find((item: any) => item.id === id);
        setEvent(matchedEvent || null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-['Space_Mono'] text-sm uppercase tracking-wider text-white/50">Loading event...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const eventTime = parseEventTime(event?.date);
  const eventDate = Number.isFinite(eventTime) ? new Date(eventTime) : null;
  const formattedDate = eventDate
    ? eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'TBD';
  const formattedTime = eventDate
    ? eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : 'TBD';

  const participantCount = Array.isArray(event?.participants)
    ? event.participants.length
    : Number(event?.participants || 0);
  const maxParticipants = Number(event?.maxParticipants || 0);
  const spotsLeft = maxParticipants > 0 ? Math.max(maxParticipants - participantCount, 0) : null;

  const distanceNumber = parseFloat(String(event?.distance || '').replace(/[^\d.]/g, ''));
  const difficulty = event?.level ? String(event.level).charAt(0).toUpperCase() + String(event.level).slice(1) : (distanceNumber >= 21 ? 'Advanced' : distanceNumber >= 10 ? 'Intermediate' : 'Beginner');
  const distanceOptions = Array.isArray(event?.distanceOptions) && event.distanceOptions.length > 0
    ? event.distanceOptions
    : (event?.distance ? String(event.distance).split(/,|&|\//).map((value) => value.trim()).filter(Boolean) : []);
  const registrationCutoffMinutes = Number(event?.registrationCutoffMinutes || 0);
  const eventStartDate = Number.isFinite(eventTime) ? new Date(eventTime) : null;
  const forcedPast = isForcedPastEvent(event);
  const isPastEvent = Boolean(eventStartDate && eventStartDate.getTime() < Date.now());
  const registrationClosed = Boolean(
    forcedPast ||
      isPastEvent ||
    registrationCutoffMinutes > 0 &&
      eventStartDate &&
      !Number.isNaN(eventStartDate.getTime()) &&
      new Date() >= new Date(eventStartDate.getTime() - registrationCutoffMinutes * 60 * 1000)
  );

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['Bebas_Neue'] text-4xl mb-4">Event Not Found</h2>
          <Link to="/" className="text-white hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleRegister = async () => {
    if (!id) return;
    if (registrationClosed) {
      toast.error('Registration is closed for this event.');
      return;
    }

    setRegistering(true);
    let userTicket: any = null;
    try {
      if (!selectedDistance) {
        toast.error('Please select a distance.');
        setRegistering(false);
        return;
      }
      if (!consentAccepted) {
        toast.error('Please accept the consent to continue.');
        setRegistering(false);
        return;
      }

      const registrationResult = await registerForEvent(id, selectedDistance, consentAccepted);
      if (registrationResult?.waitlisted) {
        setWaitlisted(true);
        toast.info(registrationResult.message || 'Event full. Added to waitlist.');
      } else {
        userTicket = registrationResult?.ticket;
        setTicket(userTicket);
        setShowTicket(true);
        setWaitlisted(false);
        toast.success('Registered successfully!');
      }
      await refreshProfile();
      await fetchEvents().then((data) => {
        const matchedEvent = (data || []).find((item: any) => item.id === id);
        setEvent(matchedEvent || null);
      });
    } catch (error: any) {
      if (String(error?.message || '').toLowerCase().includes('already registered')) {
        userTicket = await fetchEventTicket(id);
        if (userTicket) {
          setTicket(userTicket);
          setShowTicket(true);
          await refreshProfile();
          toast.success('You are already registered. Showing your ticket.');
        } else {
          toast.error('Already registered, but ticket not found.');
        }
      } else {
        toast.error(error?.message || 'Failed to register for event');
      }
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Back Button */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
        <Link to="/">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Events
          </motion.button>
        </Link>
      </div>

      {/* Hero Banner */}
      <section className="relative h-[45vh] md:h-[60vh] overflow-hidden">
        <ImageWithFallback
          src={event.photoUrl || "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1600&q=80"}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="font-['Bebas_Neue'] text-4xl md:text-7xl mb-6">
                {event.name}
              </h1>
              <div className="flex flex-wrap gap-4 md:gap-6 text-sm md:text-lg">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-white" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-white" />
                  <span>{formattedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-white" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-white" />
                  <span>{participantCount} participants</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* Overview */}
            <section>
              <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl mb-6">Race Overview</h2>
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                {event.description || 'Event details will be updated by the admin team soon.'}
              </p>
              <div className="mt-6 inline-block px-6 py-3 bg-white/5 border border-white/10 rounded-full">
                <span className="text-white/60 mr-3">Distance:</span>
                <span className="font-['Bebas_Neue'] text-2xl text-white">
                  {event.distance || 'TBD'}
                </span>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Registration Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:sticky lg:top-32 bg-gradient-to-br from-[#121212] to-[#0A0A0A] rounded-2xl p-6 md:p-8 border border-white/10"
            >
              <h3 className="font-['Bebas_Neue'] text-3xl mb-6">Register Now</h3>

              {registrationClosed && (
                <div className="mb-5 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white/75">
                  Event Done. Registration is closed.
                </div>
              )}
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-white/60">Entry Fee</span>
                  <span className="font-['Bebas_Neue'] text-2xl">Free</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-white/60">Spots Left</span>
                  <span className="font-['Bebas_Neue'] text-2xl text-white">{spotsLeft ?? 'TBD'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Difficulty</span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/30 rounded-full text-white text-sm">
                    <TrendingUp size={14} />
                    {difficulty}
                  </span>
                </div>
                {registrationCutoffMinutes > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-white/60">Registration Cutoff</span>
                    <span className="text-white text-sm">{registrationCutoffMinutes} min before start</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Choose Distance</label>
                  <select
                    value={selectedDistance}
                    onChange={(e) => setSelectedDistance(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/20 text-white rounded-lg focus:outline-none focus:border-white/40"
                  >
                    <option value="">Select distance</option>
                    {distanceOptions.map((distanceOption: string) => (
                      <option key={distanceOption} value={distanceOption}>
                        {distanceOption}
                      </option>
                    ))}
                  </select>
                </div>

                <Collapsible>
                  <CollapsibleTrigger className="w-full text-left px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/80 text-sm hover:bg-white/10 transition-colors">
                    View consent terms
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 px-4 py-3 bg-black border border-white/10 rounded-lg text-sm text-white/70 leading-relaxed">
                    {CONSENT_LABEL}
                  </CollapsibleContent>
                </Collapsible>

                <label className="flex items-start gap-3 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <span>{CONSENT_LABEL}</span>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister}
                disabled={registering || registrationClosed}
                className="w-full py-4 bg-black border border-white text-white rounded-full font-medium text-lg relative overflow-hidden group mb-4 disabled:opacity-60"
              >
                <span className="relative z-10">{registrationClosed ? 'Event Done' : registering ? 'Registering...' : 'Register for Event'}</span>
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 2 }}
                  transition={{ duration: 0.5 }}
                  style={{ opacity: 0.2 }}
                />
              </motion.button>

              <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                <Award size={16} />
                <span>{waitlisted ? 'You are currently on waitlist' : 'Earn digital medal upon completion'}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* QR Ticket Modal */}
      {showTicket && (
        <QRTicket
          eventId={String(ticket?.eventId || id || '')}
          userId={String(ticket?.userId || user?.id || '')}
          ticketId={String(ticket?.ticketId || `${id || ''}-${user?.id || ''}`)}
          qrSignature={String(ticket?.qrSignature || '')}
          eventName={event.name}
          runnerName={ticket?.userName || profile?.name || user?.email || 'Runner'}
          bibNumber={String(ticket?.bibNumber || '1')}
          distance={ticket?.selectedDistance || event.distance || 'TBD'}
          date={formattedDate}
          location={event.location}
          onClose={() => setShowTicket(false)}
        />
      )}
    </div>
  );
}
