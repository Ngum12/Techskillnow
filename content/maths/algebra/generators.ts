/**
 * Algebra question generators. Each one makes a fresh question from random numbers, with the full model
 * working (every line, as on the board), the answers to check, and known wrong answers for misconceptions.
 * Edit the wording and number ranges here; the engine in /lib/maths does the checking.
 */
import { Frac } from "@/lib/maths/frac";
import { Poly, linearLatex } from "@/lib/maths/poly";
import { coefficientsOf, evaluatedTermsLatex, inBrackets, numberDivisionLayout, polyDivisionLayout, signed, substitutionLatex } from "@/lib/maths/build";
import { near } from "@/lib/maths/exam";
import type { Rng } from "@/lib/maths/rng";
import type { ExamGenerator, Generator } from "@/lib/maths/types";

const NAMES = ["Nkeng", "Tabi", "Ngwa", "Fon", "Mbah", "Ayuk"];
const F = (n: number, d = 1) => new Frac(n, d);
const tex = (p: Poly) => p.toLatex();
const str = (p: Poly) => p.toString();
/** A polynomial with integer coefficients, highest power first; the leading coefficient is never 0. */
const randomPoly = (r: Rng, degree: number, range = 6, zeroChance = 0.2, minTerms = 3) => {
  for (;;) {
    const p = Poly.of(r.nz(-range, range), ...Array.from({ length: degree }, () => (r.next() < zeroChance ? 0 : r.int(-range, range))));
    if (p.terms().length >= Math.min(minTerms, degree + 1)) return p;
  }
};

/** The terms of p written after an earlier expression, each with its sign: "+ 3x^{2} - x + 4". */
function followingTerms(p: Poly): string {
  return p
    .terms()
    .map(({ coef, power }) => {
      const t = new Poly([...Array(power).fill(0), coef.n < 0 ? coef.neg() : coef]).toLatex();
      return `${coef.n < 0 ? "-" : "+"} ${t}`;
    })
    .join(" ");
}

/* ======================================================================
 * Lesson 0: prerequisites (diagnostic and foundation repair)
 * ====================================================================== */

const negatives: Generator = {
  id: "pre.negatives",
  skill: "pre.negatives",
  generate: (r) => {
    const a = r.nz(-9, 9);
    const b = r.nz(-9, -1);
    const c = r.nz(2, 6);
    const prod = b * c;
    const ans = a - prod;
    return {
      prompt: `Work out $${a} - (${b}) \\times ${c}$.`,
      answers: [{ spec: { kind: "number", value: String(ans) } }],
      bugs: [{ misconception: "orderOfOperations", value: String((a - b) * c) }, { misconception: "doubleNegative", value: String(a + -Math.abs(prod)) }],
      solution: [
        { latex: `(${b}) \\times ${c} = ${prod}`, note: "Multiply first. A negative times a positive is negative." },
        { latex: `${a} - (${prod}) = ${a} + ${-prod}`, note: "Subtracting a negative is the same as adding." },
        { latex: `= ${ans}`, value: String(ans) },
      ],
    };
  },
};

const fractions: Generator = {
  id: "pre.fractions",
  skill: "pre.fractions",
  generate: (r) => {
    const d1 = r.pick([2, 3, 4, 5, 6]);
    const d2 = r.pick([3, 4, 5, 6, 8].filter((d) => d !== d1));
    const x = F(r.int(1, d1 - 1), d1);
    const y = F(r.int(1, d2 - 1), d2);
    const op = r.pick(["+", "-", "×", "÷"] as const);
    const ans = op === "+" ? x.add(y) : op === "-" ? x.sub(y) : op === "×" ? x.mul(y) : x.div(y);
    const lcd = (x.d * y.d) / gcd(x.d, y.d);
    const sol =
      op === "+" || op === "-"
        ? [
            { latex: `${x.toLatex()} ${op} ${y.toLatex()} = \\frac{${(x.n * lcd) / x.d}}{${lcd}} ${op} \\frac{${(y.n * lcd) / y.d}}{${lcd}}`, note: `Use a common denominator: ${lcd}.` },
            { latex: `= \\frac{${op === "+" ? (x.n * lcd) / x.d + (y.n * lcd) / y.d : (x.n * lcd) / x.d - (y.n * lcd) / y.d}}{${lcd}}`, note: "Add or subtract the numerators only." },
            { latex: `= ${ans.toLatex()}`, note: "Simplify if you can.", value: ans.toString() },
          ]
        : op === "×"
          ? [
              { latex: `${x.toLatex()} \\times ${y.toLatex()} = \\frac{${x.n} \\times ${y.n}}{${x.d} \\times ${y.d}}`, note: "Multiply the tops, multiply the bottoms." },
              { latex: `= ${ans.toLatex()}`, note: "Simplify.", value: ans.toString() },
            ]
          : [
              { latex: `${x.toLatex()} \\div ${y.toLatex()} = ${x.toLatex()} \\times \\frac{${y.d}}{${y.n}}`, note: "Dividing by a fraction = multiplying by it turned upside down." },
              { latex: `= ${ans.toLatex()}`, note: "Multiply and simplify.", value: ans.toString() },
            ];
    return {
      prompt: `Work out $${x.toLatex()} ${op === "×" ? "\\times" : op === "÷" ? "\\div" : op} ${y.toLatex()}$. Give your answer as a fraction in its simplest form.`,
      answers: [{ spec: { kind: "number", value: ans.toString() } }],
      bugs: op === "+" ? [{ misconception: "addDenominators", value: F(x.n + y.n, x.d + y.d).toString() }] : undefined,
      solution: sol,
    };
  },
};

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : Math.abs(a);
}

