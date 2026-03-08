import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { fetchGlobalStats } from "../lib/api";

export function StatsSection() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalMiles: 0,
    totalRuns: 0,
    totalEvents: 0,
    bestPerformerThisWeek: {
      name: '--',
      distance: 0,
      time: '--:--:--'
    },
    bestPerformerThisMonth: {
      name: '--',
      distance: 0,
      time: '--:--:--'
    }
  });

  const bestPerformer = stats.bestPerformerThisWeek || stats.bestPerformerThisMonth;
  const bestPerformerName = bestPerformer?.name || '--';
  const bestPerformerDistance = Number(bestPerformer?.distance || 0);
  const bestPerformerTime = bestPerformer?.time || '--:--:--';

  useEffect(() => {
    fetchGlobalStats()
      .then(data => {
        if (data) {
          setStats(data);
        }
      });
  }, []);

  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden px-[var(--site-margin)]">
      <div className="max-w-[1440px] mx-auto">
        {/* Chapter Header */}
        <div className="flex justify-between items-start mb-16 md:mb-24 border-b border-white/10 pb-8">
          <div>
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-2">
              chapter 1:
            </p>
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">
              about
            </p>
          </div>
          <div className="text-right">
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">
              who we are
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
          <h2 className="font-['Bebas_Neue'] text-[8vw] md:text-[6vw] lg:text-[80px] leading-[0.95] mb-12">
            A COMMUNITY<br/>OF RUNNERS
          </h2>
        </motion.div>

        {/* Best Performer Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-white/10 border border-white/10">
          <StatCard
            value={bestPerformerName}
            label="Best Performer (This Week)"
            delay={0}
          />
          <StatCard
            value={`${bestPerformerDistance.toFixed(2)} mi`}
            label="Distance"
            delay={0.2}
          />
          <StatCard
            value={bestPerformerTime}
            label="Time"
            delay={0.4}
          />
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-24 max-w-2xl"
        >
          <div className="flex items-start gap-8">
            <div className="w-16 h-[1px] bg-white/20 mt-3" />
            <p className="text-base md:text-lg text-white/60 leading-relaxed">
              DTBM Run Club is more than just a running group. We're a movement of athletes pushing boundaries, 
              supporting each other, and celebrating every stride. From casual joggers to marathon runners, 
              everyone finds their pace with us.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({
  value,
  label,
  delay,
}: {
  value: number | string;
  label: string;
  delay: number;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isNumeric = typeof value === 'number' && Number.isFinite(value);

  useEffect(() => {
    if (!isNumeric) {
      setCount(0);
    }
  }, [isNumeric, value]);

  useEffect(() => {
    if (!isNumeric) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated, isNumeric]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="relative group bg-black p-12 md:p-16"
    >
      <div className="relative z-10">
        <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-6">
          {label}
        </p>
        <div className="font-['Bebas_Neue'] text-4xl md:text-6xl lg:text-7xl text-white break-words">
          {isNumeric ? count.toLocaleString() : value}
        </div>
      </div>
    </motion.div>
  );
}