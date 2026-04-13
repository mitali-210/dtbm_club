import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Users, HeartHandshake, CalendarDays, MapPin, MessageSquare, Trophy, Clock3, Star, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import oneMoreLoopPhoto1 from './one more loop/DSC03464.JPG';
import oneMoreLoopPhoto2 from './one more loop/DSC03513.JPG';
import oneMoreLoopPhoto3 from './one more loop/DSC03535.JPG';
import oneMoreLoopPhoto4 from './one more loop/DSC03609.JPG';
import oneMoreLoopPhoto5 from './one more loop/DSC03635.JPG';
import oneMoreLoopPhoto6 from './one more loop/DSC03688.JPG';
import oneMoreLoopPhoto7 from './one more loop/DSC03743.JPG';
import oneMoreLoopPhoto8 from './one more loop/DSC03947.JPG';

const communityPillars = [
  {
    title: 'Run Together',
    description: 'All paces, all levels. We train as one crew and celebrate every finish.',
    icon: <Users size={22} />,
  },
  {
    title: 'Support Culture',
    description: 'You never run alone. Accountability, mentorship, and post-run check-ins are built in.',
    icon: <HeartHandshake size={22} />,
  },
  {
    title: 'Consistent Events',
    description: 'Weekly social runs, milestone challenges, and race-day meetups across the city.',
    icon: <CalendarDays size={22} />,
  },
];

const runFormats = [
  {
    title: 'Easy Miles',
    pace: 'Conversational pace',
    detail: 'Great for beginners and recovery weeks.',
  },
  {
    title: 'Tempo Crew',
    pace: 'Progressive effort',
    detail: 'Build speed and stamina with guided pacing.',
  },
  {
    title: 'Long Run Squad',
    pace: 'Endurance-focused',
    detail: 'Weekend distance runs for half/full prep.',
  },
  {
    title: 'Race Simulation',
    pace: 'Goal-race pace blocks',
    detail: 'Structured sessions to sharpen race confidence.',
  },
];

const originStory = [
  'DTBM Run Club began about seven months ago with just two runners: Soham and Shreeram. There was no big launch, no marketing plan, and definitely no corporate nonsense. It started simply with the idea of running consistently and building a small circle of people who believed in discipline, endurance, and showing up even on the days when motivation was nowhere to be found.',
  'What began as a few runners covering kilometers together slowly turned into a growing community. As more people joined the runs, the purpose of DTBM became clearer. It was never meant to be just a casual running group. The goal was to create a culture where people push their limits, support each other, and develop both physical and mental resilience through running.',
  'Over time, DTBM started organizing structured runs and endurance-based challenges that bring runners together in a shared environment of effort and persistence. Every run contributes to the collective progress of the club, where total kilometers represent the work put in by the entire community rather than individual achievements alone.',
  'Today, DTBM continues to grow as a disciplined and supportive running community. What started with three people has evolved into a network of runners who believe in consistency, movement, and the simple philosophy that progress happens one kilometer at a time.',
];

const exclusiveEvent = {
  title: 'One More Loop',
  dateLabel: '28 December 2025',
  timeLabel: '6:00 AM',
  locationLabel: 'Zostel, Nashik',
  winner: 'Aditya',
  duration: '6 hours',
  story:
    'A backyard-style endurance race held in the chilling Nashik winter. The challenge was simple but brutal: keep showing up for one more loop. Aditya won the event with a composed and powerful performance. It was tough, but he made it look easy while the race pushed on for six full hours.',
};

const exclusiveEventPhotos = [
  { src: oneMoreLoopPhoto1, alt: 'One More Loop group photo at event venue' },
  { src: oneMoreLoopPhoto2, alt: 'One More Loop large group gathering at clock tower venue' },
  { src: oneMoreLoopPhoto3, alt: 'One More Loop community group photo in rainy weather' },
  { src: oneMoreLoopPhoto4, alt: 'One More Loop runners and crew gathering at cafe venue' },
  { src: oneMoreLoopPhoto5, alt: 'One More Loop race lane action shot' },
  { src: oneMoreLoopPhoto6, alt: 'One More Loop race timing table with countdown' },
  { src: oneMoreLoopPhoto7, alt: 'One More Loop runners on the course road' },
  { src: oneMoreLoopPhoto8, alt: 'One More Loop participant in action during the run' },
];

