import { motion } from "motion/react";
import heroVideo from "../../upscaled-video.mp4";

const HERO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1558980664-10ea292cc10d?auto=format&fit=crop&w=1800&q=80&sat=-100";

export function MapTrailsBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.04, 1], x: [0, -10, 0], y: [0, -6, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <img
          src={HERO_FALLBACK_IMAGE}
          alt="Monochrome city"
          className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 brightness-85"
        />
        <video
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={HERO_FALLBACK_IMAGE}
          className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 brightness-85"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/20" />
      <motion.div
        animate={{ opacity: [0.75, 0.9, 0.75] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),rgba(0,0,0,0.62)_70%)]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  );
}
