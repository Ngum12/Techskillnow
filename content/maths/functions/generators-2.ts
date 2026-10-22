/**
 * Functions question generators, lessons 6–10: graphs to know, transformations (translations, stretches,
 * reflections, combined), graph sketching including modulus graphs, and the topic review exam.
 * Same rules as ./generators.ts.
 */
import { Frac } from "@/lib/maths/frac";
import { inBrackets, signed } from "@/lib/maths/build";
import { describeSingle } from "@/lib/maths/functions";
import type { ExamGenerator, Generator, GraphSpec } from "@/lib/maths/types";
import { F, P, close, compose, exprOk, nL, nS, relOk, solOk, str, tex, upToConstant, vec, windowFor, xMinus, xMinusS } from "./helpers";

/* ======================================================================
 * Lesson 6: graphs every student must know
 * ====================================================================== */

/** `sibling`: the graph it is most often confused with. */
type Known = { tex: string; expr: string; sibling: number };
const KNOWN: Known[] = [
  { tex: "y = x", expr: "x", sibling: 2 },
  { tex: "y = x^2", expr: "x^2", sibling: 6 },
  { tex: "y = x^3", expr: "x^3", sibling: 0 },
  { tex: "y = \\dfrac{1}{x}", expr: "1/x", sibling: 4 },
  { tex: "y = \\dfrac{1}{x^2}", expr: "1/x^2", sibling: 3 },
  { tex: "y = \\sqrt{x}", expr: "sqrt(x)", sibling: 1 },
  { tex: "y = |x|", expr: "|x|", sibling: 1 },
];

const identify: Generator = {
  id: "fn.graph.identify",
  skill: "fn.graph.know",
  generate: (r) => {
    const i = r.int(0, KNOWN.length - 1);
    const k = r.int(-2, 2);
    const shift = (e: string) => (k === 0 ? e : `${e} + ${k}`);
    const label = (t: string) => (k === 0 ? t : `${t} ${signed(k)}`);
    const others = r.shuffle(KNOWN.map((_, j) => j).filter((j) => j !== i && j !== KNOWN[i].sibling)).slice(0, 2);
    const picks = r.shuffle([i, KNOWN[i].sibling, ...others]);
    const answer = picks.indexOf(i);
    const sib = picks.indexOf(KNOWN[i].sibling);
    const graphOf = (j: number): GraphSpec => ({ x: [-4, 4], y: [-4 + Math.min(k, 0), 4 + Math.max(k, 0)], curves: [{ expr: shift(KNOWN[j].expr) }], asymptotes: KNOWN[j].expr.startsWith("1/") ? [{ x: 0 }, { y: k }] : undefined });
    const fromGraph = r.next() < 0.5;
    const feature = [
      "a straight line through the origin with gradient 1",
      "a U shape with its minimum at the origin, symmetrical about the y-axis",
      "an S shape through the origin: down on the left, up on the right",
      "two branches in opposite quadrants, with asymptotes x = 0 and y = 0",
      "two branches both above the x-axis, symmetrical about the y-axis, with asymptotes x = 0 and y = 0",
      "half a sideways parabola, starting at the origin, only for x ≥ 0",
      "a V shape with its vertex at the origin",
    ][i];
    return {
      prompt: fromGraph ? `The graph shows a curve every student must know${k ? ", moved up or down" : ""}. Which equation does it have?` : `Which graph shows $${label(KNOWN[i].tex)}$?`,
      graph: fromGraph ? graphOf(i) : undefined,
      answers: [{ spec: { kind: "choice", options: fromGraph ? picks.map((j) => `$${label(KNOWN[j].tex)}$`) : picks.map((_, n) => `Graph ${"ABCD"[n]}`), answer } }],
      optionGraphs: fromGraph ? undefined : picks.map(graphOf),
      bugs: [{ misconception: "graphShape", value: String(sib) }],
      solution: [
        { latex: `${label(KNOWN[i].tex)}`, note: `Look for the key features: ${feature}.` },
        ...(k ? [{ latex: `${signed(k)} \\text{ moves the whole graph ${k > 0 ? "up" : "down"} by } ${Math.abs(k)}`, note: "Adding a number outside f moves the graph vertically." }] : []),
      ],
    };
  },
};