export function Community() {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const activePhoto = activePhotoIndex !== null ? exclusiveEventPhotos[activePhotoIndex] : null;
  const goToPreviousPhoto = () => {
    setActivePhotoIndex((current) => {
      if (current === null) return null;
      return (current - 1 + exclusiveEventPhotos.length) % exclusiveEventPhotos.length;
    });
  };
  const goToNextPhoto = () => {
    setActivePhotoIndex((current) => {
      if (current === null) return null;
      return (current + 1) % exclusiveEventPhotos.length;
    });
  };

  useEffect(() => {
    if (activePhotoIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePhotoIndex(null);
      }
      if (event.key === 'ArrowLeft') {
        goToPreviousPhoto();
      }
      if (event.key === 'ArrowRight') {
        goToNextPhoto();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePhotoIndex]);

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-[var(--site-margin)]">
      <div className="max-w-[1440px] mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="border border-white/15 bg-[#0A0A0A] rounded-2xl p-10 md:p-14 mb-8"
        >
          <p className="font-['Space_Mono'] text-xs uppercase tracking-[0.2em] text-white/50 mb-4">DTBM Community</p>
          <h1 className="font-['Bebas_Neue'] text-[16vw] md:text-[9vw] leading-[0.85] tracking-tight mb-4">RUN WITH US</h1>
          <p className="text-white/70 text-base md:text-lg max-w-3xl">
            DTBM is a community-powered run club where consistency, courage, and connection come first. Whether it is your first 5K
            or your next half marathon, there is a crew waiting for you.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="px-4 py-2 border border-white/20 rounded-full text-xs uppercase tracking-wider text-white/70">Beginner Friendly</span>
            <span className="px-4 py-2 border border-white/20 rounded-full text-xs uppercase tracking-wider text-white/70">Weekly Meetups</span>
            <span className="px-4 py-2 border border-white/20 rounded-full text-xs uppercase tracking-wider text-white/70">Milestone Medals</span>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {communityPillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + index * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-7 hover:border-white/25 transition-all"
            >
              <div className="w-11 h-11 rounded-full border border-white/20 bg-[#111111] flex items-center justify-center mb-5 text-white">
                {pillar.icon}
              </div>
              <h2 className="font-['Bebas_Neue'] text-3xl tracking-wide mb-2">{pillar.title}</h2>
              <p className="text-sm md:text-base text-white/65 leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-8 md:p-10 mb-8"
        >
          <p className="font-['Space_Mono'] text-xs uppercase tracking-wider text-white/60 mb-3">Origin</p>
          <h2 className="font-['Bebas_Neue'] text-5xl md:text-6xl tracking-wide mb-6">DTBM Run Club Story</h2>
          <div className="space-y-5">
            {originStory.map((paragraph) => (
              <p key={paragraph} className="text-white/75 leading-relaxed text-sm md:text-base">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-8 md:p-10 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <MapPin size={18} className="text-white/70" />
            <p className="font-['Space_Mono'] text-xs uppercase tracking-wider text-white/60">Run Formats</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {runFormats.map((format) => (
              <div key={format.title} className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5">
                <h3 className="font-['Bebas_Neue'] text-2xl tracking-wide mb-1">{format.title}</h3>
                <p className="text-xs uppercase tracking-wider text-white/50 mb-3">{format.pace}</p>
                <p className="text-white/70 text-sm">{format.detail}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="one-more-loop"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-8 md:p-10 mb-8"
        >
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/25 text-[11px] uppercase tracking-wider font-['Space_Mono'] text-white/80">
              <Star size={13} />
              Exclusive Event
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 text-[11px] uppercase tracking-wider font-['Space_Mono'] text-white/65">
              <Clock3 size={13} />
              Backyard Race
            </div>
          </div>

          <h2 className="font-['Bebas_Neue'] text-5xl md:text-6xl tracking-wide leading-[0.9] mb-3">{exclusiveEvent.title}</h2>
          <p className="font-['Space_Mono'] text-xs uppercase tracking-wider text-white/55 mb-6">
            {exclusiveEvent.dateLabel} • {exclusiveEvent.timeLabel} • {exclusiveEvent.locationLabel}
          </p>

          <p className="text-white/78 text-sm md:text-base leading-relaxed mb-6">{exclusiveEvent.story}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
              <p className="font-['Space_Mono'] text-[11px] uppercase tracking-wider text-white/45 mb-2">Winner</p>
              <p className="font-['Bebas_Neue'] text-3xl tracking-wide">{exclusiveEvent.winner}</p>
            </div>
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4">
              <p className="font-['Space_Mono'] text-[11px] uppercase tracking-wider text-white/45 mb-2">Race Duration</p>
              <p className="font-['Bebas_Neue'] text-3xl tracking-wide">{exclusiveEvent.duration}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {exclusiveEventPhotos.map((photo, index) => (
              <div key={photo.alt} className="group relative overflow-hidden rounded-xl border border-white/10 bg-black">
                <button
                  type="button"
                  onClick={() => setActivePhotoIndex(index)}
                  className="block w-full text-left"
                  aria-label={`Open photo ${index + 1}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="h-56 w-full object-contain bg-black grayscale saturate-0 group-hover:grayscale-0 group-hover:saturate-100 group-hover:scale-[1.02] transition-all duration-500"
                  />
                </button>
                <a
                  href={photo.src}
                  download={`one-more-loop-${index + 1}.jpg`}
                  onClick={(event) => event.stopPropagation()}
                  className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-white/35 bg-black/60 px-2 py-1 text-[10px] font-['Space_Mono'] uppercase tracking-wider text-white/90 hover:bg-white hover:text-black transition-colors"
                  title="Download photo"
                  aria-label={`Download photo ${index + 1}`}
                >
                  <Download size={11} />
                  DL
                </a>
                <p className="pointer-events-none absolute left-2 bottom-2 rounded-full border border-white/20 bg-black/50 px-2 py-1 font-['Space_Mono'] text-[10px] uppercase tracking-wider text-white/75">
                  Tap to expand
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4 text-white/70">
              <MessageSquare size={18} />
              <span className="font-['Space_Mono'] text-xs uppercase tracking-wider">How We Stay Connected</span>
            </div>
            <p className="text-white/75 mb-4">
              Weekly updates, challenge drops, and event details are shared through DTBM announcements and run-day briefings.
              Show up, check in, and let the crew pull you forward.
            </p>
            <div className="flex items-center gap-3 text-white/65 text-sm">
              <Trophy size={16} />
              <span>Earn medals by hitting milestones and showing consistency.</span>
            </div>
          </div>

          <div className="bg-white text-black rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <p className="font-['Space_Mono'] text-xs uppercase tracking-wider mb-3">Ready to Join?</p>
              <h3 className="font-['Bebas_Neue'] text-4xl leading-[0.9] mb-3">YOUR CREW IS WAITING</h3>
              <p className="text-black/70 text-sm">Create your account and start logging runs with DTBM.</p>
            </div>
            <div className="mt-6 grid gap-3">
              <Link to="/signup" className="inline-flex justify-center border border-black px-6 py-3 text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-all">
                Join DTBM
              </Link>
            </div>
          </div>
        </motion.section>
      </div>

      {activePhoto && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm px-4 py-8"
          onClick={() => setActivePhotoIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded event photo"
        >
          <div
            className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#050505]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="font-['Space_Mono'] text-[11px] uppercase tracking-wider text-white/70">
                One More Loop Photo {activePhotoIndex! + 1}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPreviousPhoto}
                  className="inline-flex items-center gap-1 rounded-full border border-white/30 px-3 py-1.5 font-['Space_Mono'] text-[11px] uppercase tracking-wider text-white/90 hover:bg-white hover:text-black transition-colors"
                >
                  <ChevronLeft size={12} />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={goToNextPhoto}
                  className="inline-flex items-center gap-1 rounded-full border border-white/30 px-3 py-1.5 font-['Space_Mono'] text-[11px] uppercase tracking-wider text-white/90 hover:bg-white hover:text-black transition-colors"
                >
                  Next
                  <ChevronRight size={12} />
                </button>
                <a
                  href={activePhoto.src}
                  download={`one-more-loop-${activePhotoIndex! + 1}.jpg`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1.5 font-['Space_Mono'] text-[11px] uppercase tracking-wider text-white/90 hover:bg-white hover:text-black transition-colors"
                >
                  <Download size={12} />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setActivePhotoIndex(null)}
                  className="inline-flex items-center rounded-full border border-white/30 px-3 py-1.5 font-['Space_Mono'] text-[11px] uppercase tracking-wider text-white/90 hover:bg-white hover:text-black transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-black p-3 md:p-6">
              <button
                type="button"
                onClick={goToPreviousPhoto}
                className="absolute left-5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/55 p-2 text-white/90 hover:bg-white hover:text-black transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft size={16} />
              </button>
              <img
                src={activePhoto.src}
                alt={activePhoto.alt}
                className="h-full w-full object-contain"
              />
              <button
                type="button"
                onClick={goToNextPhoto}
                className="absolute right-5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/55 p-2 text-white/90 hover:bg-white hover:text-black transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
