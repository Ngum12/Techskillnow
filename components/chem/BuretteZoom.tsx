"use client";
import { useId } from "react";
/**
 * Close-up of the burette scale around the current level, for readings. Graduations every 0.1 cm³,
 * numbers every 1 cm³ (increasing downwards). With the eye above or below the meniscus, the meniscus
 * appears against a different graduation (parallax), so the learner reads what they would really see.
 */

export type Eye = "above" | "level" | "below";

const W = 220;
const H = 210;
const PX = 70; // pixels per cm³
const TUBE = { left: 64, right: 156 };

export function BuretteZoom({ level, eye = "level", parallax = { above: -0.1, below: 0.1 }, label }: { level: number; eye?: Eye; parallax?: { above: number; below: number }; label?: string }) {
  // The window is centred a little off the level so the meniscus is not always in the middle.
  const centre = level + 0.27;
  const y = (v: number) => H / 2 + (v - centre) * PX;
  const clip = "zoom" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  // Where the meniscus appears against the scale from this eye position.
  const apparent = level + (eye === "above" ? parallax.above : eye === "below" ? parallax.below : 0);
  const my = y(apparent);
  const first = Math.floor((centre - H / 2 / PX) * 10) / 10;
  const ticks = Array.from({ length: Math.ceil((H / PX) * 10) + 2 }, (_, i) => Math.round((first + i * 0.1) * 10) / 10).filter((v) => v >= 0);
  const mid = (TUBE.left + TUBE.right) / 2;
  const eyeY = eye === "above" ? my - 70 : eye === "below" ? my + 70 : my;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-[280px] rounded-xl border border-line bg-white" role="img" aria-label={label}>
      <defs>
        <clipPath id={clip}>
          <rect x={0} y={0} width={W} height={H} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x={TUBE.left} y={0} width={TUBE.right - TUBE.left} height={H} fill="#eef5f9" />
        {/* Liquid below the meniscus */}
        <path d={`M${TUBE.left} ${my - 7} Q${mid} ${my + 7} ${TUBE.right} ${my - 7} L${TUBE.right} ${H} L${TUBE.left} ${H} Z`} fill="#cfe3f1" style={{ transition: "d 0.3s" }} />
        <path d={`M${TUBE.left} ${my - 7} Q${mid} ${my + 7} ${TUBE.right} ${my - 7}`} fill="none" stroke="#2f5d7c" strokeWidth={1.6} />
        {ticks.map((v) => {
          const whole = Math.abs(v - Math.round(v)) < 1e-6;
          const half = !whole && Math.abs(v * 2 - Math.round(v * 2)) < 1e-6;
          const len = whole ? 46 : half ? 30 : 18;
          return (
            <g key={v}>
              <line x1={TUBE.left} x2={TUBE.left + len} y1={y(v)} y2={y(v)} stroke="#1f2a30" strokeWidth={whole ? 1.6 : 1} />
              {whole && (
                <text x={TUBE.left + len + 4} y={y(v) + 5} fontSize={15} fontWeight={700} fill="#1f2a30">
                  {Math.round(v)}
                </text>
              )}
            </g>
          );
        })}
        <line x1={TUBE.left} x2={TUBE.left} y1={0} y2={H} stroke="#41525c" strokeWidth={1.5} />
        <line x1={TUBE.right} x2={TUBE.right} y1={0} y2={H} stroke="#41525c" strokeWidth={1.5} />
        {/* The eye and its line of sight */}
        <g opacity={0.9}>
          <line x1={16} y1={eyeY} x2={TUBE.right + 40} y2={eyeY + ((my - eyeY) / (mid - 16)) * (TUBE.right + 40 - 16)} stroke="#c0392b" strokeDasharray="4 3" strokeWidth={1} />
          <ellipse cx={12} cy={eyeY} rx={9} ry={6} fill="#fff" stroke="#1f2a30" strokeWidth={1.2} />
          <circle cx={14} cy={eyeY} r={3} fill="#1f2a30" />
        </g>
      </g>
    </svg>
  );
}
