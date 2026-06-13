"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string, name: string) => void;
}

export default function SignModal({ open, onClose, onSubmit }: Props) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");

  if (!open) return null;

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSubmit(t.slice(0, 80), name.trim().slice(0, 24));
    setText("");
    setName("");
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 backdrop-blur-[2px] px-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, rotate: -1 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-[#fde68a] p-6 shadow-[4px_8px_0_rgba(0,0,0,0.18)] -rotate-1"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2.5 right-2.5 text-ink/50 hover:text-ink"
        >
          <X size={18} />
        </button>

        <h3 className="font-hand font-bold text-2xl text-ink mb-1">
          sign the board ✍️
        </h3>
        <p className="font-marker text-[13px] text-ink/60 mb-4">
          leave a note — it sticks around on your next visit.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={80}
          rows={3}
          autoFocus
          placeholder="say something nice…"
          className="w-full resize-none rounded-md bg-white/70 border border-ink/15 px-3 py-2 font-marker text-ink text-[15px] outline-none focus:border-ink/40"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          placeholder="— your name (optional)"
          className="w-full mt-2 rounded-md bg-white/70 border border-ink/15 px-3 py-2 font-marker text-ink text-[14px] outline-none focus:border-ink/40"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="font-marker text-[14px] px-4 py-2 rounded-full text-ink/70 hover:bg-ink/10 transition-colors"
          >
            cancel
          </button>
          <button
            onClick={submit}
            className="font-marker font-bold text-[14px] px-5 py-2 rounded-full bg-ink text-board hover:bg-pink-600 transition-colors"
          >
            stick it on 📌
          </button>
        </div>
      </motion.div>
    </div>
  );
}
