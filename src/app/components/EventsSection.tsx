import { motion } from "motion/react";
import { Calendar, CheckCircle2, MapPin } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { fetchEvents } from "../lib/api";

const FORCED_PAST_EVENT_NAMES = new Set([
  "women's day run (womens only)",
  "one more loop",
]);

function isForcedPastEvent(event: any): boolean {
  const name = String(event?.name || "").trim().toLowerCase();
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

export function EventsSection() {
  const [events, setEvents] = useState<any[]>([]);
  const [nextEvent, setNextEvent] = useState<any | null>(null);

  useEffect(() => {
    fetchEvents()
      .then(data => {
        const nowMs = Date.now();
        const validEvents = (data || []).filter((event: any) => Number.isFinite(parseEventTime(event?.date)));

        const upcomingEvents = validEvents
          .filter((event: any) => parseEventTime(event.date) >= nowMs && !isForcedPastEvent(event))
          .sort((a: any, b: any) => parseEventTime(a.date) - parseEventTime(b.date));

        const completedEvents = validEvents
          .filter((event: any) => parseEventTime(event.date) < nowMs || isForcedPastEvent(event))
          .sort((a: any, b: any) => parseEventTime(b.date) - parseEventTime(a.date));

        const oneMoreLoopFallback = {
          id: 'one-more-loop-past',
          name: 'One More Loop',
          date: '28-12-2025 06:00 AM',
          location: 'Zostel, Nashik',
          link: '/community#one-more-loop',
        };

        const hasOneMoreLoop = [...upcomingEvents, ...completedEvents].some(
          (event: any) => String(event?.name || '').trim().toLowerCase() === 'one more loop'
        );

        const completedWithFallback = hasOneMoreLoop
          ? completedEvents
          : [oneMoreLoopFallback, ...completedEvents];

        setNextEvent(upcomingEvents[0] || null);
        setEvents([...upcomingEvents.slice(0, 4), ...completedWithFallback.slice(0, 5)]);
      });
  }, []);

  return (
    <section id="events" className="relative py-24 md:py-32 overflow-hidden px-[var(--site-margin)]">
      <div className="max-w-[1440px] mx-auto">
        {/* Chapter Header */}
        <div className="flex justify-between items-start mb-16 md:mb-24 border-b border-white/10 pb-8">
          <div>
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-2">
              chapter 2:
            </p>
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">
              events
            </p>
          </div>
          <div className="text-right">
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">
              upcoming runs
            </p>
          </div>
        </div>

        {/* Large Display Text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="font-['Bebas_Neue'] text-[8vw] md:text-[6vw] lg:text-[80px] leading-[0.95]">
            NEXT<br/>CHALLENGES
          </h2>
        </motion.div>

        {/* Events List - Minimal Layout */}
        {nextEvent ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <Link
              to={`/event/${nextEvent.id}`}
              className="block border border-white/20 bg-black/70 p-5 md:p-6 hover:bg-white/5 transition-all duration-300"
            >
              <p className="font-['Space_Mono'] text-[11px] text-white/50 uppercase tracking-wider mb-1">Next Run</p>
              <p className="font-['Bebas_Neue'] text-3xl md:text-4xl leading-none">{nextEvent.name}</p>
            </Link>
          </motion.div>
        ) : null}

        <div className="space-y-[1px] bg-white/10">
          {events.length > 0 ? (
            events.map((event, index) => (
              <EventRow key={event.id} event={event} index={index} />
            ))
          ) : (
            <div className="bg-black border-t border-white/10 p-10 text-center">
              <p className="font-['Space_Mono'] text-xs uppercase tracking-wider text-white/50">
                No events available yet
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EventRow({ event, index }: { event: any; index: number }) {
  const eventTime = parseEventTime(event.date);
  const eventDate = Number.isFinite(eventTime) ? new Date(eventTime) : null;
  const isDone = (Number.isFinite(eventTime) && eventTime < Date.now()) || isForcedPastEvent(event);
  const eventLink = typeof event?.link === 'string' && event.link ? event.link : `/event/${event.id}`;
  const formattedDate = eventDate ? eventDate.toLocaleDateString('en-US', {
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  }) : 'TBD';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
    >
      <Link to={eventLink}>
        <div className="group relative bg-black border-t border-white/10 hover:bg-white/5 transition-all duration-300">
          <div className="grid grid-cols-12 gap-4 p-8 md:p-12 items-center">
            {/* Number */}
            <div className="col-span-2 md:col-span-1">
              <p className="font-['Space_Mono'] text-xs text-white/40">
                {String(index + 1).padStart(2, '0')}
              </p>
            </div>

            {/* Event Name */}
            <div className="col-span-10 md:col-span-5">
              <h3 className={`font-['Bebas_Neue'] text-2xl md:text-4xl group-hover:text-white/80 transition-colors ${isDone ? 'line-through text-white/45' : ''}`}>
                {event.name}
              </h3>
            </div>

            {/* Date */}
            <div className="col-span-6 md:col-span-2">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-white/40" />
                <p className="font-['Space_Mono'] text-xs text-white/60">
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="col-span-6 md:col-span-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-white/40" />
                <p className="font-['Space_Mono'] text-xs text-white/60">
                  {event.location}
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="col-span-12 md:col-span-1 flex justify-end">
              {isDone ? (
                <div className="inline-flex items-center gap-1 rounded-full border border-white/20 px-2 py-1 font-['Space_Mono'] text-[10px] uppercase tracking-wider text-white/60">
                  <CheckCircle2 size={12} />
                  Done
                </div>
              ) : (
                <div className="font-['Space_Mono'] text-white/40 group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
                  →
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}