/**
 * GCE-style marking: M (method), A (accuracy, dependent on the M before it), B (independent) marks,
 * with follow-through so a learner who makes an early slip still earns the later method marks.
 */
import { numberValue } from "./answer";
import type { ExamQuestion, MarkCtx } from "./types";

export type MarkedPoint = { type: "M" | "A" | "B"; text: string; ft: boolean; got: boolean };
export type ExamResult = { parts: { label: string; points: MarkedPoint[]; got: number; max: number }[]; total: number; max: number };

export function markExam(q: ExamQuestion, inputs: string[][]): ExamResult {
  const ctx: MarkCtx = {
    raw: (p, i = 0) => inputs[p]?.[i] ?? "",
    num: (p, i = 0) => numberValue(inputs[p]?.[i] ?? ""),
  };
  const parts = q.parts.map((part) => {
    let lastM: boolean | null = null;
    const points = part.marks.map((m): MarkedPoint => {
      let got = false;
      try {
        got = m.check(ctx);
      } catch {
        got = false;
      }
      if (m.type === "M") lastM = got;
      // An A mark depends on the method mark before it.
      if (m.type === "A" && lastM === false) got = false;
      return { type: m.type, text: m.text, ft: !!m.ft, got };
    });
    const got = points.filter((p) => p.got).length;
    return { label: part.label, points, got, max: points.length };
  });
  return { parts, total: parts.reduce((n, p) => n + p.got, 0), max: parts.reduce((n, p) => n + p.max, 0) };
}

/** Helpers for writing mark schemes in generators. */
export const near = (a: number | null, b: number, tol = 1e-6) => a !== null && Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
