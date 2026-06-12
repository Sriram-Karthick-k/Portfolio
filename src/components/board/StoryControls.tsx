"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface Props {
  index: number;
  total: number;
  caption: string;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onShowAll: () => void;
}

export default function StoryControls({
  index,
  total,
  caption,
  isLast,
  onPrev,
  onNext,
  onShowAll,
}: Props) {
  return (
    <>
      {/* top caption — sticky-note style */}
      <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={caption}
            initial={{ opacity: 0, y: -10, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="bg-yellow-200 px-4 py-1.5 shadow-[2px_3px_8px_rgba(0,0,0,0.16)]"
          >
            <span className="font-hand font-bold text-ink text-xl sm:text-2xl leading-none">
              {caption}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* bottom story navigator */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-2 py-2 rounded-full bg-white/90 backdrop-blur border border-ink/10 shadow-[0_6px_24px_rgba(0,0,0,0.18)]">
          <button
            onClick={onPrev}
            disabled={index <= 0}
            className="w-10 h-10 flex items-center justify-center rounded-full text-ink/70 hover:text-ink hover:bg-ink/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="Previous"
          >
            <ArrowLeft size={19} />
          </button>

          {/* progress dots */}
          <div className="flex items-center gap-1.5 px-2">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 22 : 7,
                  height: 7,
                  background: i <= index ? "#27313f" : "rgba(39,49,63,0.22)",
                }}
              />
            ))}
          </div>

          <button
            onClick={onNext}
            className="flex items-center gap-1.5 h-10 px-4 rounded-full font-marker font-bold text-board bg-ink hover:bg-blue-600 transition-colors"
          >
            {isLast ? (
              <>
                Finish <Check size={17} />
              </>
            ) : (
              <>
                Next <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>

        <button
          onClick={onShowAll}
          className="font-marker text-[13px] text-ink/50 hover:text-ink/80 transition-colors"
        >
          skip · show the whole board
        </button>
      </div>
    </>
  );
}
