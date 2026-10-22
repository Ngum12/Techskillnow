/**
 * Functions topic logic, pure and tested: mapping diagrams, function machines (chained and reversed),
 * line tests, graph transformations (point mapping and "describe fully" wording) and ranges.
 */
import { evaluate, parseExpr, type Expr } from "./expr";
import { realRoots } from "./equiv";

/* ---------- Mapping diagrams ---------- */

export type MappingKind = "oneToOne" | "manyToOne" | "oneToMany" | "manyToMany";

/** Arrows go from left element i to right element j. */
export function classifyMapping(arrows: [number, number][]): MappingKind {
  const outOf = new Map<number, Set<number>>();
  const into = new Map<number, Set<number>>();
  for (const [i, j] of arrows) {
    outOf.set(i, (outOf.get(i) ?? new Set()).add(j));
    into.set(j, (into.get(j) ?? new Set()).add(i));
  }
  const oneToMany = [...outOf.values()].some((s) => s.size > 1);
  const manyToOne = [...into.values()].some((s) => s.size > 1);
  return oneToMany && manyToOne ? "manyToMany" : oneToMany ? "oneToMany" : manyToOne ? "manyToOne" : "oneToOne";
}

/** A mapping is a function when every input has exactly one output. */
export const isFunctionMapping = (k: MappingKind) => k === "oneToOne" || k === "manyToOne";

/* ---------- Function machines ---------- */

export type Machine = { name: string; expr: string; inverse?: string };

/** Values after each machine, in order. `order` lists machine names in the order they act (for fg: ["g", "f"]). */
export function runChain(machines: Machine[], order: string[], input: number): number[] {
  const values: number[] = [];
  let v = input;
  for (const name of order) {
    const m = machines.find((x) => x.name === name);
    if (!m) throw new Error(`no machine ${name}`);
    v = evaluate(parseExpr(m.expr), { x: v });
    values.push(v);
  }
  return values;
}

/** Running backwards: each machine's inverse, last machine first. */
export function runBackwards(machines: Machine[], order: string[], output: number): number[] {
  const values: number[] = [];
  let v = output;
  for (const name of [...order].reverse()) {
    const m = machines.find((x) => x.name === name);
    if (!m?.inverse) throw new Error(`no inverse for ${name}`);
    v = evaluate(parseExpr(m.inverse), { x: v });
    values.push(v);
  }
  return values;
}

/** fg means "g first, then f": the order the machines act in. */
export const compositeOrder = (written: string) => [...written].reverse();

/* ---------- Line tests ---------- */

export type Curve = { expr: string } | { x: string; y: string; t: [number, number] };

/** How many times the vertical line x = c meets the curve (a function meets it at most once). */
export function verticalHits(curve: Curve, c: number, params: Record<string, number> = {}): number {
  if ("expr" in curve) return Number.isFinite(evaluate(parseExpr(curve.expr), { ...params, x: c })) ? 1 : 0;
  const X = parseExpr(curve.x);
  return realRoots((t) => evaluate(X, { ...params, t }) - c, curve.t[0], curve.t[1], (curve.t[1] - curve.t[0]) / 600).length;
}

/** How many times the horizontal line y = c meets the curve (one-to-one: at most once). */
export function horizontalHits(curve: Curve, c: number, range: [number, number], params: Record<string, number> = {}): number {
  if ("expr" in curve) {
    const e = parseExpr(curve.expr);
    return realRoots((x) => evaluate(e, { ...params, x }) - c, range[0], range[1], (range[1] - range[0]) / 800).length;
  }
  const Y = parseExpr(curve.y);
  return realRoots((t) => evaluate(Y, { ...params, t }) - c, curve.t[0], curve.t[1], (curve.t[1] - curve.t[0]) / 600).length;
}

/* ---------- Transformations ---------- */

/**
 * y = A·f(B·x + C) + D. The playground's sliders set these:
 * f(x) + a → D = a;  f(x + b) → C = b;  a·f(x) → A = a;  f(ax) → B = a;  −f(x) → A < 0;  f(−x) → B < 0.
 */
export type Transform = { A: number; B: number; C: number; D: number };
export const IDENTITY: Transform = { A: 1, B: 1, C: 0, D: 0 };

/** Where the point (x, y) of y = f(x) goes on the transformed graph. */
export function mapPoint(t: Transform, p: { x: number; y: number }): { x: number; y: number } {
  return { x: (p.x - t.C) / t.B, y: t.A * p.y + t.D };
}

export function transformedValue(t: Transform, f: (x: number) => number, x: number): number {
  return t.A * f(t.B * x + t.C) + t.D;
}

const frac = (v: number): string => {
  if (Number.isInteger(v)) return String(v);
  for (let d = 2; d <= 12; d++) if (Number.isInteger(Math.round(v * d)) && Math.abs(v * d - Math.round(v * d)) < 1e-9) return `${Math.round(v * d)}/${d}`;
  return String(Number(v.toFixed(3)));
};

/**
 * "Describe fully" in exam language, for a single transformation. Translations use a column vector,
 * stretches give the direction and scale factor, reflections name the axis.
 */
export function describeSingle(kind: "up" | "inside" | "stretchY" | "stretchX" | "reflectX" | "reflectY", a = 0): string {
  switch (kind) {
    case "up":
      return `Translation by the vector (0, ${frac(a)})`;
    case "inside":
      return `Translation by the vector (${frac(-a)}, 0)`;
    case "stretchY":
      return `Stretch parallel to the y-axis, scale factor ${frac(a)}`;
    case "stretchX":
      return `Stretch parallel to the x-axis, scale factor ${frac(1 / a)}`;
    case "reflectX":
      return "Reflection in the x-axis";
    case "reflectY":
      return "Reflection in the y-axis";
  }
}

/** y = f(x) written with the transformation applied, e.g. "2f(x + 1) − 3", for the playground caption. */
export function transformLabel(t: Transform): string {
  const inner = (() => {
    const b = t.B === 1 ? "x" : t.B === -1 ? "-x" : `${frac(t.B)}x`;
    return t.C === 0 ? b : `${b} ${t.C < 0 ? "-" : "+"} ${frac(Math.abs(t.C))}`;
  })();
  const a = t.A === 1 ? "" : t.A === -1 ? "-" : frac(t.A);
  return `${a}f(${inner})${t.D === 0 ? "" : ` ${t.D < 0 ? "-" : "+"} ${frac(Math.abs(t.D))}`}`;
}

/* ---------- Ranges ---------- */

/** Smallest and largest value of f on [lo, hi] (numerically, endpoints included). */
export function rangeOn(f: Expr | string, lo: number, hi: number, params: Record<string, number> = {}): [number, number] {
  const e = typeof f === "string" ? parseExpr(f) : f;
  let min = Infinity;
  let max = -Infinity;
  const n = 2000;
  for (let k = 0; k <= n; k++) {
    const x = lo + ((hi - lo) * k) / n;
    const y = evaluate(e, { ...params, x });
    if (!Number.isFinite(y)) continue;
    if (y < min) min = y;
    if (y > max) max = y;
  }
  const snap = (v: number) => (Math.abs(v - Math.round(v)) < 1e-6 ? Math.round(v) : v);
  return [snap(min), snap(max)];
}
