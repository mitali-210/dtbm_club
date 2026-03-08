import { motion } from "motion/react";

export function OriginStory() {
  return (
    <section className="relative py-24 md:py-32 px-[var(--site-margin)]">
      <div className="max-w-[1440px] mx-auto border border-white/10 bg-black/70 p-8 md:p-12">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-4"
        >
          Origin Story
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="font-['Bebas_Neue'] text-[12vw] md:text-[6vw] lg:text-[72px] leading-[0.95] mb-6"
        >
          HOW DTBM STARTED
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-white/70 text-sm md:text-lg leading-relaxed max-w-4xl"
        >
          DTBM (Dare To Be More) started with founders Pruthvi and the early core crew in Nashik who wanted one thing: a
          consistent space where beginners and experienced runners could train together without judgment. What began as a
          small weekend meetup turned into a growing running culture powered by discipline, accountability, and community.
          Every event, every check-in, and every finish line is built on that same mission — help each runner become more
          than yesterday.
        </motion.p>
      </div>
    </section>
  );
}
