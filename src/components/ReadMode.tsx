"use client";

import Image from "next/image";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  ExternalLink,
  Star,
  FileText,
  PenTool,
  Code2,
} from "lucide-react";
import projectsJson from "@/data/projects.json";

interface ProjectData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
  year?: number;
}

const projects = projectsJson as ProjectData[];
const STICKY = ["#fde68a", "#fbcfe8", "#bfdbfe", "#bbf7d0", "#ddd6fe", "#fed7aa"];
const TAPE = ["#fcd34d", "#f9a8d4", "#93c5fd", "#86efac"];

const skills = [
  { label: "languages", items: ["C++", "Java", "JavaScript"] },
  { label: "graphics", items: ["Skia", "WebGPU", "WASM"] },
  { label: "realtime", items: ["WebSockets", "OT"] },
  { label: "AI", items: ["LLMs", "Embeddings"] },
  { label: "web", items: ["Next.js", "Tailwind", "React"] },
  { label: "data", items: ["PostgreSQL", "SQLite"] },
];

const experience = [
  "Develop the Vani editor in C++, WebAssembly & JavaScript (Skia engine).",
  "Develop server-side features & REST APIs in Java; maintain the Connectors module.",
  "Built an internal tool that automates the team's local-dev setup, database & operations.",
  "Develop the platform's AI capabilities; contributing to an upcoming agentic whiteboard.",
];

