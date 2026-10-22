/** Exact rational numbers for generators (no floating-point surprises in model answers). */

const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

export class Frac {
  readonly n: number;
  readonly d: number;
  constructor(n: number, d = 1) {
    if (d === 0) throw new Error("division by zero");
    if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error(`Frac needs integers: ${n}/${d}`);
    const g = gcd(n, d);
    const s = d < 0 ? -1 : 1;
    this.n = (s * n) / g || 0;
    this.d = (s * d) / g;
  }
  static of(v: number | Frac): Frac {
    return v instanceof Frac ? v : new Frac(v);
  }
  add(o: number | Frac) {
    const b = Frac.of(o);
    return new Frac(this.n * b.d + b.n * this.d, this.d * b.d);
  }
  sub(o: number | Frac) {
    const b = Frac.of(o);
    return new Frac(this.n * b.d - b.n * this.d, this.d * b.d);
  }
  mul(o: number | Frac) {
    const b = Frac.of(o);
    return new Frac(this.n * b.n, this.d * b.d);
  }
  div(o: number | Frac) {
    const b = Frac.of(o);
    return new Frac(this.n * b.d, this.d * b.n);
  }
  neg() {
    return new Frac(-this.n, this.d);
  }
  isZero() {
    return this.n === 0;
  }
  isInt() {
    return this.d === 1;
  }
  eq(o: number | Frac) {
    const b = Frac.of(o);
    return this.n === b.n && this.d === b.d;
  }
  value() {
    return this.n / this.d;
  }
  /** Linear syntax, e.g. "-3/4" (accepted by the expression parser). */
  toString() {
    return this.d === 1 ? String(this.n) : `${this.n}/${this.d}`;
  }
  toLatex() {
    if (this.d === 1) return String(this.n);
    return `${this.n < 0 ? "-" : ""}\\frac{${Math.abs(this.n)}}{${this.d}}`;
  }
}
