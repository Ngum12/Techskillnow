/**
 * Functions question generators, lessons 0–5: foundations, what a function is, notation, domain and
 * range, composite functions and inverse functions. Each one makes a fresh question from random numbers,
 * with the full model working, the answers to check and known wrong answers for common errors.
 * Edit the wording and number ranges here; the engine in /lib/maths does the checking.
 * Lessons 6–10 are in ./generators-2.ts.
 */
import { inBrackets, signed } from "@/lib/maths/build";
import { classifyMapping, isFunctionMapping } from "@/lib/maths/functions";
import { evaluate } from "@/lib/maths/expr";
import type { Rng } from "@/lib/maths/rng";
import type { ExamGenerator, Generator, GraphSpec } from "@/lib/maths/types";
import { generators as algebraGenerators } from "../algebra/generators";
import { F, P, close, compose, exprOf, exprOk, nL, nS, rangeOk, relOk, solOk, str, tex, upToConstant, valuesOf, xMinus, xMinusS } from "./helpers";
import { generators2, examGenerators2 } from "./generators-2";

/** Algebra skills this topic builds on: they appear in the starting check and in repairs. */
const PREREQUISITES = ["pre.substitute", "pre.factorise", "pre.rearrange", "alg.ineq.quad", "alg.mod.eq"];

/* ======================================================================
 * Lesson 0: foundations (diagnostic and repair)
 * ====================================================================== */

const solveLinear: Generator = {
  id: "fn.pre.solve",
  skill: "fn.pre.solve",
  generate: (r) => {
    const x = r.int(-6, 6);
    if (r.next() < 0.5) {
      const a = r.pick([2, 3, 4, 5, -2, -3]);
      const b = r.nz(-9, 9);
      const k = a * x + b;
      return {
        prompt: `Solve $${tex(P(a, b))} = ${k}$.`,
        work: { mode: "equation", start: `${str(P(a, b))} = ${k}` },
        answers: [{ spec: { kind: "solutions", values: [String(x)] } }],
        bugs: [{ misconception: "moveTermSign", value: nS(F(k + b, a)) }],
        solution: [
          { latex: `${tex(P(a, 0))} = ${k} ${signed(-b)}`, note: `${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)} on both sides: the term changes sign when it crosses.`, value: `${a}x = ${k - b}` },
          { latex: `${tex(P(a, 0))} = ${a * x}` },
          { latex: `x = ${x}`, note: `Divide both sides by ${inBrackets(a)}.`, value: `x = ${x}` },
        ],
      };
    }
    const [a, c] = r.distinct(2, -5, 6, [0]);
    const b = r.int(-9, 9);
    const d = (a - c) * x + b;
    return {
      prompt: `Solve $${tex(P(a, b))} = ${tex(P(c, d))}$.`,
      work: { mode: "equation", start: `${str(P(a, b))} = ${str(P(c, d))}` },
      answers: [{ spec: { kind: "solutions", values: [String(x)] } }],
      solution: [
        { latex: `${tex(P(a - c, 0))} = ${d - b}`, note: "Collect the x terms on one side and the numbers on the other.", value: `${a - c}x = ${d - b}` },
        { latex: `x = ${x}`, note: `Divide by ${inBrackets(a - c)}.`, value: `x = ${x}` },
      ],
    };
  },
};

const readGraph: Generator = {
  id: "fn.pre.readGraph",
  skill: "fn.pre.graphs",
  generate: (r) => {
    const m = r.pick([-2, -1, 1, 2]);
    const c = r.int(-3, 3);
    const line = P(m, c);
    const k = r.int(-3, 3);
    const j = r.pick([-3, -2, -1, 1, 2, 3].filter((v) => v !== k));
    const v = m * j + c;
    return {
      prompt: `The graph shows the straight line $y = f(x)$. Use the graph to write down $f(${k})$, and the value of $x$ for which $f(x) = ${v}$.`,
      graph: { x: [-5, 5], y: [-8, 8], curves: [{ expr: str(line) }], points: [{ x: 0, y: c }, { x: 1, y: m + c }] },
      answers: [
        { label: `f(${k})`, spec: { kind: "number", value: String(m * k + c) } },
        { label: `x when f(x) = ${v}`, spec: { kind: "number", value: String(j) } },
      ],
      bugs: [{ misconception: "swapCoordinates", answer: 1, value: String(m * v + c) }],
      solution: [
        { latex: `f(${k}): \\text{ go to } x = ${k} \\text{ on the x-axis, up or down to the line, across to the y-axis}`, note: "The input is on the x-axis, the output on the y-axis." },
        { latex: `f(${k}) = ${m * k + c}`, value: String(m * k + c) },
        { latex: `f(x) = ${v}: \\text{ start at } y = ${v} \\text{, across to the line, then down to the x-axis}`, note: "Working backwards: start from the output." },
        { latex: `x = ${j}`, value: String(j) },
      ],
    };
  },
};

const intervals: Generator = {
  id: "fn.pre.interval",
  skill: "fn.pre.interval",
  generate: (r) => {
    const [a, b] = r.distinct(2, -8, 9).sort((p, q) => p - q);
    const type = r.int(0, 3);
    const [rel, intv, wrong] = [
      [`${a} <= x <= ${b}`, `[${a}, ${b}]`, `${a} < x < ${b}`],
      [`${a} < x <= ${b}`, `(${a}, ${b}]`, `${a} <= x < ${b}`],
      [`x >= ${a}`, `[${a}, ∞)`, `x > ${a}`],
      [`x < ${b}`, `(−∞, ${b})`, `x <= ${b}`],
    ][type];
    const relTex = rel.replace(/<=/g, "\\le").replace(/>=/g, "\\ge");
    const intTex = intv.replace("∞", "\\infty").replace("−", "-");
    const toInterval = r.next() < 0.5;
    return {
      prompt: toInterval ? `Write the set of values $${relTex}$ in interval notation.` : `Write $x \\in ${intTex}$ as an inequality in $x$.`,
      answers: [{ spec: { kind: "relation", value: rel } }],
      bugs: [{ misconception: "intervalBracket", value: wrong }],
      solution: [
        { latex: "[\\;] \\text{ include the end value } (\\le, \\ge); \\quad (\\;) \\text{ leave it out } (<, >)", note: "∞ is never included, so it always has a round bracket." },
        { latex: toInterval ? intTex : relTex, value: rel },
      ],
    };
  },
};