const asymptotes: Generator = {
  id: "fn.graph.asymptotes",
  skill: "fn.graph.features",
  generate: (r) => {
    const a = r.pick([1, 2, 3, 4, -1, -2, -6]);
    const p = r.nz(-4, 4);
    const q = r.nz(-3, 3);
    const squared = r.next() < 0.3;
    const yInt = F(a, squared ? p * p : -p).add(q);
    return {
      prompt: `For the curve $y = \\dfrac{${a}}{${squared ? `(${xMinus(p)})^2` : xMinus(p)}} ${signed(q)}$, write down the equations of the asymptotes and find where the curve crosses the y-axis.`,
      answers: [
        { label: "Vertical asymptote: x =", spec: { kind: "number", value: String(p) } },
        { label: "Horizontal asymptote: y =", spec: { kind: "number", value: String(q) } },
        { label: "y-intercept: y =", spec: { kind: "number", value: nS(yInt) } },
      ],
      bugs: [
        { misconception: "asymptoteSign", answer: 0, value: String(-p) },
        { misconception: "asymptoteSign", answer: 1, value: String(-q) },
      ],
      solution: [
        { latex: `${xMinus(p)} = 0 \\Rightarrow x = ${p}`, note: "Vertical asymptote: the x-value that makes the bottom zero.", value: String(p) },
        { latex: `\\text{As } x \\to \\pm\\infty, \\; \\dfrac{${a}}{${squared ? `(${xMinus(p)})^2` : xMinus(p)}} \\to 0, \\text{ so } y \\to ${q}`, note: "Horizontal asymptote: what y gets close to for very large x.", value: String(q) },
        { latex: `x = 0: \\; y = \\dfrac{${a}}{${squared ? `${inBrackets(-p)}^2` : -p}} ${signed(q)} = ${nL(yInt)}`, note: "Put x = 0 for the y-intercept.", value: nS(yInt) },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 7: translations and stretches
 * ====================================================================== */

type TKind = "up" | "inside" | "stretchY" | "stretchX";

/** The transformed curve written in terms of f, e.g. "f(x + 3)", "2f(x)", "f(3x)". */
const written = (kind: TKind, a: number) =>
  kind === "up" ? `f(x) ${signed(a)}` : kind === "inside" ? `f(x ${signed(a)})` : kind === "stretchY" ? `${a}f(x)` : `f(${a}x)`;

/** Image of (p, q) under one transformation. */
function imageOf(kind: TKind, a: number, p: number, q: number): [Frac, Frac] {
  return kind === "up" ? [F(p), F(q + a)] : kind === "inside" ? [F(p - a), F(q)] : kind === "stretchY" ? [F(p), F(a * q)] : [F(p, a), F(q)];
}

const transformPoint: Generator = {
  id: "fn.tr.point",
  skill: "fn.tr",
  generate: (r) => {
    const kind = r.pick(["up", "inside", "stretchY", "stretchX"] as const);
    const a = kind === "stretchX" || kind === "stretchY" ? r.pick([2, 3, 4]) : r.nz(-5, 5);
    const p = kind === "stretchX" ? a * r.nz(-3, 3) : r.nz(-5, 5);
    const q = r.nz(-6, 6);
    const [x, y] = imageOf(kind, a, p, q);
    const bugs =
      kind === "inside"
        ? [{ misconception: "translateDirection", answer: 0, value: String(p + a) }]
        : kind === "stretchX"
          ? [{ misconception: "stretchFactor", answer: 0, value: String(p * a) }]
          : kind === "up"
            ? [{ misconception: "wrongAxis", answer: 0, value: String(p + a) }]
            : [{ misconception: "wrongAxis", answer: 0, value: nS(F(p, a)) }];
    const note = {
      up: `Adding ${a} outside f changes the OUTPUT: y goes ${a > 0 ? "up" : "down"} by ${Math.abs(a)}. x stays the same.`,
      inside: `Adding ${a} inside the bracket changes the INPUT: the graph moves ${a > 0 ? "LEFT" : "RIGHT"} by ${Math.abs(a)}, the opposite of the sign.`,
      stretchY: `Multiplying outside f multiplies every y-coordinate by ${a}. x stays the same.`,
      stretchX: `Multiplying x inside the bracket squashes the graph: every x-coordinate is DIVIDED by ${a}.`,
    }[kind];
    return {
      prompt: `The point $P(${p}, ${q})$ lies on the curve $y = f(x)$. Find the coordinates of the point that $P$ maps to on the curve $y = ${written(kind, a)}$.`,
      answers: [
        { label: "x-coordinate", spec: { kind: "number", value: nS(x) } },
        { label: "y-coordinate", spec: { kind: "number", value: nS(y) } },
      ],
      bugs,
      solution: [
        { latex: `y = ${written(kind, a)}`, note: `${describeTex(kind, a)}. ${note}` },
        { latex: `(${p}, ${q}) \\to (${nL(x)}, ${nL(y)})`, value: nS(x) },
      ],
    };
  },
};

/** Exam wording, with a column vector for translations. */
function describeTex(kind: TKind | "reflectX" | "reflectY", a = 0): string {
  if (kind === "up") return `Translation by the vector $${vec(0, a)}$`;
  if (kind === "inside") return `Translation by the vector $${vec(-a, 0)}$`;
  return describeSingle(kind, a).replace(/scale factor (\d+)\/(\d+)/, "scale factor $\\tfrac{$1}{$2}$");
}

const transformDescribe: Generator = {
  id: "fn.tr.describe",
  skill: "fn.tr.describe",
  generate: (r) => {
    const kind = r.pick(["up", "inside", "stretchY", "stretchX"] as const);
    const a = kind === "stretchX" || kind === "stretchY" ? r.pick([2, 3, 4]) : r.nz(-5, 5);
    const correct = describeTex(kind, a);
    // Wrong options: the classic mistakes, each tied to its misconception.
    const wrong: [string, string][] =
      kind === "inside"
        ? [[describeTex("inside", -a), "translateDirection"], [describeTex("up", a), "wrongAxis"], [describeTex("up", -a), "wrongAxis"]]
        : kind === "up"
          ? [[describeTex("up", -a), "translateDirection"], [describeTex("inside", a), "wrongAxis"], [describeTex("inside", -a), "wrongAxis"]]
          : kind === "stretchX"
            ? [[`Stretch parallel to the x-axis, scale factor ${a}`, "stretchFactor"], [`Stretch parallel to the y-axis, scale factor ${a}`, "wrongAxis"], [describeTex("stretchY", 1 / a), "wrongAxis"]]
            : [[`Stretch parallel to the y-axis, scale factor $\\tfrac{1}{${a}}$`, "stretchFactor"], [`Stretch parallel to the x-axis, scale factor ${a}`, "wrongAxis"], [describeTex("stretchX", a), "wrongAxis"]];
    const options = r.shuffle([correct, ...wrong.map((w) => w[0])]);
    return {
      prompt: `Describe fully the single transformation that maps the graph of $y = f(x)$ onto the graph of $y = ${written(kind, a)}$.`,
      answers: [{ spec: { kind: "choice", options, answer: options.indexOf(correct) } }],
      bugs: wrong.map(([o, m]) => ({ misconception: m, value: String(options.indexOf(o)) })),
      solution: [
        { latex: kind === "up" || kind === "stretchY" ? "\\text{The change is OUTSIDE f: it acts on y, as you expect}" : "\\text{The change is INSIDE the bracket: it acts on x, the opposite way}", note: kind === "inside" ? `x ${signed(a)} moves the graph ${a > 0 ? "left" : "right"}.` : kind === "stretchX" ? `${a}x makes x-values ${a} times smaller: scale factor 1/${a}.` : undefined },
        { latex: `\\text{${describeSingle(kind, a)}}`, note: "A full description names the transformation AND gives its vector, or its direction and scale factor." },
      ],
    };
  },
};

const transformEquation: Generator = {
  id: "fn.tr.equation",
  skill: "fn.tr.equation",
  generate: (r) => {
    const [b, c] = [r.int(-5, 5), r.int(-6, 6)];
    const f = P(1, b, c);
    const kind = r.pick(["inside", "up", "stretchY"] as const);
    const h = r.nz(-3, 3);
    if (kind === "inside") {
      // Translation by (h, 0): y = f(x − h).
      const ans = compose(f, P(1, -h));
      const wrong = compose(f, P(1, h));
      return {
        prompt: `$f(x) = ${tex(f)}$. The graph of $y = f(x)$ is translated by the vector $${vec(h, 0)}$. Find the equation of the new graph in the form $y = ax^2 + bx + c$.`,
        work: { mode: "expr", start: `(${xMinusS(h)})^2 + ${b}(${xMinusS(h)}) + ${c}` },
        answers: [{ spec: { kind: "expr", value: str(ans), form: "expanded" } }],
        bugs: wrong.eq(ans) ? [] : [{ misconception: "translateDirection", value: str(wrong) }],
        solution: [
          { latex: `\\text{Translation } ${vec(h, 0)} \\Rightarrow y = f(${xMinus(h)})`, note: `Moving ${h > 0 ? "right" : "left"} by ${Math.abs(h)} means replacing x by $${xMinus(h)}$: the sign inside is the opposite.` },
          { latex: `= (${xMinus(h)})^2 ${b ? `${signed(b)}(${xMinus(h)})` : ""} ${signed(c)}`, value: `(${xMinusS(h)})^2 + ${b}(${xMinusS(h)}) + ${c}` },
          { latex: `= ${tex(ans)}`, value: str(ans) },
        ],
      };
    }
    if (kind === "up") {
      const ans = f.add(P(h));
      return {
        prompt: `$f(x) = ${tex(f)}$. The graph of $y = f(x)$ is translated by the vector $${vec(0, h)}$. Find the equation of the new graph.`,
        work: { mode: "expr", start: `${str(f)} + ${h}` },
        answers: [{ spec: { kind: "expr", value: str(ans), form: "expanded" } }],
        bugs: [{ misconception: "wrongAxis", value: str(compose(f, P(1, h))) }],
        solution: [
          { latex: `\\text{Translation } ${vec(0, h)} \\Rightarrow y = f(x) ${signed(h)}`, note: "Up or down: add outside f." },
          { latex: `= ${tex(ans)}`, value: str(ans) },
        ],
      };
    }
    const s = r.pick([2, 3, -2]);
    const ans = f.scale(s);
    return {
      prompt: `$f(x) = ${tex(f)}$. The graph of $y = f(x)$ is stretched parallel to the y-axis with scale factor ${s}${s < 0 ? " (a stretch and a reflection)" : ""}. Find the equation of the new graph.`,
      work: { mode: "expr", start: `${s}(${str(f)})` },
      answers: [{ spec: { kind: "expr", value: str(ans), form: "expanded" } }],
      bugs: [{ misconception: "stretchFactor", value: str(compose(f, P(s, 0))) }],
      solution: [
        { latex: `y = ${s}f(x)`, note: "A stretch parallel to the y-axis multiplies the outputs: multiply outside f." },
        { latex: `= ${s}(${tex(f)}) = ${tex(ans)}`, value: str(ans) },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 8: reflections and combined transformations
 * ====================================================================== */

const reflectPoint: Generator = {
  id: "fn.tr.reflect",
  skill: "fn.tr.reflect",
  generate: (r) => {
    const p = r.nz(-6, 6);
    const q = r.nz(-6, 6);
    const kind = r.pick(["-f(x)", "f(-x)", "-f(-x)"] as const);
    const [x, y] = kind === "-f(x)" ? [p, -q] : kind === "f(-x)" ? [-p, q] : [-p, -q];
    return {
      prompt: `The curve $y = f(x)$ has a turning point at $(${p}, ${q})$. Find the coordinates of the turning point on the curve $y = ${kind}$.`,
      answers: [
        { label: "x-coordinate", spec: { kind: "number", value: String(x) } },
        { label: "y-coordinate", spec: { kind: "number", value: String(y) } },
      ],
      bugs: kind === "-f(x)" ? [{ misconception: "reflectAxis", answer: 0, value: String(-p) }] : kind === "f(-x)" ? [{ misconception: "reflectAxis", answer: 1, value: String(-q) }] : [],
      solution: [
        {
          latex: kind === "-f(x)" ? "y = -f(x): \\text{ reflection in the x-axis}" : kind === "f(-x)" ? "y = f(-x): \\text{ reflection in the y-axis}" : "y = -f(-x): \\text{ reflection in both axes}",
          note: kind === "-f(x)" ? "The minus is outside: the y-values change sign." : kind === "f(-x)" ? "The minus is inside: the x-values change sign." : "Both signs change (this is a rotation of 180° about the origin).",
        },
        { latex: `(${p}, ${q}) \\to (${x}, ${y})`, value: String(x) },
      ],
    };
  },
};

const combined: Generator = {
  id: "fn.tr.combined",
  skill: "fn.tr.combined",
  generate: (r) => {
    const p = r.nz(-5, 5);
    const q = r.nz(-5, 5);
    const v = r.int(0, 2);
    if (v === 0) {
      // y = a f(x + b) + c
      const a = r.pick([2, 3, -1, -2]);
      const b = r.nz(-4, 4);
      const c = r.nz(-4, 4);
      const [x, y] = [p - b, a * q + c];
      return {
        prompt: `The point $(${p}, ${q})$ lies on $y = f(x)$. Find its image on the curve $y = ${a === -1 ? "-" : a}f(x ${signed(b)}) ${signed(c)}$.`,
        answers: [
          { label: "x-coordinate", spec: { kind: "number", value: String(x) } },
          { label: "y-coordinate", spec: { kind: "number", value: String(y) } },
        ],
        bugs: [
          { misconception: "translateDirection", answer: 0, value: String(p + b) },
          ...(a * (q + c) === y ? [] : [{ misconception: "transformOrder", answer: 1, value: String(a * (q + c)) }]),
        ],
        solution: [
          { latex: `\\text{Inside: } x ${signed(b)} \\Rightarrow x\\text{-coordinate } ${p} ${signed(-b)} = ${x}`, note: "Changes inside the bracket act on x, the opposite way." },
          { latex: `\\text{Outside: multiply by } ${a} \\text{ first, then } ${signed(c)}`, note: "Outside f, follow the order of operations: multiply, then add." },
          { latex: `y\\text{-coordinate: } ${a}${inBrackets(q)} ${signed(c)} = ${y}`, value: String(y) },
          { latex: `(${p}, ${q}) \\to (${x}, ${y})` },
        ],
      };
    }
    if (v === 1) {
      // y = f(kx) + c
      const k = r.pick([2, 3]);
      const c = r.nz(-4, 4);
      const pp = p * k;
      return {
        prompt: `The point $(${pp}, ${q})$ lies on $y = f(x)$. Find its image on the curve $y = f(${k}x) ${signed(c)}$.`,
        answers: [
          { label: "x-coordinate", spec: { kind: "number", value: String(p) } },
          { label: "y-coordinate", spec: { kind: "number", value: String(q + c) } },
        ],
        bugs: [{ misconception: "stretchFactor", answer: 0, value: String(pp * k) }],
        solution: [
          { latex: `f(${k}x): \\; x\\text{-coordinate} \\div ${k} = ${p}`, note: `Stretch parallel to the x-axis, scale factor $\\tfrac{1}{${k}}$.` },
          { latex: `${signed(c)} \\text{ outside}: \\; y\\text{-coordinate } ${q} ${signed(c)} = ${q + c}`, value: String(q + c) },
        ],
      };
    }
    // y = −f(x − b)
    const b = r.nz(-4, 4);
    return {
      prompt: `The point $(${p}, ${q})$ lies on $y = f(x)$. Find its image on the curve $y = -f(${xMinus(b)})$.`,
      answers: [
        { label: "x-coordinate", spec: { kind: "number", value: String(p + b) } },
        { label: "y-coordinate", spec: { kind: "number", value: String(-q) } },
      ],
      bugs: [
        { misconception: "translateDirection", answer: 0, value: String(p - b) },
        { misconception: "reflectAxis", answer: 0, value: String(-(p + b)) },
      ],
      solution: [
        { latex: `${xMinus(b)} \\text{ inside: translation } ${vec(b, 0)}`, note: `$${xMinus(b)}$ inside the bracket moves the graph the opposite way to its sign: ${b > 0 ? "right" : "left"} by ${Math.abs(b)}.` },
        { latex: `-f: \\text{ reflection in the x-axis}`, note: "The y-coordinate changes sign." },
        { latex: `(${p}, ${q}) \\to (${p + b}, ${-q})`, value: String(p + b) },
      ],
    };
  },
};

const sequence: Generator = {
  id: "fn.tr.sequence",
  skill: "fn.tr.combined",
  generate: (r) => {
    if (r.next() < 0.5) {
      const a = r.pick([2, 3, 4]);
      const c = r.nz(-5, 5);
      const right = `A stretch parallel to the y-axis, scale factor ${a}, then a translation by $${vec(0, c)}$`;
      const order = `A translation by $${vec(0, c)}$, then a stretch parallel to the y-axis, scale factor ${a}`;
      const factor = `A stretch parallel to the x-axis, scale factor ${a}, then a translation by $${vec(0, c)}$`;
      const dir = `A stretch parallel to the y-axis, scale factor ${a}, then a translation by $${vec(0, -c)}$`;
      const options = r.shuffle([right, order, factor, dir]);
      return {
        prompt: `Which sequence of transformations maps $y = f(x)$ onto $y = ${a}f(x) ${signed(c)}$?`,
        answers: [{ spec: { kind: "choice", options, answer: options.indexOf(right) } }],
        bugs: [
          { misconception: "transformOrder", value: String(options.indexOf(order)) },
          { misconception: "wrongAxis", value: String(options.indexOf(factor)) },
          { misconception: "translateDirection", value: String(options.indexOf(dir)) },
        ],
        solution: [
          { latex: `${a}f(x) ${signed(c)}: \\text{ multiply by } ${a}, \\text{ then add } ${c}`, note: "Outside f, the order is the order of operations: multiply first." },
          { latex: `\\text{Translating first would give } ${a}(f(x) ${signed(c)}) = ${a}f(x) ${signed(a * c)}`, note: "That is a different curve, so the order matters." },
        ],
      };
    }
    // f(kx + m) = f(k(x + m/k)): translate by (−m, 0) then stretch 1/k, or stretch then translate by (−m/k, 0).
    const k = r.pick([2, 3]);
    const m = k * r.nz(-3, 3);
    const right = `A translation by $${vec(-m, 0)}$, then a stretch parallel to the x-axis, scale factor $\\tfrac{1}{${k}}$`;
    const dir = `A translation by $${vec(m, 0)}$, then a stretch parallel to the x-axis, scale factor $\\tfrac{1}{${k}}$`;
    const factor = `A translation by $${vec(-m, 0)}$, then a stretch parallel to the x-axis, scale factor ${k}`;
    const wrongStep = `A stretch parallel to the x-axis, scale factor $\\tfrac{1}{${k}}$, then a translation by $${vec(-m, 0)}$`;
    const options = r.shuffle([right, dir, factor, wrongStep]);
    return {
      prompt: `Which sequence of transformations maps $y = f(x)$ onto $y = f(${k}x ${signed(m)})$?`,
      answers: [{ spec: { kind: "choice", options, answer: options.indexOf(right) } }],
      bugs: [
        { misconception: "translateDirection", value: String(options.indexOf(dir)) },
        { misconception: "stretchFactor", value: String(options.indexOf(factor)) },
        { misconception: "transformOrder", value: String(options.indexOf(wrongStep)) },
      ],
      solution: [
        { latex: `f(${k}x ${signed(m)}): \\text{ first replace } x \\text{ by } x ${signed(m)}, \\text{ then } x \\text{ by } ${k}x`, note: `Translation by $${vec(-m, 0)}$, then x-values divided by ${k}.` },
        { latex: `\\text{Or: } f\\left(${k}\\left(x ${signed(m / k)}\\right)\\right): \\text{ stretch first, then translate by } ${vec(-m / k, 0)}`, note: "Stretching first changes the translation you need: that is why the order matters." },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 9: graph sketching and modulus graphs
 * ====================================================================== */

const sketchCurve: Generator = {
  id: "fn.sketch.curve",
  skill: "fn.sketch",
  generate: (r) => {
    const v = r.int(0, 2);
    if (v === 0) {
      const roots = r.distinct(3, -3, 3).sort((a, b) => a - b);
      const sgn = r.pick([1, -1]);
      const f = P(1, -roots[0]).mul(P(1, -roots[1])).mul(P(1, -roots[2])).scale(sgn);
      const y0 = f.at(0).value();
      const ys = Array.from({ length: 41 }, (_, i) => f.at(F(-20 + i, 5)).value()).filter((y) => Math.abs(y) < 30);
      const win = windowFor([-4, 4], [...ys.filter((_, i) => i % 4 === 0), y0]);
      const brackets = roots.map((t) => `(${xMinus(t)})`).join("");
      return {
        prompt: `Sketch the curve $y = ${sgn < 0 ? "-" : ""}${brackets}$.`,
        answers: [{ label: "Where it crosses the y-axis: y =", spec: { kind: "number", value: String(y0) } }],
        sketch: {
          graph: { ...win, y: [Math.max(win.y[0], -20), Math.min(win.y[1], 20)], curves: [{ expr: str(f) }], points: [...roots.map((t) => ({ x: t, y: 0, label: String(t) })), { x: 0, y: y0, label: `(0, ${y0})` }] },
          features: [
            `Crosses the x-axis at $x = ${roots.join(", ")}$`,
            `Crosses the y-axis at $(0, ${y0})$`,
            sgn > 0 ? "Comes up from bottom left, ends going up on the right (positive $x^3$)" : "Comes down from top left, ends going down on the right (negative $x^3$)",
            "Two turning points, one between each pair of roots",
          ],
        },
        solution: [
          { latex: `y = 0: \\; x = ${roots.join(", \\; ")}`, note: "Each bracket gives a root." },
          { latex: `x = 0: \\; y = ${y0}`, note: "Multiply the numbers in the brackets (with the sign in front).", value: String(y0) },
          { latex: sgn > 0 ? "x \\to \\infty: y \\to \\infty" : "x \\to \\infty: y \\to -\\infty", note: "The sign of the $x^3$ term decides the ends." },
        ],
      };
    }
    if (v === 1) {
      const a = r.pick([1, 2, 3, -2, -4]);
      const p = r.nz(-3, 3);
      const q = r.nz(-2, 2);
      const yInt = F(a, -p).add(q);
      const xInt = F(p).sub(F(a, q));
      return {
        prompt: `Sketch the curve $y = \\dfrac{${a}}{${xMinus(p)}} ${signed(q)}$.`,
        answers: [
          { label: "Crosses the y-axis at y =", spec: { kind: "number", value: nS(yInt) } },
          { label: "Crosses the x-axis at x =", spec: { kind: "number", value: nS(xInt) } },
        ],
        sketch: {
          graph: { x: [-7, 7], y: [-7, 7], curves: [{ expr: `${a}/(${xMinusS(p)}) + ${q}` }], asymptotes: [{ x: p }, { y: q }], points: [{ x: 0, y: yInt.value(), label: `(0, ${nL(yInt).replace(/\\frac\{(-?\d+)\}\{(\d+)\}/, "$1/$2")})` }, { x: xInt.value(), y: 0 }] },
          features: [`Vertical asymptote $x = ${p}$`, `Horizontal asymptote $y = ${q}$`, `Crosses the y-axis at $y = ${nL(yInt)}$`, `Crosses the x-axis at $x = ${nL(xInt)}$`, "Two branches, never touching the asymptotes"],
        },
        solution: [
          { latex: `x = ${p}, \\quad y = ${q}`, note: "The asymptotes: the bottom is zero at x = " + p + "; the fraction tends to 0 for large x." },
          { latex: `x = 0: \\; y = \\dfrac{${a}}{${-p}} ${signed(q)} = ${nL(yInt)}`, value: nS(yInt) },
          { latex: `y = 0: \\; \\dfrac{${a}}{${xMinus(p)}} = ${-q} \\Rightarrow x = ${nL(xInt)}`, value: nS(xInt) },
        ],
      };
    }
    const p = r.int(-3, 3);
    const q = r.int(-4, 3);
    const f = P(1, -2 * p, p * p + q);
    const y0 = p * p + q;
    return {
      prompt: `Sketch the curve $y = ${tex(f)}$, showing the turning point.`,
      answers: [
        { label: "Turning point: x =", spec: { kind: "number", value: String(p) } },
        { label: "Turning point: y =", spec: { kind: "number", value: String(q) } },
      ],
      sketch: {
        graph: { x: [p - 4, p + 4], y: [Math.min(q, 0) - 2, Math.max(y0, q + 8) + 1], curves: [{ expr: str(f) }], points: [{ x: p, y: q, label: `(${p}, ${q})` }, ...(p === 0 ? [] : [{ x: 0, y: y0, label: `(0, ${y0})` }])] },
        features: [`Minimum point at $(${p}, ${q})$`, `Crosses the y-axis at $(0, ${y0})$`, q < 0 ? "Crosses the x-axis twice" : q === 0 ? "Touches the x-axis at the turning point" : "Does not meet the x-axis", "A U shape (positive $x^2$)"],
      },
      solution: [
        { latex: `y = (${xMinus(p)})^2 ${signed(q)}`, note: "Complete the square: the turning point is read off directly." },
        { latex: `\\text{Minimum } (${p}, ${q})`, value: String(p) },
        { latex: `x = 0: \\; y = ${y0}` },
      ],
    };
  },
};

const modulusGraph: Generator = {
  id: "fn.sketch.modulus",
  skill: "fn.sketch.modulus",
  generate: (r) => {
    const lin = r.next() < 0.5;
    const [s, t] = r.distinct(2, -3, 3, [0]).sort((a, b) => a - b);
    const lp = P(r.pick([1, 2, -1]), r.nz(-2, 2));
    const fStr = lin ? str(lp) : `(${xMinusS(s)})(${xMinusS(t)})`;
    const label = lin ? tex(lp) : `(${xMinus(s)})(${xMinus(t)})`;
    // f(|x|) only differs from f when f is not symmetrical about the y-axis.
    const insideAbs = r.next() < 0.3 && !lin && s + t !== 0;
    const graph = (e: string): GraphSpec => ({ x: [-4, 4], y: [-4, 6], curves: [{ expr: e }] });
    const correctE = insideAbs ? fStr.replace(/x/g, "|x|") : `|${fStr}|`;
    const options: [string, string | null][] = insideAbs
      ? [[correctE, null], [`|${fStr}|`, "modulusMix"], [fStr, "modulusDelete"], [`-|${fStr}|`, "modulusReflect"]]
      : [[correctE, null], [`(sqrt(${fStr}))^2`, "modulusDelete"], [fStr, "modulusReflect"], [lin ? `-|${fStr}|` : fStr.replace(/x/g, "|x|"), lin ? "modulusReflect" : "modulusMix"]];
    const order = r.shuffle(options);
    const target = insideAbs ? `y = f(|x|)` : `y = |f(x)|`;
    return {
      prompt: `$f(x) = ${label}$. The graph shows $y = f(x)$. Which graph shows $${target}$?`,
      graph: graph(fStr),
      answers: [{ spec: { kind: "choice", options: order.map((_, i) => `Graph ${"ABCD"[i]}`), answer: order.findIndex((o) => o[1] === null) } }],
      optionGraphs: order.map((o) => graph(o[0])),
      bugs: order.flatMap((o, i) => (o[1] ? [{ misconception: o[1], value: String(i) }] : [])),
      solution: insideAbs
        ? [
            { latex: "y = f(|x|)", note: "For x ≥ 0 nothing changes. The left half is replaced by a mirror image of the right half." },
            { latex: "\\text{Keep the part for } x \\ge 0, \\text{ reflect it in the y-axis}", note: "The graph is symmetrical about the y-axis." },
          ]
        : [
            { latex: "y = |f(x)|", note: "Outputs can never be negative." },
            { latex: "\\text{Keep the part above the x-axis; REFLECT the part below it in the x-axis}", note: "Do not delete the part below: flip it up." },
          ],
    };
  },
};

const modulusValues: Generator = {
  id: "fn.sketch.modValues",
  skill: "fn.sketch.modulus",
  generate: (r) => {
    const a = r.pick([1, 2, 3, -2]);
    const b = r.pick([-6, -4, -3, -2, 2, 3, 4, 6].filter((v) => v % a === 0 || Math.abs(a) === 1 || a === 3));
    const vx = F(-b, a);
    return {
      prompt: `Sketch $y = |${tex(P(a, b))}|$. Find the coordinates of the vertex (where the graph touches the x-axis) and of the point where it crosses the y-axis.`,
      answers: [
        { label: "Vertex: x =", spec: { kind: "number", value: nS(vx) } },
        { label: "y-intercept: y =", spec: { kind: "number", value: String(Math.abs(b)) } },
      ],
      bugs: b < 0 ? [{ misconception: "modulusReflect", answer: 1, value: String(b) }] : [],
      solution: [
        { latex: `${tex(P(a, b))} = 0 \\Rightarrow x = ${nL(vx)}`, note: "The V touches the x-axis where the inside is zero.", value: nS(vx) },
        { latex: `x = 0: \\; y = |${b}| = ${Math.abs(b)}`, note: "The modulus makes the output positive.", value: String(Math.abs(b)) },
      ],
    };
  },
};

/* ======================================================================
 * Exam questions, lessons 6–10
 * ====================================================================== */

const examGraphs: ExamGenerator = {
  id: "exam.fn.graphs",
  skill: "fn.graph.features",
  generate: (r) => {
    const a = r.pick([2, 3, 4, 6, -2, -3]);
    const p = r.nz(-3, 3);
    const q = r.nz(-3, 3);
    const yInt = F(a, -p).add(q);
    const xInt = F(p).sub(F(a, q));
    return {
      model: [[String(p), String(q)], [nS(yInt), nS(xInt)]],
      intro: `The curve C has equation $y = \\dfrac{${a}}{${xMinus(p)}} ${signed(q)}$.`,
      parts: [
        {
          label: "(a)",
          prompt: "Write down the equations of the asymptotes of C.",
          inputs: [{ label: "Vertical: x =" }, { label: "Horizontal: y =" }],
          marks: [
            { type: "B", text: `x = ${p}`, check: (m) => close(m.num(0, 0), p) },
            { type: "B", text: `y = ${q}`, check: (m) => close(m.num(0, 1), q) },
          ],
          solution: [{ latex: `x = ${p}, \\quad y = ${q}`, mark: "B1 B1" }],
        },
        {
          label: "(b)",
          prompt: "Find the coordinates of the points where C crosses the axes.",
          inputs: [{ label: "y-axis: y =" }, { label: "x-axis: x =" }],
          marks: [
            { type: "M", text: "Substitute x = 0 or y = 0", check: (m) => close(m.num(1, 0), yInt.value()) || close(m.num(1, 1), xInt.value()) },
            { type: "A", text: `(0, ${nS(yInt)})`, check: (m) => close(m.num(1, 0), yInt.value()) },
            { type: "A", text: `(${nS(xInt)}, 0)`, check: (m) => close(m.num(1, 1), xInt.value()) },
          ],
          solution: [
            { latex: `x = 0: \\; y = ${nL(yInt)}`, mark: "M1 A1" },
            { latex: `y = 0: \\; x ${signed(-p)} = ${nL(F(-a, q))} \\Rightarrow x = ${nL(xInt)}`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

const examTransform: ExamGenerator = {
  id: "exam.fn.transform",
  skill: "fn.tr",
  generate: (r) => {
    const p = r.nz(-4, 4);
    const q = r.nz(-5, 5);
    const h = r.nz(-3, 3);
    const k = r.pick([2, 3]);
    const pp = p * k;
    return {
      model: [[String(pp - h), String(q)], [String(pp), String(k * q)], [String(p), String(q)]],
      intro: `The curve $y = f(x)$ has a maximum point at $(${pp}, ${q})$. Write down the coordinates of the maximum point on each of these curves.`,
      parts: [
        {
          label: "(a)",
          prompt: `y = f(x ${h < 0 ? "−" : "+"} ${Math.abs(h)})`,
          inputs: [{ label: "x" }, { label: "y" }],
          marks: [
            { type: "B", text: `x = ${pp - h}`, check: (m) => close(m.num(0, 0), pp - h) },
            { type: "B", text: `y = ${q}`, check: (m) => close(m.num(0, 1), q) },
          ],
          solution: [{ latex: `\\text{Translation } ${vec(-h, 0)}: (${pp - h}, ${q})`, mark: "B1 B1" }],
        },
        {
          label: "(b)",
          prompt: `y = ${k}f(x)`,
          inputs: [{ label: "x" }, { label: "y" }],
          marks: [
            { type: "B", text: `x = ${pp}`, check: (m) => close(m.num(1, 0), pp) },
            { type: "B", text: `y = ${k * q}`, check: (m) => close(m.num(1, 1), k * q) },
          ],
          solution: [{ latex: `\\text{Stretch parallel to the y-axis, s.f. } ${k}: (${pp}, ${k * q})`, mark: "B1 B1" }],
        },
        {
          label: "(c)",
          prompt: `y = f(${k}x)`,
          inputs: [{ label: "x" }, { label: "y" }],
          marks: [
            { type: "B", text: `x = ${p}`, check: (m) => close(m.num(2, 0), p) },
            { type: "B", text: `y = ${q}`, check: (m) => close(m.num(2, 1), q) },
          ],
          solution: [{ latex: `\\text{Stretch parallel to the x-axis, s.f. } \\tfrac{1}{${k}}: (${p}, ${q})`, mark: "B1 B1" }],
        },
      ],
    };
  },
};

const examCombined: ExamGenerator = {
  id: "exam.fn.combined",
  skill: "fn.tr.combined",
  generate: (r) => {
    const p = r.nz(-4, 4);
    const q = r.nz(-4, 4);
    const a = r.pick([2, 3]);
    const b = r.nz(-3, 3);
    const c = r.nz(-4, 4);
    const [x1, y1] = [p + b, a * q + c];
    return {
      model: [[String(x1), String(y1)], [String(-p), String(-q)]],
      intro: `The curve $y = f(x)$ has a minimum point at $(${p}, ${q})$.`,
      parts: [
        {
          label: "(a)",
          prompt: `Find the coordinates of the minimum point of y = ${a}f(x ${b < 0 ? "+" : "−"} ${Math.abs(b)}) ${c < 0 ? "−" : "+"} ${Math.abs(c)}.`,
          inputs: [{ label: "x" }, { label: "y" }],
          marks: [
            { type: "B", text: `x = ${x1}`, check: (m) => close(m.num(0, 0), x1) },
            { type: "M", text: `Multiply the y-coordinate by ${a} and add ${c} (either order)`, check: (m) => close(m.num(0, 1), y1) || close(m.num(0, 1), a * (q + c)) },
            { type: "A", text: `y = ${y1}`, check: (m) => close(m.num(0, 1), y1) },
          ],
          solution: [
            { latex: `x: \\; ${p} ${signed(b)} = ${x1}`, mark: "B1" },
            { latex: `y: \\; ${a} \\times ${inBrackets(q)} ${signed(c)}`, mark: "M1" },
            { latex: `= ${y1}`, mark: "A1" },
          ],
        },
        {
          label: "(b)",
          prompt: "Find the coordinates of the turning point of y = −f(−x), and state whether it is a maximum or a minimum.",
          inputs: [{ label: "x" }, { label: "y" }],
          marks: [
            { type: "B", text: `x = ${-p}`, check: (m) => close(m.num(1, 0), -p) },
            { type: "B", text: `y = ${-q} (a maximum)`, check: (m) => close(m.num(1, 1), -q) },
          ],
          solution: [{ latex: `\\text{Reflect in both axes: } (${-p}, ${-q}), \\text{ now a maximum}`, mark: "B1 B1" }],
        },
      ],
    };
  },
};

const examSketch: ExamGenerator = {
  id: "exam.fn.sketch",
  skill: "fn.sketch.modulus",
  generate: (r) => {
    const [s, t] = r.distinct(2, -4, 4).sort((a, b) => a - b);
    if ((s + t) % 2 !== 0) return examSketch.generate(r);
    const f = P(1, -s).mul(P(1, -t));
    const m0 = (s + t) / 2;
    const v = f.at(m0).value();
    return {
      model: [[`x = ${s} or x = ${t}`, String(Math.abs(s * t))], [String(m0), String(-v)]],
      intro: `$f(x) = (${xMinus(s)})(${xMinus(t)})$. The graph of $y = |f(x)|$ is drawn by reflecting the part of $y = f(x)$ below the x-axis.`,
      parts: [
        {
          label: "(a)",
          prompt: "Find where y = |f(x)| meets the x-axis and the y-axis.",
          inputs: [{ label: "x-axis: x =" }, { label: "y-axis: y =" }],
          marks: [
            { type: "B", text: `x = ${s} and x = ${t}`, check: (m) => solOk(m.raw(0, 0), [String(s), String(t)]) },
            { type: "B", text: `y = ${Math.abs(s * t)}`, check: (m) => close(m.num(0, 1), Math.abs(s * t)) },
          ],
          solution: [
            { latex: `f(x) = 0 \\Rightarrow x = ${s}, \\; x = ${t}`, mark: "B1" },
            { latex: `x = 0: \\; y = |${s * t}| = ${Math.abs(s * t)}`, mark: "B1" },
          ],
        },
        {
          label: "(b)",
          prompt: "Find the coordinates of the maximum point of y = |f(x)| between the two roots.",
          inputs: [{ label: "x" }, { label: "y" }],
          marks: [
            { type: "M", text: "The turning point of f is halfway between the roots", check: (m) => close(m.num(1, 0), m0) },
            { type: "A", text: `(${m0}, ${-v})`, check: (m) => close(m.num(1, 0), m0) && close(m.num(1, 1), -v) },
          ],
          solution: [
            { latex: `x = \\dfrac{${s} ${signed(t)}}{2} = ${m0}, \\quad f(${m0}) = ${v}`, mark: "M1" },
            { latex: `|f(${m0})| = ${-v}: \\; (${m0}, ${-v})`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

const examFull: ExamGenerator = {
  id: "exam.fn.full",
  skill: "fn.review",
  generate: (r) => {
    const a = r.pick([2, 3, -2]);
    const b = r.nz(-5, 5);
    const c = r.nz(-4, 4);
    const f = P(a, b);
    const g = P(1, 0, c);
    const fg = compose(f, g);
    const ginv = `sqrt(${xMinusS(c)})`;
    const k = r.nz(-4, 4);
    const reflected = P(-a, -b + k);
    return {
      model: [[str(fg)], [ginv, `x >= ${c}`], [str(reflected)]],
      intro: `The functions f and g are defined by $f(x) = ${tex(f)}$, $x \\in \\mathbb{R}$, and $g(x) = ${tex(g)}$, $x \\ge 0$.`,
      parts: [
        {
          label: "(a)",
          prompt: "Find fg(x).",
          inputs: [{ label: "fg(x) =" }],
          marks: [
            { type: "M", text: "g(x) substituted into f", check: (m) => upToConstant(m.raw(0), str(fg)) },
            { type: "A", text: `fg(x) = ${str(fg)}`, check: (m) => exprOk(m.raw(0), str(fg)) },
          ],
          solution: [
            { latex: `fg(x) = ${a}(${tex(g)}) ${signed(b)}`, mark: "M1" },
            { latex: `= ${tex(fg)}`, mark: "A1" },
          ],
        },
        {
          label: "(b)",
          prompt: "Find g⁻¹(x) and state its domain.",
          inputs: [{ label: "g⁻¹(x) =" }, { label: "Domain" }],
          marks: [
            { type: "M", text: "Rearrange y = x² + c for x", check: (m) => exprOk(m.raw(1, 0), ginv) || exprOk(m.raw(1, 0), `-${ginv}`) },
            { type: "A", text: `g⁻¹(x) = √(x ${c < 0 ? "+" : "−"} ${Math.abs(c)})`, check: (m) => exprOk(m.raw(1, 0), ginv) },
            { type: "B", text: `x ≥ ${c}`, check: (m) => relOk(m.raw(1, 1), `x >= ${c}`) },
          ],
          solution: [
            { latex: `y = x^2 ${signed(c)} \\Rightarrow x = \\sqrt{y ${signed(-c)}}`, mark: "M1" },
            { latex: `g^{-1}(x) = \\sqrt{${xMinus(c)}}`, mark: "A1" },
            { latex: `\\text{Range of } g: g(x) \\ge ${c}, \\text{ so the domain of } g^{-1} \\text{ is } x \\ge ${c}`, mark: "B1" },
          ],
        },
        {
          label: "(c)",
          prompt: `The graph of y = f(x) is reflected in the x-axis and then translated by the vector (0, ${k}). Find the equation of the new graph, in the form y = mx + c.`,
          inputs: [{ label: "y =" }],
          marks: [
            { type: "M", text: "−f(x) used", check: (m) => upToConstant(m.raw(2), str(reflected)) },
            { type: "A", text: `y = ${str(reflected)}`, check: (m) => exprOk(m.raw(2), str(reflected)) },
          ],
          solution: [
            { latex: `y = -f(x) ${signed(k)} = -(${tex(f)}) ${signed(k)}`, mark: "M1" },
            { latex: `y = ${tex(reflected)}`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

export const generators2: Generator[] = [identify, asymptotes, transformPoint, transformDescribe, transformEquation, reflectPoint, combined, sequence, sketchCurve, modulusGraph, modulusValues];
export const examGenerators2: ExamGenerator[] = [examGraphs, examTransform, examCombined, examSketch, examFull];
