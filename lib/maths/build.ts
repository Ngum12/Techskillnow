/** Helpers for writing generators: LaTeX for working lines, division layouts, reading a typed polynomial. */
import { Frac } from "./frac";
import { Poly } from "./poly";
import { evaluate, tryParse, isRelation } from "./expr";
import type { DivisionLayout } from "./types";

/** −3 → "(-3)" inside a substitution; 3 → "3". */
export const inBrackets = (a: number | Frac) => {
  const f = Frac.of(a);
  return f.n < 0 || !f.isInt() ? `\\left(${f.toLatex()}\\right)` : f.toLatex();
};

/** "+ 5" / "- 5" after a first term. */
export const signed = (a: number | Frac) => {
  const f = Frac.of(a);
  return f.n < 0 ? `- ${f.neg().toLatex()}` : `+ ${f.toLatex()}`;
};

/** f(a) written out: 2(−3)³ − 5(−3)² + 4(−3) − 1 */
export function substitutionLatex(p: Poly, a: number | Frac): string {
  return p
    .terms()
    .map(({ coef, power }, i) => {
      const neg = coef.n < 0;
      const c = neg ? coef.neg() : coef;
      // The value always goes in brackets when it is substituted: 2(3)², −(−2)³.
      const val = `\\left(${Frac.of(a).toLatex()}\\right)`;
      const base = power === 0 ? c.toLatex() : `${c.eq(1) ? "" : c.toLatex()}${val}${power > 1 ? `^{${power}}` : ""}`;
      return i === 0 ? `${neg ? "-" : ""}${base}` : ` ${neg ? "-" : "+"} ${base}`;
    })
    .join("");
}

/** Each term of f(a) worked out: 2(−27) − 5(9) + … = −54 − 45 + … */
export function evaluatedTermsLatex(p: Poly, a: number | Frac): string {
  return p
    .terms()
    .map(({ coef, power }, i) => {
      const v = coef.mul(powFrac(Frac.of(a), power));
      return i === 0 ? v.toLatex() : ` ${signed(v)}`;
    })
    .join("");
}

export function powFrac(a: Frac, n: number): Frac {
  let r = new Frac(1);
  for (let i = 0; i < n; i++) r = r.mul(a);
  return r;
}

/** LaTeX of a single term with its sign, for layouts: "-2x^{2}", "+6", "x^{3}". */
function termLatex(coef: Frac, power: number, first: boolean, showZero = false): string {
  if (coef.isZero() && !showZero) return "";
  const neg = coef.n < 0;
  const c = neg ? coef.neg() : coef;
  const body = power === 0 ? c.toLatex() : `${c.eq(1) ? "" : c.toLatex()}x${power > 1 ? `^{${power}}` : ""}`;
  return first ? `${neg ? "-" : ""}${body}` : `${neg ? "-" : "+"}${body}`;
}

/**
 * Polynomial long division laid out as on paper, one column per power of x (missing powers shown as 0xⁿ).
 * Assumes a linear or quadratic divisor.
 */
export function polyDivisionLayout(f: Poly, divisor: Poly): DivisionLayout {
  const n = f.degree;
  const col = (power: number) => n - power;
  const width = n + 1;
  const row = () => Array<string>(width).fill("");
  const dividend = row();
  for (let p = n; p >= 0; p--) dividend[col(p)] = termLatex(f.coef(p), p, p === n, true);
  const { steps } = f.divide(divisor);
  const quotient = row();
  const quotientStage: number[] = Array(width).fill(-1);
  const stages = steps.map((s, i) => {
    const qPower = s.term.degree;
    // The quotient term sits above the dividend column with the same power.
    quotient[col(qPower)] = termLatex(s.term.leading, qPower, i === 0);
    quotientStage[col(qPower)] = i;
    const product = row();
    const top = s.before.degree;
    for (let p = top; p > top - divisor.c.length; p--) if (p >= 0) product[col(p)] = termLatex(s.product.coef(p), p, p === top, true);
    const after = row();
    const lowest = Math.max(0, top - divisor.degree - 1);
    for (let p = top - 1; p >= lowest; p--) after[col(p)] = termLatex(s.after.coef(p), p, p === top - 1, true);
    return { product, after };
  });
  return { kind: "poly", divisor: divisor.toLatex(), quotient, dividend, stages, quotientStage };
}

/** Ordinary long division of whole numbers, digit by digit, as taught in primary school. */
export function numberDivisionLayout(dividend: number, divisor: number): { layout: DivisionLayout; quotient: number; remainder: number } {
  const digits = String(dividend).split("");
  const width = digits.length;
  const quotient = Array<string>(width).fill("");
  const quotientStage = Array<number>(width).fill(-1);
  const stages: { product: string[]; after: string[] }[] = [];
  let current = 0;
  let started = false;
  const place = (value: number, endCol: number) => {
    const r = Array<string>(width).fill("");
    String(value)
      .split("")
      .reverse()
      .forEach((d, k) => (r[endCol - k] = d));
    return r;
  };
  digits.forEach((d, i) => {
    current = current * 10 + Number(d);
    const q = Math.floor(current / divisor);
    if (!started && q === 0 && i < width - 1) return;
    started = true;
    quotient[i] = String(q);
    quotientStage[i] = stages.length;
    const product = q * divisor;
    const left = current - product;
    const next = i + 1 < width ? left * 10 + Number(digits[i + 1]) : left;
    stages.push({ product: place(product, i), after: place(next, i + 1 < width ? i + 1 : i) });
    current = left;
  });
  return {
    layout: { kind: "number", divisor: String(divisor), quotient, dividend: digits, stages, quotientStage },
    quotient: Math.floor(dividend / divisor),
    remainder: dividend % divisor,
  };
}

/**
 * The coefficients (constant first) of a polynomial the learner typed, read by evaluating it at
 * 0, 1, …, degree (Newton's divided differences). Null if it is not a polynomial of that degree or less.
 */
export function coefficientsOf(input: string, degree: number, v = "x"): number[] | null {
  const s = tryParse(input.replace(/^\s*=/, ""));
  if (!s || isRelation(s)) return null;
  const e = s.or[0].parts[0];
  const xs = Array.from({ length: degree + 2 }, (_, i) => i);
  const ys = xs.map((x) => evaluate(e, { [v]: x }));
  if (ys.some((y) => !Number.isFinite(y))) return null;
  // Solve the Vandermonde system for degree + 1 points, then check the extra point.
  const n = degree + 1;
  const A = xs.slice(0, n).map((x) => Array.from({ length: n }, (_, j) => x ** j));
  const b = ys.slice(0, n);
  for (let i = 0; i < n; i++) {
    const p = A.findIndex((r, k) => k >= i && Math.abs(r[i]) > 1e-12);
    [A[i], A[p]] = [A[p], A[i]];
    [b[i], b[p]] = [b[p], b[i]];
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const m = A[k][i] / A[i][i];
      for (let j = i; j < n; j++) A[k][j] -= m * A[i][j];
      b[k] -= m * b[i];
    }
  }
  const coeffs = b.map((v2, i) => v2 / A[i][i]).map((c) => (Math.abs(c - Math.round(c)) < 1e-9 ? Math.round(c) : c));
  const extra = xs[n];
  const check = coeffs.reduce((acc, c, j) => acc + c * extra ** j, 0);
  return Math.abs(check - ys[n]) < 1e-6 * Math.max(1, Math.abs(ys[n])) ? coeffs : null;
}
