import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../lib/api";

export function Leaderboard() {
  const [level, setLevel] = useState<'all' | 'fun' | 'intermediate' | 'advanced'>('all');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetchLeaderboard(level === 'all' ? undefined : level)
      .then(data => {
        const rankedData = (data || []).map((runner: any, index: number) => ({
          rank: index + 1,
          ...runner
        }));
        setLeaderboard(rankedData.slice(0, 10));
      });
  }, [level]);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden px-[var(--site-margin)]">
      <div className="max-w-[1440px] mx-auto">
        {/* Chapter Header */}
        <div className="flex justify-between items-start mb-16 md:mb-24 border-b border-white/10 pb-8">
          <div>
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-2">
              chapter 3:
            </p>
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">
              community
            </p>
          </div>
          <div className="text-right">
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">
              top runners
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
            WEEKLY<br/>POINTS LEADERBOARD
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { label: 'All', value: 'all' },
              { label: 'Fun', value: 'fun' },
              { label: 'Intermediate', value: 'intermediate' },
              { label: 'Advanced', value: 'advanced' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setLevel(item.value as any)}
                className={`px-4 py-2 border text-xs font-['Space_Mono'] uppercase tracking-wider transition-all ${level === item.value ? 'bg-white text-black border-white' : 'border-white/30 text-white/70 hover:bg-white/10'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        <div className="space-y-[1px] bg-white/10 border border-white/10">
          {/* Header */}
          <div className="bg-black">
            <div className="grid grid-cols-12 gap-4 p-6 md:p-8">
              <div className="col-span-2 md:col-span-1">
                <p className="font-['Space_Mono'] text-xs text-white/40 uppercase">Rank</p>
              </div>
              <div className="col-span-5 md:col-span-6">
                <p className="font-['Space_Mono'] text-xs text-white/40 uppercase">Runner</p>
              </div>
              <div className="col-span-5 md:col-span-5 text-right">
                <p className="font-['Space_Mono'] text-xs text-white/40 uppercase">Points</p>
              </div>
            </div>
          </div>

          {/* Rows */}
          {leaderboard.map((runner, index) => (
            <motion.div
              key={runner.rank}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="bg-black hover:bg-white/5 transition-all duration-300"
            >
              <div className="grid grid-cols-12 gap-4 p-6 md:p-8 items-center">
                {/* Rank */}
                <div className="col-span-2 md:col-span-1">
                  {runner.rank <= 3 ? (
                    <div className="w-10 h-10 flex items-center justify-center border border-white/20">
                      <span className="font-['Bebas_Neue'] text-2xl">
                        {String(runner.rank).padStart(2, '0')}
                      </span>
                    </div>
                  ) : (
                    <span className="font-['Bebas_Neue'] text-2xl text-white/60">
                      {String(runner.rank).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="col-span-5 md:col-span-6">
                  <p className="font-['Bebas_Neue'] text-xl md:text-2xl">
                    {runner.name}
                  </p>
                </div>

                {/* Miles */}
                <div className="col-span-5 md:col-span-5 text-right">
                  <p className="font-['Space_Mono'] text-base md:text-lg">
                    {runner.totalPoints || 0} <span className="text-white/40 text-sm">pts</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          {leaderboard.length === 0 && (
            <div className="bg-black p-8 text-white/60 text-center text-sm">No runners yet for this level this week.</div>
          )}
        </div>
      </div>
    </section>
  );
}