/**
 * Small helpers shared by the Functions generators: number formatting, polynomial composition and the
 * checks used in mark schemes (each takes the learner's raw input).
 */
import { Frac } from "@/lib/maths/frac";
import { Poly } from "@/lib/maths/poly";
import { checkAnswer } from "@/lib/maths/answer";
import { constants, evaluate, normaliseAnswer, tryParse, type Expr } from "@/lib/maths/expr";
import type { AnswerSpec, GraphSpec } from "@/lib/maths/types";

export const F = (n: number, d = 1) => new Frac(n, d);
export const P = (...c: (number | Frac)[]) => Poly.of(...c);
export const tex = (p: Poly) => p.toLatex();
export const str = (p: Poly) => p.toString();
/** A number in LaTeX and in linear syntax (fractions allowed). */
export const nL = (v: number | Frac) => Frac.of(v).toLatex();
export const nS = (v: number | Frac) => Frac.of(v).toString();

/** p(q(x)) for polynomials. */
export function compose(p: Poly, q: Poly): Poly {
  return p.terms().reduce((acc, { coef, power }) => acc.add(q.pow(power).scale(coef)), P(0));
}

/** "(x - 3)" style factor in LaTeX: x − r. */
export const xMinus = (r: number | Frac) => {
  const f = Frac.of(r);
  return f.isZero() ? "x" : f.n > 0 ? `x - ${f.toLatex()}` : `x + ${f.neg().toLatex()}`;
};
export const xMinusS = (r: number | Frac) => {
  const f = Frac.of(r);
  return f.isZero() ? "x" : f.n > 0 ? `x - ${f.toString()}` : `x + ${f.neg().toString()}`;
};

/** A column vector, as written in GCE answers. */
export const vec = (a: number | Frac, b: number | Frac) => `\\begin{pmatrix} ${nL(a)} \\\\ ${nL(b)} \\end{pmatrix}`;

/** A small graph window that fits the points given, with some space around. */
export function windowFor(xs: number[], ys: number[], minHalf = 4): Pick<GraphSpec, "x" | "y"> {
  const span = (v: number[]) => {
    const lo = Math.min(...v, -minHalf / 2);
    const hi = Math.max(...v, minHalf / 2);
    const pad = Math.max(1.5, (hi - lo) * 0.2);
    return [Math.floor(lo - pad), Math.ceil(hi + pad)] as [number, number];
  };
  return { x: span(xs), y: span(ys) };
}

/* ---------- Mark-scheme checks on raw input ---------- */

export const ok = (spec: AnswerSpec, raw: string) => checkAnswer(spec, raw).ok;
export const exprOk = (raw: string, value: string) => ok({ kind: "expr", value }, raw);
export const relOk = (raw: string, value: string) => ok({ kind: "relation", value }, raw);
export const rangeOk = (raw: string, value: string) => ok({ kind: "range", value }, raw);
export const solOk = (raw: string, values: string[]) => ok({ kind: "solutions", values }, raw);

/** The learner's expression (after "f(x) =" or "y ="), or null. */
export function exprOf(raw: string): Expr | null {
  const s = tryParse(normaliseAnswer(raw).replace(/^\s*([a-z]\s*)?=/i, ""));
  return s && s.or.length === 1 && s.or[0].ops.length === 0 ? s.or[0].parts[0] : null;
}

const TEST_X = [0.37, 1.21, 2.58, 3.9, 5.43, 7.7];

/** Same expression apart from the constant term (the right method, with a slip in the arithmetic). */
export function upToConstant(raw: string, value: string): boolean {
  const e = exprOf(raw);
  const w = exprOf(value);
  if (!e || !w) return false;
  const d = TEST_X.map((x) => evaluate(e, { x }) - evaluate(w, { x })).filter(Number.isFinite);
  return d.length >= 3 && d.every((v) => Math.abs(v - d[0]) < 1e-6);
}

/** The values in "x = 3 or x = −2" (any letter), or [] if the input is not a list of x = number. */
export function valuesOf(raw: string): number[] {
  const s = tryParse(raw);
  if (!s) return [];
  const out: number[] = [];
  for (const c of s.or) {
    if (c.ops.length !== 1 || c.ops[0] !== "=") return [];
    const v = evaluate(c.parts[1], {});
    if (!Number.isFinite(v)) return [];
    out.push(v);
  }
  return out;
}

/** The statement contains this number (a method mark for using the right critical value). */
export const mentions = (raw: string, v: number) => {
  const s = tryParse(normaliseAnswer(raw));
  return !!s && s.or.some((c) => c.parts.some((p) => constants(p).some((n) => Math.abs(n - v) < 1e-9)));
};

export const close = (a: number | null, b: number) => a !== null && Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b));
