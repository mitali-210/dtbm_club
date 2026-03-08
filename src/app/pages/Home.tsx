import { Hero } from "../components/Hero";
import { StatsSection } from "../components/StatsSection";
import { EventsSection } from "../components/EventsSection";
import { Leaderboard } from "../components/Leaderboard";
import { JoinSection } from "../components/JoinSection";
import { OriginStory } from "../components/OriginStory";
import { Gallery } from "../components/Gallery";
import { Testimonials } from "../components/Testimonials";
import { LandingDashboard } from "../components/LandingDashboard";
import { Link } from "react-router";
import { motion } from "motion/react";

const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/Jf1xcHhRRiPCD2EVz6tgoz';

function CommunityPreview() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="py-24 px-[var(--site-margin)]"
      id="community"
    >
      <div className="max-w-[1440px] mx-auto border border-white/15 bg-[#0A0A0A] rounded-2xl p-8 md:p-12">
        <p className="font-['Space_Mono'] text-xs uppercase tracking-[0.2em] text-white/50 mb-3">Community</p>
        <h2 className="font-['Bebas_Neue'] text-[14vw] md:text-[7vw] leading-[0.9] tracking-tight mb-4">RUN AS ONE CREW</h2>
        <p className="text-white/70 max-w-3xl mb-8 text-sm md:text-base">
          Discover the DTBM community culture, run formats, and support system designed for every level—from your first 5K to your next half marathon.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/community"
            className="inline-flex border border-white px-8 py-4 hover:bg-white hover:text-black transition-all duration-300"
          >
            <span className="font-['Space_Mono'] text-xs uppercase tracking-wider">Explore Community</span>
          </Link>
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex border border-white px-8 py-4 hover:bg-white hover:text-black transition-all duration-300"
          >
            <span className="font-['Space_Mono'] text-xs uppercase tracking-wider">Join WhatsApp Community</span>
          </a>
        </div>
      </div>
    </motion.section>
  );
}

export function Home() {
  return (
    <div className="relative">
      <Hero />
      <div className="relative z-20 -mt-12 md:-mt-20">
        <LandingDashboard />
      </div>
      <StatsSection />
      <OriginStory />
      <EventsSection />
      <CommunityPreview />
      <Gallery />
      <Testimonials />
      <Leaderboard />
      <JoinSection />
    </div>
  );
}