const expand: Generator = {
  id: "pre.expand",
  skill: "pre.expand",
  generate: (r) => {
    if (r.next() < 0.5) {
      const [a, b, c, d] = [r.int(2, 5), r.nz(-6, 6), r.int(2, 4), r.nz(-6, 6)];
      const startStr = `${a}(x ${b < 0 ? "-" : "+"} ${Math.abs(b)}) - ${c}(x ${d < 0 ? "-" : "+"} ${Math.abs(d)})`;
      const res = Poly.of(a - c, a * b - c * d);
      return {
        prompt: `Expand and simplify $${a}(x ${signed(b)}) - ${c}(x ${signed(d)})$.`,
        work: { mode: "expr", start: startStr },
        answers: [{ spec: { kind: "expr", value: str(res), form: "expanded" } }],
        solution: [
          { latex: `= ${a}x ${signed(a * b)} - ${c}x ${signed(-c * d)}`, note: `Multiply every term in each bracket. Careful: $-${c} \\times ${inBrackets(d)} = ${-c * d}$.`, value: `${a}x + ${a * b} - ${c}x + ${-c * d}` },
          { latex: `= ${tex(res)}`, note: "Collect the x terms and the numbers.", value: str(res) },
        ],
      };
    }
    const [p, q] = [r.nz(-7, 7), r.nz(-7, 7)];
    const res = Poly.of(1, p + q, p * q);
    return {
      prompt: `Expand and simplify $(x ${signed(p)})(x ${signed(q)})$.`,
      work: { mode: "expr", start: `(x + ${p})(x + ${q})` },
      answers: [{ spec: { kind: "expr", value: str(res), form: "expanded" } }],
      bugs: [{ misconception: "forgotMiddle", value: str(Poly.of(1, 0, p * q)) }],
      solution: [
        { latex: `= x^2 ${signed(q)}x ${signed(p)}x ${signed(p * q)}`, note: "Each term in the first bracket multiplies each term in the second.", value: `x^2 + ${q}x + ${p}x + ${p * q}` },
        { latex: `= ${tex(res)}`, note: "Collect the x terms.", value: str(res) },
      ],
    };
  },
};

const factorise: Generator = {
  id: "pre.factorise",
  skill: "pre.factorise",
  generate: (r) => {
    const [p, q] = r.distinct(2, -8, 8, [0]);
    const poly = Poly.of(1, p + q, p * q);
    const fact = `(x ${p < 0 ? "-" : "+"} ${Math.abs(p)})(x ${q < 0 ? "-" : "+"} ${Math.abs(q)})`;
    return {
      prompt: `Factorise $${tex(poly)}$.`,
      work: { mode: "expr", start: str(poly) },
      answers: [{ spec: { kind: "expr", value: fact, form: "factorised" } }],
      bugs: [{ misconception: "factorSignSwap", value: `(x ${p < 0 ? "+" : "-"} ${Math.abs(p)})(x ${q < 0 ? "+" : "-"} ${Math.abs(q)})` }],
      solution: [
        { latex: `${p} \\times ${inBrackets(q)} = ${p * q}, \\quad ${p} ${signed(q)} = ${p + q}`, note: `Find two numbers that multiply to ${p * q} and add to ${p + q}.` },
        { latex: `${tex(poly)} = ${fact}`, note: "Write each number in its own bracket.", value: fact },
      ],
    };
  },
};

const indices: Generator = {
  id: "pre.indices",
  skill: "pre.indices",
  generate: (r) => {
    if (r.next() < 0.5) {
      const [a, b] = [r.int(2, 7), r.int(2, 7)];
      const c = r.int(1, a + b - 1);
      const n = a + b - c;
      return {
        prompt: `Simplify $\\dfrac{x^{${a}} \\times x^{${b}}}{x^{${c}}}$.`,
        answers: [{ spec: { kind: "expr", value: `x^${n}`, form: "monomial" } }],
        bugs: [{ misconception: "multiplyPowers", value: `x^${a * b - c}` }],
        solution: [
          { latex: `x^{${a}} \\times x^{${b}} = x^{${a} + ${b}} = x^{${a + b}}`, note: "Multiplying: add the powers." },
          { latex: `\\frac{x^{${a + b}}}{x^{${c}}} = x^{${a + b} - ${c}} = x^{${n}}`, note: "Dividing: subtract the powers.", value: `x^${n}` },
        ],
      };
    }
    const [k, a] = [r.int(2, 5), r.int(2, 5)];
    return {
      prompt: `Simplify $(${k}x^{${a}})^2$.`,
      answers: [{ spec: { kind: "expr", value: `${k * k}x^${2 * a}`, form: "monomial" } }],
      bugs: [{ misconception: "powerOfProduct", value: `${k}x^${2 * a}` }],
      solution: [
        { latex: `(${k}x^{${a}})^2 = ${k}^2 \\times (x^{${a}})^2`, note: "Square the number AND the power of x." },
        { latex: `= ${k * k}x^{${2 * a}}`, note: "A power of a power: multiply the powers.", value: `${k * k}x^${2 * a}` },
      ],
    };
  },
};

