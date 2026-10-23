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
import { mapPoint, rangeOn, transformLabel, type Transform } from "@/lib/maths/functions";

const W = 320;
const H = 240;
const COLOURS = ["#4338ca", "#b8452b", "#2f5d9c", "#8a5a00"];

function safeParse(s: string): Expr | null {
  try {
    return parseExpr(s);
  } catch {
    return null;
  }
}

/** `mini`: a small, still picture (graph answer options): no sliders, no zoom, no caption. */
export function Graph({ spec, onParams, mini = false }: { spec: GraphSpec; onParams?: (p: Record<string, number>) => void; mini?: boolean }) {
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
    const exprs = spec.select ? [spec.select.exprs[String(params[spec.select.param])] ?? Object.values(spec.select.exprs)[0]] : spec.curves.map((c) => (c.param ? "" : c.expr));
    return exprs.map((e) => (e ? safeParse(e) : null));
  }, [spec, params]);

  const f = (i: number, x: number) => {
    const e = curves[i];
    return e ? evaluate(e, { ...params, x }) : NaN;
  };

  const tr: Transform | null = spec.transform ? { A: params.A ?? 1, B: params.B ?? 1, C: params.C ?? 0, D: params.D ?? 0 } : null;
  const g = (x: number) => (tr ? tr.A * f(0, tr.B * x + tr.C) + tr.D : NaN);

  /** A curve as an SVG path, broken where it is undefined or leaves the window. */
  function pathOf(fn: (x: number) => number): string {
    let d = "";
    let pen = false;
    const n = 260;
    for (let k = 0; k <= n; k++) {
      const x = x0 + ((x1 - x0) * k) / n;
      const y = fn(x);
      if (!Number.isFinite(y) || y < y0 - (y1 - y0) * 4 || y > y1 + (y1 - y0) * 4) {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`;
      pen = true;
    }
    return d;
  }

  /** A curve given by x(t), y(t). */
  function paramPath(c: { x: string; y: string; t: [number, number] }): string {
    const ex = safeParse(c.x);
    const ey = safeParse(c.y);
    if (!ex || !ey) return "";
    let d = "";
    const n = 300;
    for (let k = 0; k <= n; k++) {
      const tt = c.t[0] + ((c.t[1] - c.t[0]) * k) / n;
      const px = evaluate(ex, { ...params, t: tt });
      const py = evaluate(ey, { ...params, t: tt });
      if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
      d += `${d ? "L" : "M"}${X(px).toFixed(1)} ${Y(py).toFixed(1)}`;
    }
    return d;
  }

  // Line test: where the dragged line meets each curve.
  const lineHits = (() => {
    if (!spec.lineTest) return [] as { x: number; y: number }[];
    const c = params[spec.lineTest.param] ?? 0;
    const hits: { x: number; y: number }[] = [];
    spec.curves.forEach((cv, i) => {
      if (cv.param) {
        const ex = safeParse(cv.param.x);
        const ey = safeParse(cv.param.y);
        if (!ex || !ey) return;
        const comp = spec.lineTest!.dir === "vertical" ? ex : ey;
        const step = (cv.param.t[1] - cv.param.t[0]) / 600;
        for (const tt of realRoots((t) => evaluate(comp, { ...params, t }) - c, cv.param.t[0], cv.param.t[1], step))
          hits.push({ x: evaluate(ex, { ...params, t: tt }), y: evaluate(ey, { ...params, t: tt }) });
      } else if (spec.lineTest!.dir === "vertical") {
        const y = f(i, c);
        if (Number.isFinite(y)) hits.push({ x: c, y });
      } else {
        for (const x of realRoots((x) => f(i, x) - c, x0, x1, (x1 - x0) / 600)) hits.push({ x, y: c });
      }
    });
    // A closed curve can meet the line at its start and end point: count each point once.
    return hits.filter((h, k) => hits.findIndex((o) => Math.abs(o.x - h.x) < 1e-3 && Math.abs(o.y - h.y) < 1e-3) === k);
  })();

  // Mirror: the reflection of the dragged point in y = x, and the trail it leaves (the inverse graph).
  const [trail, setTrail] = useState<number[]>([]);
  const dragValue = spec.dragPoint ? params[spec.dragPoint.param] : null;
  if (spec.mirror && dragValue !== null && !trail.includes(dragValue)) setTrail((tr2) => [...tr2, dragValue].sort((a, b) => a - b));

  // Domain → range bars.
  const dr = spec.domainRange ? ([params[spec.domainRange.from], params[spec.domainRange.to]] as [number, number]) : null;
  const drRange = dr && curves[0] && dr[0] < dr[1] ? rangeOn(curves[0], dr[0], dr[1], params) : null;

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
    if (spec.lineTest && dragging.current && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * W;
      const py = ((e.clientY - rect.top) / rect.height) * H;
      const v = spec.lineTest.dir === "vertical" ? invX(px) : y0 + ((H - py) / H) * (y1 - y0);
      set(spec.lineTest.param, Math.round(v * 10) / 10);
      return;
    }
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
  const shownExpr = spec.select ? spec.select.exprs[String(params[spec.select.param])] : spec.curves[0]?.param ? undefined : spec.curves[0]?.expr;
  const shownLatex = useMemo(() => {
    const e = shownExpr ? safeParse(shownExpr) : null;
    if (!e) return null;
    // Show the curve with the current parameter values substituted.
    const sub = (x: Expr): Expr =>
      x.t === "var" && x.name in params ? { t: "num", v: params[x.name] } : x.t === "bin" ? { ...x, a: sub(x.a), b: sub(x.b) } : x.t === "neg" || x.t === "abs" || x.t === "fn" ? { ...x, a: sub(x.a) } : x;
    if (tr) return `y = ${transformLabel(tr)}`;
    return `y = ${toLatex(sub(e))
      .replace(/(^|[^\d.])1(?=x)/g, "$1")
      .replace(/\+ -/g, "- ")
      .replace(/- -/g, "+ ")}`;
  }, [shownExpr, params, tr]);

  return (
    <figure className="select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full touch-none rounded-xl border border-line bg-white"
        onPointerMove={onPointer}
        onPointerDown={(e) => {
          if (!spec.lineTest) return;
          dragging.current = true;
          onPointer(e);
        }}
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
        {spec.asymptotes?.map((a, i) =>
          a.x !== undefined ? (
            <line key={`ax${i}`} x1={X(a.x)} x2={X(a.x)} y1={0} y2={H} stroke="#8a5a00" strokeWidth={1.4} strokeDasharray="6 4" />
          ) : a.y !== undefined ? (
            <line key={`ay${i}`} x1={0} x2={W} y1={Y(a.y)} y2={Y(a.y)} stroke="#8a5a00" strokeWidth={1.4} strokeDasharray="6 4" />
          ) : null,
        )}
        {spec.mirror && <line x1={X(Math.max(x0, y0))} y1={Y(Math.max(x0, y0))} x2={X(Math.min(x1, y1))} y2={Y(Math.min(x1, y1))} stroke="#6b7a82" strokeWidth={1.2} strokeDasharray="5 4" />}
        {curves.map((_, i) => {
          const cv = spec.curves[i];
          const faint = cv?.faint || (!!tr && i === 0);
          return <path key={i} d={cv?.param ? paramPath(cv.param) : path(i)} fill="none" stroke={faint ? "#b8c2c8" : (cv?.colour ?? COLOURS[i % COLOURS.length])} strokeWidth={faint ? 1.8 : 2.4} strokeLinejoin="round" />;
        })}
        {tr && <path d={pathOf(g)} fill="none" stroke="#4338ca" strokeWidth={2.8} strokeLinejoin="round" />}
        {tr &&
          spec.transform!.points.map((p) => {
            const y = f(0, p.x);
            if (!Number.isFinite(y)) return null;
            const m = mapPoint(tr, { x: p.x, y });
            const r = (v: number) => Math.round(v * 100) / 100;
            return (
              <g key={p.label}>
                <circle cx={X(p.x)} cy={Y(y)} r={3.5} fill="#b8c2c8" />
                <line x1={X(p.x)} y1={Y(y)} x2={X(m.x)} y2={Y(m.y)} stroke="#b8c2c8" strokeDasharray="2 3" />
                <circle cx={X(m.x)} cy={Y(m.y)} r={5} fill="#b8452b" stroke="#fff" strokeWidth={1.5} />
                <text x={X(m.x) + 7} y={Y(m.y) - 7} fontSize={10} fontWeight={700} fill="#b8452b">
                  {p.label}({r(m.x)}, {r(m.y)})
                </text>
              </g>
            );
          })}
        {spec.mirror && trail.length > 1 && (
          <path d={trail.map((a, k) => `${k ? "L" : "M"}${X(f(0, a)).toFixed(1)} ${Y(a).toFixed(1)}`).join("")} fill="none" stroke="#b8452b" strokeWidth={2.4} />
        )}
        {spec.mirror && dragValue !== null && Number.isFinite(f(0, dragValue)) && (
          <g>
            <line x1={X(dragValue)} y1={Y(f(0, dragValue))} x2={X(f(0, dragValue))} y2={Y(dragValue)} stroke="#b8452b" strokeDasharray="3 3" />
            <circle cx={X(f(0, dragValue))} cy={Y(dragValue)} r={6} fill="#b8452b" stroke="#fff" strokeWidth={2} />
          </g>
        )}
        {spec.lineTest &&
          (spec.lineTest.dir === "vertical" ? (
            <line x1={X(params[spec.lineTest.param])} x2={X(params[spec.lineTest.param])} y1={0} y2={H} stroke="#2f5d9c" strokeWidth={2.5} />
          ) : (
            <line x1={0} x2={W} y1={Y(params[spec.lineTest.param])} y2={Y(params[spec.lineTest.param])} stroke="#2f5d9c" strokeWidth={2.5} />
          ))}
        {lineHits.map((h, i) => (
          <circle key={`h${i}`} cx={X(h.x)} cy={Y(h.y)} r={5.5} fill="#2f5d9c" stroke="#fff" strokeWidth={2} />
        ))}
        {dr && (
          <g>
            <rect x={X(Math.min(...dr))} y={Y(0) - 4} width={Math.abs(X(dr[1]) - X(dr[0]))} height={8} rx={4} fill="#2f5d9c" opacity={0.75} />
            {drRange && <rect x={X(0) - 4} y={Y(drRange[1])} width={8} height={Math.max(2, Y(drRange[0]) - Y(drRange[1]))} rx={4} fill="#b8452b" opacity={0.75} />}
            <path d={(() => {
              let d = "";
              for (let k = 0; k <= 120; k++) {
                const x = dr[0] + ((dr[1] - dr[0]) * k) / 120;
                const y = f(0, x);
                if (Number.isFinite(y)) d += `${d ? "L" : "M"}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`;
              }
              return d;
            })()} fill="none" stroke="#2f5d9c" strokeWidth={4} opacity={0.8} />
          </g>
        )}
        {spec.points?.map((p, i) => (
          <g key={`pt${i}`}>
            <circle cx={X(p.x)} cy={Y(p.y)} r={4.5} fill="#1f2a30" />
            {p.label && (
              <text x={X(p.x) + 6} y={Y(p.y) - 6} fontSize={10} fontWeight={700} fill="#1f2a30">
                {p.label}
              </text>
            )}
          </g>
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
            <circle cx={X(dp)} cy={Y(f(0, dp))} r={7} fill="#4338ca" stroke="#fff" strokeWidth={2} />
          </g>
        )}
      </svg>
      {shownLatex && !mini && (
        <figcaption className="mt-1 text-center">
          <Tex latex={shownLatex} />
        </figcaption>
      )}
      {spec.lineTest && (
        <p className="mt-1 text-center text-sm font-semibold text-[#2f5d9c]">
          {spec.lineTest.dir === "vertical" ? s.verticalHits : s.horizontalHits} {lineHits.length}
        </p>
      )}
      {dr && drRange && (
        <p className="mt-1 text-center text-sm">
          <Tex latex={`${Math.min(...dr)} \\le x \\le ${Math.max(...dr)} \\;\\Rightarrow\\; ${Number(drRange[0].toFixed(2))} \\le f(x) \\le ${Number(drRange[1].toFixed(2))}`} />
        </p>
      )}
      {dp !== null && spec.dragPoint && !spec.mirror && (
        <p className="text-center text-sm text-muted">
          {spec.dragPoint.label ?? "x"} = {dp}, f = {Number(f(0, dp).toFixed(3))}
        </p>
      )}
      <div className="mt-2 space-y-2">
        {(mini || spec.hideSliders ? [] : (spec.params ?? []))
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
      <div className={`mt-2 flex justify-end gap-2 ${mini ? "hidden" : ""}`}>
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
