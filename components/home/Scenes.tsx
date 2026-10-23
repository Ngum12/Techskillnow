/**
 * Product scenes for the home page: real lesson screens drawn in HTML and SVG (no photos to download,
 * sharp on every screen). The text comes from the locale files and matches the real lessons.
 */
import type { getDict } from "@/lib/i18n";
import { Icon } from "./Art";

type Landing = ReturnType<typeof getDict>["landing"];

/** Hero: a phone showing a real email-course step, with the learner's progress beside it. */
export function HeroScene({ s }: { s: Landing }) {
  const sc = s.scene;
  return (
    <div className="relative mx-auto w-full max-w-[30rem]">
      <div className="relative overflow-hidden rounded-[20px] bg-[#141c33] px-6 pb-28 pt-12 sm:px-10 sm:pb-10">
        {/* Quiet grid, like exercise-book paper. */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.09]" aria-hidden="true">
          <defs>
            <pattern id="hero-grid" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M22 0H0V22" fill="none" stroke="#fff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
        <p className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[0.7rem] font-semibold text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2f9e62]" aria-hidden="true" />
          {sc.chip}
        </p>
        {/* The phone. */}
        <div className="relative mx-auto w-full max-w-[15.5rem] rounded-[2rem] border-[9px] border-[#2e3858] bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]">
          <div className="mx-auto mt-1.5 h-1.5 w-14 rounded-full bg-[#2e3858]" aria-hidden="true" />
          <div className="px-3.5 pb-4 pt-3">
            <div className="flex items-center justify-between text-[0.62rem] font-semibold text-muted">
              <span>{sc.course}</span>
              <span>{sc.step}</span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-[#ece7dc]">
              <div className="h-1 w-[47%] rounded-full bg-primary" />
            </div>
            <p className="mt-3 text-[0.82rem] font-semibold leading-snug">{sc.title}</p>
            <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-wider text-muted">{sc.label}</p>
            <div className="mt-1 rounded-lg border-2 border-ok bg-white px-2 py-1.5 text-[0.68rem] leading-snug">{sc.value}</div>
            <div className="mt-2.5 flex gap-1.5 rounded-lg bg-ok-soft p-2 text-[0.64rem] leading-snug text-ok">
              <Icon name="check" className="h-3.5 w-3.5 shrink-0" />
              <span>{sc.ok}</span>
            </div>
            <div className="mt-3 rounded-lg bg-primary py-2 text-center text-[0.7rem] font-semibold text-white">{sc.next}</div>
          </div>
        </div>
      </div>
      {/* Progress card, overlapping the panel like a note on the desk. */}
      <div className="absolute -bottom-6 left-3 w-[12.5rem] rounded-xl border border-[#e4ded2] bg-white p-3.5 shadow-[0_12px_30px_-12px_rgba(20,28,51,0.35)] sm:-left-6">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-primary">{sc.progress}</p>
        <p className="mt-1 text-[0.8rem] font-semibold">{sc.course}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-[#ece7dc]">
            <div className="h-1.5 w-[47%] rounded-full bg-primary" />
          </div>
          <span className="text-[0.66rem] font-semibold text-muted">47%</span>
        </div>
        <p className="mt-1.5 text-[0.66rem] text-muted">{sc.done}</p>
      </div>
    </div>
  );
}

/** The maths desk: a line checked as correct, the next one flagged with a hint for that exact mistake. */
export function PracticeScene({ s }: { s: Landing }) {
  const m = s.maths;
  return (
    <div className="relative mx-auto w-full max-w-[30rem]">
      <div className="rounded-[18px] bg-white p-5 text-ink shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-primary">{m.course}</p>
          <span className="shrink-0 rounded-full bg-[#fbf1dc] px-2.5 py-0.5 text-[0.66rem] font-semibold text-[#8a5a00]">{m.marks}</span>
        </div>
        <p className="font-display mt-3 text-[1.25rem] italic leading-snug">{m.task}</p>
        <ol className="mt-4 space-y-2.5">
          <li className="flex items-center justify-between gap-3 rounded-lg border border-[#e4ded2] bg-[#fbfaf6] px-3 py-2.5">
            <span className="font-display text-[1.1rem] italic">{m.line1}</span>
            <span className="flex shrink-0 items-center gap-1 text-[0.72rem] font-semibold text-ok">
              <Icon name="check" className="h-4 w-4" />
              {m.ok}
            </span>
          </li>
          <li className="rounded-lg border-2 border-[#d9a441] bg-[#fffaf0] px-3 py-2.5">
            <span className="font-display text-[1.1rem] italic">{m.line2}</span>
            <p className="mt-1.5 flex gap-1.5 text-[0.74rem] leading-snug text-[#7a4f00]">
              <Icon name="hint" className="h-4 w-4 shrink-0" />
              {m.wrong}
            </p>
          </li>
        </ol>
        <div className="mt-4 grid grid-cols-6 gap-1.5" aria-hidden="true">
          {["x", "x²", "(", ")", "+", "−"].map((k) => (
            <span key={k} className="rounded-md border border-[#e4ded2] bg-[#f4f1ea] py-1.5 text-center text-[0.78rem] font-semibold">
              {k}
            </span>
          ))}
        </div>
      </div>
      <p className="absolute -top-3 right-4 rounded-full bg-[#d9a441] px-3 py-1 text-[0.66rem] font-bold text-[#2b1d00]">{m.hint}</p>
    </div>
  );
}

/** A deterministic QR-like pattern (decorative: the real certificates carry a real QR code). */
function QrMark() {
  const n = 21;
  const cells: [number, number][] = [];
  let seed = 7;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      if (!finder && seed % 3 === 0) cells.push([x, y]);
    }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill="#17201b" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#17201b" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="h-16 w-16" aria-hidden="true" shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" fill="#17201b" />
      ))}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}

export function CertificateScene({ s }: { s: Landing }) {
  const c = s.cert;
  return (
    <div className="relative mx-auto w-full max-w-[30rem] -rotate-[1.2deg]">
      <div className="rounded-[6px] bg-[#fffdf7] p-2.5 shadow-[0_24px_50px_-24px_rgba(20,28,51,0.45)]">
        <div className="rounded-[3px] border-2 border-double border-[#b9a77a] px-5 py-6 text-center sm:px-8">
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-primary">TechSkillNow</p>
          <p className="font-display mt-2 text-[1.35rem] leading-tight">{c.heading}</p>
          <p className="mt-4 text-[0.72rem] text-muted">{c.awarded}</p>
          <p className="font-display mt-0.5 text-[1.7rem] italic leading-tight">{c.name}</p>
          <div className="mx-auto mt-2 h-px w-40 bg-[#d8ccab]" />
          <p className="mt-2 text-[0.85rem] font-semibold">{c.course}</p>
          <div className="mt-5 flex items-end justify-between gap-4 text-left">
            <div>
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-muted">ID</p>
              <p className="font-mono text-[0.78rem] font-semibold">TSN-7K2Q-9M4D</p>
              <p className="mt-2 text-[0.66rem] text-muted">techskillnow.com/verify</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <QrMark />
              <p className="text-[0.6rem] text-muted">{c.scan}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="absolute -right-2 -top-3 rotate-[1.2deg] rounded-full bg-ink px-3 py-1 text-[0.66rem] font-bold uppercase tracking-wider text-white">{c.sample}</p>
    </div>
  );
}