const substitute: Generator = {
  id: "pre.substitute",
  skill: "pre.substitute",
  generate: (r) => {
    if (r.next() < 0.35) {
      const name = r.pick(NAMES);
      const base = r.pick([150, 200, 250]);
      const rate = r.pick([100, 150, 200]);
      const d = r.int(3, 9);
      const fare = base + rate * d;
      return {
        prompt: `A moto-taxi in Bamenda charges $F = ${base} + ${rate}d$ FCFA for a journey of $d$ km. ${name} travels ${d} km. Work out the fare $F$.`,
        answers: [{ spec: { kind: "number", value: String(fare) } }],
        solution: [
          { latex: `F = ${base} + ${rate} \\times ${d}`, note: "Replace d with its value." },
          { latex: `F = ${base} + ${rate * d} = ${fare}`, note: `Multiply first, then add. The fare is ${fare} FCFA.`, value: String(fare) },
        ],
      };
    }
    const p = Poly.of(r.nz(-4, 4), r.nz(-6, 6), r.int(-9, 9));
    const x = r.nz(-4, -1);
    const v = p.at(x);
    return {
      prompt: `Find the value of $${tex(p)}$ when $x = ${x}$.`,
      answers: [{ spec: { kind: "number", value: v.toString() } }],
      bugs: [{ misconception: "squareNegative", value: Poly.of(-p.coef(2).value(), p.coef(1).value(), p.coef(0).value()).at(x).toString() }],
      solution: [
        { latex: `${substitutionLatex(p, x)}`, note: "Put the number in brackets so the signs are clear." },
        { latex: `= ${evaluatedTermsLatex(p, x)}`, note: `$${inBrackets(x)}^2 = ${x * x}$: a negative number squared is positive.` },
        { latex: `= ${v.toLatex()}`, value: v.toString() },
      ],
    };
  },
};

