"use client";
/**
 * InteractiveGraph: plain SVG (no plotting library) so it stays smooth on cheap phones.
 * Curves come from expressions with parameters; sliders, a draggable point, zoom, tangent, chord,
 * shaded area and roots are all optional (see GraphSpec).
 */
import { useMemo, useRef, useState } from "react";
import { useT } from "@/components/I18n";
import { evaluate, parseExpr, type Expr } from "@/lib/maths/expr";
import { realRoots } from "@/lib/maths/equiv";
import type { GraphSpec } from "@/lib/maths/types";
import { Tex } from "./Tex";
import { toLatex } from "@/lib/maths/expr";

const W = 320;
const H = 240;
const COLOURS = ["#1d5440", "#b8452b", "#2f5d9c", "#8a5a00"];

function safeParse(s: string): Expr | null {
  try {
    return parseExpr(s);
  } catch {
    return null;
  }
}

export function Graph({ spec, onParams }: { spec: GraphSpec; onParams?: (p: Record<string, number>) => void }) {
  const t = useT();
  const s = t.maths.graph;
  const [params, setParams] = useState<Record<string, number>>(() => Object.fromEntries((spec.params ?? []).map((p) => [p.name, p.value])));
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const [x0, x1] = spec.x.map((v) => v * zoom) as [number, number];
  const [y0, y1] = spec.y.map((v) => v * zoom) as [number, number];
  const X = (x: number) => ((x - x0) / (x1 - x0)) * W;
  const Y = (y: number) => H - ((y - y0) / (y1 - y0)) * H;
  const invX = (px: number) => x0 + (px / W) * (x1 - x0);

  const curves = useMemo(() => {
    const exprs = spec.select ? [spec.select.exprs[String(params[spec.select.param])] ?? Object.values(spec.select.exprs)[0]] : spec.curves.map((c) => c.expr);
    return exprs.map((e) => safeParse(e));
  }, [spec, params]);

  const f = (i: number, x: number) => {
    const e = curves[i];
    return e ? evaluate(e, { ...params, x }) : NaN;
  };

  function path(i: number): string {
    let d = "";
    let pen = false;
    const n = 220;
    for (let k = 0; k <= n; k++) {
      const x = x0 + ((x1 - x0) * k) / n;
      const y = f(i, x);
      if (!Number.isFinite(y) || y < y0 - (y1 - y0) * 4 || y > y1 + (y1 - y0) * 4) {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`;
      pen = true;
    }
    return d;
  }

  function set(name: string, v: number) {
    const next = { ...params, [name]: v };
    setParams(next);
    onParams?.(next);
  }

  function onPointer(e: React.PointerEvent) {
    if (!spec.dragPoint || !dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const p = spec.params?.find((q) => q.name === spec.dragPoint!.param);
    let v = invX(((e.clientX - rect.left) / rect.width) * W);
    if (p) v = Math.max(p.min, Math.min(p.max, Math.round(v / p.step) * p.step));
    set(spec.dragPoint.param, Number(v.toFixed(4)));
  }

  // Grid lines every 1 unit when there is room, otherwise every 2 or 5.
  const span = x1 - x0;
  const step = span <= 12 ? 1 : span <= 24 ? 2 : 5;
  const ticks = (a: number, b: number) => {
    const out: number[] = [];
    for (let v = Math.ceil(a / step) * step; v <= b; v += step) out.push(Math.round(v * 1000) / 1000);
    return out;
  };

  const dp = spec.dragPoint ? params[spec.dragPoint.param] : null;
  const roots = spec.showRoots ? realRoots((x) => f(0, x), x0, x1, (x1 - x0) / 400) : [];
  const tangentX = spec.tangentAt ? params[spec.tangentAt] : null;
  const slope = tangentX !== null ? (f(0, tangentX + 1e-4) - f(0, tangentX - 1e-4)) / 2e-4 : 0;
  const chord = spec.chord ? spec.chord.map((p) => params[p]) : null;
  const shade = spec.shade ? [params[spec.shade.from], params[spec.shade.to]] : null;
  const shownExpr = spec.select ? spec.select.exprs[String(params[spec.select.param])] : spec.curves[0]?.expr;
  const shownLatex = useMemo(() => {
    const e = shownExpr ? safeParse(shownExpr) : null;
    if (!e) return null;
    // Show the curve with the current parameter values substituted.
    const sub = (x: Expr): Expr =>
      x.t === "var" && x.name in params ? { t: "num", v: params[x.name] } : x.t === "bin" ? { ...x, a: sub(x.a), b: sub(x.b) } : x.t === "neg" || x.t === "abs" || x.t === "fn" ? { ...x, a: sub(x.a) } : x;
    return `y = ${toLatex(sub(e))
      .replace(/(^|[^\d.])1(?=x)/g, "$1")
      .replace(/\+ -/g, "- ")
      .replace(/- -/g, "+ ")}`;
  }, [shownExpr, params]);

  return (
    <figure className="select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full touch-none rounded-xl border border-line bg-white"
        onPointerMove={onPointer}
        onPointerUp={() => (dragging.current = false)}
        onPointerLeave={() => (dragging.current = false)}
        role="img"
        aria-label={s.label}
      >
        {ticks(x0, x1).map((v) => (
          <line key={`gx${v}`} x1={X(v)} x2={X(v)} y1={0} y2={H} stroke="#eef1f3" />
        ))}
        {ticks(y0, y1).map((v) => (
          <line key={`gy${v}`} x1={0} x2={W} y1={Y(v)} y2={Y(v)} stroke="#eef1f3" />
        ))}
        <line x1={0} x2={W} y1={Y(0)} y2={Y(0)} stroke="#6b7a82" strokeWidth={1.2} />
        <line x1={X(0)} x2={X(0)} y1={0} y2={H} stroke="#6b7a82" strokeWidth={1.2} />
        {ticks(x0, x1)
          .filter((v) => v !== 0)
          .map((v) => (
            <text key={`lx${v}`} x={X(v)} y={Math.min(H - 3, Math.max(10, Y(0) + 12))} fontSize={9} textAnchor="middle" fill="#6b7a82">
              {v}
            </text>
          ))}
        {ticks(y0, y1)
          .filter((v) => v !== 0)
          .map((v) => (
            <text key={`ly${v}`} x={Math.min(W - 10, Math.max(3, X(0) + 3))} y={Y(v) + 3} fontSize={9} fill="#6b7a82">
              {v}
            </text>
          ))}
        {shade && (
          <path
            d={`M${X(shade[0])} ${Y(0)} ${Array.from({ length: 61 }, (_, k) => {
              const x = shade[0] + ((shade[1] - shade[0]) * k) / 60;
              return `L${X(x)} ${Y(f(0, x))}`;
            }).join(" ")} L${X(shade[1])} ${Y(0)} Z`}
            fill="rgba(29,84,64,0.18)"
          />
        )}
        {curves.map((_, i) => (
          <path key={i} d={path(i)} fill="none" stroke={spec.curves[i]?.colour ?? COLOURS[i % COLOURS.length]} strokeWidth={2.4} strokeLinejoin="round" />
        ))}
        {spec.highlight &&
          (() => {
            // Where the first curve is below (or above) the axis: the curve in colour, and a bar on the x-axis.
            const want = (y: number) => (spec.highlight === "below" ? y < 0 : y > 0);
            const n = 300;
            const runs: [number, number][] = [];
            let start: number | null = null;
            let d = "";
            let pen = false;
            for (let k = 0; k <= n; k++) {
              const x = x0 + ((x1 - x0) * k) / n;
              const y = f(0, x);
              const on = Number.isFinite(y) && want(y);
              if (on && start === null) start = x;
              if (!on && start !== null) (runs.push([start, x]), (start = null));
              if (on && y > y0 - (y1 - y0) * 4 && y < y1 + (y1 - y0) * 4) {
                d += `${pen ? "L" : "M"}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`;
                pen = true;
              } else pen = false;
            }
            if (start !== null) runs.push([start, x1]);
            return (
              <g>
                <path d={d} fill="none" stroke="#c0392b" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
                {runs.map(([a, b]) => (
                  <rect key={a} x={X(a)} y={Y(0) - 3.5} width={Math.max(2, X(b) - X(a))} height={7} rx={3.5} fill="#c0392b" opacity={0.75} />
                ))}
              </g>
            );
          })()}
        {tangentX !== null && Number.isFinite(slope) && (
          <line x1={X(x0)} y1={Y(f(0, tangentX) + slope * (x0 - tangentX))} x2={X(x1)} y2={Y(f(0, tangentX) + slope * (x1 - tangentX))} stroke="#b8452b" strokeWidth={1.5} strokeDasharray="5 4" />
        )}
        {chord && <line x1={X(chord[0])} y1={Y(f(0, chord[0]))} x2={X(chord[1])} y2={Y(f(0, chord[1]))} stroke="#2f5d9c" strokeWidth={1.8} />}
        {roots.map((r) => (
          <circle key={r} cx={X(r)} cy={Y(0)} r={4.5} fill="#fff" stroke="#b8452b" strokeWidth={2} />
        ))}
        {dp !== null && Number.isFinite(f(0, dp)) && (
          <g
            onPointerDown={(e) => {
              dragging.current = true;
              (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            }}
            style={{ cursor: "grab" }}
          >
            <circle cx={X(dp)} cy={Y(f(0, dp))} r={16} fill="transparent" />
            <circle cx={X(dp)} cy={Y(f(0, dp))} r={7} fill="#1d5440" stroke="#fff" strokeWidth={2} />
          </g>
        )}
      </svg>
      {shownLatex && (
        <figcaption className="mt-1 text-center">
          <Tex latex={shownLatex} />
        </figcaption>
      )}
      {dp !== null && spec.dragPoint && (
        <p className="text-center text-sm text-muted">
          {spec.dragPoint.label ?? "x"} = {dp}, f = {Number(f(0, dp).toFixed(3))}
        </p>
      )}
      <div className="mt-2 space-y-2">
        {(spec.params ?? [])
          .filter((p) => p.name !== spec.dragPoint?.param)
          .map((p) => (
            <label key={p.name} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm font-semibold">
                {p.label} = {params[p.name]}
              </span>
              <input type="range" className="h-11 flex-1 accent-primary" min={p.min} max={p.max} step={p.step} value={params[p.name]} onChange={(e) => set(p.name, Number(e.target.value))} />
            </label>
          ))}
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" className="btn btn-secondary min-h-11 px-4 py-1" aria-label={s.zoomIn} onClick={() => setZoom((z) => Math.max(0.25, z / 1.5))}>
          ＋
        </button>
        <button type="button" className="btn btn-secondary min-h-11 px-4 py-1" aria-label={s.zoomOut} onClick={() => setZoom((z) => Math.min(4, z * 1.5))}>
          －
        </button>
      </div>
    </figure>
  );
}
