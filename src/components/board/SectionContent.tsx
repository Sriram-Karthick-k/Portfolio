"use client";

import Image from "next/image";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  ExternalLink,
  Star,
  Code2,
} from "lucide-react";
import { Section } from "@/data/board";

/* sticky-note pastel backgrounds */
const STICKY = ["#fde68a", "#fbcfe8", "#bfdbfe", "#bbf7d0", "#ddd6fe", "#fed7aa"];

function SkillSticky({
  label,
  items,
  color,
  rotate,
}: {
  label: string;
  items: string[];
  color: string;
  rotate: number;
}) {
  return (
    <div
      className="rounded-[3px] px-3 py-2 shadow-[2px_3px_8px_rgba(0,0,0,0.15)]"
      style={{ background: color, transform: `rotate(${rotate}deg)` }}
    >
      <p className="font-marker font-bold text-[13px] text-ink/80 mb-1 leading-none">
        {label}
      </p>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5">
        {items.map((s) => (
          <span key={s} className="font-marker text-[13px] text-ink/90 leading-tight">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SectionContent({ section }: { section: Section }) {
  const s = section;

  switch (s.kind) {
    case "hero":
      return (
        <div className="h-full w-full px-6 py-5 flex gap-5">
          <div className="flex-1 min-w-0">
            <p className="font-marker text-[13px] text-blue-600 mb-0.5">
              hi, i&apos;m
            </p>
            <h1 className="font-hand font-bold text-ink leading-[0.95] text-[40px] sm:text-[46px]">
              Sriram Karthick K
            </h1>
            <p className="font-marker text-[15px] text-ink/70 mt-1">
              Member of Technical Staff · Zoho
            </p>
            <p className="font-marker text-[14px] text-ink/60 mt-2 leading-snug">
              I build <span className="text-blue-600 font-bold">Vani</span> — an
              infinite whiteboard. So here&apos;s mine.
            </p>
            <div className="flex items-center gap-2 mt-3">
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
                  className="w-8 h-8 rounded-full border-2 border-ink/70 flex items-center justify-center text-ink/80 hover:bg-ink hover:text-board transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* pinned polaroid */}
          <div className="shrink-0 self-center">
            <div className="relative bg-white p-2 pb-6 shadow-[3px_5px_14px_rgba(0,0,0,0.22)] rotate-3">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-red-500/80 shadow ring-2 ring-red-700/30" />
              <div className="relative w-[96px] h-[112px] bg-slate-200 overflow-hidden">
                <Image
                  src="/face.jpeg"
                  alt="Sriram Karthick K"
                  fill
                  sizes="96px"
                  className="object-cover object-top"
                />
              </div>
              <p className="font-hand text-center text-ink/70 text-base mt-1 leading-none">
                that&apos;s me!
              </p>
            </div>
          </div>
        </div>
      );

    case "about":
      return (
        <div className="h-full w-full px-5 py-4">
          <h2 className="font-hand font-bold text-[26px] text-ink leading-none mb-2">
            about me
          </h2>
          <p className="font-marker text-[14px] text-ink/80 leading-snug">
            Around 3 years at Zoho on <b>Vani</b>, working on the editor&apos;s{" "}
            <span className="text-blue-600 font-bold">C++/Skia</span> rendering
            and, more recently, its AI features.
          </p>
          <div className="flex items-center gap-1.5 mt-3 font-marker text-[13px] text-ink/60">
            <MapPin size={13} /> Chennai, India
          </div>
        </div>
      );

    case "experience":
      return (
        <div className="h-full w-full px-5 py-4">
          <h2 className="font-hand font-bold text-[26px] text-ink leading-none">
            experience
          </h2>
          <div className="flex items-baseline justify-between mt-1.5">
            <p className="font-marker font-bold text-[15px] text-blue-600">
              Zoho · Vani
            </p>
            <p className="font-marker text-[12px] text-ink/50">2023 — now</p>
          </div>
          <p className="font-marker text-[12px] text-ink/50 -mt-0.5 mb-2">
            Member of Technical Staff
          </p>
          <ul className="space-y-1.5">
            {[
              "Work on Vani's cross-platform editor, built on the C++/Skia engine.",
              "Help maintain the Connectors module — C++, WASM & JS.",
              "Worked on its AI features; now helping with the agentic whiteboard.",
            ].map((b, i) => (
              <li
                key={i}
                className="font-marker text-[13px] text-ink/80 leading-snug flex gap-1.5"
              >
                <span className="text-blue-600">✦</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "skills": {
      const groups = [
        { label: "languages", items: ["C++", "Java", "JavaScript"] },
        { label: "graphics", items: ["Skia", "WebGPU", "WASM"] },
        { label: "realtime", items: ["WebSockets", "OT"] },
        { label: "AI", items: ["LLMs", "Embeddings"] },
        { label: "web", items: ["Next.js", "Tailwind", "React"] },
        { label: "data", items: ["PostgreSQL", "SQLite"] },
      ];
      const rot = [-3, 2, -1, 3, -2, 1];
      return (
        <div className="h-full w-full px-5 py-4">
          <h2 className="font-hand font-bold text-[26px] text-ink leading-none mb-3">
            things i know
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {groups.map((g, i) => (
              <SkillSticky
                key={g.label}
                label={g.label}
                items={g.items}
                color={STICKY[i % STICKY.length]}
                rotate={rot[i]}
              />
            ))}
          </div>
        </div>
      );
    }

    case "education":
      return (
        <div className="h-full w-full px-5 py-4">
          <h2 className="font-hand font-bold text-[24px] text-ink leading-none mb-1.5">
            education
          </h2>
          <p className="font-marker font-bold text-[14px] text-ink/85 leading-snug">
            B.E. Computer Science &amp; Engineering
          </p>
          <p className="font-marker text-[13px] text-ink/70 leading-snug">
            Misrimal Navajee Munoth Jain Engineering College
          </p>
          <div className="flex items-center gap-3 mt-2 font-marker text-[12px] text-ink/60">
            <span>2019 — 2023</span>
            <span className="bg-blue-100 px-1.5 rounded-sm text-blue-700 font-bold">
              CGPA 8.65
            </span>
          </div>
        </div>
      );

    case "contact":
      return (
        <div className="h-full w-full px-5 py-4 flex flex-col">
          <h2 className="font-hand font-bold text-[26px] text-ink leading-none">
            let&apos;s talk!
          </h2>
          <p className="font-marker text-[13px] text-ink/70 mt-1 mb-3">
            open to good problems &amp; good people.
          </p>
          <a
            href="mailto:sriramkarthick.k2001@gmail.com"
            className="font-marker font-bold text-[14px] text-center bg-ink text-board rounded-[4px] py-2 px-3 hover:bg-pink-600 transition-colors break-all"
          >
            sriramkarthick.k2001@gmail.com
          </a>
          <div className="flex gap-2 mt-2.5">
            <a
              href="https://github.com/Sriram-Karthick-k"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 font-marker text-[13px] flex items-center justify-center gap-1.5 border-2 border-ink/60 rounded-[4px] py-1.5 text-ink/80 hover:bg-ink hover:text-board transition-colors"
            >
              <Github size={14} /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/sriram-karthick-k/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 font-marker text-[13px] flex items-center justify-center gap-1.5 border-2 border-ink/60 rounded-[4px] py-1.5 text-ink/80 hover:bg-ink hover:text-board transition-colors"
            >
              <Linkedin size={14} /> LinkedIn
            </a>
            <a
              href="https://leetcode.com/u/user6175a/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 font-marker text-[13px] flex items-center justify-center gap-1.5 border-2 border-ink/60 rounded-[4px] py-1.5 text-ink/80 hover:bg-ink hover:text-board transition-colors"
            >
              <Code2 size={14} /> LeetCode
            </a>
          </div>
        </div>
      );

    case "projectsHub":
      return (
        <div className="h-full w-full flex flex-col items-center justify-center text-center px-3">
          <h2 className="font-hand font-bold text-[30px] text-pink-600 leading-none">
            my projects
          </h2>
          <p className="font-marker text-[12px] text-ink/50 mt-1">
            add yours in{" "}
            <code className="bg-pink-100 px-1 rounded text-pink-700">
              projects.json
            </code>
          </p>
        </div>
      );

    case "project": {
      const p = s.data;
      if (!p) return null;
      return (
        <div className="h-full w-full px-4 py-3 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-hand font-bold text-[20px] text-ink leading-none">
              {p.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              {p.featured && (
                <Star size={13} className="text-amber-500 fill-amber-400" />
              )}
              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="text-ink/50 hover:text-ink transition-colors"
                >
                  <Github size={14} />
                </a>
              )}
              {p.demo && (
                <a
                  href={p.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Demo"
                  className="text-ink/50 hover:text-ink transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
          <p className="font-marker text-[13px] text-ink/75 leading-snug mt-1 flex-1 line-clamp-4">
            {p.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {p.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="font-marker text-[11px] text-ink/60 bg-ink/5 border border-ink/15 px-1.5 rounded"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
