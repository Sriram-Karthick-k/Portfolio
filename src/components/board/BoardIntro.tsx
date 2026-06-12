"use client";

import { motion } from "framer-motion";
import { Hand, ZoomIn, BookOpen, Pencil } from "lucide-react";

interface Props {
  onEnter: () => void;
  onReadMode: () => void;
}

export default function BoardIntro({ onEnter, onReadMode }: Props) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-board/95 backdrop-blur-[2px] px-5"
    >
      {/* dotted board behind */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.10) 1.4px, transparent 1.4px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="relative text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-yellow-200 px-3 py-1 mb-6 shadow-[2px_3px_8px_rgba(0,0,0,0.15)]"
        >
          <Pencil size={14} className="text-ink/70" />
          <span className="font-marker font-bold text-[13px] text-ink/80">
            a hand-drawn portfolio
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="font-hand font-bold text-ink leading-[0.9] text-6xl sm:text-7xl"
        >
          Sriram Karthick K
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.55 }}
          className="font-marker text-ink/70 text-base sm:text-lg leading-relaxed mt-5 mb-8"
        >
          I build <b className="text-blue-600">Vani</b>, Zoho&apos;s infinite
          whiteboard. So I&apos;ll{" "}
          <span className="bg-yellow-200 px-1">walk you through mine</span> — one
          step at a time. Hit Next and watch it draw.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
        >
          <button
            onClick={onEnter}
            className="w-full sm:w-auto font-marker font-bold text-[16px] px-8 py-3 bg-ink text-board rounded-full shadow-[3px_4px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:bg-blue-600 transition-all"
          >
            ▶ Start the story
          </button>
          <button
            onClick={onReadMode}
            className="w-full sm:w-auto font-marker text-[15px] inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-ink/30 text-ink/80 rounded-full hover:border-ink/60 transition-all"
          >
            <BookOpen size={16} /> Just read it
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex items-center justify-center gap-x-5 gap-y-2 flex-wrap font-marker text-[13px] text-ink/55"
        >
          <span className="flex items-center gap-1.5">
            <Hand size={14} /> drag to pan
          </span>
          <span className="flex items-center gap-1.5">
            <ZoomIn size={14} /> pinch / scroll to zoom
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