const plotPoint: Generator = {
  id: "fn.pre.plot",
  skill: "fn.pre.graphs",
  generate: (r) => {
    const m = r.pick([-3, -2, 2, 3]);
    const c = r.int(-4, 4);
    const x = r.pick([-2, -1, 1, 2, 3]);
    const y = m * x + c;
    const right = `(${x}, ${y})`;
    const swapped = `(${y}, ${x})`;
    const onLine = (px: number, py: number) => m * px + c === py;
    const pool = [swapped, `(${x}, ${y + m})`, `(${-x}, ${y})`, `(${x + 1}, ${y - 1})`, `(${x}, ${-y})`].filter((s, i, arr) => {
      const [px, py] = s.slice(1, -1).split(", ").map(Number);
      return s !== right && !onLine(px, py) && arr.indexOf(s) === i;
    });
    const wrong = pool.slice(0, 3);
    const options = r.shuffle([right, ...wrong]);
    const bugs = options.includes(swapped) && !onLine(y, x) ? [{ misconception: "swapCoordinates", value: String(options.indexOf(swapped)) }] : [];
    return {
      prompt: `Which point lies on the line $y = ${tex(P(m, c))}$?`,
      answers: [{ spec: { kind: "choice", options: options.map((o) => `$${o}$`), answer: options.indexOf(right) } }],
      bugs,
      solution: [
        { latex: `(x, y) = ${right}: \\; ${m} \\times ${inBrackets(x)} ${c ? signed(c) : ""} = ${y}`, note: "Substitute the x-coordinate (first number) and check you get the y-coordinate (second number)." },
        { latex: `\\text{So } ${right} \\text{ is on the line.}` },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 1: what is a function?
 * ====================================================================== */

const KIND_OPTIONS = ["One-to-one", "Many-to-one", "One-to-many", "Many-to-many"];
const KINDS = ["oneToOne", "manyToOne", "oneToMany", "manyToMany"] as const;

const mapping: Generator = {
  id: "fn.map.classify",
  skill: "fn.map",
  generate: (r) => {
    const kind = r.pick(KINDS);
    let left: number[] = [];
    let right: number[] = [];
    let arrows: [number, number][] = [];
    let rule = "";
    if (kind === "oneToOne") {
      const a = r.pick([2, 3, -1]);
      const b = r.int(-3, 4);
      left = r.distinct(r.int(3, 4), -3, 5).sort((p, q) => p - q);
      right = left.map((x) => a * x + b).sort((p, q) => p - q);
      arrows = left.map((x, i) => [i, right.indexOf(a * x + b)]);
      rule = `x \\mapsto ${tex(P(a, b))}`;
    } else if (kind === "manyToOne") {
      const k = r.pick([1, 2, 3]);
      left = r.shuffle([-k, k, ...r.distinct(r.int(1, 2), 0, 4, [k])]).sort((p, q) => p - q);
      const c = r.int(-2, 2);
      right = [...new Set(left.map((x) => x * x + c))].sort((p, q) => p - q);
      arrows = left.map((x, i) => [i, right.indexOf(x * x + c)]);
      rule = `x \\mapsto ${tex(P(1, 0, c))}`;
    } else if (kind === "oneToMany") {
      left = r.distinct(r.int(2, 3), 1, 4).sort((p, q) => p - q).map((v) => v * v);
      right = [...left.map((v) => -Math.sqrt(v)), ...left.map((v) => Math.sqrt(v))].sort((p, q) => p - q);
      arrows = left.flatMap((v, i) => [[i, right.indexOf(-Math.sqrt(v))], [i, right.indexOf(Math.sqrt(v))]] as [number, number][]);
      rule = "x \\mapsto \\pm\\sqrt{x}";
    } else {
      left = r.pick([[2, 3, 4], [2, 3, 5], [2, 3]]);
      right = r.pick([[6, 8, 9, 12], [6, 10, 12, 15], [4, 6, 9, 12]]);
      arrows = left.flatMap((a, i) => right.flatMap((b, j) => (b % a === 0 ? [[i, j] as [number, number]] : [])));
      rule = "x \\mapsto \\text{a multiple of } x";
    }
    const actual = classifyMapping(arrows);
    const fn = isFunctionMapping(actual);
    return {
      prompt: `The mapping diagram shows $${rule}$ from $\\{${left.join(", ")}\\}$ to $\\{${right.join(", ")}\\}$. What type of mapping is it, and is it a function?`,
      mapping: { left: left.map(String), right: right.map(String), arrows },
      answers: [
        { label: "Type of mapping", spec: { kind: "choice", options: KIND_OPTIONS, answer: KINDS.indexOf(actual) } },
        { label: "Is it a function?", spec: { kind: "choice", options: ["Yes", "No"], answer: fn ? 0 : 1 } },
      ],
      bugs: fn ? (actual === "manyToOne" ? [{ misconception: "manyToOneNotFunction", answer: 1, value: "1" }] : []) : [{ misconception: "oneToManyFunction", answer: 1, value: "0" }],
      solution: [
        { latex: `\\text{Arrows out of each input: } ${actual === "oneToMany" || actual === "manyToMany" ? "\\text{some input has two}" : "\\text{exactly one each}"}`, note: "Count arrows leaving each input on the left." },
        { latex: `\\text{Arrows into each output: } ${actual === "manyToOne" || actual === "manyToMany" ? "\\text{some output has two}" : "\\text{at most one each}"}`, note: "Count arrows arriving at each output on the right." },
        { latex: `\\Rightarrow \\text{${KIND_OPTIONS[KINDS.indexOf(actual)]}}`, note: fn ? "Every input has exactly one output, so it is a function." : "An input with two outputs: it is NOT a function." },
      ],
    };
  },
};

type Shape = { name: string; curve: GraphSpec["curves"][number]; kind: 0 | 1 | 2 };

/** Curves for the line tests: 0 = one-to-one function, 1 = many-to-one function, 2 = not a function. */
function shapeFor(r: Rng): Shape {
  const h = r.int(-2, 2);
  const k = r.int(-2, 2);
  const R = r.pick([2, 2.5, 3]);
  const shapes: Shape[] = [
    { name: "a parabola", curve: { expr: `(${xMinusS(h)})^2 + ${k}` }, kind: 1 },
    { name: "a cubic", curve: { expr: `(${xMinusS(h)})^3/2 + ${k}` }, kind: 0 },
    { name: "a straight line", curve: { expr: `${r.pick([2, -1, 0.5])}x + ${k}` }, kind: 0 },
    { name: "a V shape", curve: { expr: `|${xMinusS(h)}| + ${k}` }, kind: 1 },
    { name: "a circle", curve: { expr: "", param: { x: `${h} + ${R}cos(t)`, y: `${k} + ${R}sin(t)`, t: [0, 6.2832] } }, kind: 2 },
    { name: "a sideways parabola", curve: { expr: "", param: { x: `t^2/2 + ${h - 2}`, y: `t + ${k}`, t: [-4, 4] } }, kind: 2 },
    { name: "a square-root curve", curve: { expr: `2sqrt(x + 3) + ${k - 2}` }, kind: 0 },
    { name: "a wave", curve: { expr: `2sin(x) + ${k}` }, kind: 1 },
  ];
  return r.pick(shapes);
}

const LINE_OPTIONS = ["A one-to-one function", "A many-to-one function", "Not a function"];

const lineTest: Generator = {
  id: "fn.map.lineTest",
  skill: "fn.map.graph",
  generate: (r) => {
    const s = shapeFor(r);
    const dir = r.next() < 0.5 ? "vertical" : "horizontal";
    const bugs =
      s.kind === 2
        ? [{ misconception: "oneToManyFunction", value: "0" }, { misconception: "oneToManyFunction", value: "1" }]
        : s.kind === 1
          ? [{ misconception: "manyToOneNotFunction", value: "2" }, { misconception: "horizontalLine", value: "0" }]
          : [];
    return {
      prompt: `The graph shows ${s.name}. Drag the ${dir} line across it. Is this graph a one-to-one function, a many-to-one function, or not a function at all?`,
      graph: { x: [-6, 6], y: [-6, 6], curves: [s.curve], params: [{ name: "c", label: dir === "vertical" ? "x = c" : "y = c", min: -5, max: 5, step: 0.1, value: dir === "vertical" ? -1 : 1 }], lineTest: { param: "c", dir } },
      answers: [{ spec: { kind: "choice", options: LINE_OPTIONS, answer: s.kind } }],
      bugs,
      solution: [
        { latex: "\\text{Vertical line test: every vertical line meets the graph at most once} \\Rightarrow \\text{function}", note: s.kind === 2 ? "Here a vertical line can meet the graph twice: one x, two y-values. Not a function." : "Every vertical line meets this graph once at most, so it is a function." },
        { latex: "\\text{Horizontal line test: every horizontal line meets it at most once} \\Rightarrow \\text{one-to-one}", note: s.kind === 0 ? "No horizontal line meets it twice: one-to-one." : s.kind === 1 ? "A horizontal line meets it more than once: two inputs give the same output, so many-to-one." : "We only use this test on graphs that are functions." },
        { latex: `\\Rightarrow \\text{${LINE_OPTIONS[s.kind]}}` },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 2: notation, domain and range
 * ====================================================================== */

const evaluateFn: Generator = {
  id: "fn.eval",
  skill: "fn.notation",
  generate: (r) => {
    const k = r.nz(-4, 4);
    const arrow = r.next() < 0.5;
    if (r.next() < 0.6) {
      const [a, b, c] = [r.pick([1, 2, 3, -1, -2]), r.int(-5, 5), r.int(-6, 6)];
      const f = P(a, b, c);
      const v = f.at(k).value();
      const name = arrow ? `f: x \\mapsto ${tex(f)}` : `f(x) = ${tex(f)}`;
      return {
        prompt: `$${name}$, $x \\in \\mathbb{R}$. Find $f(${k})$.`,
        answers: [{ spec: { kind: "number", value: String(v) } }],
        bugs: k < 0 ? [{ misconception: "squareNegative", value: String(-a * k * k + b * k + c) }] : [],
        solution: [
          { latex: `f(${k}) = ${a === 1 ? "" : a === -1 ? "-" : a}\\left(${k}\\right)^2 ${b ? `${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}\\left(${k}\\right)` : ""} ${c ? signed(c) : ""}`, note: "Replace every x by the input, in brackets." },
          { latex: `= ${a * k * k} ${b ? signed(b * k) : ""} ${c ? signed(c) : ""}`, note: `$(${k})^2 = ${k * k}$: a negative number squared is positive.` },
          { latex: `= ${v}`, value: String(v) },
        ],
      };
    }
    const [a, b] = [r.nz(-4, 5), r.int(-6, 6)];
    const c = r.pick([-3, -2, -1, 1, 2, 3].filter((v) => v !== -k));
    const v = F(a * k + b, k + c);
    return {
      prompt: `$${arrow ? "f: x \\mapsto" : "f(x) ="} \\dfrac{${tex(P(a, b))}}{${xMinus(-c)}}$, $x \\ne ${-c}$. Find $f(${k})$.`,
      answers: [{ spec: { kind: "number", value: nS(v) } }],
      solution: [
        { latex: `f(${k}) = \\dfrac{${a === 1 ? "" : a === -1 ? "-" : a}\\left(${k}\\right) ${b ? signed(b) : ""}}{\\left(${k}\\right) ${signed(c)}}`, note: "Replace every x by the input, in brackets." },
        { latex: `= \\dfrac{${a * k + b}}{${k + c}}` },
        { latex: `= ${nL(v)}`, note: "Simplify the fraction.", value: nS(v) },
      ],
    };
  },
};

const domain: Generator = {
  id: "fn.domain",
  skill: "fn.domain",
  generate: (r) => {
    if (r.next() < 0.5) {
      const a = r.pick([1, 2, 3, 4]);
      const b = r.nz(-8, 9);
      const edge = F(b, a);
      return {
        prompt: `$f(x) = \\sqrt{${tex(P(a, -b))}}$. Find the largest possible domain of $f$.`,
        answers: [{ spec: { kind: "relation", value: `x >= ${nS(edge)}` } }],
        bugs: [{ misconception: "domainBoundary", value: `x > ${nS(edge)}` }],
        solution: [
          { latex: `${tex(P(a, -b))} \\ge 0`, note: "You can only take the square root of a number that is zero or positive." },
          { latex: `${tex(P(a, 0))} \\ge ${b}`, note: "Zero is allowed: $\\sqrt{0} = 0$." },
          { latex: `x \\ge ${nL(edge)}`, value: `x >= ${nS(edge)}` },
        ],
      };
    }
    const k = r.nz(-6, 6);
    const p = r.nz(-5, 5);
    return {
      prompt: `$g(x) = \\dfrac{${k}}{${xMinus(p)}}$. Find the largest possible domain of $g$.`,
      answers: [{ spec: { kind: "relation", value: `x != ${p}` } }],
      bugs: [{ misconception: "domainBoundary", value: `x != ${-p}` }],
      solution: [
        { latex: `${xMinus(p)} = 0 \\Rightarrow x = ${p}`, note: "You cannot divide by zero. Find the x that makes the bottom zero." },
        { latex: `x \\in \\mathbb{R}, \\; x \\ne ${p}`, note: "Every other real number is allowed.", value: `x != ${p}` },
      ],
    };
  },
};

const range: Generator = {
  id: "fn.range",
  skill: "fn.range",
  generate: (r) => {
    const v = r.int(0, 2);
    if (v === 0) {
      const [p, q] = r.distinct(2, -5, 5);
      const f = P(1, -2 * p, p * p + q);
      return {
        prompt: `$f(x) = ${tex(f)}$, $x \\in \\mathbb{R}$. By completing the square, find the range of $f$.`,
        answers: [{ spec: { kind: "range", value: `y >= ${q}` } }],
        bugs: [{ misconception: "rangeVertexX", value: `y >= ${p}` }],
        solution: [
          { latex: `f(x) = (${xMinus(p)})^2 ${signed(q)}`, note: "Complete the square: half the coefficient of x, squared." },
          { latex: `(${xMinus(p)})^2 \\ge 0`, note: "A square is never negative; it is 0 when $x = " + p + "$." },
          { latex: `f(x) \\ge ${q}`, note: "The range is about outputs: write it with f(x), not x.", value: `y >= ${q}` },
        ],
      };
    }
    if (v === 1) {
      const m = r.nz(-3, 3);
      const c = r.int(-5, 5);
      const [a, b] = r.distinct(2, -4, 5).sort((s, t) => s - t);
      const [fa, fb] = [m * a + c, m * b + c];
      const [lo, hi] = [Math.min(fa, fb), Math.max(fa, fb)];
      return {
        prompt: `$f(x) = ${tex(P(m, c))}$, $${a} \\le x \\le ${b}$. Find the range of $f$.`,
        answers: [{ spec: { kind: "range", value: `${lo} <= y <= ${hi}` } }],
        solution: [
          { latex: `f(${a}) = ${fa}, \\quad f(${b}) = ${fb}`, note: "A straight line: the smallest and largest outputs are at the ends of the domain." },
          { latex: `${lo} \\le f(x) \\le ${hi}`, note: m < 0 ? "The gradient is negative, so the left end gives the larger output." : "Write the smaller value first.", value: `${lo} <= y <= ${hi}` },
        ],
      };
    }
    // A quadratic on an interval that contains the vertex: the least value is not at an end.
    const p = r.int(-2, 2);
    const q = r.int(-4, 3);
    const a = p - r.int(1, 2);
    const b = p + r.int(3, 4);
    const f = P(1, -2 * p, p * p + q);
    const [fa, fb] = [f.at(a).value(), f.at(b).value()];
    return {
      prompt: `$f(x) = ${tex(f)}$, $${a} \\le x \\le ${b}$. Find the range of $f$.`,
      answers: [{ spec: { kind: "range", value: `${q} <= y <= ${Math.max(fa, fb)}` } }],
      bugs: [{ misconception: "rangeEndpoints", value: `${Math.min(fa, fb)} <= y <= ${Math.max(fa, fb)}` }],
      graph: { x: [a - 2, b + 2], y: [q - 2, Math.max(fa, fb) + 2], curves: [{ expr: str(f) }], points: [{ x: p, y: q, label: "min" }] },
      solution: [
        { latex: `f(x) = (${xMinus(p)})^2 ${signed(q)}`, note: `The minimum point is $(${p}, ${q})$, and $x = ${p}$ IS in the domain.` },
        { latex: `f(${a}) = ${fa}, \\quad f(${b}) = ${fb}`, note: "Check both ends for the largest value." },
        { latex: `${q} \\le f(x) \\le ${Math.max(fa, fb)}`, note: "The least value comes from the turning point, not from an end.", value: `${q} <= y <= ${Math.max(fa, fb)}` },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 3: composite functions
 * ====================================================================== */

/** f(x) = ax + b and g(x) = x² + c, or g linear: the pair used for composite questions. */
function pair(r: Rng) {
  const a = r.pick([2, 3, -2, 4, -1]);
  const b = r.int(-5, 5);
  const quad = r.next() < 0.6;
  const g = quad ? P(1, 0, r.int(-4, 4)) : P(r.pick([2, 3, -3, 5]), r.nz(-4, 4));
  const f = P(a, b);
  return { f, g, fg: compose(f, g), gf: compose(g, f) };
}

const compositeEval: Generator = {
  id: "fn.comp.eval",
  skill: "fn.comp",
  generate: (r) => {
    const { f, g } = pair(r);
    const k = r.nz(-3, 3);
    const which = r.pick(["fg", "gf"] as const);
    const [first, second] = which === "fg" ? [g, f] : [f, g];
    const [n1, n2] = which === "fg" ? ["g", "f"] : ["f", "g"];
    const mid = first.at(k).value();
    const ans = second.at(mid).value();
    const wrong = first.at(second.at(k).value()).value();
    return {
      prompt: `$f(x) = ${tex(f)}$ and $g(x) = ${tex(g)}$. Find $${which}(${k})$.`,
      answers: [{ spec: { kind: "number", value: String(ans) } }],
      bugs: wrong === ans ? [] : [{ misconception: "compositeOrder", value: String(wrong) }],
      solution: [
        { latex: `${which}(${k}) = ${n2}(${n1}(${k}))`, note: `$${which}$ means do $${n1}$ first, then $${n2}$: the function next to x acts first.` },
        { latex: `${n1}(${k}) = ${mid}`, note: `Work out the inside first.`, value: String(mid) },
        { latex: `${n2}(${mid}) = ${ans}`, value: String(ans) },
      ],
    };
  },
};

const compositeExpr: Generator = {
  id: "fn.comp.expr",
  skill: "fn.comp.expr",
  generate: (r) => {
    const { f, g, fg, gf } = pair(r);
    if (fg.eq(gf)) return compositeExpr.generate(r);
    const which = r.pick(["fg", "gf"] as const);
    const [outer, inner] = which === "fg" ? [f, g] : [g, f];
    const ans = which === "fg" ? fg : gf;
    // The outer function written with the inner one in place of x.
    const subbed = outer
      .terms()
      .map(({ coef, power }, i) => {
        const c = coef.n < 0 ? coef.neg() : coef;
        const body = power === 0 ? c.toString() : `${c.eq(1) ? "" : c.toString()}(${str(inner)})${power > 1 ? `^${power}` : ""}`;
        return i === 0 ? `${coef.n < 0 ? "-" : ""}${body}` : ` ${coef.n < 0 ? "-" : "+"} ${body}`;
      })
      .join("");
    const subbedTex = outer
      .terms()
      .map(({ coef, power }, i) => {
        const c = coef.n < 0 ? coef.neg() : coef;
        const body = power === 0 ? c.toLatex() : `${c.eq(1) ? "" : c.toLatex()}(${tex(inner)})${power > 1 ? `^{${power}}` : ""}`;
        return i === 0 ? `${coef.n < 0 ? "-" : ""}${body}` : ` ${coef.n < 0 ? "-" : "+"} ${body}`;
      })
      .join("");
    return {
      prompt: `$f(x) = ${tex(f)}$ and $g(x) = ${tex(g)}$. Find $${which}(x)$, simplifying your answer.`,
      work: { mode: "expr", start: subbed },
      answers: [{ spec: { kind: "expr", value: str(ans), form: "expanded" } }],
      bugs: [{ misconception: "compositeOrder", value: str(which === "fg" ? gf : fg) }],
      solution: [
        { latex: `${which}(x) = ${which[0]}(${which[1]}(x)) = ${which[0]}(${tex(inner)})`, note: `Put the whole of $${which[1]}(x)$ in place of x in $${which[0]}$.` },
        { latex: `= ${subbedTex}`, value: subbed },
        { latex: `= ${tex(ans)}`, note: "Expand and collect like terms.", value: str(ans) },
      ],
    };
  },
};

const compositeSolve: Generator = {
  id: "fn.comp.solve",
  skill: "fn.comp.solve",
  generate: (r) => {
    const a = r.pick([2, 3, -2, 4]);
    const b = r.int(-6, 6);
    const c = r.int(-4, 4);
    const f = P(a, b);
    if (r.next() < 0.6) {
      // fg(x) = a(x² + c) + b = k  ⇒  x = ±s
      const g = P(1, 0, c);
      const s = r.int(1, 4);
      const k = a * (s * s + c) + b;
      return {
        prompt: `$f(x) = ${tex(f)}$ and $g(x) = ${tex(g)}$. Solve $fg(x) = ${k}$.`,
        work: { mode: "equation", start: `${a}(x^2 + ${c}) + ${b} = ${k}` },
        answers: [{ spec: { kind: "solutions", values: [String(s), String(-s)] } }],
        bugs: [{ misconception: "plusMinus", value: String(s) }],
        solution: [
          { latex: `fg(x) = f(${tex(g)}) = ${a}(${tex(g)}) ${signed(b)}`, note: "Build fg(x) first: g goes inside f." },
          { latex: `${a}(${tex(g)}) ${signed(b)} = ${k}` },
          { latex: `x^2 ${signed(c)} = ${s * s + c}`, value: `x^2 + ${c} = ${s * s + c}` },
          { latex: `x^2 = ${s * s}`, value: `x^2 = ${s * s}` },
          { latex: `x = \\pm ${s}`, note: "A square root has two answers: positive and negative.", value: `x = ${s} or x = ${-s}` },
        ],
      };
    }
    // Linear g: fg is linear, one answer.
    const m = r.pick([2, 3, -3]);
    const d = r.nz(-4, 4);
    const g = P(m, d);
    const x = r.int(-4, 4);
    const k = a * (m * x + d) + b;
    return {
      prompt: `$f(x) = ${tex(f)}$ and $g(x) = ${tex(g)}$. Solve $fg(x) = ${k}$.`,
      work: { mode: "equation", start: `${a}(${str(g)}) + ${b} = ${k}` },
      answers: [{ spec: { kind: "solutions", values: [String(x)] } }],
      bugs: (() => {
        // gf(x) = k instead: m(ax + b) + d = k
        const w = F(k - d - m * b, m * a);
        return w.eq(x) ? [] : [{ misconception: "compositeOrder", value: nS(w) }];
      })(),
      solution: [
        { latex: `fg(x) = ${a}(${tex(g)}) ${signed(b)} = ${tex(compose(f, g))}`, note: "g goes inside f." },
        { latex: `${tex(compose(f, g))} = ${k}`, value: `${str(compose(f, g))} = ${k}` },
        { latex: `x = ${x}`, value: `x = ${x}` },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 4: inverse functions
 * ====================================================================== */

const inverseExpr: Generator = {
  id: "fn.inv.expr",
  skill: "fn.inv",
  generate: (r) => {
    const v = r.int(0, 3);
    if (v === 0) {
      const a = r.pick([2, 3, 4, 5, -2, -3]);
      const b = r.nz(-7, 7);
      const inv = `(x - (${b}))/(${a})`;
      return {
        prompt: `$f(x) = ${tex(P(a, b))}$, $x \\in \\mathbb{R}$. Find $f^{-1}(x)$.`,
        answers: [{ spec: { kind: "expr", value: inv } }],
        bugs: [
          { misconception: "inverseReciprocal", value: `1/(${str(P(a, b))})` },
          { misconception: "inverseOrder", value: `x/(${a}) - (${b})` },
        ],
        solution: [
          { latex: `y = ${tex(P(a, b))}`, note: "Write y = f(x)." },
          { latex: `y ${signed(-b)} = ${tex(P(a, 0))}`, note: "Make x the subject: undo the last step first." },
          { latex: `x = \\dfrac{y ${signed(-b)}}{${a}}` },
          { latex: `f^{-1}(x) = \\dfrac{x ${signed(-b)}}{${a}}`, note: "Write it in terms of x.", value: inv },
        ],
      };
    }
    if (v === 1) {
      const a = r.pick([2, 3, 5]);
      const b = r.nz(-6, 6);
      const c = r.pick([2, 3, 4].filter((x) => x !== a));
      const inv = `(${c}x - (${b}))/${a}`;
      return {
        prompt: `$f(x) = \\dfrac{${tex(P(a, b))}}{${c}}$, $x \\in \\mathbb{R}$. Find $f^{-1}(x)$.`,
        answers: [{ spec: { kind: "expr", value: inv } }],
        bugs: [{ misconception: "inverseReciprocal", value: `${c}/(${str(P(a, b))})` }],
        solution: [
          { latex: `y = \\dfrac{${tex(P(a, b))}}{${c}}` },
          { latex: `${c}y = ${tex(P(a, b))}`, note: `Multiply both sides by ${c}.` },
          { latex: `x = \\dfrac{${c}y ${signed(-b)}}{${a}}` },
          { latex: `f^{-1}(x) = \\dfrac{${c}x ${signed(-b)}}{${a}}`, value: inv },
        ],
      };
    }
    if (v === 2) {
      const a = r.nz(-6, 6);
      const b = r.nz(-4, 4);
      const inv = `${a}/x + ${b}`;
      return {
        prompt: `$f(x) = \\dfrac{${a}}{${xMinus(b)}}$, $x \\ne ${b}$. Find $f^{-1}(x)$.`,
        answers: [{ spec: { kind: "expr", value: inv } }],
        bugs: [{ misconception: "inverseReciprocal", value: `(${xMinusS(b)})/${a}` }],
        solution: [
          { latex: `y = \\dfrac{${a}}{${xMinus(b)}}` },
          { latex: `y(${xMinus(b)}) = ${a}`, note: "Multiply both sides by the bottom." },
          { latex: `${xMinus(b)} = \\dfrac{${a}}{y}` },
          { latex: `f^{-1}(x) = \\dfrac{${a}}{x} ${signed(b)}`, value: inv },
        ],
      };
    }
    // f(x) = (ax + b)/(x + c): x appears twice, so collect the x terms.
    const a = r.pick([1, 2, 3, -2]);
    const c = r.nz(-4, 4);
    const b = r.pick([-5, -3, -1, 1, 2, 4, 5].filter((t) => t !== a * c));
    const inv = `(${b} - ${c}x)/(x - ${a})`;
    return {
      prompt: `$f(x) = \\dfrac{${tex(P(a, b))}}{${xMinus(-c)}}$, $x \\ne ${-c}$. Find $f^{-1}(x)$.`,
      answers: [{ spec: { kind: "expr", value: inv } }],
      bugs: [{ misconception: "inverseReciprocal", value: `(${xMinusS(-c)})/(${str(P(a, b))})` }],
      solution: [
        { latex: `y = \\dfrac{${tex(P(a, b))}}{${xMinus(-c)}}` },
        { latex: `y(${xMinus(-c)}) = ${tex(P(a, b))}`, note: "Multiply both sides by the bottom." },
        { latex: `xy ${signed(c)}y = ${tex(P(a, b))}`, note: "Expand." },
        { latex: `xy ${signed(-a)}x = ${b} ${c < 0 ? "+" : "-"} ${Math.abs(c) === 1 ? "" : Math.abs(c)}y`, note: "Collect the x terms on one side." },
        { latex: `x(y ${signed(-a)}) = ${b} ${c < 0 ? "+" : "-"} ${Math.abs(c) === 1 ? "" : Math.abs(c)}y`, note: "Factorise: x is outside the bracket." },
        { latex: `f^{-1}(x) = \\dfrac{${b} ${c < 0 ? "+" : "-"} ${Math.abs(c) === 1 ? "" : Math.abs(c)}x}{${xMinus(a)}}`, value: inv },
      ],
    };
  },
};

const inverseDomain: Generator = {
  id: "fn.inv.domain",
  skill: "fn.inv.domain",
  generate: (r) => {
    const [p, q] = r.distinct(2, -4, 5);
    if (r.next() < 0.5) {
      const f = P(1, -2 * p, p * p + q);
      const inv = `${p} + sqrt(${xMinusS(q)})`;
      return {
        prompt: `$f(x) = ${tex(f)}$, $x \\ge ${p}$. Find $f^{-1}(x)$ and state the domain of $f^{-1}$.`,
        answers: [
          { label: "f⁻¹(x)", spec: { kind: "expr", value: inv } },
          { label: "Domain of f⁻¹", spec: { kind: "relation", value: `x >= ${q}` }, emptyHint: "inverseDomain" },
        ],
        bugs: [
          { misconception: "inverseSqrtSign", answer: 0, value: `${p} - sqrt(${xMinusS(q)})` },
          { misconception: "inverseDomain", answer: 1, value: `x >= ${p}` },
        ],
        solution: [
          { latex: `f(x) = (${xMinus(p)})^2 ${signed(q)}`, note: "Complete the square first." },
          { latex: `y = (${xMinus(p)})^2 ${signed(q)} \\Rightarrow (${xMinus(p)})^2 = y ${signed(-q)}` },
          { latex: `x ${signed(-p)} = +\\sqrt{y ${signed(-q)}}`, note: `Take the + root: the domain says $x \\ge ${p}$, so $x ${signed(-p)} \\ge 0$.` },
          { latex: `f^{-1}(x) = ${p === 0 ? "" : `${p} + `}\\sqrt{${xMinus(q)}}`, value: inv },
          { latex: `\\text{Range of } f: f(x) \\ge ${q} \\Rightarrow \\text{domain of } f^{-1}: x \\ge ${q}`, note: "The domain of the inverse is the range of f.", value: `x >= ${q}` },
        ],
      };
    }
    if (r.next() < 0.5) {
      const inv = `(${xMinusS(q)})^2 + ${p}`;
      return {
        prompt: `$f(x) = \\sqrt{${xMinus(p)}} ${signed(q)}$, $x \\ge ${p}$. Find $f^{-1}(x)$ and state the domain of $f^{-1}$.`,
        answers: [
          { label: "f⁻¹(x)", spec: { kind: "expr", value: inv } },
          { label: "Domain of f⁻¹", spec: { kind: "relation", value: `x >= ${q}` }, emptyHint: "inverseDomain" },
        ],
        bugs: [{ misconception: "inverseDomain", answer: 1, value: `x >= ${p}` }],
        solution: [
          { latex: `y = \\sqrt{${xMinus(p)}} ${signed(q)}` },
          { latex: `y ${signed(-q)} = \\sqrt{${xMinus(p)}}`, note: "Get the square root on its own." },
          { latex: `(y ${signed(-q)})^2 = ${xMinus(p)}`, note: "Square both sides." },
          { latex: `f^{-1}(x) = (${xMinus(q)})^2 ${signed(p)}`, value: inv },
          { latex: `\\sqrt{${xMinus(p)}} \\ge 0 \\Rightarrow f(x) \\ge ${q} \\Rightarrow \\text{domain of } f^{-1}: x \\ge ${q}`, note: "The domain of the inverse is the range of f.", value: `x >= ${q}` },
        ],
      };
    }
    const a = r.nz(-6, 6);
    return {
      prompt: `$f(x) = \\dfrac{${a}}{${xMinus(p)}}$, $x \\ne ${p}$. Find $f^{-1}(x)$ and state the domain of $f^{-1}$.`,
      answers: [
        { label: "f⁻¹(x)", spec: { kind: "expr", value: `${a}/x + ${p}` } },
        { label: "Domain of f⁻¹", spec: { kind: "relation", value: "x != 0" }, emptyHint: "inverseDomain" },
      ],
      bugs: [
        { misconception: "inverseReciprocal", answer: 0, value: `(${xMinusS(p)})/${a}` },
        ...(p === 0 ? [] : [{ misconception: "inverseDomain", answer: 1, value: `x != ${p}` }]),
      ],
      solution: [
        { latex: `y = \\dfrac{${a}}{${xMinus(p)}} \\Rightarrow ${xMinus(p)} = \\dfrac{${a}}{y}` },
        { latex: `f^{-1}(x) = \\dfrac{${a}}{x} ${signed(p)}`, value: `${a}/x + ${p}` },
        { latex: `f(x) \\text{ is never } 0 \\Rightarrow \\text{domain of } f^{-1}: x \\ne 0`, note: "A fraction with a number on top is never zero, so 0 is not in the range of f.", value: "x != 0" },
      ],
    };
  },
};

/** For "which has an inverse?": [label LaTeX, expression to draw, one-to-one?]. */
function functionBank(r: Rng): [string, string, boolean][] {
  const k = r.nz(-2, 2);
  const h = r.nz(-2, 2);
  return [
    [`f(x) = x^2 ${signed(k)}, \\; x \\in \\mathbb{R}`, `x^2 + ${k}`, false],
    [`f(x) = |${xMinus(h)}|, \\; x \\in \\mathbb{R}`, `|${xMinusS(h)}|`, false],
    [`f(x) = (${xMinus(h)})^2, \\; x \\in \\mathbb{R}`, `(${xMinusS(h)})^2`, false],
    [`f(x) = x^4 ${signed(k)}, \\; x \\in \\mathbb{R}`, `x^4 + ${k}`, false],
    [`f(x) = ${tex(P(r.pick([2, -2, 3]), k))}, \\; x \\in \\mathbb{R}`, "", true],
    [`f(x) = x^3 ${signed(k)}, \\; x \\in \\mathbb{R}`, `x^3 + ${k}`, true],
    [`f(x) = (${xMinus(h)})^2, \\; x \\ge ${h}`, `(sqrt(${xMinusS(h)}))^4`, true],
    [`f(x) = \\sqrt{x} ${signed(k)}, \\; x \\ge 0`, `sqrt(x) + ${k}`, true],
  ];
}

const inverseExists: Generator = {
  id: "fn.inv.exists",
  skill: "fn.inv.exists",
  generate: (r) => {
    const bank = functionBank(r);
    const yes = r.pick(bank.filter((b) => b[2]));
    const no = r.shuffle(bank.filter((b) => !b[2])).slice(0, 3);
    const options = r.shuffle([yes, ...no]);
    // The straight line's expression is read back from its label.
    const exprOfOption = (o: (typeof options)[number]) => o[1] || o[0].replace(/^f\(x\) = /, "").replace(/, .*$/, "").replace(/(\d)x/, "$1*x");
    return {
      prompt: "Only one of these functions has an inverse. Which one?",
      answers: [{ spec: { kind: "choice", options: options.map((o) => `$${o[0]}$`), answer: options.indexOf(yes) } }],
      optionGraphs: options.map((o) => ({ x: [-4, 4], y: [-4, 6], curves: [{ expr: exprOfOption(o) }] })),
      bugs: options.map((o, i) => (o === yes ? null : { misconception: "notOneToOne", value: String(i) })).filter((b) => b !== null),
      solution: [
        { latex: "\\text{A function has an inverse only if it is one-to-one}", note: "Each output must come from exactly one input, or the inverse would not know which input to give back." },
        { latex: "\\text{Horizontal line test: no horizontal line meets the graph twice}" },
        { latex: `${yes[0]} \\text{ is one-to-one}`, note: no.some((o) => o[0].includes("x^2")) ? "Squaring gives the same output for x and −x, so x² on all of ℝ is many-to-one." : undefined },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 5: the graph of the inverse
 * ====================================================================== */

const inverseGraph: Generator = {
  id: "fn.inv.graph",
  skill: "fn.inv.graph",
  generate: (r) => {
    const [a, b] = r.distinct(2, -3, 4);
    const sq = r.next() < 0.5;
    const fTex = sq ? `\\sqrt{${xMinus(a)}} ${signed(b)}` : `(${xMinus(a)})^2 ${signed(b)}`;
    const fStr = sq ? `sqrt(${xMinusS(a)}) + ${b}` : `(${xMinusS(a)})^2 + ${b}`;
    const lo = Math.min(a, b) - 2;
    const hi = Math.max(a, b) + 6;
    return {
      prompt: `$f(x) = ${fTex}$, $x \\ge ${a}$. The graph shows $y = f(x)$ and the line $y = x$. State the domain and the range of $f^{-1}$.`,
      graph: { x: [lo, hi], y: [lo, hi], curves: [{ expr: sq ? fStr : `(sqrt(${xMinusS(a)}))^4 + ${b}` }, { expr: "x", faint: true }], points: [{ x: a, y: b, label: `(${a}, ${b})` }] },
      answers: [
        { label: "Domain of f⁻¹", spec: { kind: "relation", value: `x >= ${b}` }, emptyHint: "inverseDomain" },
        { label: "Range of f⁻¹", spec: { kind: "range", value: `y >= ${a}` } },
      ],
      bugs: [
        { misconception: "inverseDomain", answer: 0, value: `x >= ${a}` },
        { misconception: "inverseDomain", answer: 1, value: `y >= ${b}` },
      ],
      solution: [
        { latex: `\\text{Domain of } f: x \\ge ${a}, \\quad \\text{range of } f: f(x) \\ge ${b}`, note: `The curve starts at $(${a}, ${b})$ and goes up.` },
        { latex: "\\text{Reflecting in } y = x \\text{ swaps x and y}", note: "So domain and range swap over." },
        { latex: `\\text{Domain of } f^{-1}: x \\ge ${b}`, value: `x >= ${b}` },
        { latex: `\\text{Range of } f^{-1}: f^{-1}(x) \\ge ${a}`, value: `y >= ${a}` },
      ],
    };
  },
};

const inverseSolve: Generator = {
  id: "fn.inv.solve",
  skill: "fn.inv.solve",
  generate: (r) => {
    if (r.next() < 0.5) {
      const a = r.pick([2, 3, 4, -1, -2, -3]);
      const x0 = r.nz(-5, 5);
      const b = x0 * (1 - a);
      return {
        prompt: `$f(x) = ${tex(P(a, b))}$. Solve $f(x) = f^{-1}(x)$.`,
        work: { mode: "equation", start: `${str(P(a, b))} = x` },
        answers: [{ spec: { kind: "solutions", values: [String(x0)] } }],
        solution: [
          { latex: "f(x) = f^{-1}(x) \\text{ where } y = f(x) \\text{ meets } y = x", note: "The graphs of f and f⁻¹ are reflections in y = x, so they meet on that line." },
          { latex: `${tex(P(a, b))} = x`, note: "So solve f(x) = x: much easier than finding f⁻¹ first." },
          { latex: `${tex(P(a - 1, 0))} = ${-b}`, value: `${a - 1}x = ${-b}` },
          { latex: `x = ${x0}`, value: `x = ${x0}` },
        ],
      };
    }
    const s = r.int(2, 5);
    const k = s * s - s;
    return {
      prompt: `$f(x) = x^2 - ${k}$, $x \\ge 0$. Solve $f(x) = f^{-1}(x)$.`,
      // No line-by-line checking here: the last step uses the domain, which the equation alone cannot know.
      answers: [{ spec: { kind: "solutions", values: [String(s)] } }],
      bugs: [{ misconception: "checkDomain", value: `${s};${1 - s}` }],
      solution: [
        { latex: "f(x) = f^{-1}(x) \\Rightarrow f(x) = x", note: "f and f⁻¹ meet on the line y = x." },
        { latex: `x^2 - x - ${k} = 0`, value: `x^2 - x - ${k} = 0` },
        { latex: `(${xMinus(s)})(${xMinus(1 - s)}) = 0`, value: `(x - ${s})(x - (${1 - s})) = 0` },
        { latex: `x = ${s} \\text{ or } x = ${1 - s}`, note: `Check the domain: $x \\ge 0$, so reject $x = ${1 - s}$.` },
        { latex: `x = ${s}`, value: `x = ${s}` },
      ],
    };
  },
};

/* ======================================================================
 * Exam questions, lessons 2–5
 * ====================================================================== */

const examBasics: ExamGenerator = {
  id: "exam.fn.basics",
  skill: "fn.map.graph",
  generate: (r) => {
    const s = r.int(1, 4);
    const c = r.int(-5, 5);
    const f = P(1, 0, c);
    const k = r.int(2, 5);
    const v = s * s + c;
    return {
      model: [[String(k * k + c), String(k * k + c)], [`x = ${s} or x = ${-s}`]],
      intro: `The function f is defined by $f: x \\mapsto ${tex(f)}$, $x \\in \\mathbb{R}$.`,
      parts: [
        {
          label: "(a)",
          prompt: `Find f(${k}) and f(${-k}).`,
          inputs: [{ label: `f(${k}) =` }, { label: `f(${-k}) =` }],
          marks: [
            { type: "B", text: String(k * k + c), check: (m) => close(m.num(0, 0), k * k + c) },
            { type: "B", text: `${k * k + c} (with brackets: (${-k})² = ${k * k})`, check: (m) => close(m.num(0, 1), k * k + c) },
          ],
          solution: [
            { latex: `f(${k}) = ${k}^2 ${signed(c)} = ${k * k + c}`, mark: "B1" },
            { latex: `f(${-k}) = (${-k})^2 ${signed(c)} = ${k * k + c}`, mark: "B1" },
          ],
        },
        {
          label: "(b)",
          prompt: `Solve f(x) = ${v}. Hence explain why f is not one-to-one.`,
          inputs: [{ label: "x =" }],
          marks: [
            { type: "M", text: `x² = ${s * s}`, check: (m) => valuesOf(m.raw(1)).some((t) => Math.abs(t) === s) },
            { type: "A", text: `x = ±${s}: two inputs give the same output, so f is many-to-one`, check: (m) => solOk(m.raw(1), [String(s), String(-s)]) },
          ],
          solution: [
            { latex: `x^2 ${signed(c)} = ${v} \\Rightarrow x^2 = ${s * s}`, mark: "M1" },
            { latex: `x = \\pm ${s}: \\text{ two inputs, one output} \\Rightarrow \\text{many-to-one}`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

const examRange: ExamGenerator = {
  id: "exam.fn.range",
  skill: "fn.range",
  generate: (r) => {
    const [p, q] = r.distinct(2, -4, 5);
    const s = r.int(1, 4);
    const f = P(1, -2 * p, p * p + q);
    const k = q + s * s;
    const roots = [p - s, p + s];
    return {
      model: [[String(p), String(q)], [`f(x) >= ${q}`], [`x = ${roots[0]} or x = ${roots[1]}`]],
      intro: `The function $f$ is defined by $f(x) = ${tex(f)}$, $x \\in \\mathbb{R}$.`,
      parts: [
        {
          label: "(a)",
          prompt: "Express f(x) in the form (x − a)² + b, where a and b are constants.",
          inputs: [{ label: "a" }, { label: "b" }],
          marks: [
            { type: "B", text: `a = ${p}`, check: (m) => close(m.num(0, 0), p) },
            { type: "B", text: `b = ${q}`, check: (m) => close(m.num(0, 1), q) },
          ],
          solution: [{ latex: `f(x) = (${xMinus(p)})^2 - ${p * p} + ${p * p + q} = (${xMinus(p)})^2 ${signed(q)}`, mark: "B1 B1" }],
        },
        {
          label: "(b)",
          prompt: "Hence state the range of f.",
          inputs: [{ label: "Range" }],
          marks: [{ type: "B", text: `f(x) ≥ ${q} (follow through their b)`, ft: true, check: (m) => rangeOk(m.raw(1), `y >= ${q}`) || (m.num(0, 1) !== null && rangeOk(m.raw(1), `y >= ${m.num(0, 1)}`)) }],
          solution: [{ latex: `(${xMinus(p)})^2 \\ge 0 \\Rightarrow f(x) \\ge ${q}`, mark: "B1" }],
        },
        {
          label: "(c)",
          prompt: `Solve the equation f(x) = ${k}.`,
          inputs: [{ label: "x =" }],
          marks: [
            { type: "M", text: `(x − ${p})² = ${s * s}, taking square roots (one correct value)`, check: (m) => valuesOf(m.raw(2)).some((v) => roots.includes(v)) },
            { type: "A", text: `x = ${roots[0]} or x = ${roots[1]}`, check: (m) => solOk(m.raw(2), roots.map(String)) },
          ],
          solution: [
            { latex: `(${xMinus(p)})^2 ${signed(q)} = ${k} \\Rightarrow (${xMinus(p)})^2 = ${s * s}`, mark: "M1" },
            { latex: `${xMinus(p)} = \\pm ${s} \\Rightarrow x = ${roots[0]} \\text{ or } x = ${roots[1]}`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

const examComposite: ExamGenerator = {
  id: "exam.fn.composite",
  skill: "fn.comp",
  generate: (r) => {
    const a = r.pick([2, 3, -2]);
    const b = r.int(-5, 5);
    const c = r.int(-4, 4);
    const f = P(a, b);
    const g = P(1, 0, c);
    const fg = compose(f, g);
    const k0 = r.nz(-3, 3);
    const gfk = g.at(f.at(k0)).value();
    const s = r.int(1, 4);
    const k = fg.at(s).value();
    return {
      model: [[str(fg)], [String(gfk)], [`x = ${s} or x = ${-s}`]],
      intro: `The functions f and g are defined by $f(x) = ${tex(f)}$, $x \\in \\mathbb{R}$, and $g(x) = ${tex(g)}$, $x \\in \\mathbb{R}$.`,
      parts: [
        {
          label: "(a)",
          prompt: "Find fg(x), simplifying your answer.",
          inputs: [{ label: "fg(x) =" }],
          marks: [
            { type: "M", text: `Substitute g(x) into f: ${a}(x² ${c < 0 ? "−" : "+"} ${Math.abs(c)}) ${b < 0 ? "−" : "+"} ${Math.abs(b)}`, check: (m) => upToConstant(m.raw(0), str(fg)) },
            { type: "A", text: `fg(x) = ${str(fg)}`, check: (m) => exprOk(m.raw(0), str(fg)) },
          ],
          solution: [
            { latex: `fg(x) = f(${tex(g)}) = ${a}(${tex(g)}) ${signed(b)}`, mark: "M1" },
            { latex: `= ${tex(fg)}`, mark: "A1" },
          ],
        },
        {
          label: "(b)",
          prompt: `Find the value of gf(${k0}).`,
          inputs: [{ label: "gf(" + k0 + ") =" }],
          marks: [{ type: "B", text: String(gfk), check: (m) => close(m.num(1), gfk) }],
          solution: [{ latex: `f(${k0}) = ${f.at(k0).value()}, \\quad g(${f.at(k0).value()}) = ${gfk}`, mark: "B1" }],
        },
        {
          label: "(c)",
          prompt: `Solve fg(x) = ${k}.`,
          inputs: [{ label: "x =" }],
          marks: [
            {
              type: "M",
              text: "Set their fg(x) equal to " + k + " and solve",
              ft: true,
              check: (m) => {
                const vals = valuesOf(m.raw(2));
                const e = exprOf(m.raw(0));
                return vals.length > 0 && (vals.some((v) => Math.abs(v) === s) || (!!e && vals.every((v) => Math.abs(evaluate(e, { x: v }) - k) < 1e-6)));
              },
            },
            { type: "A", text: `x = ±${s}`, check: (m) => solOk(m.raw(2), [String(s), String(-s)]) },
          ],
          solution: [
            { latex: `${tex(fg)} = ${k} \\Rightarrow x^2 = ${s * s}`, mark: "M1" },
            { latex: `x = \\pm ${s}`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

const examInverse: ExamGenerator = {
  id: "exam.fn.inverse",
  skill: "fn.inv.domain",
  generate: (r) => {
    const [p, q] = r.distinct(2, -4, 5);
    const f = P(1, -2 * p, p * p + q);
    const inv = `${p} + sqrt(${xMinusS(q)})`;
    return {
      model: [[`f(x) >= ${q}`], [inv], [`x >= ${q}`]],
      intro: `The function f is defined by $f(x) = ${tex(f)}$, $x \\ge ${p}$.`,
      parts: [
        {
          label: "(a)",
          prompt: "Find the range of f.",
          inputs: [{ label: "Range" }],
          marks: [{ type: "B", text: `f(x) ≥ ${q}`, check: (m) => rangeOk(m.raw(0), `y >= ${q}`) }],
          solution: [{ latex: `f(x) = (${xMinus(p)})^2 ${signed(q)} \\ge ${q}`, mark: "B1" }],
        },
        {
          label: "(b)",
          prompt: "Find an expression for f⁻¹(x).",
          inputs: [{ label: "f⁻¹(x) =" }],
          marks: [
            { type: "M", text: "Complete the square, swap x and y, rearrange (either square root)", check: (m) => exprOk(m.raw(1), inv) || exprOk(m.raw(1), `${p} - sqrt(${xMinusS(q)})`) },
            { type: "A", text: `f⁻¹(x) = ${p} + √(x ${q < 0 ? "+" : "−"} ${Math.abs(q)}) (positive root only)`, check: (m) => exprOk(m.raw(1), inv) },
          ],
          solution: [
            { latex: `y = (${xMinus(p)})^2 ${signed(q)} \\Rightarrow x = ${p} \\pm \\sqrt{y ${signed(-q)}}`, mark: "M1" },
            { latex: `f^{-1}(x) = ${p} + \\sqrt{${xMinus(q)}} \\text{ since } x \\ge ${p}`, mark: "A1" },
          ],
        },
        {
          label: "(c)",
          prompt: "State the domain of f⁻¹.",
          inputs: [{ label: "Domain" }],
          marks: [{ type: "B", text: `x ≥ ${q} (follow through their range)`, ft: true, check: (m) => relOk(m.raw(2), `x >= ${q}`) || (!!m.raw(0) && relOk(m.raw(2), m.raw(0).replace(/f\s*\(\s*x\s*\)|y/g, "x"))) }],
          solution: [{ latex: `\\text{Domain of } f^{-1} = \\text{range of } f: x \\ge ${q}`, mark: "B1" }],
        },
      ],
    };
  },
};

const examInverseLinear: ExamGenerator = {
  id: "exam.fn.inverseLine",
  skill: "fn.inv.solve",
  generate: (r) => {
    const a = r.pick([2, 3, 4, -2, -3]);
    const x0 = r.nz(-5, 5);
    const b = x0 * (1 - a);
    const inv = `(x - (${b}))/(${a})`;
    return {
      model: [[inv], [`x = ${x0}`]],
      intro: `The function f is defined by $f(x) = ${tex(P(a, b))}$, $x \\in \\mathbb{R}$.`,
      parts: [
        {
          label: "(a)",
          prompt: "Find f⁻¹(x).",
          inputs: [{ label: "f⁻¹(x) =" }],
          marks: [
            { type: "M", text: "Make x the subject of y = f(x)", check: (m) => upToConstant(m.raw(0), inv) },
            { type: "A", text: `f⁻¹(x) = (x ${b < 0 ? "+" : "−"} ${Math.abs(b)})/${a}`, check: (m) => exprOk(m.raw(0), inv) },
          ],
          solution: [
            { latex: `y = ${tex(P(a, b))} \\Rightarrow x = \\dfrac{y ${signed(-b)}}{${a}}`, mark: "M1" },
            { latex: `f^{-1}(x) = \\dfrac{x ${signed(-b)}}{${a}}`, mark: "A1" },
          ],
        },
        {
          label: "(b)",
          prompt: "Solve f(x) = f⁻¹(x).",
          inputs: [{ label: "x =" }],
          marks: [
            {
              type: "M",
              text: "Solve f(x) = x, or f(x) = their f⁻¹(x)",
              ft: true,
              check: (m) => {
                const v = valuesOf(m.raw(1));
                const e = exprOf(m.raw(0));
                return v.length === 1 && (v[0] === x0 || (!!e && Math.abs(a * v[0] + b - evaluate(e, { x: v[0] })) < 1e-6));
              },
            },
            { type: "A", text: `x = ${x0}`, check: (m) => solOk(m.raw(1), [String(x0)]) },
          ],
          solution: [
            { latex: `${tex(P(a, b))} = x \\Rightarrow ${tex(P(a - 1, 0))} = ${-b}`, mark: "M1" },
            { latex: `x = ${x0}`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

export const generators: Generator[] = [
  ...algebraGenerators.filter((g) => PREREQUISITES.includes(g.id)),
  solveLinear,
  readGraph,
  intervals,
  plotPoint,
  mapping,
  lineTest,
  evaluateFn,
  domain,
  range,
  compositeEval,
  compositeExpr,
  compositeSolve,
  inverseExpr,
  inverseDomain,
  inverseExists,
  inverseGraph,
  inverseSolve,
  ...generators2,
];
export const examGenerators: ExamGenerator[] = [examBasics, examRange, examComposite, examInverse, examInverseLinear, ...examGenerators2];
