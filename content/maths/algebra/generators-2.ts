/**
 * Algebra question generators for lessons 5–12: factor theorem, cubics, partial fractions,
 * inequalities (linear, quadratic, rational) and modulus. Same rules as ./generators.ts: fresh numbers
 * each time, every line of working, answers to check, and known wrong answers for common errors.
 */
import { Frac } from "@/lib/maths/frac";
import { Poly, linearLatex } from "@/lib/maths/poly";
import { coefficientsOf, evaluatedTermsLatex, signed, substitutionLatex } from "@/lib/maths/build";
import { near } from "@/lib/maths/exam";
import { checkAnswer } from "@/lib/maths/answer";
import { sameSolutionSet } from "@/lib/maths/equiv";
import { constants, tryParse } from "@/lib/maths/expr";
import type { Rng } from "@/lib/maths/rng";
import type { ExamGenerator, Generator, Sign, SignDiagram } from "@/lib/maths/types";

const F = (n: number, d = 1) => new Frac(n, d);
const tex = (p: Poly) => p.toLatex();
const str = (p: Poly) => p.toString();
/** (x − r) in LaTeX and linear syntax. */
const fx = (r: number) => linearLatex(1, -r);
const fs = (r: number) => `(x ${r < 0 ? "+" : "-"} ${Math.abs(r)})`;
const L = (f: Frac) => f.toLatex();
const S = (f: Frac) => f.toString();

/** Integer roots for a monic cubic, all different and never 0 (so trial values are interesting). */
function cubicRoots(r: Rng): number[] {
  return r.distinct(3, -5, 5, [0]);
}

/** f(a) written out and evaluated, for factor-theorem working. */
function trialLines(f: Poly, a: number) {
  const v = f.at(a);
  return [
    { latex: `f(${a}) = ${substitutionLatex(f, a)}`, note: `Try $x = ${a}$.` },
    { latex: `= ${evaluatedTermsLatex(f, a)} = ${v.toLatex()}`, note: v.isZero() ? `$f(${a}) = 0$, so $${fx(a)}$ is a factor.` : `$f(${a}) \\ne 0$, so $${fx(a)}$ is not a factor.` },
  ];
}

/* ======================================================================
 * Lesson 5: the factor theorem
 * ====================================================================== */

const factorTest: Generator = {
  id: "alg.factor.test",
  skill: "alg.factor",
  generate: (r) => {
    const roots = cubicRoots(r);
    const f = Poly.fromRoots(roots);
    const isFactor = r.next() < 0.5;
    const a = isFactor ? r.pick(roots) : r.pick([-4, -3, -2, -1, 1, 2, 3, 4].filter((x) => !roots.includes(x)));
    const v = f.at(a);
    return {
      prompt: `Use the factor theorem to decide whether $${fx(a)}$ is a factor of $f(x) = ${tex(f)}$.`,
      answers: [
        { label: `f(${a})`, spec: { kind: "number", value: v.toString() } },
        { label: `Is ${fx(a).replace(/[()]/g, "")} a factor?`, spec: { kind: "choice", options: ["Yes", "No"], answer: isFactor ? 0 : 1 } },
      ],
      bugs: f.at(-a).eq(v) ? [] : [{ misconception: "factorSign", answer: 0, value: f.at(-a).toString() }],
      solution: [
        { latex: `${fx(a).replace(/[()]/g, "")} = 0 \\Rightarrow x = ${a}`, note: "Find the x that makes the factor zero.", mark: "M1" },
        ...trialLines(f, a),
        { latex: isFactor ? `\\text{So } ${fx(a)} \\text{ is a factor.}` : `\\text{So } ${fx(a)} \\text{ is not a factor.}`, mark: "A1" },
      ],
    };
  },
};

