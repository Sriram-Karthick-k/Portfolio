"use client";

import { Plus, Minus, Maximize2, RotateCcw, BookOpen, FileText } from "lucide-react";

interface Props {
  zoom: number;
  drawing: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReplay: () => void;
  onSkip: () => void;
  onReadMode: () => void;
}

export default function BoardToolbar({
  zoom,
  drawing,
  onZoomIn,
  onZoomOut,
  onFit,
  onReplay,
  onSkip,
  onReadMode,
}: Props) {
  const Btn = ({
    onClick,
    label,
    children,
  }: {
    onClick: () => void;
    label: string;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-9 h-9 flex items-center justify-center rounded-full text-ink/70 hover:text-ink hover:bg-ink/10 transition-colors"
    >
      {children}
    </button>
  );

  return (
    <div className="fixed z-40 bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-2 py-1.5 rounded-full bg-white/90 backdrop-blur border border-ink/10 shadow-[0_6px_24px_rgba(0,0,0,0.18)] max-w-[95vw]">
      {drawing && (
        <button
          onClick={onSkip}
          className="font-marker text-[13px] font-bold px-3 h-9 rounded-full text-board bg-ink hover:bg-blue-600 transition-colors whitespace-nowrap"
        >
          Skip ⏭
        </button>
      )}

      <Btn onClick={onZoomOut} label="Zoom out">
        <Minus size={17} />
      </Btn>
      <button
        onClick={onFit}
        title="Fit board"
        className="min-w-[46px] px-1 h-9 font-marker text-[13px] text-ink/70 hover:text-ink rounded-full hover:bg-ink/10 transition-colors"
      >
        {Math.round(zoom * 100)}%
      </button>
      <Btn onClick={onZoomIn} label="Zoom in">
        <Plus size={17} />
      </Btn>

      <span className="w-px h-5 bg-ink/15 mx-1 hidden sm:block" />

      <Btn onClick={onFit} label="Fit to board">
        <Maximize2 size={16} />
      </Btn>
      <Btn onClick={onReplay} label="Replay drawing">
        <RotateCcw size={16} />
      </Btn>

      <span className="w-px h-5 bg-ink/15 mx-1" />

      <button
        onClick={onReadMode}
        title="Plain reading view"
        className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-full text-ink/70 hover:text-ink hover:bg-ink/10 transition-colors font-marker text-[13px]"
      >
        <BookOpen size={15} /> <span className="hidden sm:inline">Read</span>
      </button>
      <a
        href="/Sriram-Karthick-K.pdf"
        target="_blank"
        rel="noopener noreferrer"
        title="Resume PDF"
        className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-full text-blue-600 hover:bg-blue-50 transition-colors font-marker text-[13px]"
      >
        <FileText size={15} /> <span className="hidden sm:inline">Resume</span>
      </a>
    </div>
  );
}
