import projectsJson from "./projects.json";

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
  year?: number;
}

export type SectionKind =
  | "hero"
  | "about"
  | "experience"
  | "skills"
  | "education"
  | "contact"
  | "projectsHub"
  | "project";

export interface Section {
  id: string;
  kind: SectionKind;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string; // ink color for the hand-drawn frame
  data?: ProjectData;
}

/* ---- ink palette (marker colors on a light board) ---- */
export const INK = {
  blue: "#2563eb",
  slate: "#334155",
  violet: "#7c3aed",
  green: "#16a34a",
  red: "#e11d48",
  pink: "#db2777",
  amber: "#d97706",
};

const projects = (projectsJson as ProjectData[]) ?? [];

/* ---- fixed sections on the board ---- */
const baseSections: Section[] = [
  { id: "hero", kind: "hero", x: 560, y: 70, w: 560, h: 240, color: INK.blue },
  { id: "about", kind: "about", x: 40, y: 90, w: 470, h: 230, color: INK.slate },
  { id: "experience", kind: "experience", x: 1190, y: 60, w: 480, h: 320, color: INK.blue },
  { id: "education", kind: "education", x: 1200, y: 490, w: 460, h: 185, color: INK.green },
  { id: "skills", kind: "skills", x: 40, y: 480, w: 490, h: 390, color: INK.violet },
  { id: "projectsHub", kind: "projectsHub", x: 720, y: 400, w: 230, h: 110, color: INK.pink },
  { id: "contact", kind: "contact", x: 40, y: 930, w: 480, h: 240, color: INK.red },
];

/* ---- project sticky notes fanned out below the hub ---- */
const P_BASE = { x: 600, y: 700 };
const PW = 300;
const PH = 215;
const STEP_X = 330;
const STEP_Y = 250;
const PER_ROW = 3;

const projectSections: Section[] = projects.map((p, i) => ({
  id: `project-${p.id ?? i}`,
  kind: "project",
  x: P_BASE.x + (i % PER_ROW) * STEP_X,
  y: P_BASE.y + Math.floor(i / PER_ROW) * STEP_Y,
  w: PW,
  h: PH,
  color: p.featured ? INK.amber : INK.pink,
  data: p,
}));

export const SECTIONS: Section[] = [...baseSections, ...projectSections];
export const SECTION_MAP = new Map(SECTIONS.map((s) => [s.id, s]));
export const PROJECT_COUNT = projects.length;

/* ---- arrows (hand-drawn connectors) ---- */
export interface Arrow {
  from: string;
  to: string;
  color: string;
}
export const ARROWS: Arrow[] = [
  { from: "hero", to: "about", color: INK.slate },
  { from: "hero", to: "experience", color: INK.blue },
  { from: "experience", to: "education", color: INK.green },
  { from: "hero", to: "skills", color: INK.violet },
  { from: "experience", to: "projectsHub", color: INK.pink },
  { from: "hero", to: "contact", color: INK.red },
  ...projectSections.map((p) => ({ from: "projectsHub", to: p.id, color: INK.amber })),
];

/* =========================================================
   Geometry: edge-to-edge bezier between two section rects
   ========================================================= */
export interface Bezier {
  d: string;
  end: { x: number; y: number };
  dir: { x: number; y: number }; // unit tangent at end (for arrowhead)
}

export function bezierBetween(a: Section, b: Section): Bezier {
  const acx = a.x + a.w / 2;
  const acy = a.y + a.h / 2;
  const bcx = b.x + b.w / 2;
  const bcy = b.y + b.h / 2;
  const dx = bcx - acx;
  const dy = bcy - acy;

  let p1, p2, c1, c2;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const k = Math.max(70, Math.abs(dx) * 0.45);
    if (dx > 0) {
      p1 = { x: a.x + a.w, y: acy };
      p2 = { x: b.x, y: bcy };
      c1 = { x: p1.x + k, y: p1.y };
      c2 = { x: p2.x - k, y: p2.y };
    } else {
      p1 = { x: a.x, y: acy };
      p2 = { x: b.x + b.w, y: bcy };
      c1 = { x: p1.x - k, y: p1.y };
      c2 = { x: p2.x + k, y: p2.y };
    }
  } else {
    const k = Math.max(70, Math.abs(dy) * 0.45);
    if (dy > 0) {
      p1 = { x: acx, y: a.y + a.h };
      p2 = { x: bcx, y: b.y };
      c1 = { x: p1.x, y: p1.y + k };
      c2 = { x: p2.x, y: p2.y - k };
    } else {
      p1 = { x: acx, y: a.y };
      p2 = { x: bcx, y: b.y + b.h };
      c1 = { x: p1.x, y: p1.y - k };
      c2 = { x: p2.x, y: p2.y + k };
    }
  }
  const tx = p2.x - c2.x;
  const ty = p2.y - c2.y;
  const len = Math.hypot(tx, ty) || 1;
  return {
    d: `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`,
    end: p2,
    dir: { x: tx / len, y: ty / len },
  };
}