const rearrange: Generator = {
  id: "pre.rearrange",
  skill: "pre.rearrange",
  generate: (r) => {
    if (r.next() < 0.4) {
      const base = r.pick([150, 200, 300]);
      const rate = r.pick([100, 150, 250]);
      return {
        prompt: `A moto-taxi fare is $F = ${base} + ${rate}d$, where $d$ is the distance in km. Make $d$ the subject.`,
        answers: [{ spec: { kind: "expr", value: `(F - ${base})/${rate}` } }],
        bugs: [{ misconception: "rearrangeOrder", value: `F/${rate} - ${base}` }],
        solution: [
          { latex: `F - ${base} = ${rate}d`, note: `Subtract ${base} from both sides.` },
          { latex: `d = \\frac{F - ${base}}{${rate}}`, note: `Divide both sides by ${rate}.`, value: `(F - ${base})/${rate}` },
        ],
      };
    }
    const [a, b, c] = [r.int(2, 7), r.nz(-9, 9), r.int(2, 5)];
    return {
      prompt: `Make $x$ the subject of $y = \\dfrac{${a}x ${signed(b)}}{${c}}$.`,
      answers: [{ spec: { kind: "expr", value: `(${c}y ${b < 0 ? "+" : "-"} ${Math.abs(b)})/${a}` } }],
      bugs: [{ misconception: "rearrangeOrder", value: `(y ${b < 0 ? "+" : "-"} ${Math.abs(b)})/${a * c}` }],
      solution: [
        { latex: `${c}y = ${a}x ${signed(b)}`, note: `Multiply both sides by ${c}.` },
        { latex: `${c}y ${signed(-b)} = ${a}x`, note: `${b > 0 ? "Subtract" : "Add"} ${Math.abs(b)} on both sides.` },
        { latex: `x = \\frac{${c}y ${signed(-b)}}{${a}}`, note: `Divide both sides by ${a}.`, value: `(${c}y ${b < 0 ? "+" : "-"} ${Math.abs(b)})/${a}` },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 1: what is a polynomial?
 * ====================================================================== */

/** A polynomial written with its terms in a jumbled order, as examiners sometimes do. */
function jumbled(r: Rng, p: Poly): string {
  const terms = r.shuffle(p.terms());
  return terms
    .map(({ coef, power }, i) => {
      const t = new Poly([...Array(power).fill(0), coef.n < 0 && i > 0 ? coef.neg() : coef]).toLatex();
      return i === 0 ? t : ` ${coef.n < 0 ? "-" : "+"} ${t}`;
    })
    .join("");
}

const parts: Generator = {
  id: "alg.poly.parts",
  skill: "alg.poly.terms",
  generate: (r) => {
    const deg = r.int(2, 5);
    let p = randomPoly(r, deg, 7, 0.3);
    if (p.terms().length < 3) p = p.add(Poly.mono(r.nz(-5, 5), 1)).add(new Poly([r.nz(-8, 8)]));
    const shown = jumbled(r, p);
    const firstWritten = shown.match(/^-?\d*/)?.[0];
    const terms = p.terms();
    return {
      prompt: `For the polynomial $${shown}$, state (a) its degree, (b) its leading coefficient, (c) its constant term.`,
      answers: [
        { label: "(a) Degree", spec: { kind: "number", value: String(p.degree) } },
        { label: "(b) Leading coefficient", spec: { kind: "number", value: p.leading.toString() } },
        { label: "(c) Constant term", spec: { kind: "number", value: p.coef(0).toString() } },
      ],
      bugs: [
        { misconception: "degreeCount", answer: 0, value: String(terms.length) },
        ...(firstWritten && firstWritten !== "-" && Number(firstWritten) !== p.leading.value() ? [{ misconception: "leadingFirstTerm", answer: 1, value: firstWritten }] : []),
      ],
      solution: [
        { latex: `${tex(p)}`, note: "First rewrite it with the powers in descending order (highest power first)." },
        { latex: `\\text{Degree} = ${p.degree}`, note: "The degree is the highest power of x." },
        { latex: `\\text{Leading coefficient} = ${p.leading.toLatex()}`, note: "The number in front of the highest power, with its sign." },
        { latex: `\\text{Constant term} = ${p.coef(0).toLatex()}`, note: "The term with no x. If there is none, it is 0." },
      ],
    };
  },
};

const POLYS = ["3x^{2} - 5x + 1", "\\frac{1}{2}x^{3} + 4", "7", "x^{4} - x", "2x - \\frac{3}{4}", "6x^{5}"];
const NON_POLYS = ["\\frac{3}{x} + 1", "\\sqrt{x} + 2", "2^{x}", "x^{-2} + x", "\\frac{x + 1}{x - 1}", "4x^{\\frac{1}{2}}"];

const isPoly: Generator = {
  id: "alg.poly.isPoly",
  skill: "alg.poly.terms",
  generate: (r) => {
    const askNot = r.next() < 0.5;
    const odd = r.pick(askNot ? NON_POLYS : POLYS);
    const rest = r.shuffle(askNot ? POLYS : NON_POLYS).slice(0, 3);
    const options = r.shuffle([odd, ...rest]);
    return {
      prompt: askNot ? "Which one of these is NOT a polynomial?" : "Which one of these IS a polynomial?",
      answers: [{ spec: { kind: "choice", options: options.map((o) => `$${o}$`), answer: options.indexOf(odd) } }],
      solution: [
        { latex: odd, note: askNot ? "A polynomial only has whole-number powers of x (0, 1, 2, …). This one has x in a denominator, a root, a negative or fractional power, or x as a power." : "Every power of x here is a whole number (0, 1, 2, …), so it is a polynomial." },
      ],
    };
  },
};

const evaluatePoly: Generator = {
  id: "alg.poly.evaluate",
  skill: "alg.poly.evaluate",
  generate: (r) => {
    const p = randomPoly(r, 3, 5, 0.2);
    const a = r.nz(-3, 3);
    const v = p.at(a);
    return {
      prompt: `Given $f(x) = ${tex(p)}$, find $f(${a})$.`,
      answers: [{ spec: { kind: "number", value: v.toString() } }],
      bugs: [{ misconception: "squareNegative", value: new Poly(p.c.map((c, i) => (i % 2 === 0 && i > 0 ? c.neg() : c))).at(a).toString() }],
      solution: [
        { latex: `f(${a}) = ${substitutionLatex(p, a)}`, note: "Replace every x with the number, in brackets." },
        { latex: `= ${evaluatedTermsLatex(p, a)}`, note: "Work out each term. Watch the signs of the powers." },
        { latex: `= ${v.toLatex()}`, value: v.toString() },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 2: adding, subtracting and multiplying polynomials
 * ====================================================================== */

const addSub: Generator = {
  id: "alg.poly.addsub",
  skill: "alg.poly.addsub",
  generate: (r) => {
    const P = randomPoly(r, r.int(2, 3), 6, 0.15);
    const Q = randomPoly(r, 2, 6, 0.1);
    const minus = r.next() < 0.7;
    const res = minus ? P.sub(Q) : P.add(Q);
    const opened = `${tex(P)} ${followingTerms(minus ? Q.scale(-1) : Q)}`;
    return {
      prompt: `Simplify $(${tex(P)}) ${minus ? "-" : "+"} (${tex(Q)})$.`,
      work: { mode: "expr", start: `(${str(P)}) ${minus ? "-" : "+"} (${str(Q)})` },
      answers: [{ spec: { kind: "expr", value: str(res), form: "expanded" } }],
      solution: [
        { latex: `= ${opened}`, note: minus ? "Remove the brackets. The minus sign changes the sign of EVERY term in the second bracket." : "Remove the brackets: nothing changes after a plus sign.", value: `${str(P)} ${minus ? "-" : "+"} (${str(Q)})` },
        { latex: `= ${tex(res)}`, note: "Collect like terms: x³ with x³, x² with x², and so on.", value: str(res) },
      ],
    };
  },
};

/** (ax + b)(cx² + dx + e) with an area (grid) model. */
const multiply: Generator = {
  id: "alg.poly.mul",
  skill: "alg.poly.mul",
  generate: (r) => {
    const A = Poly.of(r.int(1, 3), r.nz(-5, 5));
    const B = Poly.of(r.int(1, 3), r.nz(-5, 5), r.nz(-6, 6));
    const res = A.mul(B);
    const rows = A.terms().map(({ coef, power }) => new Poly([...Array(power).fill(0), coef]));
    const cols = B.terms().map(({ coef, power }) => new Poly([...Array(power).fill(0), coef]));
    const products = rows.flatMap((x) => cols.map((y) => x.mul(y)));
    return {
      prompt: `Expand and simplify $(${tex(A)})(${tex(B)})$.`,
      work: { mode: "expr", start: `(${str(A)})(${str(B)})` },
      answers: [{ spec: { kind: "expr", value: str(res), form: "expanded" } }],
      grid: { rows: rows.map(str), cols: cols.map(str) },
      solution: [
        { latex: `= ${products.map((p, i) => (i === 0 ? tex(p) : tex(p).startsWith("-") ? `- ${tex(p).slice(1)}` : `+ ${tex(p)}`)).join(" ")}`, note: "Multiply each term of the first bracket by each term of the second (fill the grid).", value: products.map((p) => `(${str(p)})`).join(" + ") },
        { latex: `= ${tex(res)}`, note: "Collect like terms.", value: str(res) },
      ],
    };
  },
};

const square: Generator = {
  id: "alg.poly.square",
  skill: "alg.poly.mul",
  generate: (r) => {
    const [a, b] = [r.int(1, 4), r.nz(-7, 7)];
    const res = Poly.of(a * a, 2 * a * b, b * b);
    const ax = a === 1 ? "x" : `${a}x`;
    return {
      prompt: `Expand $(${ax} ${signed(b)})^2$.`,
      work: { mode: "expr", start: `(${a}x + ${b})^2` },
      answers: [{ spec: { kind: "expr", value: str(res), form: "expanded" } }],
      solution: [
        { latex: `= (${ax} ${signed(b)})(${ax} ${signed(b)})`, note: "Squaring means multiplying the bracket by itself.", value: `(${a}x + ${b})(${a}x + ${b})` },
        { latex: `= ${a * a === 1 ? "" : a * a}x^2 ${signed(a * b)}x ${signed(a * b)}x ${signed(b * b)}`, note: "Four products. Do not forget the two middle terms." },
        { latex: `= ${tex(res)}`, value: str(res) },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 3: long division
 * ====================================================================== */

const numberDivision: Generator = {
  id: "num.longdiv",
  skill: "alg.div.number",
  generate: (r) => {
    const divisor = r.int(3, 9);
    const dividend = r.int(1000, 9999);
    const { layout, quotient, remainder } = numberDivisionLayout(dividend, divisor);
    return {
      prompt: `Work out $${dividend} \\div ${divisor}$ by long division. Give the quotient and the remainder.`,
      answers: [
        { label: "Quotient", spec: { kind: "number", value: String(quotient) } },
        { label: "Remainder", spec: { kind: "number", value: String(remainder) } },
      ],
      division: layout,
      solution: [
        { latex: `${dividend} = ${divisor} \\times ${quotient} + ${remainder}`, note: "Check: divisor × quotient + remainder gives back the number." },
        { latex: `\\text{Quotient } ${quotient}, \\text{ remainder } ${remainder}` },
      ],
    };
  },
};

/** The wrong division you get by adding instead of subtracting the second term at each stage. */
function signSlipDivision(f: Poly, a: number): { q: Poly; rem: Frac } {
  const c = [...f.c].reverse().map((x) => x.value());
  const q: number[] = [];
  let carry = c[0];
  for (let i = 1; i < c.length; i++) {
    q.push(carry);
    // Correct: next = c[i] + a·carry. The slip subtracts instead: c[i] − a·carry.
    carry = c[i] - a * carry;
  }
  return { q: Poly.of(...q), rem: F(carry) };
}

const polyDivision: Generator = {
  id: "alg.poly.div",
  skill: "alg.div.poly",
  generate: (r) => {
    const a = r.nz(-4, 4);
    const f = Poly.of(r.int(1, 3), r.next() < 0.3 ? 0 : r.nz(-6, 6), r.int(-8, 8), r.int(-9, 9));
    const d = Poly.of(1, -a);
    const { quotient, remainder } = f.divide(d);
    const slip = signSlipDivision(f, a);
    const missing = f.coef(2).isZero();
    return {
      prompt: `Divide $${tex(f)}$ by $${linearLatex(1, -a)}$. Give the quotient and the remainder.`,
      answers: [
        { label: "Quotient", spec: { kind: "expr", value: str(quotient), form: "expanded" } },
        { label: "Remainder", spec: { kind: "number", value: remainder.coef(0).toString() } },
      ],
      bugs: [
        { misconception: "divisionSign", answer: 0, value: str(slip.q) },
        { misconception: "divisionSign", answer: 1, value: slip.rem.toString() },
      ],
      division: polyDivisionLayout(f, d),
      solution: [
        ...(missing ? [{ latex: `${tex(f).replace(/x\^\{3\}/, "x^{3} + 0x^{2}")}`, note: "There is no x² term, so write 0x² to keep the columns lined up." }] : []),
        ...f.divide(d).steps.map((s) => ({
          latex: `${tex(s.term)} \\times ${linearLatex(1, -a)} = ${tex(s.product)}`,
          note: `Divide the first term by x to get ${s.term.toLatex() === "1" ? "1" : `$${tex(s.term)}$`}. Multiply back, then subtract to leave $${tex(s.after)}$.`,
        })),
        { latex: `\\text{Quotient} = ${tex(quotient)}, \\quad \\text{Remainder} = ${remainder.coef(0).toLatex()}`, value: str(quotient) },
      ],
    };
  },
};

/* ======================================================================
 * Lesson 4: the remainder theorem
 * ====================================================================== */

const remainder: Generator = {
  id: "alg.rem.find",
  skill: "alg.rem",
  generate: (r) => {
    const f = randomPoly(r, 3, 5, 0.2);
    const kind = r.pick(["minus", "plus", "plus", "linear"] as const);
    let divisorTex: string;
    let root: Frac;
    let bug: { misconception: string; value: string };
    if (kind === "linear") {
      const k = r.pick([2, 3]);
      const m = r.nz(-3, 3);
      root = F(m, k);
      divisorTex = linearLatex(k, -m);
      bug = { misconception: "linearRoot", value: f.at(m).toString() };
    } else {
      const a = r.int(1, 4);
      root = F(kind === "minus" ? a : -a);
      divisorTex = linearLatex(1, kind === "minus" ? -a : a);
      bug = { misconception: "factorSign", value: f.at(root.neg()).toString() };
    }
    const R = f.at(root);
    return {
      prompt: `Find the remainder when $f(x) = ${tex(f)}$ is divided by $${divisorTex}$.`,
      answers: [{ spec: { kind: "number", value: R.toString() } }],
      bugs: [bug],
      solution: [
        { latex: `${divisorTex.replace(/[()]/g, "")} = 0 \\Rightarrow x = ${root.toLatex()}`, note: "Find the value of x that makes the divisor zero.", mark: "M1" },
        { latex: `R = f(${root.toLatex()}) = ${substitutionLatex(f, root)}`, note: "By the remainder theorem, the remainder is f of that value." },
        { latex: `= ${evaluatedTermsLatex(f, root)}` },
        { latex: `R = ${R.toLatex()}`, mark: "A1", value: R.toString() },
      ],
    };
  },
};

const remainderTable: Generator = {
  id: "alg.rem.table",
  skill: "alg.rem",
  generate: (r) => {
    const f = Poly.of(1, r.nz(-3, 3), r.int(-5, 5), r.int(-6, 6));
    const as = r.shuffle([1, 2, -1, -2, 3]).slice(0, 3);
    return {
      prompt: `$f(x) = ${tex(f)}$. On paper, divide $f(x)$ by each divisor and write the remainder. Then work out $f(a)$.`,
      answers: [],
      table: {
        headers: ["Divisor", "a", "Remainder after dividing", "f(a)"],
        rows: as.map((a) => ({
          cells: [{ latex: linearLatex(1, -a) }, { latex: String(a) }, { answer: { kind: "number", value: f.at(a).toString() } }, { answer: { kind: "number", value: f.at(a).toString() } }],
        })),
      },
      solution: as.map((a) => ({ latex: `${linearLatex(1, -a)}: \\; R = ${f.divide(Poly.of(1, -a)).remainder.coef(0).toLatex()}, \\quad f(${a}) = ${f.at(a).toLatex()}` })),
    };
  },
};

/* ======================================================================
 * Exam questions (GCE style, M/A/B marks with follow-through)
 * ====================================================================== */

/** Values a learner gets with the right method but one arithmetic slip in one term (earns M, not A). */
function oneTermSlips(p: Poly, a: number): number[] {
  const terms = p.terms().map(({ coef, power }) => coef.value() * a ** power);
  const total = terms.reduce((s, t) => s + t, 0);
  return terms.map((t) => total - 2 * t);
}

const examBasics: ExamGenerator = {
  id: "exam.poly.basics",
  skill: "alg.poly.terms",
  generate: (r) => {
    const p = randomPoly(r, r.int(3, 4), 6, 0.25);
    const a = -2;
    const v = p.at(a).value();
    const slips = oneTermSlips(p, a);
    return {
      model: [[String(p.degree)], [p.leading.toString()], [String(v)]],
      intro: `$f(x) = ${jumbled(r, p)}$`,
      parts: [
        { label: "(a)", prompt: "State the degree of f(x).", inputs: [{ label: "Degree" }], marks: [{ type: "B", text: `Degree ${p.degree}`, check: (c) => near(c.num(0), p.degree) }], solution: [{ latex: `\\text{Degree} = ${p.degree}`, mark: "B1" }] },
        { label: "(b)", prompt: "State the leading coefficient.", inputs: [{ label: "Leading coefficient" }], marks: [{ type: "B", text: `Leading coefficient ${p.leading.toString()}`, check: (c) => near(c.num(1), p.leading.value()) }], solution: [{ latex: `${p.leading.toLatex()}`, mark: "B1" }] },
        {
          label: "(c)",
          prompt: "Find f(−2).",
          inputs: [{ label: "f(−2)" }],
          marks: [
            { type: "M", text: "Substitute x = −2 into every term", check: (c) => near(c.num(2), v) || slips.some((s) => near(c.num(2), s)) },
            { type: "A", text: `f(−2) = ${v}`, check: (c) => near(c.num(2), v) },
          ],
          solution: [
            { latex: `f(-2) = ${substitutionLatex(p, a)}`, mark: "M1" },
            { latex: `= ${evaluatedTermsLatex(p, a)}` },
            { latex: `= ${v}`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

const examExpand: ExamGenerator = {
  id: "exam.poly.expand",
  skill: "alg.poly.mul",
  generate: (r) => {
    const A = Poly.of(1, r.nz(-5, 5));
    const B = Poly.of(2, r.nz(-6, 6), r.nz(-7, 7));
    const res = A.mul(B);
    const want = [...res.c].map((x) => x.value());
    return {
      model: [[res.toString()], [res.coef(2).toString()]],
      intro: `$f(x) = (${tex(A)})(${tex(B)})$`,
      parts: [
        {
          label: "(a)",
          prompt: "Expand and simplify f(x).",
          inputs: [{ label: "f(x) =" }],
          marks: [
            {
              type: "M",
              text: "Multiply out: all six products, at most one slip",
              check: (c) => {
                const got = coefficientsOf(c.raw(0), 3);
                return !!got && got.filter((g, i) => Math.abs(g - (want[i] ?? 0)) > 1e-9).length <= 1;
              },
            },
            { type: "A", text: `${res.toString()}`, check: (c) => (coefficientsOf(c.raw(0), 3) ?? []).every((g, i) => Math.abs(g - (want[i] ?? 0)) < 1e-9) && !!coefficientsOf(c.raw(0), 3) },
          ],
          solution: [
            { latex: `f(x) = 2x^3 ${signed(B.coef(1))}x^2 ${signed(B.coef(0))}x ${signed(A.coef(0).mul(2))}x^2 ${signed(A.coef(0).mul(B.coef(1)))}x ${signed(A.coef(0).mul(B.coef(0)))}`, mark: "M1" },
            { latex: `= ${tex(res)}`, mark: "A1" },
          ],
        },
        {
          label: "(b)",
          prompt: "Hence state the coefficient of x² in f(x).",
          inputs: [{ label: "Coefficient of x²" }],
          marks: [
            {
              type: "B",
              text: `${res.coef(2).toString()} (or follow-through from their (a))`,
              ft: true,
              check: (c) => near(c.num(1), res.coef(2).value()) || near(c.num(1), coefficientsOf(c.raw(0), 3)?.[2] ?? NaN),
            },
          ],
          solution: [{ latex: `${res.coef(2).toLatex()}`, mark: "B1ft" }],
        },
      ],
    };
  },
};

const examDivide: ExamGenerator = {
  id: "exam.poly.divide",
  skill: "alg.div.poly",
  generate: (r) => {
    const a = r.nz(-3, 3);
    const f = Poly.of(2, r.nz(-5, 5), r.int(-6, 6), r.int(-8, 8));
    const d = Poly.of(1, -a);
    const { quotient, remainder: rem } = f.divide(d);
    const R = rem.coef(0).value();
    return {
      model: [[quotient.toString(), String(R)], [`(x ${a < 0 ? "+" : "-"} ${Math.abs(a)})(${quotient.toString()}) ${R < 0 ? "-" : "+"} ${Math.abs(R)}`]],
      intro: `$f(x) = ${tex(f)}$`,
      parts: [
        {
          label: "(a)",
          prompt: `Divide f(x) by ${linearLatex(1, -a).replace(/[{}]/g, "")}, giving the quotient and the remainder.`,
          inputs: [{ label: "Quotient" }, { label: "Remainder" }],
          marks: [
            { type: "M", text: "Divide: first term 2x² correct in the quotient", check: (c) => (coefficientsOf(c.raw(0, 0), 2)?.[2] ?? 0) === 2 },
            { type: "A", text: `Quotient ${quotient.toString()}`, check: (c) => (coefficientsOf(c.raw(0, 0), 2) ?? []).every((g, i) => Math.abs(g - quotient.coef(i).value()) < 1e-9) && !!coefficientsOf(c.raw(0, 0), 2) },
            { type: "A", text: `Remainder ${R}`, check: (c) => near(c.num(0, 1), R) },
          ],
          solution: [
            ...f.divide(d).steps.map((s, i) => ({ latex: `${tex(s.term)}${linearLatex(1, -a)} = ${tex(s.product)}`, mark: i === 0 ? "M1" : undefined })),
            { latex: `\\text{Quotient } ${tex(quotient)}`, mark: "A1" },
            { latex: `\\text{Remainder } ${R}`, mark: "A1" },
          ],
        },
        {
          label: "(b)",
          prompt: `Hence write f(x) in the form (x ${a > 0 ? "−" : "+"} ${Math.abs(a)})Q(x) + R.`,
          inputs: [{ label: "f(x) =" }],
          marks: [{ type: "B", text: "Correct form (follow-through from their (a))", ft: true, check: (c) => !!coefficientsOf(c.raw(1), 3) && (coefficientsOf(c.raw(1), 3) ?? []).every((g, i) => Math.abs(g - f.coef(i).value()) < 1e-9) }],
          solution: [{ latex: `f(x) = ${linearLatex(1, -a)}(${tex(quotient)}) ${signed(R)}`, mark: "B1" }],
        },
      ],
    };
  },
};

const examRemainder: ExamGenerator = {
  id: "exam.rem.unknowns",
  skill: "alg.rem",
  generate: (r) => {
    // f(x) = x³ + px² + qx + c with two remainder conditions.
    const [p, q, c] = [r.nz(-5, 5), r.nz(-8, 8), r.int(-6, 6)];
    const [a1, a2] = [r.int(1, 3), -r.int(1, 3)];
    const fx = (P: number, Q: number, x: number) => x ** 3 + P * x * x + Q * x + c;
    const R1 = fx(p, q, a1);
    const R2 = fx(p, q, a2);
    const b = r.pick([2, -3, 3].filter((x) => x !== a1 && x !== a2));
    const R3 = fx(p, q, b);
    const eq1 = (P: number, Q: number) => near(fx(P, Q, a1), R1);
    const eq2 = (P: number, Q: number) => near(fx(P, Q, a2), R2);
    return {
      model: [[String(p), String(q)], [String(R3)]],
      intro: `$f(x) = x^3 + px^2 + qx ${signed(c)}$, where $p$ and $q$ are constants. When $f(x)$ is divided by $${linearLatex(1, -a1)}$ the remainder is $${R1}$. When $f(x)$ is divided by $${linearLatex(1, -a2)}$ the remainder is $${R2}$.`,
      parts: [
        {
          label: "(a)",
          prompt: "Find the values of p and q.",
          inputs: [{ label: "p" }, { label: "q" }],
          marks: [
            { type: "M", text: `Use f(${a1}) = ${R1} to form an equation in p and q`, check: (m) => m.num(0, 0) !== null && m.num(0, 1) !== null && eq1(m.num(0, 0)!, m.num(0, 1)!) },
            { type: "M", text: `Use f(${a2}) = ${R2} to form a second equation`, check: (m) => m.num(0, 0) !== null && m.num(0, 1) !== null && eq2(m.num(0, 0)!, m.num(0, 1)!) },
            { type: "A", text: `p = ${p}`, check: (m) => near(m.num(0, 0), p) },
            { type: "A", text: `q = ${q}`, check: (m) => near(m.num(0, 1), q) },
          ],
          solution: [
            { latex: `f(${a1}) = ${a1 ** 3} + ${a1 * a1}p ${signed(a1)}q ${signed(c)} = ${R1}`, mark: "M1" },
            { latex: `${a1 * a1}p ${signed(a1)}q = ${R1 - a1 ** 3 - c}` },
            { latex: `f(${a2}) = ${a2 ** 3} + ${a2 * a2}p ${signed(a2)}q ${signed(c)} = ${R2}`, mark: "M1" },
            { latex: `${a2 * a2}p ${signed(a2)}q = ${R2 - a2 ** 3 - c}` },
            { latex: `\\text{Solving simultaneously: } p = ${p}`, mark: "A1" },
            { latex: `q = ${q}`, mark: "A1" },
          ],
        },
        {
          label: "(b)",
          prompt: `Find the remainder when f(x) is divided by ${linearLatex(1, -b).replace(/[{}]/g, "")}.`,
          inputs: [{ label: "Remainder" }],
          marks: [
            { type: "M", text: `Find f(${b}) using their p and q`, ft: true, check: (m) => m.num(0, 0) !== null && m.num(0, 1) !== null && near(m.num(1), fx(m.num(0, 0)!, m.num(0, 1)!, b)) },
            { type: "A", text: `Remainder ${R3}`, check: (m) => near(m.num(1), R3) },
          ],
          solution: [
            { latex: `f(${b}) = ${inBrackets(b)}^3 ${signed(p)}${inBrackets(b)}^2 ${signed(q)}${inBrackets(b)} ${signed(c)}`, mark: "M1" },
            { latex: `= ${R3}`, mark: "A1" },
          ],
        },
      ],
    };
  },
};

export const generators: Generator[] = [negatives, fractions, expand, factorise, indices, substitute, rearrange, parts, isPoly, evaluatePoly, addSub, multiply, square, numberDivision, polyDivision, remainder, remainderTable];
export const examGenerators: ExamGenerator[] = [examBasics, examExpand, examDivide, examRemainder];

