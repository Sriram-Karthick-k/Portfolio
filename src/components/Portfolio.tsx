"use client";

import { useEffect, useState } from "react";
import BoardStage from "@/components/board/BoardStage";
import ReadMode from "@/components/ReadMode";

type Mode = "canvas" | "read";

export default function Portfolio() {
  // default to the board so it renders server-side (good for first paint + SEO)
  const [mode, setMode] = useState<Mode>("canvas");

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-mode") as Mode | null;
    if (saved === "read") setMode("read");
  }, []);

  const switchMode = (m: Mode) => {
    setMode(m);
    localStorage.setItem("portfolio-mode", m);
    if (m === "read") window.scrollTo(0, 0);
  };

  return mode === "canvas" ? (
    <BoardStage onReadMode={() => switchMode("read")} />
  ) : (
    <ReadMode onCanvas={() => switchMode("canvas")} />
  );
}
