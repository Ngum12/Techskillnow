/**
 * Mathematical equivalence, checked numerically at many points (fast and dependable for school algebra).
 * - Expressions: equal wherever both are defined.
 * - Equations: same solution set (a valid step multiplies f(x) = 0 by a non-zero constant, or factorises it).
 * - Inequalities and solution sets: true for exactly the same values of the variable.
 */
import { evaluate, holds, constants, statementVariables, tryParse, variables, type Chain, type Env, type Expr, type Statement } from "./expr";

/** Awkward, non-integer sample values so that different expressions almost never agree by chance. */
const SAMPLES = [-2.718, -1.371, -0.537, 0.293, 0.831, 1.613, 2.471, 3.137, -3.29, 4.071, 1.071, -1.913, 0.447, -0.889, 5.23, -4.41];

function envs(vars: string[]): Env[] {
  return SAMPLES.map((_, i) => Object.fromEntries(vars.map((v, j) => [v, SAMPLES[(i + j * 5) % SAMPLES.length] + j * 0.173])));
}

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));

/** True if two expressions agree wherever both are defined (at least 6 test points). */
/** Extra points used when too few of the usual ones are in the domain (e.g. √(x − 7)). */
const WIDE = [6.17, 7.33, 8.91, 10.47, 12.29, 15.83, 19.11, 27.3, -6.29, -8.73, -11.9, -17.3];

export function exprEquivalent(a: Expr, b: Expr): boolean {
  const vars = [...variables(a, variables(b))];
  let ok = 0;
  const wide = WIDE.map((v, i) => Object.fromEntries(vars.map((n, j) => [n, WIDE[(i + j * 5) % WIDE.length] + j * 0.173 + (v - v)])));
  for (const env of [...envs(vars), ...wide]) {
    const x = evaluate(a, env);
    const y = evaluate(b, env);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (!close(x, y)) return false;
    ok++;
  }
  return ok >= 6;
}

/** f(x) for an equation L = R, as L − R. */
export const sideDiff = (c: Chain): Expr => ({ t: "bin", op: "-", a: c.parts[0], b: c.parts[1] });

export const isSingleEquation = (s: Statement) => s.or.length === 1 && s.or[0].ops.length === 1 && s.or[0].ops[0] === "=";
export const isEquationList = (s: Statement) => s.or.every((c) => c.ops.length === 1 && c.ops[0] === "=");

/** g(x) = k · f(x) for a constant k ≠ 0? */
export function constantMultiple(f: Expr, g: Expr): boolean {
  const vars = [...variables(f, variables(g))];
  let ratio: number | null = null;
  let n = 0;
  for (const env of envs(vars)) {
    const a = evaluate(f, env);
    const b = evaluate(g, env);
    if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a) < 1e-9) continue;
    const r = b / a;
    if (Math.abs(r) < 1e-12) return false;
    if (ratio === null) ratio = r;
    else if (!close(r, ratio)) return false;
    n++;
  }
  return n >= 6;
}

/**
 * Is `next` a valid step from the equation `start`? Accepts rearranging, multiplying or dividing by a
 * non-zero number, expanding, factorising, and splitting a product into "A = 0 or B = 0". Rejects steps
 * that lose or gain solutions (e.g. dividing both sides by x − 1).
 */
export function equationStepValid(start: Statement, next: Statement): boolean {
  if (!isSingleEquation(start) || !isEquationList(next)) return false;
  const f = sideDiff(start.or[0]);
  // "A = 0 or B = 0 or …" (or a single equation): the product of the parts must have the same real roots as f.
  const product = next.or.map(sideDiff).reduce((p, g): Expr => ({ t: "bin", op: "*", a: p, b: g }));
  if (constantMultiple(f, product)) return true;
  // Allow leaving out a factor with no real roots, e.g. x² + 1.
  const v = [...statementVariables(start)][0] ?? "x";
  let sign = 0;
  for (let x = -40.037; x <= 40; x += 0.231) {
    const q = evaluate(f, { [v]: x }) / evaluate(product, { [v]: x });
    if (!Number.isFinite(q) || Math.abs(q) < 1e-9) continue;
    const s = Math.sign(q);
    if (sign && s !== sign) return false;
    sign = s;
  }
  return sign !== 0 && sameRoots(f, product, v);
}

