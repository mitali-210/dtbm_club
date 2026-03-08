import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchEvents, fetchGlobalStats, fetchLeaderboard } from "../lib/api";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { Link } from "react-router";

type DashboardMode = "pulse" | "race" | "community";

function parseEventTime(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN;
  }

  if (typeof value !== "string") {
    return Number.NaN;
  }

  const trimmed = value.trim();
  if (!trimmed) return Number.NaN;

  // Handle legacy admin date format: DD-MM-YYYY HH:mm AM/PM
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

function formatEventDate(value: unknown): string {
  const eventTime = parseEventTime(value);
  if (!Number.isFinite(eventTime)) return "Date pending";
  return new Date(eventTime).toLocaleString();
}

export function LandingDashboard() {
  const [mode, setMode] = useState<DashboardMode>("pulse");
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [countdownNow, setCountdownNow] = useState<number>(() => Date.now());
  const dashboardRef = useRef<HTMLElement | null>(null);
  const smoothEase = [0.22, 1, 0.36, 1] as const;
  const { scrollYProgress: enterProgress } = useScroll({
    target: dashboardRef,
    offset: ["start 95%", "start 35%"],
  });
  const introY = useTransform(enterProgress, [0, 1], [120, 0]);
  const introOpacity = useTransform(enterProgress, [0, 1], [0.15, 1]);
  const introScale = useTransform(enterProgress, [0, 1], [0.965, 1]);

  useEffect(() => {
    fetchGlobalStats().then((data) => setStats(data || null));
    fetchEvents().then((data) => setEvents(data || []));
    fetchLeaderboard().then((data) => setLeaderboard(data || []));
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCountdownNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const nextEvent = useMemo(() => {
    const now = countdownNow;
    return [...events]
      .filter((event) => {
        const eventTime = parseEventTime(event?.date);
        return Number.isFinite(eventTime) && eventTime > now;
      })
      .sort((a, b) => parseEventTime(a.date) - parseEventTime(b.date))[0] || null;
  }, [events, countdownNow]);

  const countdownText = useMemo(() => {
    if (!nextEvent) return "No upcoming run";
    const now = countdownNow;
    const eventTime = parseEventTime(nextEvent.date);
    if (!Number.isFinite(eventTime)) return "Date pending";
    const diff = Math.max(0, eventTime - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes === 0 && diff > 0) return "<1m";
    return `${minutes}m`;
  }, [nextEvent, countdownNow]);

  const kmTotal = Math.round((Number(stats?.totalMiles || 0) / 0.621371) * 10) / 10;

  const leaderboardBars = useMemo(() => {
    return leaderboard.slice(0, 5).map((runner: any, index: number) => ({
      name: String(runner?.name || "Runner").split(" ")[0],
      points: Number(runner?.totalPoints || 0),
      rank: index + 1,
    }));
  }, [leaderboard]);

  const monthlyEventFlow = useMemo(() => {
    const monthMap = new Map<string, number>();
    for (const event of events || []) {
      const eventTime = parseEventTime(event?.date);
      if (!Number.isFinite(eventTime)) continue;
      const date = new Date(eventTime);
      const label = date.toLocaleDateString("en-US", { month: "short" });
      monthMap.set(label, (monthMap.get(label) || 0) + 1);
    }

    const sorted = Array.from(monthMap.entries()).slice(-6).map(([month, count]) => ({ month, count }));
    return sorted.length > 0
      ? sorted
      : [
          { month: "Jan", count: 0 },
          { month: "Feb", count: 0 },
          { month: "Mar", count: 0 },
          { month: "Apr", count: 0 },
        ];
  }, [events]);

  const modeDescription =
    mode === "pulse"
      ? "Live club momentum with real runner, KM, and event activity."
      : mode === "race"
      ? "Race operations view with next-run timing and registration pulse."
      : "Community lens focused on people, proof, and leaderboard energy.";

  return (
    <motion.section
      ref={dashboardRef}
      style={{ y: introY, opacity: introOpacity, scale: introScale }}
      className="relative py-24 md:py-32 px-[var(--site-margin)] overflow-hidden"
    >
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1], x: [0, 12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-24 left-[8%] h-[280px] w-[280px] rounded-full bg-white/10 blur-[120px]"
      />
      <motion.div
        animate={{ opacity: [0.08, 0.15, 0.08], y: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="pointer-events-none absolute -bottom-24 right-[10%] h-[320px] w-[320px] rounded-full bg-white/10 blur-[130px]"
      />
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: smoothEase }}
          className="mb-10 md:mb-14"
        >
          <p className="font-['Space_Mono'] text-xs text-white/45 uppercase tracking-wider mb-3">Command Center</p>
          <h2 className="font-['Bebas_Neue'] text-[12vw] md:text-[5.5vw] leading-[0.92]">INTERACTIVE RUN DASHBOARD</h2>
          <div className="mt-5 flex items-center gap-3">
            <motion.span
              animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.2, 0.9] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="h-2 w-2 rounded-full bg-white"
            />
            <p className="font-['Space_Mono'] text-[11px] text-white/55 uppercase tracking-wider">Live cinematic feed</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: smoothEase }}
            className="relative lg:col-span-4 border border-white/15 bg-black/70 p-6 md:p-8"
          >
            <motion.div
              animate={{ opacity: [0.1, 0.18, 0.1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]"
            />
            <p className="font-['Space_Mono'] text-[11px] text-white/45 uppercase tracking-wider mb-3">Mode</p>
            <div className="space-y-2 mb-6">
              {[
                { key: "pulse", label: "Live Pulse" },
                { key: "race", label: "Race Control" },
                { key: "community", label: "Community Heat" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setMode(item.key as DashboardMode)}
                  className={`w-full text-left px-4 py-3 border transition-all font-['Space_Mono'] text-xs uppercase tracking-wider ${
                    mode === item.key ? "bg-white text-black border-white" : "border-white/20 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <p className="text-white/65 text-sm leading-relaxed mb-8">{modeDescription}</p>

            <div className="grid grid-cols-2 gap-[1px] bg-white/10 border border-white/10">
              <MetricCard label="Runners" value={Number(stats?.totalMembers || 0).toLocaleString()} />
              <MetricCard label="KM Run" value={kmTotal.toLocaleString()} />
              <MetricCard label="Events" value={Number(stats?.totalEvents || 0).toLocaleString()} />
              <MetricCard label="Next Run" value={countdownText} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: smoothEase, delay: 0.05 }}
            className="relative lg:col-span-8 border border-white/15 bg-black/70 p-5 md:p-8"
          >
            <motion.div
              animate={{ opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12)_0%,transparent_45%)]"
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="border border-white/10 p-4">
                <p className="font-['Space_Mono'] text-[11px] text-white/45 uppercase tracking-wider mb-4">Event Flow</p>
                <div className="h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyEventFlow}>
                      <defs>
                        <linearGradient id="eventFlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.42} />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }} />
                      <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#ffffff" strokeWidth={2} fill="url(#eventFlow)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="border border-white/10 p-4">
                <p className="font-['Space_Mono'] text-[11px] text-white/45 uppercase tracking-wider mb-4">Top Points Board</p>
                <div className="h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leaderboardBars}>
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.35)" tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }} />
                      <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Bar dataKey="points" fill="#ffffff" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mt-6"
            >
              {nextEvent ? (
                <Link
                  to={`/event/${nextEvent.id}`}
                  className="block border border-white/10 p-4 md:p-5 hover:bg-white/5 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-['Space_Mono'] text-[11px] text-white/45 uppercase tracking-wider">Next Run Spotlight</p>
                      <p className="font-['Bebas_Neue'] text-3xl leading-none mt-1">{nextEvent.name}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-white/70 text-sm">{nextEvent.location || "Location pending"}</p>
                      <p className="text-white/55 text-xs mt-1">{formatEventDate(nextEvent.date)}</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="border border-white/10 p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-['Space_Mono'] text-[11px] text-white/45 uppercase tracking-wider">Next Run Spotlight</p>
                      <p className="font-['Bebas_Neue'] text-3xl leading-none mt-1">No upcoming run yet</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-white/70 text-sm">Location pending</p>
                      <p className="text-white/55 text-xs mt-1">Date pending</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }} className="bg-black p-4 md:p-5">
      <p className="font-['Space_Mono'] text-[11px] text-white/45 uppercase tracking-wider mb-2">{label}</p>
      <p className="font-['Bebas_Neue'] text-3xl md:text-4xl leading-none">{value}</p>
    </motion.div>
  );
}
