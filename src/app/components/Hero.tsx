import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useNavigate } from "react-router";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { fetchGlobalStats } from "../lib/api";
import { MapTrailsBackground } from "./MapTrailsBackground";

const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/Jf1xcHhRRiPCD2EVz6tgoz';

export function Hero() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [stats, setStats] = useState({
    totalMiles: 0,
    totalMembers: 0,
    totalEvents: 0,
  });
  const smoothEase = [0.22, 1, 0.36, 1] as const;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 0.55, 0.2]);
  const handoffOpacity = useTransform(scrollYProgress, [0.35, 1], [0, 1]);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothPointerX = useSpring(pointerX, { stiffness: 110, damping: 18, mass: 0.35 });
  const smoothPointerY = useSpring(pointerY, { stiffness: 110, damping: 18, mass: 0.35 });
  const heroParallaxX = useTransform(smoothPointerX, [-0.5, 0.5], [-26, 26]);
  const heroParallaxY = useTransform(smoothPointerY, [-0.5, 0.5], [-20, 20]);
  const heroParallaxInverseX = useTransform(heroParallaxX, (value) => -value * 0.7);
  const heroParallaxInverseY = useTransform(heroParallaxY, (value) => -value * 0.7);
  const heroTiltX = useTransform(smoothPointerY, [-0.5, 0.5], [8, -8]);
  const heroTiltY = useTransform(smoothPointerX, [-0.5, 0.5], [-10, 10]);

  const handlePointerMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
    pointerX.set(normalizedX);
    pointerY.set(normalizedY);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  useEffect(() => {
    fetchGlobalStats().then((data) => {
      if (data) {
        setStats(data);
      }
    });
  }, []);

  const totalKm = Math.round((Number(stats.totalMiles || 0) / 0.621371) * 10) / 10;

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: smoothEase }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-24 px-[var(--site-margin)]"
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
    >
      {/* Digital map + animated trails background */}
      <MapTrailsBackground />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      {/* Radial Gradient Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_50%)]" />

      <motion.div
        animate={{
          opacity: [0.14, 0.24, 0.14],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/10 blur-[140px]"
      />

      <motion.div
        animate={{
          opacity: [0.08, 0.15, 0.08],
          x: [0, 20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-24 right-[8%] h-[260px] w-[260px] rounded-full bg-white/10 blur-[120px]"
      />

      <motion.div
        style={{ x: heroParallaxX, y: heroParallaxY }}
        animate={{ opacity: [0.15, 0.26, 0.15] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[8%] top-[18%] h-px w-[220px] bg-gradient-to-r from-transparent via-white/70 to-transparent"
      />

      <motion.div
        style={{ x: heroParallaxInverseX, y: heroParallaxInverseY }}
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="pointer-events-none absolute right-[9%] top-[28%] h-px w-[180px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
      />

      <motion.div
        style={{ opacity: handoffOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[9] h-44 bg-gradient-to-b from-transparent via-black/45 to-black"
      />

      {/* Content Container */}
      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 w-full max-w-[1440px] mx-auto">
        {/* Chapter Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: smoothEase }}
          className="flex justify-between items-start mb-12 md:mb-16"
        >
          <div>
            <p className="font-['Space_Mono'] text-xs md:text-sm text-white/40 uppercase tracking-wider mb-2">
              dtbm run club
            </p>
            <p className="font-['Space_Mono'] text-xs md:text-sm text-white/40 uppercase tracking-wider">
              est. 2025
            </p>
          </div>
          <div className="text-right">
            <p className="font-['Space_Mono'] text-xs md:text-sm text-white/40 uppercase tracking-wider mb-2">
              community
            </p>
            <p className="font-['Space_Mono'] text-xs md:text-sm text-white/40 uppercase tracking-wider">
              powered
            </p>
          </div>
        </motion.div>

        {/* DTBM> SECTION - CENTERED WITH HOVER SPREAD */}
        <div className="relative mb-24 md:mb-32 flex flex-col items-center justify-center text-center">
          {/* Main DTBM> with Hover Spread Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.95, ease: smoothEase }}
            className="relative cursor-pointer"
            style={{
              x: heroParallaxX,
              y: heroParallaxY,
              rotateX: heroTiltX,
              rotateY: heroTiltY,
              transformPerspective: 1200,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ opacity: [0.2, 0.36, 0.2], scale: [0.92, 1.04, 0.92] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -inset-12 rounded-full border border-white/20"
              />

              <motion.div
                animate={{ opacity: [0.08, 0.16, 0.08], scale: [1.03, 1.1, 1.03] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                className="pointer-events-none absolute -inset-20 rounded-full border border-white/10"
              />

              <motion.h1 
                className="font-['Montserrat'] font-black text-[18vw] md:text-[15vw] leading-[0.85] mb-4 text-[#ffffff]"
                animate={{
                  letterSpacing: isHovered ? '0.12em' : '0em',
                  scale: isHovered ? 1.035 : 1,
                }}
                transition={{
                  duration: 0.75,
                  ease: smoothEase,
                }}
              >
                DTB<span className="relative">M<span className="absolute bottom-0 left-0 w-full h-[4px] md:h-[6px] bg-white" /></span>&gt;
              </motion.h1>

              <motion.h1
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 font-['Montserrat'] font-black text-[18vw] md:text-[15vw] leading-[0.85] mb-4 text-white/30 blur-[2px]"
                animate={{ opacity: [0.15, 0.32, 0.15] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                DTBM&gt;
              </motion.h1>
              
              {/* Underline removed - now inline under M only */}
            </div>

            {/* "Dare To Be More" Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.85, ease: smoothEase }}
              className="font-['Space_Mono'] text-xs md:text-sm text-white/60 tracking-[0.3em] uppercase mt-6"
            >
              Dare To Be More
            </motion.p>

          </motion.div>

          {/* Animated Underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.55, duration: 1, ease: smoothEase }}
            className="h-[1px] bg-white/30 origin-center mt-8"
            style={{ width: 'clamp(150px, 40vw, 500px)' }}
          />
        </div>

        {/* Main Headline */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.9, ease: smoothEase }}
            className="mb-16 md:mb-20"
          >
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72, duration: 0.8, ease: smoothEase }}
              className="font-['Bebas_Neue'] text-[10vw] md:text-[8vw] lg:text-[120px] leading-[0.9] tracking-tight mb-4"
            >
              RUN
            </motion.h2>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.82, duration: 0.8, ease: smoothEase }}
              className="font-['Bebas_Neue'] text-[10vw] md:text-[8vw] lg:text-[120px] leading-[0.9] tracking-tight mb-4 ml-4 md:ml-16"
            >
              TOGETHER
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.85, ease: smoothEase }}
              className="flex items-center gap-4 md:gap-8 mt-8 ml-4 md:ml-16"
            >
              <div className="w-10 md:w-16 h-[1px] bg-white/20" />
              <p className="text-base md:text-lg text-white/50 max-w-md">
                A community-powered running movement pushing limits and celebrating every mile.
              </p>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.9, ease: smoothEase }}
            className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-white/10 border border-white/10 mb-16"
          >
            <div className="bg-black p-8 hover:bg-white/5 transition-all duration-300">
              <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-4">
                Total KM Run
              </p>
              <h3 className="font-['Bebas_Neue'] text-5xl md:text-6xl">{totalKm.toLocaleString()}</h3>
            </div>
            <div className="bg-black p-8 hover:bg-white/5 transition-all duration-300">
              <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-4">
                Total Runners
              </p>
              <h3 className="font-['Bebas_Neue'] text-5xl md:text-6xl">{Number(stats.totalMembers || 0).toLocaleString()}</h3>
            </div>
            <div className="bg-black p-8 hover:bg-white/5 transition-all duration-300">
              <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-4">
                Total Events
              </p>
              <h3 className="font-['Bebas_Neue'] text-5xl md:text-6xl">{Number(stats.totalEvents || 0).toLocaleString()}</h3>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.9, ease: smoothEase }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch"
          >
            <button
              onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative border border-white px-8 md:px-12 py-4 md:py-6 overflow-hidden hover:bg-white transition-all duration-300 w-full md:w-auto"
            >
              <span className="relative z-10 font-['Space_Mono'] text-sm uppercase tracking-wider group-hover:text-black transition-colors duration-300">
                Join Next Run
              </span>
            </button>
            <button
              onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative border border-white/20 px-8 md:px-12 py-4 md:py-6 overflow-hidden hover:border-white/40 transition-all duration-300 w-full md:w-auto"
            >
              <span className="relative z-10 font-['Space_Mono'] text-sm uppercase tracking-wider text-white/70 group-hover:text-white transition-colors duration-300">
                Register Event
              </span>
            </button>
            <button
              onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative border border-white/20 px-8 md:px-12 py-4 md:py-6 overflow-hidden hover:border-white/40 transition-all duration-300 w-full md:w-auto"
            >
              <span className="relative z-10 font-['Space_Mono'] text-sm uppercase tracking-wider text-white/70 group-hover:text-white transition-colors duration-300">
                See Run Schedule
              </span>
            </button>
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative border border-white/20 px-8 md:px-12 py-4 md:py-6 overflow-hidden hover:border-white/40 transition-all duration-300 w-full md:w-auto text-center"
            >
              <span className="relative z-10 font-['Space_Mono'] text-sm uppercase tracking-wider text-white/70 group-hover:text-white transition-colors duration-300">
                Join Community
              </span>
            </a>
          </motion.div>
        </div>

        {/* Bottom Section Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.9, ease: smoothEase }}
          className="hidden md:flex justify-between items-end mt-32 pt-8 border-t border-white/10"
        >
          <div>
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">
              chapters
            </p>
            <div className="mt-4 space-y-2">
              <p className="font-['Space_Mono'] text-xs text-white/40">01. about</p>
              <p className="font-['Space_Mono'] text-xs text-white/40">02. events</p>
              <p className="font-['Space_Mono'] text-xs text-white/40">03. community</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">
              scroll to explore
            </p>
            <p className="font-['Space_Mono'] text-2xl text-white/40 mt-2">↓</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}