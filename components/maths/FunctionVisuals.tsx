"use client";
/** Visuals for the Functions topic: mapping diagrams and animated function machines. */
import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { runBackwards, runChain, type Machine } from "@/lib/maths/functions";
import { numberValue } from "@/lib/maths/answer";
import { previewLatex } from "@/lib/maths/expr";
import { Tex } from "./Tex";
import { MathField } from "./MathInput";
import { Graph } from "./Graph";
import type { Question } from "@/lib/maths/types";

/** Two sets with arrows: inputs on the left, outputs on the right. */
export function MappingDiagram({ left, right, arrows }: { left: string[]; right: string[]; arrows: [number, number][] }) {
  const rowH = 34;
  const h = Math.max(left.length, right.length) * rowH + 30;
  const ly = (i: number) => 22 + i * rowH + ((Math.max(left.length, right.length) - left.length) * rowH) / 2;
  const ry = (j: number) => 22 + j * rowH + ((Math.max(left.length, right.length) - right.length) * rowH) / 2;
  return (
    <svg viewBox={`0 0 260 ${h}`} className="mx-auto block w-full max-w-xs" role="img" aria-label={arrows.map(([i, j]) => `${left[i]} → ${right[j]}`).join(", ")}>
      <defs>
        <marker id="map-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#1d5440" />
        </marker>
      </defs>
      <ellipse cx={55} cy={h / 2} rx={42} ry={h / 2 - 4} fill="#e3ecf7" stroke="#41525c" />
      <ellipse cx={205} cy={h / 2} rx={42} ry={h / 2 - 4} fill="#fdf1df" stroke="#41525c" />
      {arrows.map(([i, j], k) => (
        <line key={k} x1={72} y1={ly(i)} x2={186} y2={ry(j)} stroke="#1d5440" strokeWidth={1.8} markerEnd="url(#map-arrow)" />
      ))}
      {left.map((v, i) => (
        <text key={`l${i}`} x={55} y={ly(i) + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill="#17201b">
          {v}
        </text>
      ))}
      {right.map((v, j) => (
        <text key={`r${j}`} x={205} y={ry(j) + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill="#17201b">
          {v}
        </text>
      ))}
    </svg>
  );
}

const show = (v: number) => (Number.isFinite(v) ? String(Number(v.toFixed(4))) : "—");

/**
 * Function machines in a row. Type an input and run it: the value travels through each machine in
 * turn (for fg: g first, then f). `backwards` runs the inverse machines from the output end.
 */
export function FunctionMachine({ machines, order, backwards = false, input }: { machines: Machine[]; order: string[]; backwards?: boolean; input?: number }) {
  const s = useT().maths.machine;
  const [value, setValue] = useState(input !== undefined ? String(input) : "");
  const [stage, setStage] = useState(-1);
  const [values, setValues] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = backwards ? [...order].reverse() : order;
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  function run() {
    const v = numberValue(value);
    if (v === null) return;
    try {
      setValues(backwards ? runBackwards(machines, order, v) : runChain(machines, order, v));
    } catch {
      return;
    }
    setStage(0);
    // Step through each machine so the learner sees the value change at each stage.
    const tick = (k: number) => {
      timer.current = setTimeout(() => {
        setStage(k);
        if (k < seq.length) tick(k + 1);
      }, 700);
    };
    tick(1);
  }

  const label = (m: Machine) => {
    const e = backwards ? m.inverse ?? "?" : m.expr;
    return `${m.name}${backwards ? "^{-1}" : ""}: x \\mapsto ${previewLatex(e) ?? e}`;
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <MathField compact value={value} onChange={(v) => (setValue(v), setStage(-1))} label={backwards ? s.output : s.input} placeholder={backwards ? s.outputPlaceholder : s.inputPlaceholder} onEnter={run} />
        </div>
        <button type="button" className="btn btn-primary min-h-12 px-4" onClick={run} disabled={numberValue(value) === null}>
          ▶ {s.run}
        </button>
      </div>
      <ol className="mt-3 flex flex-col gap-2">
        <li className="flex items-center gap-2">
          <span className={`min-w-16 rounded-lg px-2 py-1 text-center font-mono font-bold ${stage >= 0 ? "bg-primary-soft" : "bg-bg"}`}>{stage >= 0 ? value : "?"}</span>
          <span className="text-sm text-muted">{backwards ? s.startOutput : s.startInput}</span>
        </li>
        {seq.map((name, k) => {
          const m = machines.find((x) => x.name === name)!;
          const reached = stage >= k + 1;
          return (
            <li key={`${name}${k}`} className="flex flex-col gap-1">
              <div className={`flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 transition-colors duration-500 ${stage === k + 1 ? "border-primary bg-primary-soft" : "border-[#1f2a30] bg-[#f4f6f7]"}`}>
                <span className="text-sm font-semibold">⚙️ {fmt(s.machine, { n: k + 1 })}</span>
                <Tex latex={label(m)} />
              </div>
              <div className="flex items-center gap-2 pl-4">
                <span className="text-muted">↓</span>
                <span className={`min-w-16 rounded-lg px-2 py-1 text-center font-mono font-bold transition-all duration-500 ${reached ? "scale-100 bg-ok-soft text-ok opacity-100" : "scale-90 bg-bg opacity-40"}`}>{reached ? show(values[k]) : "?"}</span>
              </div>
            </li>
          );
        })}
      </ol>
      {stage >= seq.length && (
        <p className="mt-2 text-center font-semibold text-ok">
          {fmt(backwards ? s.resultBack : s.result, { input: value, output: show(values[values.length - 1]) })}
        </p>
      )}
    </div>
  );
}

/** Any picture that belongs to a question. */
export function QuestionVisual({ q }: { q: Question }) {
  return (
    <>
      {q.mapping && (
        <div className="mt-3">
          <MappingDiagram {...q.mapping} />
        </div>
      )}
      {q.machine && (
        <div className="mt-3">
          <FunctionMachine machines={q.machine.machines} order={q.machine.order} backwards={q.machine.backwards} input={q.machine.input} />
        </div>
      )}
      {q.graph && (
        <div className="mt-3">
          <Graph spec={q.graph} />
        </div>
      )}
    </>
  );
}

