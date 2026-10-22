/** Polynomials in one variable with exact rational coefficients: arithmetic, long division, display. */
import { Frac } from "./frac";

export class Poly {
  /** Coefficients, index = power (c[0] is the constant term). No trailing zeros. */
  readonly c: Frac[];
  constructor(coeffs: (number | Frac)[]) {
    const c = coeffs.map(Frac.of);
    while (c.length > 1 && c[c.length - 1].isZero()) c.pop();
    this.c = c.length ? c : [new Frac(0)];
  }
  /** From coefficients written highest power first, as on paper: P(2, -3, 1) = 2x² − 3x + 1. */
  static of(...highToLow: (number | Frac)[]): Poly {
    return new Poly([...highToLow].reverse());
  }
  /** (x − r₁)(x − r₂)… times k. */
  static fromRoots(roots: (number | Frac)[], k: number | Frac = 1): Poly {
    return roots.reduce<Poly>((p, r) => p.mul(Poly.of(1, Frac.of(r).neg())), new Poly([k]));
  }
  /** a·x^n */
  static mono(a: number | Frac, n: number): Poly {
    return new Poly([...Array(n).fill(0), a]);
  }
  get degree() {
    return this.c.length === 1 && this.c[0].isZero() ? -Infinity : this.c.length - 1;
  }
  get leading() {
    return this.c[this.c.length - 1];
  }
  coef(n: number): Frac {
    return this.c[n] ?? new Frac(0);
  }
  isZero() {
    return this.degree === -Infinity;
  }
  add(o: Poly) {
    const n = Math.max(this.c.length, o.c.length);
    return new Poly(Array.from({ length: n }, (_, i) => this.coef(i).add(o.coef(i))));
  }
  sub(o: Poly) {
    return this.add(o.scale(-1));
  }
  scale(k: number | Frac) {
    return new Poly(this.c.map((x) => x.mul(k)));
  }
  mul(o: Poly) {
    const out = Array.from({ length: this.c.length + o.c.length - 1 }, () => new Frac(0));
    this.c.forEach((a, i) => o.c.forEach((b, j) => (out[i + j] = out[i + j].add(a.mul(b)))));
    return new Poly(out);
  }
  pow(n: number) {
    let r = new Poly([1]);
    for (let i = 0; i < n; i++) r = r.mul(this);
    return r;
  }
  at(x: number | Frac): Frac {
    return this.c.reduceRight<Frac>((acc, a) => acc.mul(x).add(a), new Frac(0));
  }
  eq(o: Poly) {
    return this.c.length === o.c.length && this.c.every((a, i) => a.eq(o.c[i]));
  }

  /**
   * Long division, keeping every line the learner writes: at each stage the next quotient term,
   * the product to subtract, and what is left after subtracting.
   */
  divide(divisor: Poly): { quotient: Poly; remainder: Poly; steps: DivisionStep[] } {
    if (divisor.isZero()) throw new Error("divide by zero polynomial");
    let rem: Poly = this;
    let quotient = new Poly([0]);
    const steps: DivisionStep[] = [];
    while (!rem.isZero() && rem.degree >= divisor.degree) {
      const power = rem.degree - divisor.degree;
      const coef = rem.leading.div(divisor.leading);
      const term = Poly.mono(coef, power);
      const product = divisor.mul(term);
      const before = rem;
      rem = rem.sub(product);
      quotient = quotient.add(term);
      steps.push({ term, product, before, after: rem });
    }
    return { quotient, remainder: rem, steps };
  }

  /** Terms highest power first, skipping zeros. */
  terms(): { coef: Frac; power: number }[] {
    const out: { coef: Frac; power: number }[] = [];
    for (let i = this.c.length - 1; i >= 0; i--) if (!this.c[i].isZero()) out.push({ coef: this.c[i], power: i });
    return out;
  }

  /** Linear syntax for the parser, e.g. "2x^3 - x + (1/2)". */
  toString(v = "x"): string {
    const t = this.terms();
    if (!t.length) return "0";
    return t
      .map(({ coef, power }, i) => {
        const neg = coef.n < 0;
        const a = neg ? coef.neg() : coef;
        const num = a.isInt() ? String(a.n) : `(${a.n}/${a.d})`;
        const body = power === 0 ? num : `${a.eq(1) ? "" : num}${v}${power > 1 ? `^${power}` : ""}`;
        return i === 0 ? `${neg ? "-" : ""}${body}` : ` ${neg ? "-" : "+"} ${body}`;
      })
      .join("");
  }

  toLatex(v = "x"): string {
    const t = this.terms();
    if (!t.length) return "0";
    return t
      .map(({ coef, power }, i) => {
        const neg = coef.n < 0;
        const a = neg ? coef.neg() : coef;
        const num = a.isInt() ? String(a.n) : `\\frac{${a.n}}{${a.d}}`;
        const body = power === 0 ? num : `${a.eq(1) ? "" : num}${v}${power > 1 ? `^{${power}}` : ""}`;
        return i === 0 ? `${neg ? "-" : ""}${body}` : ` ${neg ? "-" : "+"} ${body}`;
      })
      .join("");
  }
}

export type DivisionStep = { term: Poly; product: Poly; before: Poly; after: Poly };

/** "(x − 2)", "(x + 3)", "(2x − 1)" for a linear factor ax + b. */
export function linearLatex(a: number, b: number, v = "x"): string {
  return `(${a === 1 ? "" : a === -1 ? "-" : a}${v} ${b < 0 ? "-" : "+"} ${Math.abs(b)})`;
}

/** The same factor in linear syntax: "(2x - 1)". */
export function linearString(a: number, b: number, v = "x"): string {
  return `(${a === 1 ? "" : a === -1 ? "-" : a}${v} ${b < 0 ? "-" : "+"} ${Math.abs(b)})`;
}