const factorFind: Generator = {
  id: "alg.factor.find",
  skill: "alg.factor",
  generate: (r) => {
    const roots = [r.pick([1, -1, 2, -2]), ...r.distinct(2, -5, 5, [0])];
    const uniq = [...new Set(roots)];
    while (uniq.length < 3) uniq.push(uniq[uniq.length - 1] + 7);
    const f = Poly.fromRoots(uniq);
    const tries = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5];
    const lines = [];
    for (const a of tries) {
      lines.push(...trialLines(f, a));
      if (f.at(a).isZero()) break;
    }
    const hit = tries.find((a) => f.at(a).isZero())!;
    return {
      prompt: `Find a linear factor of $f(x) = ${tex(f)}$ by testing small values of $x$.`,
      answers: [{ label: "A factor", spec: { kind: "factorOf", value: str(f) } }],
      solution: [
        { latex: `\\text{Try factors of the constant term } ${f.coef(0).toLatex()}: \\pm 1, \\pm 2, \\pm 3, \\dots`, note: "A root must divide the constant term (when the leading coefficient is 1)." },
        ...lines,
        { latex: `${fx(hit)} \\text{ is a factor.}`, value: fs(hit) },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 6: factorising cubics, solving cubic equations
 * ====================================================================== */

/** A cubic with three integer roots, sometimes with leading coefficient 2 and a root of ½ or −½. */
function niceCubic(r: Rng) {
  if (r.next() < 0.3) {
    const half = r.pick([1, -1]);
    const [p, q] = r.distinct(2, -4, 4, [0]);
    const f = Poly.of(2, -half).mul(Poly.fromRoots([p, q]));
    const factors = `(2x ${half > 0 ? "-" : "+"} 1)${fs(p)}${fs(q)}`;
    return { f, roots: [F(half, 2), F(p), F(q)], factors, first: p, rest: Poly.of(2, -half).mul(Poly.fromRoots([q])) };
  }
  const roots = cubicRoots(r);
  const [p, q, s] = roots;
  return { f: Poly.fromRoots(roots), roots: roots.map((x) => F(x)), factors: `${fs(p)}${fs(q)}${fs(s)}`, first: p, rest: Poly.fromRoots([q, s]) };
}

const cubicFactorise: Generator = {
  id: "alg.cubic.factorise",
  skill: "alg.cubic",
  generate: (r) => {
    const c = niceCubic(r);
    const quad = c.f.divide(Poly.of(1, -c.first)).quotient;
    return {
      prompt: `Factorise $f(x) = ${tex(c.f)}$ completely.`,
      work: { mode: "expr", start: str(c.f) },
      answers: [{ spec: { kind: "expr", value: c.factors, form: "factorised" } }],
      solution: [
        { latex: `f(${c.first}) = ${evaluatedTermsLatex(c.f, c.first)} = 0`, note: `Trial: $f(${c.first}) = 0$, so $${fx(c.first)}$ is a factor.`, mark: "M1" },
        { latex: `f(x) = ${fx(c.first)}(${tex(quad)})`, note: "Divide f(x) by this factor (long division or comparing coefficients).", value: `${fs(c.first)}(${str(quad)})`, mark: "M1" },
        { latex: `= ${c.factors.replace(/\)\(/g, ")(")}`, note: "Factorise the quadratic.", value: c.factors, mark: "A1" },
      ],
    };
  },
};

const cubicSolve: Generator = {
  id: "alg.cubic.solve",
  skill: "alg.cubic",
  generate: (r) => {
    const c = niceCubic(r);
    const quad = c.f.divide(Poly.of(1, -c.first)).quotient;
    return {
      prompt: `Solve the equation $${tex(c.f)} = 0$.`,
      work: { mode: "equation", start: `${str(c.f)} = 0` },
      answers: [{ spec: { kind: "solutions", values: c.roots.map(S) } }],
      solution: [
        { latex: `f(${c.first}) = 0 \\Rightarrow ${fx(c.first)} \\text{ is a factor}`, mark: "M1" },
        { latex: `${fx(c.first)}(${tex(quad)}) = 0`, value: `${fs(c.first)}(${str(quad)}) = 0`, mark: "M1" },
        { latex: `${c.factors} = 0`, value: `${c.factors} = 0` },
        { latex: `x = ${c.roots.map(L).join(", \\; x = ")}`, value: c.roots.map((x) => `x = ${S(x)}`).join(" or "), mark: "A1" },
      ],
    };
  },
};

/* ======================================================================
 * Lessons 7–8: partial fractions
 * ====================================================================== */

/** "3/(x - 2)", sign-safe, for a constant over a factor string. */
const over = (k: Frac, factor: string) => `(${S(k)})/${factor}`;
const overTex = (k: Frac, factorTex: string, first = false) => {
  const neg = k.n < 0;
  const body = `\\frac{${L(neg ? k.neg() : k)}}{${factorTex}}`;
  return first ? `${neg ? "-" : ""}${body}` : `${neg ? "-" : "+"} ${body}`;
};

const pfDistinct: Generator = {
  id: "alg.pf.distinct",
  skill: "alg.pf",
  generate: (r) => {
    const [a, b] = r.distinct(2, -4, 4);
    const [A, B] = [F(r.nz(-5, 5)), F(r.nz(-5, 5))];
    // N(x) = A(x − b) + B(x − a)
    const N = Poly.of(1, -b).scale(A).add(Poly.of(1, -a).scale(B));
    if (N.degree < 0 || N.isZero()) return pfDistinct.generate(r);
    const D = `${fs(a)}${fs(b)}`;
    const Dtex = `${fx(a)}${fx(b)}`;
    const answer = `${over(A, fs(a))} + ${over(B, fs(b))}`;
    return {
      prompt: `Express $\\dfrac{${tex(N)}}{${Dtex}}$ in partial fractions.`,
      work: { mode: "expr", start: `(${str(N)})/(${D})` },
      answers: [{ spec: { kind: "expr", value: answer, form: "partial" } }],
      bugs: [{ misconception: "pfSwap", value: `${over(B, fs(a))} + ${over(A, fs(b))}` }],
      solution: [
        { latex: `\\frac{${tex(N)}}{${Dtex}} \\equiv \\frac{A}{${fx(a)}} + \\frac{B}{${fx(b)}}`, note: "One fraction for each linear factor, with a number on top.", mark: "B1" },
        { latex: `${tex(N)} \\equiv A${fx(b)} + B${fx(a)}`, note: "Multiply both sides by the denominator." },
        { latex: `x = ${a}: \\; ${N.at(a).toLatex()} = A(${a - b}) \\Rightarrow A = ${L(A)}`, note: `Put $x = ${a}$ so the B term disappears (the cover-up method).`, mark: "M1" },
        { latex: `x = ${b}: \\; ${N.at(b).toLatex()} = B(${b - a}) \\Rightarrow B = ${L(B)}`, note: `Put $x = ${b}$ so the A term disappears.`, mark: "A1" },
        { latex: `= ${overTex(A, fx(a), true)} ${overTex(B, fx(b))}`, value: answer, mark: "A1" },
      ],
    };
  },
};

const pfRepeated: Generator = {
  id: "alg.pf.repeated",
  skill: "alg.pf2",
  generate: (r) => {
    const [a, b] = r.distinct(2, -3, 3);
    const [A, B, C] = [F(r.nz(-4, 4)), F(r.nz(-4, 4)), F(r.nz(-5, 5))];
    // N = A(x − b)² + B(x − a)(x − b) + C(x − a)
    const N = Poly.fromRoots([b, b]).scale(A).add(Poly.fromRoots([a, b]).scale(B)).add(Poly.of(1, -a).scale(C));
    const Dtex = `${fx(a)}${fx(b)}^2`;
    const answer = `${over(A, fs(a))} + ${over(B, fs(b))} + ${over(C, `${fs(b)}^2`)}`;
    return {
      prompt: `Express $\\dfrac{${tex(N)}}{${Dtex}}$ in partial fractions.`,
      work: { mode: "expr", start: `(${str(N)})/(${fs(a)}${fs(b)}^2)` },
      answers: [{ spec: { kind: "expr", value: answer, form: "partial" } }],
      bugs: [{ misconception: "pfRepeatedForm", value: `${over(A, fs(a))} + ${over(C, `${fs(b)}^2`)}` }],
      solution: [
        { latex: `\\equiv \\frac{A}{${fx(a)}} + \\frac{B}{${fx(b)}} + \\frac{C}{${fx(b)}^2}`, note: "A repeated factor needs TWO fractions: one over the factor, one over its square.", mark: "B1" },
        { latex: `${tex(N)} \\equiv A${fx(b)}^2 + B${fx(a)}${fx(b)} + C${fx(a)}`, note: "Multiply both sides by the denominator." },
        { latex: `x = ${a}: \\; ${N.at(a).toLatex()} = ${(a - b) ** 2}A \\Rightarrow A = ${L(A)}`, mark: "M1" },
        { latex: `x = ${b}: \\; ${N.at(b).toLatex()} = ${b - a}C \\Rightarrow C = ${L(C)}`, mark: "A1" },
        { latex: `x^2: \\; ${N.coef(2).toLatex()} = A + B \\Rightarrow B = ${L(B)}`, note: "No x value removes B: compare the coefficients of $x^2$ instead.", mark: "A1" },
        { latex: `= ${overTex(A, fx(a), true)} ${overTex(B, fx(b))} ${overTex(C, `${fx(b)}^2`)}`, value: answer },
      ],
    };
  },
};

const pfImproper: Generator = {
  id: "alg.pf.improper",
  skill: "alg.pf2",
  generate: (r) => {
    const [a, b] = r.distinct(2, -4, 4);
    const k = r.pick([1, 2, 3]);
    const [A, B] = [F(r.nz(-5, 5)), F(r.nz(-5, 5))];
    const rem = Poly.of(1, -b).scale(A).add(Poly.of(1, -a).scale(B));
    const N = Poly.fromRoots([a, b]).scale(k).add(rem);
    const Dtex = `${fx(a)}${fx(b)}`;
    const Dexp = Poly.fromRoots([a, b]);
    const answer = `${k} + ${over(A, fs(a))} + ${over(B, fs(b))}`;
    return {
      prompt: `Express $\\dfrac{${tex(N)}}{${Dtex}}$ in partial fractions.`,
      work: { mode: "expr", start: `(${str(N)})/(${fs(a)}${fs(b)})` },
      answers: [{ spec: { kind: "expr", value: answer, form: "partial" } }],
      bugs: [{ misconception: "improperNoDivide", value: `${over(A, fs(a))} + ${over(B, fs(b))}` }],
      solution: [
        { latex: `\\text{Top degree } 2 = \\text{bottom degree } 2: \\text{ improper, so divide first.}`, note: "The denominator expands to $" + tex(Dexp) + "$." },
        { latex: `\\frac{${tex(N)}}{${tex(Dexp)}} = ${k} + \\frac{${tex(rem)}}{${Dtex}}`, note: `Divide: the quotient is ${k}, the remainder is $${tex(rem)}$.`, value: `${k} + (${str(rem)})/(${fs(a)}${fs(b)})`, mark: "M1" },
        { latex: `\\frac{${tex(rem)}}{${Dtex}} \\equiv \\frac{A}{${fx(a)}} + \\frac{B}{${fx(b)}}, \\; A = ${L(A)}, \\; B = ${L(B)}`, note: "Now split the proper fraction with the cover-up method.", mark: "A1" },
        { latex: `= ${k} ${overTex(A, fx(a))} ${overTex(B, fx(b))}`, value: answer, mark: "A1" },
      ],
    };
  },
};

/* ======================================================================
 * Lessons 9–10: inequalities
 * ====================================================================== */

type Op = "<" | ">" | "<=" | ">=";
const OPTEX: Record<Op, string> = { "<": "<", ">": ">", "<=": "\\le", ">=": "\\ge" };
const FLIP: Record<Op, Op> = { "<": ">", ">": "<", "<=": ">=", ">=": "<=" };
const strict = (op: Op) => op === "<" || op === ">";

/** "p < x < q" (inside) or "x < p or x > q" (outside), with ≤/≥ when the ends are included. */
function region(p: Frac, q: Frac, inside: boolean, inclP: boolean, inclQ: boolean) {
  const lo = inclP ? "<=" : "<";
  const hi = inclQ ? "<=" : "<";
  if (inside) return { s: `${S(p)} ${lo} x ${hi} ${S(q)}`, t: `${L(p)} ${OPTEX[lo]} x ${OPTEX[hi]} ${L(q)}` };
  return {
    s: `x ${inclP ? "<=" : "<"} ${S(p)} or x ${inclQ ? ">=" : ">"} ${S(q)}`,
    t: `x ${inclP ? "\\le" : "<"} ${L(p)} \\;\\text{ or }\\; x ${inclQ ? "\\ge" : ">"} ${L(q)}`,
  };
}

/** Sign of a linear factor (x − root) times `lead` on interval i of the sorted critical values. */
function linSigns(root: Frac, lead: number, crit: Frac[]): Sign[] {
  return Array.from({ length: crit.length + 1 }, (_, i) => {
    const x = i === 0 ? crit[0].value() - 1 : i === crit.length ? crit[crit.length - 1].value() + 1 : (crit[i - 1].value() + crit[i].value()) / 2;
    return (x - root.value()) * lead > 0 ? "+" : "-";
  });
}
const times = (a: Sign[], b: Sign[]): Sign[] => a.map((s, i) => (s === b[i] ? "+" : "-"));

const ineqLinear: Generator = {
  id: "alg.ineq.linear",
  skill: "alg.ineq",
  generate: (r) => {
    let a = r.nz(-6, 6);
    const c = r.nz(-6, 6);
    if (a === c) a = c + r.pick([-2, 3]);
    if (a === 0) a = -3;
    const [b, d] = [r.int(-9, 9), r.int(-9, 9)];
    const op = r.pick(["<", ">", "<=", ">="] as Op[]);
    const k = a - c;
    const rhs = F(d - b, k);
    const finalOp = k < 0 ? FLIP[op] : op;
    const final = `x ${finalOp} ${S(rhs)}`;
    const left = `${a}x ${signed(b)}`.replace(/^1x/, "x").replace(/^-1x/, "-x");
    const right = `${c}x ${signed(d)}`.replace(/^1x/, "x").replace(/^-1x/, "-x");
    return {
      prompt: `Solve the inequality $${left} ${OPTEX[op]} ${right}$.`,
      work: { mode: "relation", start: `${a}x + ${b} ${op} ${c}x + ${d}` },
      answers: [{ spec: { kind: "relation", value: final } }],
      solution: [
        { latex: `${k}x ${OPTEX[op]} ${d - b}`, note: "Collect the x terms on one side and the numbers on the other.", value: `${k}x ${op} ${d - b}` },
        k < 0
          ? { latex: `x ${OPTEX[finalOp]} ${L(rhs)}`, note: `Divide by $${k}$. It is NEGATIVE, so reverse the inequality sign.`, value: final }
          : { latex: `x ${OPTEX[finalOp]} ${L(rhs)}`, note: `Divide by $${k}$ (positive, so the sign stays).`, value: final },
      ],
    };
  },
};

const ineqQuad: Generator = {
  id: "alg.ineq.quad",
  skill: "alg.ineq",
  generate: (r) => {
    const [p, q] = r.distinct(2, -6, 6).sort((x, y) => x - y);
    const op = r.pick(["<", ">", "<=", ">="] as Op[]);
    const f = Poly.fromRoots([p, q]);
    const inside = op === "<" || op === "<=";
    const incl = !strict(op);
    const ans = region(F(p), F(q), inside, incl, incl);
    const wrong = region(F(p), F(q), !inside, incl, incl);
    return {
      prompt: `Solve the inequality $${tex(f)} ${OPTEX[op]} 0$.`,
      work: { mode: "relation", start: `${str(f)} ${op} 0` },
      answers: [{ spec: { kind: "relation", value: ans.s } }],
      bugs: [{ misconception: "quadRegion", value: wrong.s }],
      solution: [
        { latex: `${fx(p)}${fx(q)} ${OPTEX[op]} 0`, note: "Factorise.", value: `${fs(p)}${fs(q)} ${op} 0` },
        { latex: `\\text{Critical values: } x = ${p}, \\; x = ${q}`, note: "Where the curve meets the x-axis.", mark: "M1" },
        { latex: `\\text{The curve } y = ${tex(f)} \\text{ is U-shaped: ${inside ? "below" : "above"} the axis ${inside ? "between" : "outside"} the roots}`, note: "Sketch it: the region you want is where the curve is " + (inside ? "below" : "above") + " the x-axis." },
        { latex: ans.t, value: ans.s, mark: "A1" },
      ],
    };
  },
};

/** Sign diagram for (x − p)(x − q) or (x − p)(x − q)(x − r), then the solution. */
const signPoly: Generator = {
  id: "alg.sign.poly",
  skill: "alg.ineq",
  generate: (r) => {
    const n = r.pick([2, 3]);
    const roots = r.distinct(n, -5, 5).sort((x, y) => x - y);
    const crit = roots.map((x) => F(x));
    const op = r.pick([">", "<"] as Op[]);
    const factors = roots.map((x) => ({ latex: fx(x), signs: linSigns(F(x), 1, crit) }));
    const res = factors.reduce<Sign[]>((acc, f) => times(acc, f.signs), factors[0].signs.map(() => "+" as Sign));
    const want: Sign = op === ">" ? "+" : "-";
    const parts = res.map((s, i) => (s === want ? i : -1)).filter((i) => i >= 0);
    const piece = (i: number) => (i === 0 ? `x < ${roots[0]}` : i === roots.length ? `x > ${roots[roots.length - 1]}` : `${roots[i - 1]} < x < ${roots[i]}`);
    const ans = parts.map(piece).join(" or ");
    const product = roots.map(fx).join("");
    const signs: SignDiagram = { critical: roots.map(String), factors, result: { latex: product, signs: res } };
    return {
      prompt: `Use a sign diagram to solve $${product} ${OPTEX[op]} 0$.`,
      answers: [{ spec: { kind: "relation", value: ans } }],
      signs,
      solution: [
        { latex: `\\text{Critical values: } ${roots.join(", \\; ")}`, note: "Each factor changes sign at its critical value." },
        { latex: `\\text{Product ${op === ">" ? "positive" : "negative"} on: } ${parts.map(piece).join(", \\; ")}`, note: "Multiply the signs in each column." },
        { latex: ans.replace(/ or /g, " \\;\\text{ or }\\; "), value: ans },
      ],
    };
  },
};

const ineqRational: Generator = {
  id: "alg.ineq.rational",
  skill: "alg.ineq.rational",
  generate: (r) => {
    if (r.next() < 0.5) {
      // c/(x − b) > m with c, m > 0  →  b < x < b + c/m
      const b = r.int(-5, 5);
      const m = r.pick([1, 2]);
      const c = r.pick([2, 4, 6].filter((x) => x % m === 0 || m === 1));
      const top = F(b).add(F(c, m));
      const ans = `${b} < x < ${S(top)}`;
      return {
        prompt: `Solve the inequality $\\dfrac{${c}}{${fx(b)}} > ${m}$.`,
        work: { mode: "relation", start: `${c}/${fs(b)} > ${m}` },
        answers: [{ spec: { kind: "relation", value: ans } }],
        bugs: [{ misconception: "unknownSign", value: `x < ${S(top)}` }],
        solution: [
          { latex: `\\frac{${c}}{${fx(b)}} - ${m} > 0`, note: "Do NOT multiply by $" + fx(b) + "$: its sign is unknown. Bring everything to one side.", value: `${c}/${fs(b)} - ${m} > 0` },
          { latex: `\\frac{${c} - ${m}${fx(b)}}{${fx(b)}} > 0 \\;\\Rightarrow\\; \\frac{${tex(Poly.of(-m, c + m * b))}}{${fx(b)}} > 0`, note: "Write it as ONE fraction.", value: `(${str(Poly.of(-m, c + m * b))})/${fs(b)} > 0` },
          { latex: `\\text{Critical values: } x = ${b} \\; (\\text{not allowed}), \\; x = ${L(top)}`, note: "Where the top or the bottom is zero.", mark: "M1" },
          { latex: `${b} < x < ${L(top)}`, note: "Use a sign diagram. $x = " + b + "$ is never included: the fraction is not defined there.", value: ans, mark: "A1" },
        ],
      };
    }
    // (x − a)/(x − b) op 0
    const [a, b] = r.distinct(2, -6, 6);
    const op = r.pick(["<", ">", "<=", ">="] as Op[]);
    const [lo, hi] = a < b ? [a, b] : [b, a];
    const inside = op === "<" || op === "<=";
    const inclA = !strict(op);
    const ans = inside
      ? `${lo} ${lo === a && inclA ? "<=" : "<"} x ${hi === a && inclA ? "<=" : "<"} ${hi}`
      : `x ${lo === a && inclA ? "<=" : "<"} ${lo} or x ${hi === a && inclA ? ">=" : ">"} ${hi}`;
    const ansTex = ans.replace(/<=/g, "\\le").replace(/>=/g, "\\ge").replace(/ or /g, " \\;\\text{ or }\\; ");
    return {
      prompt: `Solve the inequality $\\dfrac{${tex(Poly.of(1, -a))}}{${tex(Poly.of(1, -b))}} ${OPTEX[op]} 0$.`,
      work: { mode: "relation", start: `${fs(a)}/${fs(b)} ${op} 0` },
      answers: [{ spec: { kind: "relation", value: ans } }],
      bugs: [{ misconception: "unknownSign", value: `x ${op} ${a}` }, { misconception: "excludedPoint", value: ans.replace(new RegExp(`(<|>) ${b}`), (m) => (m.startsWith("<") ? `<= ${b}` : `>= ${b}`)).replace(new RegExp(`${b} <( x)`), `${b} <=$1`) }],
      solution: [
        { latex: `\\text{Critical values: } x = ${a} \\; (\\text{top} = 0), \\; x = ${b} \\; (\\text{bottom} = 0)`, mark: "M1" },
        { latex: `\\text{Sign diagram: the fraction is ${inside ? "negative" : "positive"} ${inside ? "between" : "outside"} } ${lo} \\text{ and } ${hi}`, note: "Test one number in each interval." },
        { latex: ansTex, note: `$x = ${b}$ is never included (division by zero).${inclA ? ` $x = ${a}$ is included because of the equals sign.` : ""}`, value: ans, mark: "A1" },
      ],
    };
  },
};

/** Sign diagram for (x − a)/(x − b) or (x − a)(x − c)/(x − b). */
const signRational: Generator = {
  id: "alg.sign.rational",
  skill: "alg.ineq.rational",
  generate: (r) => {
    const three = r.next() < 0.5;
    const vals = r.distinct(three ? 3 : 2, -5, 5);
    const b = vals[0];
    const tops = vals.slice(1);
    const sorted = [...vals].sort((x, y) => x - y);
    const crit = sorted.map((x) => F(x));
    const op = r.pick([">", "<"] as Op[]);
    const factors = [...tops.map((x) => ({ latex: fx(x), signs: linSigns(F(x), 1, crit) })), { latex: `${fx(b)} \\text{ (bottom)}`, signs: linSigns(F(b), 1, crit) }];
    const res = factors.reduce<Sign[]>((acc, f) => times(acc, f.signs), factors[0].signs.map(() => "+" as Sign));
    const want: Sign = op === ">" ? "+" : "-";
    const piece = (i: number) => (i === 0 ? `x < ${sorted[0]}` : i === sorted.length ? `x > ${sorted[sorted.length - 1]}` : `${sorted[i - 1]} < x < ${sorted[i]}`);
    const ans = res.map((s, i) => (s === want ? piece(i) : "")).filter(Boolean).join(" or ");
    const topTex = tops.map(fx).join("");
    const exprTex = `\\frac{${topTex}}{${fx(b)}}`;
    return {
      prompt: `Use a sign diagram to solve $${exprTex} ${OPTEX[op]} 0$.`,
      answers: [{ spec: { kind: "relation", value: ans } }],
      signs: { critical: sorted.map(String), factors, result: { latex: exprTex, signs: res } },
      solution: [
        { latex: `\\text{Critical values: } ${sorted.join(", \\; ")}`, note: `$x = ${b}$ makes the bottom zero, so it is never part of the answer.` },
        { latex: ans.replace(/ or /g, " \\;\\text{ or }\\; "), value: ans },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 11: modulus
 * ====================================================================== */

const modEq: Generator = {
  id: "alg.mod.eq",
  skill: "alg.mod",
  generate: (r) => {
    const kind = r.pick(["simple", "linear", "two"] as const);
    if (kind === "two") {
      // |x − a| = |2x + b|  →  x − a = 2x + b  or  x − a = −(2x + b)
      const a = r.int(-5, 5);
      const b = r.int(-5, 5);
      const x1 = F(-a - b);
      const x2 = F(a - b, 3);
      if (x1.eq(x2)) return modEq.generate(r);
      return {
        prompt: `Solve $|x ${signed(-a)}| = |2x ${signed(b)}|$.`.replace("+ 0", "").replace("- 0", ""),
        work: { mode: "equation", start: `|x - ${a}| = |2x + ${b}|` },
        answers: [{ spec: { kind: "solutions", values: [S(x1), S(x2)] } }],
        bugs: [{ misconception: "modulusOneSide", value: S(x1) }],
        solution: [
          { latex: `x ${signed(-a)} = 2x ${signed(b)} \\quad\\text{or}\\quad x ${signed(-a)} = -(2x ${signed(b)})`, note: "Two cases: the insides are equal, or one is minus the other.", mark: "M1" },
          { latex: `x = ${L(x1)}`, note: "First case.", mark: "A1" },
          { latex: `3x = ${a - b} \\Rightarrow x = ${L(x2)}`, note: "Second case.", mark: "A1" },
        ],
      };
    }
    const k = kind === "simple" ? 1 : r.pick([2, 3]);
    const b = r.int(-6, 6);
    const c = r.int(1, 9);
    const x1 = F(c - b, k);
    const x2 = F(-c - b, k);
    const inside = `${k === 1 ? "" : k}x ${signed(b)}`.replace(" + 0", "").replace(" - 0", "");
    return {
      prompt: `Solve $|${inside}| = ${c}$.`,
      work: { mode: "equation", start: `|${k}x + ${b}| = ${c}` },
      answers: [{ spec: { kind: "solutions", values: [S(x1), S(x2)] } }],
      bugs: [{ misconception: "modulusOneSide", value: S(x1) }],
      solution: [
        { latex: `${inside} = ${c} \\quad\\text{or}\\quad ${inside} = -${c}`, note: `The distance from 0 is ${c}: the inside is $${c}$ or $-${c}$.`, value: `${k}x + ${b} = ${c} or ${k}x + ${b} = -${c}`, mark: "M1" },
        { latex: `x = ${L(x1)} \\quad\\text{or}\\quad x = ${L(x2)}`, value: `x = ${S(x1)} or x = ${S(x2)}`, mark: "A1 A1" },
      ],
    };
  },
};

const modIneq: Generator = {
  id: "alg.mod.ineq",
  skill: "alg.mod",
  generate: (r) => {
    const k = r.pick([1, 1, 2]);
    const b = r.int(-6, 6);
    const c = r.int(1, 8);
    const op = r.pick(["<", "<=", ">", ">="] as Op[]);
    const lo = F(-c - b, k);
    const hi = F(c - b, k);
    const inside = op === "<" || op === "<=";
    const incl = !strict(op);
    const ans = region(lo, hi, inside, incl, incl);
    const inner = `${k === 1 ? "" : k}x ${signed(b)}`.replace(" + 0", "").replace(" - 0", "");
    return {
      prompt: `Solve the inequality $|${inner}| ${OPTEX[op]} ${c}$.`,
      work: { mode: "relation", start: `|${k}x + ${b}| ${op} ${c}` },
      answers: [{ spec: { kind: "relation", value: ans.s } }],
      bugs: [{ misconception: "modulusOneSide", value: `x ${inside ? op : op} ${S(inside ? hi : hi)}` }],
      solution: [
        inside
          ? { latex: `-${c} ${OPTEX[op]} ${inner} ${OPTEX[op]} ${c}`, note: `"Less than ${c} from 0" means between $-${c}$ and ${c}.`, value: `-${c} ${op} ${k}x + ${b} ${op} ${c}`, mark: "M1" }
          : { latex: `${inner} ${OPTEX[FLIP[op]]} -${c} \\quad\\text{or}\\quad ${inner} ${OPTEX[op]} ${c}`, note: `"More than ${c} from 0" means below $-${c}$ or above ${c}.`, value: `${k}x + ${b} ${FLIP[op]} -${c} or ${k}x + ${b} ${op} ${c}`, mark: "M1" },
        { latex: ans.t, value: ans.s, mark: "A1" },
      ],
    };
  },
};

/** Count the solutions of |x² − k| = m from the graph. */
const modCount: Generator = {
  id: "alg.mod.count",
  skill: "alg.mod.graph",
  generate: (r) => {
    const k = r.pick([1, 4, 9, 16, 25, 36]);
    const which = r.pick(["below", "equal", "above", "above"] as const);
    const m = which === "equal" ? k : which === "above" ? k + r.int(1, 9) : k === 1 ? 0.5 : r.int(1, k - 1);
    const n = m < k ? 4 : m === k ? 3 : 2;
    return {
      prompt: `Sketch $y = |x^2 - ${k}|$. How many solutions does $|x^2 - ${k}| = ${m}$ have?`,
      answers: [{ spec: { kind: "number", value: String(n) } }],
      solution: [
        { latex: `y = x^2 - ${k} \\text{ meets the x-axis at } x = \\pm ${Math.sqrt(k)}`, note: "Start with the parabola." },
        { latex: `\\text{Reflect the part below the axis: a bump of height } ${k} \\text{ at } x = 0`, note: "The modulus turns negative y-values into positive ones." },
        { latex: `\\text{The line } y = ${m} \\text{ ${m < k ? "cuts the bump twice and each arm once" : m === k ? "touches the top of the bump and cuts each arm" : "passes above the bump and cuts each arm once"}}`, note: "Count the crossing points." },
        { latex: `${n} \\text{ solutions}`, value: String(n) },
      ],
    };
  },
};

/* ======================================================================
 * Exam questions for lessons 5–12
 * ====================================================================== */

/** The learner's statement has the same solution set as the answer. */
const sameRel = (raw: string, want: string) => {
  const a = tryParse(raw);
  const b = tryParse(want);
  return !!a && !!b && sameSolutionSet(a, b);
};
/** Every critical value appears as a number in the learner's statement (method mark for inequalities). */
const usesValues = (raw: string, vals: number[]) => {
  const s = tryParse(raw);
  if (!s) return false;
  const nums = s.or.flatMap((c) => c.parts.flatMap((p) => constants(p)));
  return vals.every((v) => nums.some((n) => Math.abs(n - v) < 1e-9));
};

const examCubic: ExamGenerator = {
  id: "exam.cubic.unknowns",
  skill: "alg.cubic",
  generate: (r) => {
    const [r1, r2, r3] = cubicRoots(r);
    const f = Poly.fromRoots([r1, r2, r3]);
    const [a, b, c] = [f.coef(2).value(), f.coef(1).value(), f.coef(0).value()];
    const k = r.pick([2, -2, 3, -3].filter((x) => ![r1, r2, r3].includes(x)));
    const R = f.at(k).value();
    const fAt = (A: number, B: number, x: number) => x ** 3 + A * x * x + B * x + c;
    const factors = `${fs(r1)}${fs(r2)}${fs(r3)}`;
    return {
      model: [[String(a), String(b)], [factors]],
      intro: `$f(x) = x^3 + ax^2 + bx ${signed(c)}$, where $a$ and $b$ are constants. $${fx(r1)}$ is a factor of $f(x)$, and when $f(x)$ is divided by $${fx(k)}$ the remainder is $${R}$.`,
      parts: [
        {
          label: "(a)",
          prompt: "Find the values of a and b.",
          inputs: [{ label: "a" }, { label: "b" }],
          marks: [
            { type: "M", text: `Use f(${r1}) = 0`, check: (m) => m.num(0, 0) !== null && m.num(0, 1) !== null && near(fAt(m.num(0, 0)!, m.num(0, 1)!, r1), 0) },
            { type: "M", text: `Use f(${k}) = ${R}`, check: (m) => m.num(0, 0) !== null && m.num(0, 1) !== null && near(fAt(m.num(0, 0)!, m.num(0, 1)!, k), R) },
            { type: "A", text: `a = ${a}`, check: (m) => near(m.num(0, 0), a) },
            { type: "A", text: `b = ${b}`, check: (m) => near(m.num(0, 1), b) },
          ],
          solution: [
            { latex: `f(${r1}) = ${r1 ** 3} + ${r1 * r1}a ${signed(r1)}b ${signed(c)} = 0`, mark: "M1" },
            { latex: `f(${k}) = ${k ** 3} + ${k * k}a ${signed(k)}b ${signed(c)} = ${R}`, mark: "M1" },
            { latex: `\\text{Solving simultaneously: } a = ${a}`, mark: "A1" },
            { latex: `b = ${b}`, mark: "A1" },
          ],
        },
        {
          label: "(b)",
          prompt: "Hence factorise f(x) completely.",
          inputs: [{ label: "f(x) =" }],
          marks: [
            { type: "M", text: `Divide by ${fx(r1).replace(/[{}]/g, "")} to get a quadratic factor`, check: (m) => !!coefficientsOf(m.raw(1), 3) && Math.abs(evalAt(m.raw(1), r1)) < 1e-9 },
            { type: "A", text: factors, check: (m) => checkAnswer({ kind: "expr", value: factors, form: "factorised" }, m.raw(1)).ok },
          ],
          solution: [
            { latex: `f(x) = ${fx(r1)}(${tex(Poly.fromRoots([r2, r3]))})`, mark: "M1" },
            { latex: `= ${fx(r1)}${fx(r2)}${fx(r3)}`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

function evalAt(raw: string, x: number): number {
  const c = coefficientsOf(raw, 3);
  return c ? c.reduce((s, k, i) => s + k * x ** i, 0) : NaN;
}

const examPartial: ExamGenerator = {
  id: "exam.pf.repeated",
  skill: "alg.pf2",
  generate: (r) => {
    const [a, b] = r.distinct(2, -3, 3);
    const [A, B, C] = [r.nz(-4, 4), r.nz(-4, 4), r.nz(-5, 5)];
    const N = Poly.fromRoots([b, b]).scale(A).add(Poly.fromRoots([a, b]).scale(B)).add(Poly.of(1, -a).scale(C));
    return {
      model: [[String(A), String(B), String(C)]],
      intro: `$\\dfrac{${tex(N)}}{${fx(a)}${fx(b)}^2} \\equiv \\dfrac{A}{${fx(a)}} + \\dfrac{B}{${fx(b)}} + \\dfrac{C}{${fx(b)}^2}$`,
      parts: [
        {
          label: "(a)",
          prompt: "Find the values of the constants A, B and C.",
          inputs: [{ label: "A" }, { label: "B" }, { label: "C" }],
          marks: [
            { type: "M", text: "Multiply through and substitute (at least one value correct)", check: (m) => near(m.num(0, 0), A) || near(m.num(0, 1), B) || near(m.num(0, 2), C) },
            { type: "A", text: `A = ${A}`, check: (m) => near(m.num(0, 0), A) },
            { type: "A", text: `C = ${C}`, check: (m) => near(m.num(0, 2), C) },
            { type: "A", text: `B = ${B}`, check: (m) => near(m.num(0, 1), B) },
          ],
          solution: [
            { latex: `${tex(N)} \\equiv A${fx(b)}^2 + B${fx(a)}${fx(b)} + C${fx(a)}`, mark: "M1" },
            { latex: `x = ${a}: \\; A = ${A}`, mark: "A1" },
            { latex: `x = ${b}: \\; C = ${C}`, mark: "A1" },
            { latex: `x^2: \\; ${N.coef(2).toLatex()} = A + B \\Rightarrow B = ${B}`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

const examInequality: ExamGenerator = {
  id: "exam.ineq",
  skill: "alg.ineq.rational",
  generate: (r) => {
    // (a) 2x² + (2q − p... ) built from (2x − u)(x − v) > 0; (b) (x − c)/(x − d) ≤ 0.
    const u = r.pick([1, -1, 3, -3]);
    const v = r.int(-4, 4);
    const f = Poly.of(2, -u).mul(Poly.of(1, -v));
    const p1 = F(u, 2);
    const [lo, hi] = p1.value() < v ? [p1, F(v)] : [F(v), p1];
    const ansA = region(lo, hi, false, false, false);
    const [c, d] = r.distinct(2, -5, 5);
    const [l2, h2] = c < d ? [c, d] : [d, c];
    const ansB = `${l2} ${l2 === c ? "<=" : "<"} x ${h2 === c ? "<=" : "<"} ${h2}`;
    return {
      model: [[ansA.s], [ansB]],
      intro: "Solve the following inequalities.",
      parts: [
        {
          label: "(a)",
          prompt: `$${tex(f)} > 0$`,
          inputs: [{ label: "Solution" }],
          marks: [
            { type: "M", text: `Critical values ${L(lo)} and ${L(hi)}`, check: (m) => usesValues(m.raw(0), [lo.value(), hi.value()]) },
            { type: "A", text: ansA.s, check: (m) => sameRel(m.raw(0), ansA.s) },
          ],
          solution: [
            { latex: `${tex(f)} = (2x ${signed(-u)})(x ${signed(-v)})`, note: "Critical values " + `$${L(p1)}$ and $${v}$.`, mark: "M1" },
            { latex: ansA.t, mark: "A1" },
          ],
        },
        {
          label: "(b)",
          prompt: `$\\dfrac{${tex(Poly.of(1, -c))}}{${tex(Poly.of(1, -d))}} \\le 0$`,
          inputs: [{ label: "Solution" }],
          marks: [
            { type: "M", text: `Critical values ${c} and ${d}`, check: (m) => usesValues(m.raw(1), [c, d]) },
            { type: "A", text: `${ansB} (with x ≠ ${d})`, check: (m) => sameRel(m.raw(1), ansB) },
          ],
          solution: [
            { latex: `\\text{Critical values } x = ${c}, \\; x = ${d}`, mark: "M1" },
            { latex: ansB.replace(/<=/g, "\\le"), note: `$x = ${d}$ is excluded: the bottom would be zero.`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

const examModulus: ExamGenerator = {
  id: "exam.mod",
  skill: "alg.mod",
  generate: (r) => {
    const a = r.int(-4, 4);
    const b = r.int(-4, 4);
    const x1 = F(-a - b);
    const x2 = F(a - b, 3);
    if (x1.eq(x2)) return examModulus.generate(r);
    const [lo, hi] = x1.value() < x2.value() ? [x1, x2] : [x2, x1];
    // |x − a| > |2x + b|  ⇔  (x − a)² > (2x + b)²  ⇔  3x² + … < 0  ⇔  between the roots.
    const ansB = region(lo, hi, true, false, false);
    return {
      model: [[`x = ${S(x1)} or x = ${S(x2)}`], [ansB.s]],
      intro: `$f(x) = |x ${signed(-a)}|$ and $g(x) = |2x ${signed(b)}|$.`,
      parts: [
        {
          label: "(a)",
          prompt: "Solve f(x) = g(x).",
          inputs: [{ label: "x =" }],
          marks: [
            { type: "M", text: "Form two equations (or square both sides)", check: (m) => usesValues(m.raw(0), [x1.value()]) || usesValues(m.raw(0), [x2.value()]) },
            { type: "A", text: `x = ${S(x1)}`, check: (m) => usesValues(m.raw(0), [x1.value()]) },
            { type: "A", text: `x = ${S(x2)}`, check: (m) => usesValues(m.raw(0), [x2.value()]) },
          ],
          solution: [
            { latex: `x ${signed(-a)} = 2x ${signed(b)} \\text{ or } x ${signed(-a)} = -(2x ${signed(b)})`, mark: "M1" },
            { latex: `x = ${L(x1)}`, mark: "A1" },
            { latex: `x = ${L(x2)}`, mark: "A1" },
          ],
        },
        {
          label: "(b)",
          prompt: "Hence solve f(x) > g(x).",
          inputs: [{ label: "Solution" }],
          marks: [
            { type: "M", text: "Use the critical values from (a)", ft: true, check: (m) => usesValues(m.raw(1), [lo.value(), hi.value()]) },
            { type: "A", text: ansB.s, check: (m) => sameRel(m.raw(1), ansB.s) },
          ],
          solution: [
            { latex: `\\text{Sketch both graphs: } |x ${signed(-a)}| \\text{ is above } |2x ${signed(b)}| \\text{ between the crossing points}`, mark: "M1" },
            { latex: ansB.t, mark: "A1" },
          ],
        },
      ],
    };
  },
};

const examPartialDistinct: ExamGenerator = {
  id: "exam.pf.distinct",
  skill: "alg.pf",
  generate: (r) => {
    const [a, b] = r.distinct(2, -4, 4, [0]);
    const [A, B] = [r.nz(-5, 5), r.nz(-5, 5)];
    const N = Poly.of(1, -b).scale(A).add(Poly.of(1, -a).scale(B));
    if (N.isZero()) return examPartialDistinct.generate(r);
    const D = Poly.fromRoots([a, b]);
    return {
      model: [[String(A), String(B)]],
      intro: `$\\dfrac{${tex(N)}}{${tex(D)}} \\equiv \\dfrac{A}{${fx(a)}} + \\dfrac{B}{${fx(b)}}$`,
      parts: [
        {
          label: "(a)",
          prompt: `Factorise the denominator, then find the values of the constants A and B.`,
          inputs: [{ label: "A" }, { label: "B" }],
          marks: [
            { type: "M", text: "Multiply through and substitute (at least one value correct)", check: (m) => near(m.num(0, 0), A) || near(m.num(0, 1), B) },
            { type: "A", text: `A = ${A}`, check: (m) => near(m.num(0, 0), A) },
            { type: "A", text: `B = ${B}`, check: (m) => near(m.num(0, 1), B) },
          ],
          solution: [
            { latex: `${tex(D)} = ${fx(a)}${fx(b)}`, note: "Factorise the denominator first." },
            { latex: `${tex(N)} \\equiv A${fx(b)} + B${fx(a)}`, mark: "M1" },
            { latex: `x = ${a}: \\; A = ${A}`, mark: "A1" },
            { latex: `x = ${b}: \\; B = ${B}`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

const examInequalityBasic: ExamGenerator = {
  id: "exam.ineq.basic",
  skill: "alg.ineq",
  generate: (r) => {
    const k = r.pick([-3, -2, 2, 3, 4]);
    const c = r.int(-8, 8);
    const d = r.int(-8, 8);
    // kx + c ≥ d  →  x ≥ (d − c)/k (reversed when k < 0)
    const bound = F(d - c, k);
    const ansA = `x ${k > 0 ? ">=" : "<="} ${S(bound)}`;
    const [p, q] = r.distinct(2, -5, 5).sort((x, y) => x - y);
    const f = Poly.fromRoots([p, q]);
    const ansB = `${p} < x < ${q}`;
    return {
      model: [[ansA], [ansB]],
      intro: "Find the set of values of x for which",
      parts: [
        {
          label: "(a)",
          prompt: `$${k}x ${signed(c)} \\ge ${d}$`,
          inputs: [{ label: "Solution" }],
          marks: [
            { type: "M", text: `Collect terms: ${k}x ≥ ${d - c}`, check: (m) => usesValues(m.raw(0), [bound.value()]) },
            { type: "A", text: ansA + (k < 0 ? " (sign reversed)" : ""), check: (m) => sameRel(m.raw(0), ansA) },
          ],
          solution: [
            { latex: `${k}x \\ge ${d - c}`, mark: "M1" },
            { latex: `x ${k > 0 ? "\\ge" : "\\le"} ${L(bound)}`, note: k < 0 ? "Dividing by a negative number reverses the sign." : undefined, mark: "A1" },
          ],
        },
        {
          label: "(b)",
          prompt: `$${tex(f)} < 0$`,
          inputs: [{ label: "Solution" }],
          marks: [
            { type: "M", text: `Critical values ${p} and ${q}`, check: (m) => usesValues(m.raw(1), [p, q]) },
            { type: "A", text: ansB, check: (m) => sameRel(m.raw(1), ansB) },
          ],
          solution: [
            { latex: `${fx(p)}${fx(q)} < 0`, note: `Critical values ${p} and ${q}.`, mark: "M1" },
            { latex: `${p} < x < ${q}`, note: "Below the axis between the roots.", mark: "A1" },
          ],
        },
      ],
    };
  },
};

export const generators2: Generator[] = [factorTest, factorFind, cubicFactorise, cubicSolve, pfDistinct, pfRepeated, pfImproper, ineqLinear, ineqQuad, signPoly, ineqRational, signRational, modEq, modIneq, modCount];
export const examGenerators2: ExamGenerator[] = [examCubic, examPartialDistinct, examPartial, examInequalityBasic, examInequality, examModulus];
