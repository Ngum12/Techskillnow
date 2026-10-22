"use client";
/** Small teaching visuals: the area (grid) model and long-division layouts. */
import { useState } from "react";
import { useT } from "@/components/I18n";
import type { DivisionLayout, Sign, SignDiagram } from "@/lib/maths/types";
import { Tex } from "./Tex";

/** (x + a)(x + b) as the area of a rectangle split into four parts. Drag the slider to change x. */
export function AreaModel({ a = 3, b = 2 }: { a?: number; b?: number }) {
  const s = useT().maths.visuals;
  const [x, setX] = useState(5);
  const unit = 260 / (x + Math.max(a, b) + 1);
  const W = (x + b) * unit;
  const H = (x + a) * unit;
  const cell = (cx: number, cy: number, w: number, h: number, fill: string, label: string) => (
    <g>
      <rect x={cx} y={cy} width={w} height={h} fill={fill} stroke="#41525c" strokeWidth={1.2} />
      <foreignObject x={cx} y={cy} width={w} height={h}>
        <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
          <Tex latex={label} />
        </div>
      </foreignObject>
    </g>
  );
  return (
    <figure>
      <svg viewBox={`-30 -30 ${W + 40} ${H + 40}`} className="mx-auto block w-full max-w-sm">
        <text x={(x * unit) / 2} y={-10} textAnchor="middle" fontSize={13}>
          x
        </text>
        <text x={x * unit + (b * unit) / 2} y={-10} textAnchor="middle" fontSize={13}>
          {b}
        </text>
        <text x={-12} y={(x * unit) / 2} textAnchor="middle" fontSize={13}>
          x
        </text>
        <text x={-12} y={x * unit + (a * unit) / 2} textAnchor="middle" fontSize={13}>
          {a}
        </text>
        {cell(0, 0, x * unit, x * unit, "#e6f0eb", "x^2")}
        {cell(x * unit, 0, b * unit, x * unit, "#fdf1df", `${b}x`)}
        {cell(0, x * unit, x * unit, a * unit, "#e3ecf7", `${a}x`)}
        {cell(x * unit, x * unit, b * unit, a * unit, "#f6e3e0", `${a * b}`)}
      </svg>
      <label className="mt-2 flex items-center gap-3">
        <span className="w-20 text-sm font-semibold">x = {x}</span>
        <input type="range" min={2} max={9} step={1} value={x} onChange={(e) => setX(Number(e.target.value))} className="h-11 flex-1 accent-primary" />
      </label>
      <figcaption className="mt-1 text-center">
        <Tex latex={`(x + ${a})(x + ${b}) = x^2 + ${b}x + ${a}x + ${a * b} = x^2 + ${a + b}x + ${a * b}`} />
        <p className="text-sm text-muted">{s.areaCheck.replace("{x}", String(x)).replace("{total}", String((x + a) * (x + b)))}</p>
      </figcaption>
    </figure>
  );
}

/**
 * A sign diagram: one column per interval between the critical values, one row per factor, and the
 * result row. Each cell is tapped through blank → + → −. `bad` marks wrong cells after checking.
 */
export function SignTable({ data, value, onTap, bad, locked }: { data: SignDiagram; value: Record<string, Sign | "">; onTap: (key: string) => void; bad?: Record<string, boolean>; locked?: boolean }) {
  const s = useT().maths.visuals;
  const n = data.critical.length + 1;
  const header = (i: number) => (i === 0 ? `x < ${data.critical[0]}` : i === n - 1 ? `x > ${data.critical[n - 2]}` : `${data.critical[i - 1]} < x < ${data.critical[i]}`);
  const rows = [...data.factors.map((f, r) => ({ key: `f${r}`, latex: f.latex })), { key: "res", latex: data.result.latex }];
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-bg">
            <th className="border-b border-line px-2 py-2 text-left">{s.signFactor}</th>
            {Array.from({ length: n }, (_, i) => (
              <th key={i} className="whitespace-nowrap border-b border-l border-line px-1 py-2 text-center font-normal">
                <Tex latex={header(i)} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className={r.key === "res" ? "border-t-2 border-[#1f2a30] font-bold" : "border-t border-line"}>
              <td className="whitespace-nowrap px-2 py-1.5">
                <Tex latex={r.latex} />
              </td>
              {Array.from({ length: n }, (_, i) => {
                const key = `${r.key}:${i}`;
                const v = value[key] ?? "";
                return (
                  <td key={i} className="border-l border-line p-1 text-center">
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => onTap(key)}
                      aria-label={`${r.latex}, ${header(i)}: ${v || s.signEmpty}`}
                      className={`h-11 w-11 rounded-lg border-2 text-xl font-bold ${bad?.[key] ? "border-err bg-err-soft" : v === "+" ? "border-ok bg-ok-soft text-ok" : v === "-" ? "border-[#c0392b] bg-[#fcebe9] text-[#c0392b]" : "border-dashed border-line"}`}
                    >
                      {v === "-" ? "−" : v}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * A long-division layout, as written in the exercise book. `upto` shows stages 0…upto (−1 = only the
 * question). `blank(row, col)` can turn a cell into an input for "fill the gaps".
 */
export function DivisionView({ layout, upto, blank }: { layout: DivisionLayout; upto: number; blank?: (key: string, value: string) => React.ReactNode }) {
  const cols = layout.dividend.length;
  const cellCls = "px-1 py-1 text-center whitespace-nowrap";
  const render = (key: string, v: string) => (blank && v ? blank(key, v) ?? <Tex latex={v} /> : v ? <Tex latex={v} /> : null);
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white p-2">
      <table className="mx-auto border-collapse text-[0.98rem]">
        <tbody>
          <tr>
            <td />
            {layout.quotient.map((q, i) => (
              <td key={i} className={cellCls}>
                {layout.quotientStage[i] >= 0 && layout.quotientStage[i] <= upto ? render(`q${i}`, q) : null}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border-r-2 border-[#1f2a30] pr-2 text-right">
              <Tex latex={layout.kind === "poly" ? `(${layout.divisor})` : layout.divisor} />
            </td>
            {layout.dividend.map((d, i) => (
              <td key={i} className={`${cellCls} border-t-2 border-[#1f2a30]`}>
                <Tex latex={d} />
              </td>
            ))}
          </tr>
          {layout.stages.slice(0, upto + 1).map((st, k) => (
            <StageRows key={k} k={k} stage={st} cols={cols} cellCls={cellCls} render={render} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StageRows({ k, stage, cols, cellCls, render }: { k: number; stage: { product: string[]; after: string[] }; cols: number; cellCls: string; render: (key: string, v: string) => React.ReactNode }) {
  return (
    <>
      <tr>
        <td className="pr-2 text-right text-muted">−</td>
        {Array.from({ length: cols }, (_, i) => (
          <td key={i} className={`${cellCls} ${stage.product[i] ? "border-b border-[#1f2a30]" : ""}`}>
            {render(`p${k}-${i}`, stage.product[i])}
          </td>
        ))}
      </tr>
      <tr>
        <td />
        {Array.from({ length: cols }, (_, i) => (
          <td key={i} className={cellCls}>
            {render(`a${k}-${i}`, stage.after[i])}
          </td>
        ))}
      </tr>
    </>
  );
}
