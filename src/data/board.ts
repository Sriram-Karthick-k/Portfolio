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

/* ---- reduced ink palette: 3 marker colors + a neutral connector ---- */
export const INK = {
  blue: "#2563eb", // core / work
  slate: "#475569", // structure / background nodes
  pink: "#db2777", // output / projects / contact
};
export const CONNECTOR = "#64748b"; // one neutral ink for every arrow

const allProjects = (projectsJson as ProjectData[]) ?? [];
const projects = allProjects.slice(0, 6); // keep the board tidy

/* =========================================================
   Layout — three clean columns so connectors stay short and
   never cross:   LEFT: about → skills → contact
                  CENTER: hero → projects(hub → cards)
                  RIGHT: experience → education
   ========================================================= */
const baseSections: Section[] = [
  { id: "hero", kind: "hero", x: 470, y: 40, w: 540, h: 230, color: INK.blue },
  { id: "about", kind: "about", x: -110, y: 110, w: 430, h: 210, color: INK.slate },
  { id: "skills", kind: "skills", x: -110, y: 440, w: 430, h: 360, color: INK.slate },
  { id: "contact", kind: "contact", x: -110, y: 880, w: 430, h: 210, color: INK.pink },
  { id: "experience", kind: "experience", x: 1160, y: 110, w: 470, h: 300, color: INK.blue },
  { id: "education", kind: "education", x: 1160, y: 480, w: 470, h: 190, color: INK.slate },
  { id: "projectsHub", kind: "projectsHub", x: 590, y: 360, w: 300, h: 110, color: INK.pink },
];

/* ---- project sticky notes: a tidy 2-column tree under the hub.
   The lane (x 430–1050) sits clear between the left column (right edge ~320)
   and the right column (left edge 1160), so nothing ever overlaps. Each
   second-row card hangs straight below its first-row parent — no crossings. */
const COL_A = 430;
const COL_B = 760;
const PW = 290;
const PH = 215;
const ROW_STEP = 250;
const BASE_Y = 560;

const projectSections: Section[] = projects.map((p, i) => ({
  id: `project-${p.id ?? i}`,
  kind: "project",
  x: i % 2 === 0 ? COL_A : COL_B,
  y: BASE_Y + Math.floor(i / 2) * ROW_STEP,
  w: PW,
  h: PH,
  color: INK.pink,
  data: p,
}));

/** parent node a project hangs from: top row → hub, lower rows → card above */
const projectParent = (i: number) =>
  i < 2 ? "projectsHub" : projectSections[i - 2].id;

export const SECTIONS: Section[] = [...baseSections, ...projectSections];
export const SECTION_MAP = new Map(SECTIONS.map((s) => [s.id, s]));
export const PROJECT_COUNT = projects.length;

/* ---- connectors (re-parented to follow the columns) ---- */
export interface Arrow {
  from: string;
  to: string;
  label?: string;
}
export const ARROWS: Arrow[] = [
  { from: "hero", to: "about", label: "about me" },
  { from: "hero", to: "experience", label: "works on" },
  { from: "experience", to: "education", label: "before that" },
  { from: "about", to: "skills", label: "knows" },
  { from: "hero", to: "projectsHub", label: "builds" },
  { from: "skills", to: "contact", label: "say hi 👋" },
  ...projectSections.map((p, i) => ({ from: projectParent(i), to: p.id })),
];

/* =========================================================
   Geometry: edge-to-edge bezier between two section rects
   ========================================================= */
export interface Bezier {
  d: string;
  end: { x: number; y: number };
  dir: { x: number; y: number };
  mid: { x: number; y: number };
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
    const k = Math.max(60, Math.abs(dx) * 0.45);
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
    const k = Math.max(60, Math.abs(dy) * 0.45);
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
  // cubic bezier midpoint (t = 0.5)
  const mid = {
    x: 0.125 * p1.x + 0.375 * c1.x + 0.375 * c2.x + 0.125 * p2.x,
    y: 0.125 * p1.y + 0.375 * c1.y + 0.375 * c2.y + 0.125 * p2.y,
  };
  return {
    d: `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`,
    end: p2,
    dir: { x: tx / len, y: ty / len },
    mid,
  };
}

/* ---- floating labels on the connectors (revealed with their target) ---- */
export interface ConnectorLabel {
  x: number;
  y: number;
  text: string;
  showWith: string;
}
export const CONNECTOR_LABELS: ConnectorLabel[] = ARROWS.filter(
  (a) => a.label
).map((a) => {
  const b = bezierBetween(SECTION_MAP.get(a.from)!, SECTION_MAP.get(a.to)!);
  return { x: b.mid.x, y: b.mid.y, text: a.label!, showWith: a.to };
});

/* =========================================================
   Draw step types
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

function arrowStep(from: string, to: string, dur = 0.45): DrawStep {
  const a = SECTION_MAP.get(from)!;
  const b = SECTION_MAP.get(to)!;
  return { type: "arrow", color: CONNECTOR, duration: dur, bezier: bezierBetween(a, b) };
}

/* =========================================================
   Story chapters
   ========================================================= */
export interface Chapter {
  id: string;
  caption: string;
  focusIds: string[];
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
        color: INK.blue,
        duration: 0.4,
        x1: hero.x + 24,
        y1: hero.y + 92,
        x2: hero.x + 240,
        y2: hero.y + 96,
      },
    ],
  });

  chapters.push({
    id: "about",
    caption: "A little about me",
    focusIds: ["about"],
    steps: [arrowStep("hero", "about"), rectStep("about")],
  });

  chapters.push({
    id: "experience",
    caption: "Where I work",
    focusIds: ["experience"],
    steps: [arrowStep("hero", "experience"), rectStep("experience", 0.7)],
  });

  chapters.push({
    id: "education",
    caption: "How I got here",
    focusIds: ["education"],
    steps: [arrowStep("experience", "education"), rectStep("education")],
  });

  chapters.push({
    id: "skills",
    caption: "Things I know",
    focusIds: ["skills"],
    steps: [arrowStep("about", "skills"), rectStep("skills", 0.7)],
  });

  const pSteps: DrawStep[] = [
    arrowStep("hero", "projectsHub"),
    rectStep("projectsHub", 0.4),
  ];
  const pFocus = ["projectsHub"];
  projectSections.forEach((p, i) => {
    pSteps.push(arrowStep(projectParent(i), p.id, 0.35));
    pSteps.push(rectStep(p.id, 0.45));
    pFocus.push(p.id);
  });
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
    steps: [arrowStep("skills", "contact"), rectStep("contact")],
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
