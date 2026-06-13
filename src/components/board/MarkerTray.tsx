"use client";

import { Hand, Pen, Eraser, Trash2, StickyNote } from "lucide-react";
import { MARKER_COLORS } from "./ink";

export type Tool = "pan" | "draw" | "erase";

interface Props {
  tool: Tool;
  color: string;
  hasInk: boolean;
  onTool: (t: Tool) => void;
  onColor: (c: string) => void;
  onSign: () => void;
  onClear: () => void;
}

export default function MarkerTray({
  tool,
  color,
  hasInk,
  onTool,
  onColor,
  onSign,
  onClear,
}: Props) {
  const Tab = ({
    active,
    label,
    onClick,
    children,
  }: {
    active?: boolean;
    label: string;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-ink text-board"
          : "text-ink/70 hover:text-ink hover:bg-ink/10"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/90 backdrop-blur border border-ink/10 shadow-[0_6px_24px_rgba(0,0,0,0.16)] max-w-[95vw]">
      <Tab active={tool === "pan"} label="Move the board" onClick={() => onTool("pan")}>
        <Hand size={17} />
      </Tab>
      <Tab active={tool === "draw"} label="Marker — draw on the board" onClick={() => onTool("draw")}>
        <Pen size={17} />
      </Tab>

      {tool === "draw" && (
        <div className="flex items-center gap-1 px-1">
          {MARKER_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onColor(c)}
              aria-label={`marker ${c}`}
              className="w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-110"
              style={{
                background: c,
                outline: color === c ? "2px solid #27313f" : "none",
                outlineOffset: 1,
              }}
            />
          ))}
        </div>
      )}

      <Tab active={tool === "erase"} label="Eraser" onClick={() => onTool("erase")}>
        <Eraser size={17} />
      </Tab>

      <span className="w-px h-5 bg-ink/15 mx-0.5" />

      <button
        onClick={onSign}
        title="Sign the board"
        className="flex items-center gap-1.5 h-9 px-3 rounded-full text-pink-600 hover:bg-pink-50 transition-colors font-marker text-[13px]"
      >
        <StickyNote size={15} /> <span className="hidden sm:inline">Sign it</span>
      </button>
      <Tab label="Clear my drawing" onClick={onClear}>
        <Trash2 size={16} className={hasInk ? "" : "opacity-30"} />
      </Tab>
    </div>
  );
}
