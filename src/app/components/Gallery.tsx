import { motion } from "motion/react";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import Masonry from "react-responsive-masonry";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

import img1 from "../pages/IMG-20250726-WA0010.jpg.jpeg";
import img2 from "../pages/IMG-20250803-WA0014.jpg.jpeg";
import img3 from "../pages/IMG-20251019-WA0006.jpg.jpeg";
import img4 from "../pages/IMG-20251109-WA0029.jpg.jpeg";
import img5 from "../pages/IMG-20251116-WA0006.jpg.jpeg";
import img6 from "../pages/IMG-20251129-WA0002.jpg.jpeg";
import img7 from "../pages/IMG-20251207-WA0002(2).jpg.jpeg";
import img8 from "../pages/IMG-20260124-WA0004.jpg.jpeg";

const photos = [
  { id: 1, url: img1, alt: "Community run moment 1" },
  { id: 2, url: img2, alt: "Community run moment 2" },
  { id: 3, url: img3, alt: "Community run moment 3" },
  { id: 4, url: img4, alt: "Community run moment 4" },
  { id: 5, url: img5, alt: "Community run moment 5" },
  { id: 6, url: img6, alt: "Community run moment 6" },
  { id: 7, url: img7, alt: "Community run moment 7" },
  { id: 8, url: img8, alt: "Community run moment 8" },
];

export function Gallery() {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const activePhoto = activePhotoIndex !== null ? photos[activePhotoIndex] : null;
  const touchStartXRef = useRef<number | null>(null);

  const goToPreviousPhoto = () => {
    setActivePhotoIndex((current) => {
      if (current === null) return null;
      return (current - 1 + photos.length) % photos.length;
    });
  };

  const goToNextPhoto = () => {
    setActivePhotoIndex((current) => {
      if (current === null) return null;
      return (current + 1) % photos.length;
    });
  };

  useEffect(() => {
    if (activePhotoIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePhotoIndex(null);
      if (event.key === "ArrowLeft") goToPreviousPhoto();
      if (event.key === "ArrowRight") goToNextPhoto();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activePhotoIndex]);

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX ?? null;
    touchStartXRef.current = null;

    if (startX === null || endX === null) return;

    const deltaX = endX - startX;
    if (deltaX > 60) goToPreviousPhoto();
    if (deltaX < -60) goToNextPhoto();
  };

  return (
    <section className="relative py-32 bg-[#121212]/30">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="font-['Bebas_Neue'] text-5xl md:text-6xl mb-4">
            Community Gallery
          </h2>
          <p className="text-white/60 text-lg max-w-2xl">
            Moments captured from our running adventures.
          </p>
        </motion.div>

        <Masonry columnsCount={4} gutter="1.5rem">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02 }}
              className="relative group cursor-pointer overflow-hidden rounded-2xl"
            >
              <button
                type="button"
                onClick={() => setActivePhotoIndex(index)}
                className="block w-full text-left"
                aria-label={`Open gallery photo ${index + 1}`}
              >
                <ImageWithFallback
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </button>

              <a
                href={photo.url}
                download={`gallery-photo-${index + 1}.jpg`}
                onClick={(event) => event.stopPropagation()}
                className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/35 bg-black/60 px-2 py-1 text-[10px] font-['Space_Mono'] uppercase tracking-wider text-white/90 hover:bg-white hover:text-black transition-colors"
                title="Download photo"
                aria-label={`Download gallery photo ${index + 1}`}
              >
                <Download size={11} />
                DL
              </a>

              <div className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-['Space_Mono'] text-[10px] uppercase tracking-[0.2em] text-white/80">Hover to reveal color</p>
                </div>
              </div>
            </motion.div>
          ))}
        </Masonry>
      </div>

      {activePhoto && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm px-4 py-8"
          onClick={() => setActivePhotoIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded gallery photo"
        >
          <div
            className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#050505]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="font-['Space_Mono'] text-[11px] uppercase tracking-wider text-white/70">
                Gallery Photo {activePhotoIndex! + 1}
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
                  href={activePhoto.url}
                  download={`gallery-photo-${activePhotoIndex! + 1}.jpg`}
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
                  <X size={12} />
                </button>
              </div>
            </div>

            <div
              className="relative flex-1 bg-black p-3 md:p-6"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <button
                type="button"
                onClick={goToPreviousPhoto}
                className="absolute left-5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/55 p-2 text-white/90 hover:bg-white hover:text-black transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft size={16} />
              </button>
              <img
                src={activePhoto.url}
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
    </section>
  );
}
