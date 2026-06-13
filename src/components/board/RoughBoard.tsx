"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";
import { DrawStep, Bezier } from "@/data/board";

interface Props {
  steps: DrawStep[];
  /** how many steps (from the start) should be drawn */
  targetStep: number;
  /** animate forward draws (true) or apply instantly (false) */
  animate: boolean;
  /** bump to rebuild + reset everything to hidden (used for replay) */
  boardKey: number;
  onReveal: (id: string) => void;
  onHide: (id: string) => void;
}

interface BuiltStep {
  step: DrawStep;
  paths: SVGPathElement[];
  lengths: number[];
  guide: SVGPathElement | null;
}

const ROUGH_OPTS = { roughness: 1.5, bowing: 1.2, strokeWidth: 2.4 };
const easeOut = (t: number) => 1 - Math.pow(1 - t, 2.2);

export default function RoughBoard({
  steps,
  targetStep,
  animate,
  boardKey,
  onReveal,
  onHide,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const penRef = useRef<SVGGElement>(null);
  const builtRef = useRef<BuiltStep[]>([]);
  const currentRef = useRef(0); // how many steps are currently drawn
  const targetRef = useRef(0);
  const runningRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const onRevealRef = useRef(onReveal);
  const onHideRef = useRef(onHide);
  onRevealRef.current = onReveal;
  onHideRef.current = onHide;
  targetRef.current = targetStep;

  /* ---- build (or rebuild) all shapes, hidden ---- */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    runningRef.current = false;

    const rc = rough.svg(svg);
    const layer = svg.querySelector("#draw-layer") as SVGGElement;
    layer.innerHTML = "";
    const built: BuiltStep[] = [];

    const arrowHead = (b: Bezier, color: string) => {
      const { end, dir } = b;
      const size = 16;
      const ang = Math.atan2(dir.y, dir.x);
      const wing = (da: number) => {
        const a = ang + Math.PI + da;
        return rc.line(
          end.x,
          end.y,
          end.x + Math.cos(a) * size,
          end.y + Math.sin(a) * size,
          { ...ROUGH_OPTS, stroke: color, roughness: 1 }
        );
      };
      return [wing(0.45), wing(-0.45)];
    };

    for (const step of steps) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      let guide: SVGPathElement | null = null;

      if (step.type === "rect") {
        g.appendChild(
          rc.rectangle(step.x, step.y, step.w, step.h, {
            ...ROUGH_OPTS,
            stroke: step.color,
            fill: "rgba(255,255,255,0.6)",
            fillStyle: "solid",
          })
        );
      } else if (step.type === "underline") {
        g.appendChild(
          rc.line(step.x1, step.y1, step.x2, step.y2, {
            ...ROUGH_OPTS,
            stroke: step.color,
            strokeWidth: 5,
          })
        );
      } else if (step.type === "arrow") {
        g.appendChild(rc.path(step.bezier.d, { ...ROUGH_OPTS, stroke: step.color }));
        for (const head of arrowHead(step.bezier, step.color)) g.appendChild(head);
        guide = document.createElementNS("http://www.w3.org/2000/svg", "path");
        guide.setAttribute("d", step.bezier.d);
        guide.setAttribute("fill", "none");
        guide.setAttribute("stroke", "none");
        g.appendChild(guide);
      }

      layer.appendChild(g);

      const paths = Array.from(g.querySelectorAll("path")) as SVGPathElement[];
      const lengths: number[] = [];
      for (const p of paths) {
        const len = p.getTotalLength ? p.getTotalLength() : 0;
        lengths.push(len);
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
        if (p.getAttribute("fill") !== "none") p.style.opacity = "0";
      }
      built.push({ step, paths, lengths, guide });
    }

    builtRef.current = built;
    currentRef.current = 0;
    if (penRef.current) penRef.current.style.opacity = "0";

    // draw immediately up to the current target (instant) after a rebuild
    syncToTarget();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, boardKey]);

  /* ---- helpers ---- */
  const showStepInstant = (i: number) => {
    const b = builtRef.current[i];
    if (!b) return;
    b.paths.forEach((p) => {
      p.style.strokeDashoffset = "0";
      if (p.getAttribute("fill") !== "none") p.style.opacity = "1";
    });
    if (b.step.type === "rect") onRevealRef.current(b.step.revealId);
  };

  const hideStep = (i: number) => {
    const b = builtRef.current[i];
    if (!b) return;
    b.paths.forEach((p, k) => {
      p.style.strokeDashoffset = `${b.lengths[k]}`;
      if (p.getAttribute("fill") !== "none") p.style.opacity = "0";
    });
    if (b.step.type === "rect") onHideRef.current(b.step.revealId);
  };

  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animateStep = (i: number, done: () => void) => {
    const b = builtRef.current[i];
    if (!b) return done();
    // honour reduced-motion: snap the shape in, skip the stroke animation
    if (prefersReduced()) {
      b.paths.forEach((p) => {
        p.style.strokeDashoffset = "0";
        if (p.getAttribute("fill") !== "none") p.style.opacity = "1";
      });
      if (penRef.current) penRef.current.style.opacity = "0";
      return done();
    }
    const durMs = b.step.duration * 1000;
    const t0 = performance.now();
    const strokes = b.paths.filter((p) => p.getAttribute("fill") === "none");
    const fills = b.paths.filter((p) => p.getAttribute("fill") !== "none");
    const lead = strokes[0] ?? b.paths[0];
    const follow = b.guide ?? lead;
    const followLen = follow ? follow.getTotalLength?.() ?? 0 : 0;

    if (penRef.current) penRef.current.style.opacity = "1";

    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / durMs);
      const e = easeOut(p);
      for (const path of strokes) {
        const len = path.getTotalLength?.() ?? 0;
        path.style.strokeDashoffset = `${len * (1 - e)}`;
      }
      for (const fp of fills) fp.style.opacity = `${Math.max(0, (e - 0.4) / 0.6)}`;
      if (penRef.current && follow && followLen > 0) {
        const pt = follow.getPointAtLength(e * followLen);
        penRef.current.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
      }
      if (p < 1) rafRef.current = requestAnimationFrame(frame);
      else done();
    };
    rafRef.current = requestAnimationFrame(frame);
  };

  const runForward = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    const loop = () => {
      if (currentRef.current >= targetRef.current) {
        runningRef.current = false;
        if (penRef.current) penRef.current.style.opacity = "0";
        return;
      }
      const i = currentRef.current;
      animateStep(i, () => {
        const b = builtRef.current[i];
        if (b?.step.type === "rect") onRevealRef.current(b.step.revealId);
        currentRef.current = i + 1;
        loop();
      });
    };
    loop();
  };

  /* ---- reconcile drawn state to targetStep ---- */
  const syncToTarget = () => {
    const target = targetRef.current;
    if (target < currentRef.current) {
      // hide backwards (instant)
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      if (penRef.current) penRef.current.style.opacity = "0";
      for (let i = currentRef.current - 1; i >= target; i--) hideStep(i);
      currentRef.current = target;
    } else if (target > currentRef.current) {
      if (animate) {
        runForward();
      } else {
        for (let i = currentRef.current; i < target; i++) showStepInstant(i);
        currentRef.current = target;
      }
    }
  };

  useEffect(() => {
    syncToTarget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetStep, animate]);

  return (
    <svg
      ref={svgRef}
      className="absolute left-0 top-0 overflow-visible pointer-events-none"
      width={1}
      height={1}
      style={{ overflow: "visible", zIndex: 2 }}
    >
      <g id="draw-layer" />
      <g ref={penRef} style={{ opacity: 0 }}>
        <circle r="7" fill="#1e293b" />
        <circle r="3" fill="#f6f4ec" />
        <line x1="0" y1="0" x2="13" y2="-20" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
        <line x1="0" y1="0" x2="13" y2="-20" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
