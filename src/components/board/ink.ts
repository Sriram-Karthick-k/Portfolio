export interface Stroke {
  id: string;
  color: string;
  width: number;
  pts: { x: number; y: number }[];
}

export interface Signature {
  id: string;
  text: string;
  name: string;
  sticky: string;
  rot: number;
}

/** vivid marker colors for drawing */
export const MARKER_COLORS = ["#2563eb", "#db2777", "#16a34a", "#d97706", "#1e293b"];
/** pastel sticky backgrounds for signatures */
export const SIGN_STICKIES = ["#fde68a", "#fbcfe8", "#bfdbfe", "#bbf7d0", "#ddd6fe", "#fed7aa"];

/* ---- guestbook grid below the board ---- */
const G_COLS = 4;
const G_X0 = 278;
const G_Y0 = 1200;
const G_W = 210;
const G_H = 150;
const G_GX = 28;
const G_GY = 28;

export function sigPosition(i: number) {
  const c = i % G_COLS;
  const r = Math.floor(i / G_COLS);
  return {
    x: G_X0 + c * (G_W + G_GX),
    y: G_Y0 + r * (G_H + G_GY),
    w: G_W,
    h: G_H,
  };
}

export const GUESTBOOK_LABEL = { x: G_X0, y: G_Y0 - 56 };
