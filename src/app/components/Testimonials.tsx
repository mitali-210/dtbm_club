import { motion } from "motion/react";

const testimonials = [
  {
    name: "Aditi P.",
    text: "I joined for fitness, stayed for the people. DTBM made running feel possible for me.",
  },
  {
    name: "Rahul S.",
    text: "The event energy is unreal. From bib pickup to finish scan, everything feels professional.",
  },
  {
    name: "Neha K.",
    text: "This is not just a run club — it’s a support system that pushes you every week.",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 px-[var(--site-margin)]">
      <div className="max-w-[1440px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-['Bebas_Neue'] text-[10vw] md:text-[5vw] leading-[0.95] mb-10"
        >
          RUNNER VOICES
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-white/10 border border-white/10">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-black p-8 md:p-10 hover:bg-white/5 transition-all duration-300"
            >
              <p className="text-white/75 text-sm md:text-base leading-relaxed mb-6">“{item.text}”</p>
              <p className="font-['Space_Mono'] text-xs uppercase tracking-wider text-white/45">{item.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
