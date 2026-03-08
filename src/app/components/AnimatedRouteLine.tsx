import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function AnimatedRouteLine() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const progress = Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1);

  return (
    <div className="fixed top-0 right-12 bottom-0 w-1 z-40 pointer-events-none hidden lg:block">
      {/* Track */}
      <div className="absolute inset-0 bg-white/5" />
      
      {/* Animated Route Line */}
      <motion.div
        className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#FF3B30] via-[#4CC9F0] to-[#FF3B30]"
        style={{
          height: `${progress * 100}%`,
          boxShadow: "0 0 20px rgba(255, 59, 48, 0.6)",
        }}
      >
        {/* Glowing Dot */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FF3B30]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.6, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          style={{
            boxShadow: "0 0 20px rgba(255, 59, 48, 0.8)",
          }}
        />
      </motion.div>

      {/* Particles along the line */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#4CC9F0]"
          style={{
            top: `${(i / 5) * progress * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            delay: i * 0.4,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}