/** Real roots of a function on [lo, hi] (sign changes refined by bisection, plus touching zeros). */
export function realRoots(fn: (x: number) => number, lo = -60, hi = 60, step = 0.05): number[] {
  const roots: number[] = [];
  let x0 = lo;
  let y0 = fn(x0);
  for (let x1 = lo + step; x1 <= hi + 1e-9; x1 += step) {
    const y1 = fn(x1);
    if (Number.isFinite(y0) && Number.isFinite(y1)) {
      if (y0 === 0) roots.push(x0);
      else if (y0 * y1 < 0) {
        let a = x0;
        let b = x1;
        for (let k = 0; k < 60; k++) {
          const m = (a + b) / 2;
          const ym = fn(m);
          if (Math.sign(ym) === Math.sign(fn(a))) a = m;
          else b = m;
        }
        roots.push((a + b) / 2);
      }
    }
    x0 = x1;
    y0 = y1;
  }
  // Touching roots (double roots) where the curve does not cross: check simple rationals.
  for (let d = 1; d <= 6; d++)
    for (let n = lo * d; n <= hi * d; n++) {
      const x = n / d;
      if (Math.abs(fn(x)) < 1e-9 && !roots.some((r) => Math.abs(r - x) < 1e-6)) roots.push(x);
    }
  // Snap to simple fractions (0, ½, −⅔ …) so exact boundaries are tested exactly.
  const snap = (r: number) => {
    for (let d = 1; d <= 12; d++) {
      const n = Math.round(r * d);
      if (Math.abs(r - n / d) < 1e-9) return n / d;
    }
    return r;
  };
  return roots
    .map(snap)
    .sort((a, b) => a - b)
    .filter((r, i, all) => i === 0 || Math.abs(r - all[i - 1]) > 1e-6);
}

function sameRoots(f: Expr, g: Expr, v: string): boolean {
  const a = realRoots((x) => evaluate(f, { [v]: x }));
  const b = realRoots((x) => evaluate(g, { [v]: x }));
  return a.length === b.length && a.every((r, i) => Math.abs(r - b[i]) < 1e-6);
}

/** Do two written lines say the same thing (expressions, equations or inequalities)? */
export function sameLine(expected: string, input: string): boolean {
  const a = tryParse(expected.replace(/^\s*=/, ""));
  const b = tryParse(input.replace(/^\s*=/, ""));
  if (!a || !b) return false;
  const rel = (s: Statement) => s.or.length > 1 || s.or[0].ops.length > 0;
  if (!rel(a) && !rel(b)) return exprEquivalent(a.or[0].parts[0], b.or[0].parts[0]);
  if (isSingleEquation(a)) return equationStepValid(a, b);
  return sameSolutionSet(a, b);
}

/** A simple LaTeX cell from a layout ("-2x^{2}", "+6", "\frac{1}{2}x") in the keypad's linear syntax. */
export function latexToLinear(s: string): string {
  return s
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1/$2)")
    .replace(/[{}]/g, "")
    .replace(/^\+/, "");
}

/** Points worth testing a relation at: a fine grid, every number written, and every boundary. */
function testPoints(stmts: Statement[], v: string): number[] {
  const pts = new Set<number>();
  for (let x = -30.0137; x <= 30; x += 0.0731) pts.add(x);
  for (const s of stmts)
    for (const c of s.or) {
      c.parts.forEach((p) => constants(p).forEach((k) => [k, -k, k + 1e-5, k - 1e-5].forEach((x) => pts.add(x))));
      for (let i = 0; i < c.ops.length; i++) {
        const d: Expr = { t: "bin", op: "-", a: c.parts[i], b: c.parts[i + 1] };
        for (const r of realRoots((x) => evaluate(d, { [v]: x }), -30, 30, 0.025)) [r, r + 1e-5, r - 1e-5].forEach((x) => pts.add(x));
      }
    }
  return [...pts];
}

/** True if two statements (inequalities, solution lists, equations) hold for exactly the same values. */
export function sameSolutionSet(a: Statement, b: Statement): boolean {
  const vars = new Set([...statementVariables(a), ...statementVariables(b)]);
  if (vars.size > 1) return false;
  const v = [...vars][0] ?? "x";
  const truth = (s: Statement, x: number) => s.or.some((c) => holds(c, { [v]: x }, 1e-9));
  return testPoints([a, b], v).every((x) => truth(a, x) === truth(b, x));
}
