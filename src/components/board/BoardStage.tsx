"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, FileText } from "lucide-react";
import {
  SECTIONS,
  buildChapters,
  getBoardBounds,
  boundsOfIds,
  CONNECTOR_LABELS,
  Section,
} from "@/data/board";
import RoughBoard from "./RoughBoard";
import SectionContent from "./SectionContent";
import BoardToolbar from "./BoardToolbar";
import BoardIntro from "./BoardIntro";
import StoryControls from "./StoryControls";
import InkLayer from "./InkLayer";
import MarkerTray, { Tool } from "./MarkerTray";
import SignModal from "./SignModal";
import {
  Stroke,
  Signature,
  MARKER_COLORS,
  SIGN_STICKIES,
  sigPosition,
  GUESTBOOK_LABEL,
} from "./ink";

const INK_KEY = "board-ink-v1";
const SIGN_KEY = "board-sign-v1";
const STROKE_WIDTH = 3.5;
const ERASE_RADIUS = 18;

interface Transform {
  x: number;
  y: number;
  scale: number;
}

const MIN_SCALE = 0.18;
const MAX_SCALE = 2.4;
const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const uid = () => Math.random().toString(36).slice(2);

export default function BoardStage({ onReadMode }: { onReadMode: () => void }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const chapters = useMemo(() => buildChapters(), []);
  const flatSteps = useMemo(() => chapters.flatMap((c) => c.steps), [chapters]);
  const chapterEnds = useMemo(() => {
    let acc = 0;
    return chapters.map((c) => (acc += c.steps.length));
  }, [chapters]);
  const lastChapter = chapters.length - 1;

  const tf = useRef<Transform>({ x: 0, y: 0, scale: 0.6 });
  const [view, setView] = useState<Transform>({ x: 0, y: 0, scale: 0.6 });
  const [vp, setVp] = useState({ w: 1200, h: 800 });

  const [showIntro, setShowIntro] = useState(true);
  const [chapterIndex, setChapterIndex] = useState(-1);
  const [draw, setDraw] = useState<{ target: number; animate: boolean }>({
    target: 0,
    animate: true,
  });
  const [boardKey, setBoardKey] = useState(0);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [storyDone, setStoryDone] = useState(false);

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const panning = useRef(false);
  const pinch = useRef<{ dist: number; cx: number; cy: number } | null>(null);
  const animRef = useRef<number | null>(null);
  const commitRaf = useRef<number | null>(null);

  /* ---------- marker / sign state ---------- */
  const [tool, setTool] = useState<Tool>("pan");
  const [inkColor, setInkColor] = useState(MARKER_COLORS[0]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [signOpen, setSignOpen] = useState(false);
  const [, setLiveTick] = useState(0);
  const drawingRef = useRef(false);
  const erasingRef = useRef(false);
  const curPts = useRef<{ x: number; y: number }[]>([]);
  const liveRaf = useRef<number | null>(null);
  const loadedInk = useRef(false);

  /* ---------- transform plumbing ---------- */
  const applyStyle = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    const { x, y, scale } = tf.current;
    w.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }, []);

  const layerTimer = useRef<number | null>(null);
  const setLayer = useCallback((on: boolean) => {
    const w = worldRef.current;
    if (!w) return;
    if (layerTimer.current != null) {
      clearTimeout(layerTimer.current);
      layerTimer.current = null;
    }
    if (on) w.style.willChange = "transform";
    else
      layerTimer.current = window.setTimeout(() => {
        if (worldRef.current) worldRef.current.style.willChange = "auto";
      }, 220);
  }, []);

  const commit = useCallback(() => {
    if (commitRaf.current != null) return;
    commitRaf.current = requestAnimationFrame(() => {
      commitRaf.current = null;
      setView({ ...tf.current });
    });
  }, []);

  const getViewport = useCallback(() => {
    const el = viewportRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height };
    }
    return { w: window.innerWidth, h: window.innerHeight };
  }, []);

  const fitTransform = useCallback((): Transform => {
    const { w, h } = getViewport();
    const b = getBoardBounds(SECTIONS);
    const padX = w < 640 ? 40 : 120;
    const padY = w < 640 ? 100 : 120;
    const scale = clampScale(
      Math.min(w / (b.width + padX * 2), h / (b.height + padY * 2))
    );
    return {
      x: w / 2 - (b.minX + b.width / 2) * scale,
      y: h / 2 - (b.minY + b.height / 2) * scale,
      scale,
    };
  }, [getViewport]);

  /* frame the camera on a set of sections, leaving room for caption + nav */
  const frameIds = useCallback(
    (ids: string[]): Transform => {
      const { w, h } = getViewport();
      const b = boundsOfIds(ids);
      const topInset = 120;
      const bottomInset = 150;
      const availH = Math.max(120, h - topInset - bottomInset);
      const padX = w < 640 ? 28 : 90;
      const scale = Math.min(
        clampScale(Math.min((w - padX * 2) / b.width, availH / b.height)),
        1.15
      );
      const cx = b.minX + b.width / 2;
      const cy = b.minY + b.height / 2;
      return {
        x: w / 2 - cx * scale,
        y: topInset + availH / 2 - cy * scale,
        scale,
      };
    },
    [getViewport]
  );

  const animateTo = useCallback(
    (target: Transform, dur = 650) => {
      if (animRef.current != null) cancelAnimationFrame(animRef.current);
      const start = performance.now();
      const from = { ...tf.current };
      setLayer(true);
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const e = easeInOutCubic(p);
        tf.current = {
          x: from.x + (target.x - from.x) * e,
          y: from.y + (target.y - from.y) * e,
          scale: from.scale + (target.scale - from.scale) * e,
        };
        applyStyle();
        commit();
        if (p < 1) animRef.current = requestAnimationFrame(step);
        else {
          animRef.current = null;
          setLayer(false);
        }
      };
      animRef.current = requestAnimationFrame(step);
    },
    [applyStyle, commit, setLayer]
  );

  const zoomAt = useCallback(
    (sx: number, sy: number, factor: number) => {
      const cur = tf.current;
      const next = clampScale(cur.scale * factor);
      const wx = (sx - cur.x) / cur.scale;
      const wy = (sy - cur.y) / cur.scale;
      tf.current = { scale: next, x: sx - wx * next, y: sy - wy * next };
      applyStyle();
      commit();
    },
    [applyStyle, commit]
  );

  /* ---------- init ---------- */
  useEffect(() => {
    const measure = () => setVp(getViewport());
    measure();
    tf.current = frameIds(["hero"]);
    applyStyle();
    commit();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      setLayer(true);
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * 0.0015));
      setLayer(false);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt, setLayer]);

  /* ---------- ink helpers ---------- */
  const worldPt = (e: React.PointerEvent) => {
    const rect = viewportRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - tf.current.x) / tf.current.scale,
      y: (e.clientY - rect.top - tf.current.y) / tf.current.scale,
    };
  };

  const scheduleLive = () => {
    if (liveRaf.current != null) return;
    liveRaf.current = requestAnimationFrame(() => {
      liveRaf.current = null;
      setLiveTick((t) => t + 1);
    });
  };

  const eraseAt = (wp: { x: number; y: number }) => {
    const r = ERASE_RADIUS / tf.current.scale;
    setStrokes((prev) =>
      prev.filter(
        (s) => !s.pts.some((p) => Math.hypot(p.x - wp.x, p.y - wp.y) < r)
      )
    );
  };

  /* load + persist user ink/signatures */
  useEffect(() => {
    try {
      const ink = localStorage.getItem(INK_KEY);
      if (ink) setStrokes(JSON.parse(ink));
      const sig = localStorage.getItem(SIGN_KEY);
      if (sig) setSignatures(JSON.parse(sig));
    } catch {}
    loadedInk.current = true;
  }, []);
  useEffect(() => {
    if (loadedInk.current)
      try {
        localStorage.setItem(INK_KEY, JSON.stringify(strokes));
      } catch {}
  }, [strokes]);
  useEffect(() => {
    if (loadedInk.current)
      try {
        localStorage.setItem(SIGN_KEY, JSON.stringify(signatures));
      } catch {}
  }, [signatures]);

  /* ---------- pan + pinch + draw ---------- */
  const activeTool = (): Tool => (storyDone ? tool : "pan");

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, textarea")) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        cx: (pts[0].x + pts[1].x) / 2,
        cy: (pts[0].y + pts[1].y) / 2,
      };
      panning.current = false;
      drawingRef.current = false;
      erasingRef.current = false;
      setLayer(true);
      return;
    }

    const t = activeTool();
    if (t === "draw") {
      drawingRef.current = true;
      curPts.current = [worldPt(e)];
      scheduleLive();
    } else if (t === "erase") {
      erasingRef.current = true;
      eraseAt(worldPt(e));
    } else {
      panning.current = true;
      document.body.classList.add("board-grabbing");
    }
    setLayer(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch.current && pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      const rect = viewportRef.current!.getBoundingClientRect();
      zoomAt(cx - rect.left, cy - rect.top, dist / pinch.current.dist);
      tf.current.x += cx - pinch.current.cx;
      tf.current.y += cy - pinch.current.cy;
      applyStyle();
      commit();
      pinch.current = { dist, cx, cy };
      return;
    }

    if (drawingRef.current) {
      curPts.current.push(worldPt(e));
      scheduleLive();
      return;
    }
    if (erasingRef.current) {
      eraseAt(worldPt(e));
      return;
    }
    if (panning.current) {
      tf.current.x += e.movementX;
      tf.current.y += e.movementY;
      applyStyle();
      commit();
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) {
      if (drawingRef.current) {
        if (curPts.current.length > 1) {
          const stroke: Stroke = {
            id: uid(),
            color: inkColor,
            width: STROKE_WIDTH,
            pts: curPts.current.slice(),
          };
          setStrokes((p) => [...p, stroke]);
        }
        drawingRef.current = false;
        curPts.current = [];
        scheduleLive();
      }
      erasingRef.current = false;
      panning.current = false;
      setLayer(false);
      document.body.classList.remove("board-grabbing");
    }
  };

  /* ---------- signing ---------- */
  const handleSign = (text: string, name: string) => {
    const idx = signatures.length;
    const sig: Signature = {
      id: uid(),
      text,
      name,
      sticky: SIGN_STICKIES[idx % SIGN_STICKIES.length],
      rot: ((idx * 37) % 9) - 4,
    };
    setSignatures((p) => [...p, sig]);
    setSignOpen(false);
    const pos = sigPosition(idx);
    animateTo(
      {
        x: vp.w / 2 - (pos.x + pos.w / 2) * 0.9,
        y: vp.h / 2 - (pos.y + pos.h / 2) * 0.9,
        scale: 0.9,
      },
      700
    );
  };
  const clearMine = () => setStrokes([]);

  /* ---------- reveal bookkeeping ---------- */
  const handleReveal = useCallback((id: string) => {
    setRevealed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);
  const handleHide = useCallback((id: string) => {
    setRevealed((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /* ---------- story navigation ---------- */
  const goToChapter = useCallback(
    (nc: number, animateDraw: boolean) => {
      setChapterIndex(nc);
      setDraw({ target: nc < 0 ? 0 : chapterEnds[nc], animate: animateDraw });
      if (nc >= 0) animateTo(frameIds(chapters[nc].focusIds), 650);
    },
    [chapterEnds, chapters, animateTo, frameIds]
  );

  const enterStory = () => {
    setShowIntro(false);
    goToChapter(0, true);
  };

  const next = () => {
    if (chapterIndex < lastChapter) goToChapter(chapterIndex + 1, true);
    else finish();
  };
  const prev = () => {
    if (chapterIndex > 0) goToChapter(chapterIndex - 1, false);
  };

  const finish = () => {
    setStoryDone(true);
    setDraw({ target: flatSteps.length, animate: false });
    setChapterIndex(lastChapter);
    animateTo(fitTransform(), 700);
  };

  const showEverything = () => {
    setShowIntro(false);
    setStoryDone(true);
    setChapterIndex(lastChapter);
    setDraw({ target: flatSteps.length, animate: false });
    animateTo(fitTransform(), 700);
  };

  const replayStory = () => {
    setRevealed(new Set());
    setStoryDone(false);
    setChapterIndex(0);
    setDraw({ target: chapterEnds[0], animate: true });
    setBoardKey((k) => k + 1);
    animateTo(frameIds(chapters[0].focusIds), 600);
  };

  const handleZoomIn = () => zoomAt(vp.w / 2, vp.h / 2, 1.25);
  const handleZoomOut = () => zoomAt(vp.w / 2, vp.h / 2, 0.8);
  const handleFit = () => animateTo(fitTransform());

  /* keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (showIntro) return;
      if (!storyDone) {
        if (e.key === "ArrowRight" || e.key === " ") next();
        if (e.key === "ArrowLeft") prev();
      } else {
        if (e.key === "f" || e.key === "F") handleFit();
        if (e.key === "+" || e.key === "=") handleZoomIn();
        if (e.key === "-") handleZoomOut();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIntro, storyDone, chapterIndex, vp]);

  const cursorCls =
    !storyDone || tool === "pan"
      ? "board-grab"
      : tool === "draw"
        ? "cursor-crosshair"
        : "cursor-cell";

  return (
    <div
      ref={viewportRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      className={`fixed inset-0 overflow-hidden bg-board touch-none select-none ${cursorCls}`}
    >
      <div className="pointer-events-none absolute inset-0 z-[1] [background:radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.06)_100%)]" />

      <div
        ref={worldRef}
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            left: -6000,
            top: -6000,
            width: 12000,
            height: 12000,
            backgroundImage:
              "radial-gradient(circle, rgba(39,49,63,0.14) 1.3px, transparent 1.3px)",
            backgroundSize: "28px 28px",
            zIndex: 0,
          }}
        />

        {/* visitor's marker ink (sits on the board, under the cards) */}
        <InkLayer
          strokes={strokes}
          live={
            drawingRef.current && curPts.current.length > 1
              ? { id: "live", color: inkColor, width: STROKE_WIDTH, pts: curPts.current }
              : null
          }
        />

        <RoughBoard
          steps={flatSteps}
          targetStep={draw.target}
          animate={draw.animate}
          boardKey={boardKey}
          onReveal={handleReveal}
          onHide={handleHide}
        />

        {SECTIONS.map((s: Section) => {
          const on = revealed.has(s.id);
          return (
            <motion.div
              key={s.id}
              className="board-section absolute rounded-2xl"
              style={{
                left: s.x,
                top: s.y,
                width: s.w,
                minHeight: s.h,
                zIndex: 5,
                pointerEvents: on ? "auto" : "none",
                boxShadow: "0 18px 36px -22px rgba(15,23,42,0.45)",
              }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
            >
              <SectionContent section={s} />
            </motion.div>
          );
        })}

        {/* connector labels — appear with their target node */}
        {CONNECTOR_LABELS.map((l, i) => {
          const on = revealed.has(l.showWith);
          return (
            <motion.div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: l.x, top: l.y, zIndex: 6 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: on ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-marker text-[13px] text-slate-500 bg-board/90 px-1.5 py-0.5 rounded-md whitespace-nowrap -rotate-2 inline-block">
                {l.text}
              </span>
            </motion.div>
          );
        })}

        {/* guestbook — visitor signatures */}
        {signatures.length > 0 && (
          <div
            className="absolute pointer-events-none"
            style={{ left: GUESTBOOK_LABEL.x, top: GUESTBOOK_LABEL.y, zIndex: 4 }}
          >
            <span className="font-hand font-bold text-2xl text-ink/70">
              ✎ guestbook
            </span>
          </div>
        )}
        {signatures.map((sig, i) => {
          const pos = sigPosition(i);
          return (
            <motion.div
              key={sig.id}
              className="absolute pointer-events-none p-3 flex flex-col shadow-[2px_4px_10px_rgba(0,0,0,0.16)]"
              style={{
                left: pos.x,
                top: pos.y,
                width: pos.w,
                minHeight: pos.h,
                background: sig.sticky,
                transform: `rotate(${sig.rot}deg)`,
                zIndex: 4,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <p className="font-marker text-ink/90 text-[15px] leading-snug flex-1 break-words">
                {sig.text}
              </p>
              {sig.name && (
                <p className="font-hand text-ink/70 text-lg mt-1 leading-none">
                  — {sig.name}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* brand chip */}
      <div className="fixed top-4 left-4 z-40 flex items-center gap-2 pointer-events-none">
        <div className="bg-yellow-200 px-2.5 py-1 shadow-[2px_2px_6px_rgba(0,0,0,0.15)] -rotate-3">
          <span className="font-hand font-bold text-ink text-lg leading-none">SK</span>
        </div>
        <span className="font-marker text-ink/60 text-sm hidden sm:block">
          Sriram&apos;s whiteboard
        </span>
      </div>

      {/* during the story: quick exits top-right */}
      {!showIntro && !storyDone && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-1">
          <button
            onClick={onReadMode}
            className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-white/85 backdrop-blur border border-ink/10 text-ink/70 hover:text-ink font-marker text-[13px] transition-colors"
          >
            <BookOpen size={15} /> Read
          </button>
          <a
            href="/Sriram-Karthick-K.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-white/85 backdrop-blur border border-ink/10 text-blue-600 hover:bg-blue-50 font-marker text-[13px] transition-colors"
          >
            <FileText size={15} /> Resume
          </a>
        </div>
      )}

      {/* story controls vs free-explore toolbar */}
      {!showIntro && !storyDone && (
        <StoryControls
          index={chapterIndex < 0 ? 0 : chapterIndex}
          total={chapters.length}
          caption={chapters[chapterIndex < 0 ? 0 : chapterIndex].caption}
          isLast={chapterIndex >= lastChapter}
          onPrev={prev}
          onNext={next}
          onShowAll={showEverything}
        />
      )}

      {storyDone && (
        <BoardToolbar
          zoom={view.scale}
          drawing={false}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFit={handleFit}
          onReplay={replayStory}
          onSkip={() => {}}
          onReadMode={onReadMode}
        />
      )}

      {/* the whiteboard is yours once the story's done */}
      {storyDone && (
        <MarkerTray
          tool={tool}
          color={inkColor}
          hasInk={strokes.length > 0}
          onTool={setTool}
          onColor={setInkColor}
          onSign={() => setSignOpen(true)}
          onClear={clearMine}
        />
      )}

      <SignModal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        onSubmit={handleSign}
      />

      <AnimatePresence>
        {showIntro && (
          <BoardIntro key="intro" onEnter={enterStory} onReadMode={onReadMode} />
        )}
      </AnimatePresence>
    </div>
  );
}