/* =========================================================
   Draw sequence: ordered steps the pen performs on load
   ========================================================= */
export type DrawStep =
  | {
      type: "rect";
      revealId: string;
      color: string;
      duration: number;
      x: number;
      y: number;
      w: number;
      h: number;
    }
  | {
      type: "arrow";
      color: string;
      duration: number;
      bezier: Bezier;
    }
  | {
      type: "underline";
      color: string;
      duration: number;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };

function rectStep(id: string, dur = 0.55): DrawStep {
  const s = SECTION_MAP.get(id)!;
  return {
    type: "rect",
    revealId: id,
    color: s.color,
    duration: dur,
    x: s.x,
    y: s.y,
    w: s.w,
    h: s.h,
  };
}

function arrowStep(from: string, to: string, color: string, dur = 0.45): DrawStep {
  const a = SECTION_MAP.get(from)!;
  const b = SECTION_MAP.get(to)!;
  return { type: "arrow", color, duration: dur, bezier: bezierBetween(a, b) };
}

/* =========================================================
   Story chapters — each "Next" plays one chapter's steps and
   pans the camera to focus on it.
   ========================================================= */
export interface Chapter {
  id: string;
  caption: string;
  focusIds: string[]; // sections the camera frames for this beat
  steps: DrawStep[];
}

export function buildChapters(): Chapter[] {
  const hero = SECTION_MAP.get("hero")!;
  const chapters: Chapter[] = [];

  chapters.push({
    id: "hero",
    caption: "Meet Sriram 👋",
    focusIds: ["hero"],
    steps: [
      rectStep("hero", 0.7),
      {
        type: "underline",
        color: INK.amber,
        duration: 0.4,
        x1: hero.x + 24,
        y1: hero.y + 96,
        x2: hero.x + 250,
        y2: hero.y + 100,
      },
    ],
  });

  chapters.push({
    id: "about",
    caption: "A little about me",
    focusIds: ["about"],
    steps: [arrowStep("hero", "about", INK.slate), rectStep("about")],
  });

  chapters.push({
    id: "experience",
    caption: "Where I work",
    focusIds: ["experience"],
    steps: [arrowStep("hero", "experience", INK.blue), rectStep("experience", 0.7)],
  });

  chapters.push({
    id: "education",
    caption: "How I got here",
    focusIds: ["education"],
    steps: [arrowStep("experience", "education", INK.green), rectStep("education")],
  });

  chapters.push({
    id: "skills",
    caption: "Things I know",
    focusIds: ["skills"],
    steps: [arrowStep("hero", "skills", INK.violet), rectStep("skills", 0.7)],
  });

  const pSteps: DrawStep[] = [
    arrowStep("experience", "projectsHub", INK.pink),
    rectStep("projectsHub", 0.4),
  ];
  const pFocus = ["projectsHub"];
  for (const p of projectSections) {
    pSteps.push(arrowStep("projectsHub", p.id, p.color, 0.35));
    pSteps.push(rectStep(p.id, 0.45));
    pFocus.push(p.id);
  }
  chapters.push({
    id: "projects",
    caption: "Things I've built",
    focusIds: pFocus,
    steps: pSteps,
  });

  chapters.push({
    id: "contact",
    caption: "Let's talk!",
    focusIds: ["contact"],
    steps: [arrowStep("hero", "contact", INK.red), rectStep("contact")],
  });

  return chapters;
}

/* ---- bounding boxes for camera framing ---- */
export function getBoardBounds(sections: Section[] = SECTIONS) {
  const minX = Math.min(...sections.map((s) => s.x));
  const minY = Math.min(...sections.map((s) => s.y));
  const maxX = Math.max(...sections.map((s) => s.x + s.w));
  const maxY = Math.max(...sections.map((s) => s.y + s.h));
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export function boundsOfIds(ids: string[]) {
  const secs = ids
    .map((id) => SECTION_MAP.get(id))
    .filter((s): s is Section => Boolean(s));
  if (!secs.length) return getBoardBounds();
  return getBoardBounds(secs);
}
