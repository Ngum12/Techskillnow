import { useId } from "react";

/**
 * Laboratory apparatus as plain SVG groups (no images): light enough for cheap phones.
 * Liquid levels and colours come from props and animate with CSS transitions.
 */

const GLASS = "#eaf3f8";
const LINE = "#41525c";
const ACID = "#dbeaf5";
/** A unique id usable inside url(#…). */
const useSvgId = (prefix: string) => prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const smooth = { transition: "transform 0.35s ease-out, fill 0.6s ease" } as const;

/** Burette scale: reading 0 at the top, `capacity` at the bottom of the scale. */
export const BURETTE = { x: 0, top: 0, scaleTop: 18, scaleBottom: 238, bottom: 252, width: 14, capacity: 50 };

export function buretteY(reading: number, capacity = 50): number {
  return BURETTE.scaleTop + (reading / capacity) * (BURETTE.scaleBottom - BURETTE.scaleTop);
}

/** Burette with tap and jet. `level` is the current reading (cm³). */
export function Burette({ level, capacity = 50, funnel = false, bubble = false, flowing = false, highlight = false }: { level: number; capacity?: number; funnel?: boolean; bubble?: boolean; flowing?: boolean; highlight?: boolean }) {
  const w = BURETTE.width;
  const clip = useSvgId("burette");
  const liquidTop = Math.min(buretteY(Math.max(level, -1.5), capacity), BURETTE.bottom);
  const full = BURETTE.bottom - BURETTE.top;
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <rect x={0} y={BURETTE.top} width={w} height={full} rx={2} />
        </clipPath>
      </defs>
      <rect x={0} y={BURETTE.top} width={w} height={full} rx={2} fill={GLASS} />
      <g clipPath={`url(#${clip})`}>
        <rect x={0} y={0} width={w} height={full + 10} fill={ACID} style={{ ...smooth, transform: `translateY(${liquidTop}px)` }} />
      </g>
      {Array.from({ length: capacity / 5 + 1 }, (_, i) => (
        <line key={i} x1={w - 6} x2={w} y1={buretteY(i * 5, capacity)} y2={buretteY(i * 5, capacity)} stroke={LINE} strokeWidth={0.8} />
      ))}
      <rect x={0} y={BURETTE.top} width={w} height={full} rx={2} fill="none" stroke={highlight ? "#4338ca" : LINE} strokeWidth={highlight ? 2.5 : 1.2} />
      {/* Tap and jet */}
      <rect x={w / 2 - 2} y={BURETTE.bottom} width={4} height={10} fill={ACID} stroke={LINE} strokeWidth={0.8} />
      <rect x={-6} y={BURETTE.bottom + 2} width={w + 12} height={5} rx={2} fill={flowing ? "#4338ca" : "#c9d3d8"} stroke={LINE} strokeWidth={0.8} />
      <path d={`M${w / 2 - 2} ${BURETTE.bottom + 10} L${w / 2 - 1} ${BURETTE.bottom + 24} L${w / 2 + 1} ${BURETTE.bottom + 24} L${w / 2 + 2} ${BURETTE.bottom + 10} Z`} fill={bubble ? "#ffffff" : ACID} stroke={LINE} strokeWidth={0.8} />
      {bubble && <circle cx={w / 2} cy={BURETTE.bottom + 15} r={1.6} fill="none" stroke={LINE} strokeWidth={0.6} />}
      {funnel && <path d={`M${-10} ${-16} L${w + 10} ${-16} L${w / 2 + 2} ${4} L${w / 2 - 2} ${4} Z`} fill={GLASS} stroke={LINE} strokeWidth={1.2} />}
    </g>
  );
}

/** Retort stand with clamp, drawn around a burette placed at x=0..14. */
export function Stand({ height = 300 }: { height?: number }) {
  return (
    <g>
      <rect x={-46} y={height - 6} width={70} height={8} rx={2} fill="#8b9aa3" />
      <rect x={-40} y={10} width={5} height={height - 12} fill="#8b9aa3" />
      <rect x={-38} y={70} width={44} height={5} rx={2} fill="#8b9aa3" />
      <rect x={-3} y={64} width={20} height={16} rx={3} fill="none" stroke="#8b9aa3" strokeWidth={3} />
    </g>
  );
}

