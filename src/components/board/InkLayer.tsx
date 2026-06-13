"use client";

import { Stroke } from "./ink";

const toPoints = (s: Stroke) => s.pts.map((p) => `${p.x},${p.y}`).join(" ");

export default function InkLayer({
  strokes,
  live,
}: {
  strokes: Stroke[];
  live: Stroke | null;
}) {
  return (
    <svg
      className="absolute left-0 top-0 overflow-visible pointer-events-none"
      width={1}
      height={1}
      style={{ overflow: "visible", zIndex: 1 }}
    >
      {strokes.map((s) =>
        s.pts.length > 1 ? (
          <polyline
            key={s.id}
            points={toPoints(s)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null
      )}
      {live && live.pts.length > 1 && (
        <polyline
          points={toPoints(live)}
          fill="none"
          stroke={live.color}
          strokeWidth={live.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