/* a little hand-drawn squiggle under each heading */
function Squiggle({ color }: { color: string }) {
  return (
    <svg width="116" height="9" viewBox="0 0 116 9" fill="none" className="mt-1">
      <path
        d="M2 6 Q 11 1 21 6 T 41 6 T 61 6 T 81 6 T 101 6 T 114 5"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Heading({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className="mb-6">
      <h2
        className="font-hand font-bold text-3xl sm:text-4xl leading-none"
        style={{ color }}
      >
        {children}
      </h2>
      <Squiggle color={color} />
    </div>
  );
}

const cardClass =
  "relative rounded-2xl bg-white/75 border border-ink/5 shadow-[0_14px_34px_-16px_rgba(0,0,0,0.3)]";

export default function ReadMode({ onCanvas }: { onCanvas: () => void }) {
  return (
    <div className="paper-grid min-h-screen text-ink">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        {/* ---------- header ---------- */}
        <header className={`${cardClass} p-6 sm:p-8 mb-14`}>
          <span
            className="absolute -top-2.5 left-10 w-20 h-6 rotate-[-4deg] shadow-sm"
            style={{ background: "rgba(252,211,77,0.7)" }}
          />
          <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <p className="font-marker text-blue-600 text-sm mb-1">hi, i&apos;m</p>
              <h1 className="font-hand font-bold text-5xl sm:text-6xl leading-[0.9] mb-2">
                Sriram Karthick K
              </h1>
              <p className="font-marker text-ink/70 text-lg">
                Member of Technical Staff · Zoho
              </p>
              <p className="font-marker text-ink/60 mt-2 leading-snug">
                I build <b className="text-blue-600">Vani</b>, Zoho&apos;s
                collaborative whiteboard.
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                {[
                  { href: "https://github.com/Sriram-Karthick-k", icon: Github, label: "GitHub" },
                  {
                    href: "https://www.linkedin.com/in/sriram-karthick-k/",
                    icon: Linkedin,
                    label: "LinkedIn",
                  },
                  {
                    href: "https://leetcode.com/u/user6175a/",
                    icon: Code2,
                    label: "LeetCode",
                  },
                  { href: "mailto:sriramkarthick.k2001@gmail.com", icon: Mail, label: "Email" },
                ].map(({ href, icon: Icon, label }, i) => (
                  <a
                    key={i}
                    href={href}
                    title={label}
                    aria-label={label}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border-2 border-ink/70 flex items-center justify-center text-ink/80 hover:bg-ink hover:text-board transition-colors"
                  >
                    <Icon size={16} />
                  </a>
                ))}
                <a
                  href="/Sriram-Karthick-K.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-marker text-sm flex items-center gap-1.5 h-9 px-3 rounded-full border-2 border-blue-500/60 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <FileText size={14} /> Resume
                </a>
              </div>
            </div>

            {/* polaroid */}
            <div className="shrink-0 self-start sm:self-center">
              <div className="relative bg-white p-2 pb-6 shadow-[3px_5px_14px_rgba(0,0,0,0.22)] rotate-3 w-fit">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-red-500/80 shadow ring-2 ring-red-700/30" />
                <div className="relative w-[104px] h-[120px] bg-slate-200 overflow-hidden">
                  <Image
                    src="/face.jpeg"
                    alt="Sriram Karthick K"
                    fill
                    sizes="104px"
                    className="object-cover object-top"
                  />
                </div>
                <p className="font-hand text-center text-ink/70 text-base mt-1 leading-none">
                  that&apos;s me!
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ---------- about ---------- */}
        <section className="mb-14">
          <Heading color="#334155">about me</Heading>
          <p className="font-marker text-ink/80 text-lg leading-relaxed">
            Around 3 years at Zoho on <b>Vani</b>, working on the editor&apos;s{" "}
            <span className="bg-blue-100 text-blue-700 px-1 rounded">C++/Skia</span>{" "}
            rendering and, more recently, its AI features.
          </p>
          <p className="flex items-center gap-1.5 mt-3 font-marker text-ink/60">
            <MapPin size={15} /> Chennai, India
          </p>
        </section>

        {/* ---------- experience ---------- */}
        <section className="mb-14">
          <Heading color="#2563eb">experience</Heading>
          <div className={`${cardClass} p-6 border-l-[5px] border-l-blue-500`}>
            <div className="flex items-baseline justify-between flex-wrap gap-1">
              <span className="font-hand font-bold text-2xl text-blue-600">
                Zoho · Vani
              </span>
              <span className="font-marker text-sm text-ink/50">2023 — now</span>
            </div>
            <p className="font-marker text-sm text-ink/50 mb-4">
              Member of Technical Staff
            </p>
            <ul className="space-y-2.5">
              {experience.map((b, i) => (
                <li
                  key={i}
                  className="font-marker text-ink/80 leading-snug flex gap-2.5"
                >
                  <span className="text-blue-500 mt-0.5">✦</span> {b}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- skills ---------- */}
        <section className="mb-14">
          <Heading color="#475569">things i know</Heading>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {skills.map((g, i) => (
              <div
                key={g.label}
                className="px-4 py-3 shadow-[2px_4px_10px_rgba(0,0,0,0.13)]"
                style={{
                  background: STICKY[i % STICKY.length],
                  transform: `rotate(${[-2, 1.5, -1, 2, -1.5, 1][i]}deg)`,
                }}
              >
                <p className="font-hand font-bold text-xl text-ink/80 mb-1.5 leading-none">
                  {g.label}
                </p>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  {g.items.map((s) => (
                    <span key={s} className="font-marker text-ink/90 text-[15px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- projects ---------- */}
        <section className="mb-14">
          <Heading color="#db2777">things i&apos;ve built</Heading>
          <p className="font-marker text-ink/50 text-sm -mt-3 mb-6">
            add yours in{" "}
            <code className="bg-pink-100 px-1 rounded text-pink-700">
              projects.json
            </code>
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {projects.map((p, i) => (
              <div key={p.id ?? i} className={`${cardClass} p-5 pt-6 flex flex-col`}>
                <span
                  className="absolute -top-2.5 left-8 w-16 h-5 rotate-[-5deg] shadow-sm"
                  style={{ background: TAPE[i % TAPE.length], opacity: 0.75 }}
                />
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-hand font-bold text-2xl leading-none">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0 mt-1">
                    {p.featured && (
                      <Star size={15} className="text-amber-500 fill-amber-400" />
                    )}
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="text-ink/45 hover:text-ink transition-colors"
                      >
                        <Github size={16} />
                      </a>
                    )}
                    {p.demo && (
                      <a
                        href={p.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Demo"
                        className="text-ink/45 hover:text-ink transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
                <p className="font-marker text-ink/75 leading-snug mt-2 flex-1">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="font-marker text-xs text-ink/60 bg-ink/[0.06] border border-ink/10 px-2 py-0.5 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- education ---------- */}
        <section className="mb-14">
          <Heading color="#475569">education</Heading>
          <div className={`${cardClass} p-6 border-l-[5px] border-l-slate-400`}>
            <p className="font-hand font-bold text-2xl">
              B.E. Computer Science &amp; Engineering
            </p>
            <p className="font-marker text-ink/70 mt-0.5">
              Misrimal Navajee Munoth Jain Engineering College
            </p>
            <div className="flex items-center gap-3 mt-3 font-marker text-sm text-ink/60">
              <span>2019 — 2023</span>
              <span className="bg-blue-100 px-2 py-0.5 rounded-full text-blue-700 font-bold">
                CGPA 8.65
              </span>
            </div>
          </div>
        </section>

        {/* ---------- contact ---------- */}
        <section className="mb-12 text-center">
          <Heading color="#db2777">
            <span className="inline-block">let&apos;s talk!</span>
          </Heading>
          <p className="font-marker text-ink/70 mb-5">
            open to good problems &amp; good people.
          </p>
          <a
            href="mailto:sriramkarthick.k2001@gmail.com"
            className="font-marker font-bold text-lg inline-flex items-center gap-2 bg-ink text-board rounded-full py-3 px-7 hover:bg-pink-600 transition-colors shadow-[3px_4px_0_rgba(0,0,0,0.18)] break-all"
          >
            <Mail size={18} /> sriramkarthick.k2001@gmail.com
          </a>
        </section>

        <footer className="font-marker text-ink/50 text-sm text-center border-t-2 border-dashed border-ink/15 pt-6">
          drawn on a whiteboard, like Vani · © {new Date().getFullYear()} Sriram
          Karthick K
        </footer>
      </div>

      {/* switch to the interactive story board */}
      <button
        onClick={onCanvas}
        className="fixed z-50 bottom-5 right-5 flex items-center gap-2 font-marker font-bold text-board bg-ink hover:bg-blue-600 px-4 py-3 rounded-full shadow-[3px_4px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all"
      >
        <PenTool size={17} /> Play the story
      </button>
    </div>
  );
}