/** Conical flask. `fill` 0–1 is how full; `colour` the solution; `flash` shows a local colour patch. */
export function Flask({ fill, colour, flash, flashColour, swirling = false, highlight = false }: { fill: number; colour: string; flash?: boolean; flashColour?: string; swirling?: boolean; highlight?: boolean }) {
  const body = "M22 0 L22 22 L2 66 Q0 72 6 72 L58 72 Q64 72 62 66 L42 22 L42 0 Z";
  const clip = useSvgId("flask");
  const h = fill > 0 ? 8 + Math.min(1, fill) * 30 : 0;
  return (
    <g className={swirling ? "chem-swirl" : undefined} style={{ transformOrigin: "32px 72px" }}>
      <defs>
        <clipPath id={clip}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d={body} fill={GLASS} />
      <g clipPath={`url(#${clip})`}>
        <rect x={0} y={0} width={64} height={80} fill={colour} style={{ ...smooth, transform: `translateY(${72 - h}px)` }} />
        {flash && <ellipse cx={32} cy={72 - h + 6} rx={12} ry={4} fill={flashColour} className="chem-flash" />}
      </g>
      <path d={body} fill="none" stroke={highlight ? "#4338ca" : LINE} strokeWidth={highlight ? 2.5 : 1.4} />
    </g>
  );
}

export function Tile({ width = 90 }: { width?: number }) {
  return <rect x={0} y={0} width={width} height={7} rx={1.5} fill="#ffffff" stroke={LINE} strokeWidth={1} />;
}

/** 25.0 cm³ bulb pipette with a filler on top. `fill` 0–1. */
export function Pipette({ fill = 0, colour = ACID, highlight = false }: { fill?: number; colour?: string; highlight?: boolean }) {
  const stroke = highlight ? "#4338ca" : LINE;
  return (
    <g>
      <ellipse cx={8} cy={8} rx={9} ry={8} fill="#c44" opacity={0.85} />
      <rect x={6} y={14} width={4} height={56} fill={fill > 0.5 ? colour : GLASS} stroke={stroke} strokeWidth={1} />
      <line x1={3} x2={13} y1={40} y2={40} stroke={stroke} strokeWidth={1} />
      <ellipse cx={8} cy={86} rx={8} ry={16} fill={fill > 0 ? colour : GLASS} stroke={stroke} strokeWidth={1.2} />
      <path d="M6 102 L7 140 L9 140 L10 102" fill={fill > 0 ? colour : GLASS} stroke={stroke} strokeWidth={1} />
    </g>
  );
}

export function Funnel({ highlight = false }: { highlight?: boolean }) {
  return <path d="M0 0 L36 0 L20 22 L20 38 L16 38 L16 22 Z" fill={GLASS} stroke={highlight ? "#4338ca" : LINE} strokeWidth={highlight ? 2.5 : 1.4} />;
}

export function Beaker({ label, colour, highlight = false }: { label: string; colour: string; highlight?: boolean }) {
  return (
    <g>
      <path d="M0 0 L0 52 Q0 56 4 56 L40 56 Q44 56 44 52 L44 0" fill={GLASS} />
      <rect x={1} y={22} width={42} height={33} fill={colour} />
      <path d="M-3 -2 L0 0 L0 52 Q0 56 4 56 L40 56 Q44 56 44 52 L44 0" fill="none" stroke={highlight ? "#4338ca" : LINE} strokeWidth={highlight ? 2.5 : 1.4} />
      <text x={22} y={42} textAnchor="middle" fontSize={9} fontWeight={600} fill="#17201b">
        {label}
      </text>
    </g>
  );
}

export function WashBottle({ highlight = false }: { highlight?: boolean }) {
  return (
    <g>
      <path d="M30 0 L44 -10" stroke={LINE} strokeWidth={2} fill="none" />
      <rect x={26} y={0} width={8} height={10} fill="#c9d3d8" />
      <path d="M10 10 L50 10 L54 70 Q54 74 50 74 L10 74 Q6 74 6 70 Z" fill="#f4f8fb" stroke={highlight ? "#4338ca" : LINE} strokeWidth={highlight ? 2.5 : 1.4} />
      <text x={30} y={48} textAnchor="middle" fontSize={8} fill="#41525c">
        H₂O
      </text>
    </g>
  );
}

export function IndicatorBottle({ colour = "#e0368a", highlight = false }: { colour?: string; highlight?: boolean }) {
  return (
    <g>
      <rect x={8} y={0} width={12} height={10} rx={2} fill="#4b3a2f" />
      <rect x={2} y={10} width={24} height={34} rx={4} fill="#fff7e6" stroke={highlight ? "#4338ca" : LINE} strokeWidth={highlight ? 2.5 : 1.4} />
      <rect x={4} y={26} width={20} height={16} rx={3} fill={colour} opacity={0.7} />
    </g>
  );
}
