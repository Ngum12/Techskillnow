import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, parseExpr, parseStatement, previewLatex, toLatex, tryParse } from "@/lib/maths/expr";
import { equationStepValid, exprEquivalent, realRoots, sameSolutionSet } from "@/lib/maths/equiv";
import { checkAnswer, isExpanded, isFactorised, numberValue } from "@/lib/maths/answer";
import { checkLine } from "@/lib/maths/stepcheck";
import { detectMisconception } from "@/lib/maths/misconceptions";
import { markExam, near } from "@/lib/maths/exam";
import { Frac } from "@/lib/maths/frac";
import { Poly } from "@/lib/maths/poly";
import type { ExamQuestion, Question } from "@/lib/maths/types";

const E = (s: string) => parseExpr(s);
const S = (s: string) => parseStatement(s);
const val = (s: string, x = 0) => evaluate(E(s), { x });

/* ---------- Parser ---------- */

test("parser: implicit multiplication, powers, unary minus and functions", () => {
  assert.equal(val("2x^2", 3), 18);
  assert.equal(val("-x^2", 3), -9);
  assert.equal(val("(x+1)(x-2)", 4), 10);
  assert.equal(val("3(x+1)", 2), 9);
  assert.equal(val("x^-1", 4), 0.25);
  assert.equal(val("2^3^2"), 512); // right-associative
  assert.equal(val("x^2/3", 3), 3);
  assert.equal(val("1/2x", 4), 2); // (1/2)·x
  assert.equal(val("sqrt(16)"), 4);
  assert.equal(val("√9"), 3);
  assert.equal(val("|x-5|", 2), 3);
  assert.equal(val("|x||x-1|", -2), 6);
  assert.equal(val("2|x|", -3), 6);
  assert.ok(Math.abs(val("e^x", 1) - Math.E) < 1e-12);
  assert.ok(Math.abs(val("ln(e^2)") - 2) < 1e-12);
  assert.equal(val("sin(0)"), 0);
  assert.equal(val("3 × 4 ÷ 2"), 6);
  assert.equal(val("x − 1", 3), 2);
  assert.ok(Number.isNaN(val("sqrt(-1)")));
});

test("parser: relations, chains and 'or'", () => {
  assert.equal(S("x = 2 or x = -3").or.length, 2);
  assert.deepEqual(S("-1 < x <= 4").or[0].ops, ["<", "<="]);
  assert.deepEqual(S("x ≥ 2").or[0].ops, [">="]);
  assert.equal(S("x = 1, x = 2").or.length, 2);
  assert.equal(tryParse("2x +"), null);
  assert.equal(tryParse("(x+1"), null);
});

test("parser: LaTeX output reads like a textbook", () => {
  assert.equal(toLatex(E("2x^2 - 3x + 1")), "2x^{2} - 3x + 1");
  assert.equal(toLatex(E("(x+1)(x-2)")), "\\left(x + 1\\right)\\left(x - 2\\right)");
  assert.equal(toLatex(E("(x+1)/(x-2)")), "\\frac{x + 1}{x - 2}");
  assert.equal(toLatex(E("3 * 4")), "3 \\times 4");
  assert.equal(toLatex(E("x - (2x - 1)")), "x - \\left(2x - 1\\right)");
  assert.equal(previewLatex("x <= 3"), "x \\le 3");
});

/* ---------- Equivalence ---------- */

test("equivalence: expressions in any equivalent form", () => {
  assert.ok(exprEquivalent(E("(x+1)^2"), E("x^2 + 2x + 1")));
  assert.ok(exprEquivalent(E("(x^2-1)/(x-1)"), E("x+1")));
  assert.ok(exprEquivalent(E("2(x-3) + x"), E("3x - 6")));
  assert.ok(!exprEquivalent(E("(x+1)^2"), E("x^2 + 1")));
  assert.ok(!exprEquivalent(E("x^3"), E("x^2")));
  assert.ok(exprEquivalent(E("a(b + c)"), E("ab + ac")));
});

test("equivalence: equation steps keep exactly the same solutions", () => {
  const start = S("x^3 - 6x^2 + 11x - 6 = 0");
  assert.ok(equationStepValid(start, S("(x-1)(x^2-5x+6) = 0")));
  assert.ok(equationStepValid(start, S("(x-1)(x-2)(x-3) = 0")));
  assert.ok(equationStepValid(start, S("x - 1 = 0 or x - 2 = 0 or x - 3 = 0")));
  assert.ok(equationStepValid(start, S("x = 1 or x = 2 or x = 3")));
  assert.ok(!equationStepValid(start, S("x = 1 or x = 2"))); // a root lost
  assert.ok(!equationStepValid(start, S("x^2 - 5x + 6 = 0"))); // divided by (x − 1)
  assert.ok(equationStepValid(S("2x + 1 = 7"), S("2x = 6")));
  assert.ok(equationStepValid(S("2x + 1 = 7"), S("x = 3")));
  assert.ok(!equationStepValid(S("2x + 1 = 7"), S("x = 4")));
  // x(x² + 1) = 0: leaving out x² + 1 (no real roots) is fine.
  assert.ok(equationStepValid(S("x^3 + x = 0"), S("x = 0")));
});

test("equivalence: inequalities and solution sets", () => {
  assert.ok(sameSolutionSet(S("2x - 3 < 5"), S("x < 4")));
  assert.ok(!sameSolutionSet(S("2x - 3 < 5"), S("x <= 4")));
  assert.ok(sameSolutionSet(S("-2x > 6"), S("x < -3")));
  assert.ok(sameSolutionSet(S("x^2 - x - 6 < 0"), S("-2 < x < 3")));
  assert.ok(sameSolutionSet(S("x^2 - x - 6 >= 0"), S("x <= -2 or x >= 3")));
  assert.ok(sameSolutionSet(S("|x - 2| <= 5"), S("-3 <= x <= 7")));
  assert.ok(sameSolutionSet(S("x = 3 or x = -1"), S("x = -1 or x = 3")));
  assert.deepEqual(realRoots((x) => (x - 2) ** 2 * (x + 1)), [-1, 2]);
});

/* ---------- Answers and forms ---------- */

test("answers: equivalent forms accepted; required forms enforced", () => {
  assert.ok(isExpanded(E("2x^3 - x + 4")));
  assert.ok(!isExpanded(E("2x(x+1)")));
  assert.ok(!isExpanded(E("3x + 2x")));
  assert.ok(isFactorised(E("(x-1)(x+2)(x-3)")));
  assert.ok(isFactorised(E("2(x-1)^2")));
  assert.ok(!isFactorised(E("x^2 - 1")));
  assert.ok(checkAnswer({ kind: "expr", value: "x^2+2x+1", form: "expanded" }, "1 + 2x + x^2").ok);
  assert.equal(checkAnswer({ kind: "expr", value: "x^2+2x+1", form: "expanded" }, "(x+1)^2").reason, "form");
  assert.equal(checkAnswer({ kind: "expr", value: "(x-1)(x+2)", form: "factorised" }, "x^2+x-2").reason, "form");
  assert.ok(checkAnswer({ kind: "expr", value: "(x-1)(x+2)", form: "factorised" }, "(x+2)(x-1)").ok);
  assert.ok(checkAnswer({ kind: "number", value: "-3/4" }, "-0.75").ok);
  assert.ok(checkAnswer({ kind: "number", value: "5" }, "R = 5").ok);
  assert.equal(numberValue("2^3"), 8);
  assert.ok(checkAnswer({ kind: "solutions", values: ["2", "-1/2"] }, "x = -0.5 or x = 2").ok);
  assert.equal(checkAnswer({ kind: "solutions", values: ["2"] }, "x - 2 = 0").reason, "notSolved");
  assert.ok(checkAnswer({ kind: "relation", value: "x < -1 or x > 3" }, "x > 3 or x < -1").ok);
  assert.equal(checkAnswer({ kind: "relation", value: "x < 4" }, "x <= 4").reason, "wrong");
});

/* ---------- StepChecker ---------- */

const expandQ: Question = {
  generator: "t",
  skill: "s",
  seed: 1,
  prompt: "",
  work: { mode: "expr", start: "(x+3)^2 - (x - 1)" },
  answers: [{ spec: { kind: "expr", value: "x^2 + 5x + 10", form: "expanded" } }],
  solution: [],
};

test("step checker: valid lines, different methods, final answer, wrong lines", () => {
  assert.equal(checkLine(expandQ, "x^2 + 6x + 9 - x + 1").status, "valid");
  assert.equal(checkLine(expandQ, "(x+3)(x+3) - x + 1").status, "valid");
  assert.equal(checkLine(expandQ, "x^2 + 5x + 10").status, "final");
  assert.equal(checkLine(expandQ, "= 10 + 5x + x^2").status, "final");
  assert.equal(checkLine(expandQ, "x^2 + 6x + 9 - x - 1").status, "wrong");
  assert.equal(checkLine(expandQ, "x^2 + 5x +").status, "unreadable");
  const eq: Question = { ...expandQ, work: { mode: "equation", start: "2x^2 - 5x - 3 = 0" }, answers: [{ spec: { kind: "solutions", values: ["3", "-1/2"] } }] };
  assert.equal(checkLine(eq, "(2x + 1)(x - 3) = 0").status, "valid");
  assert.equal(checkLine(eq, "x = 3 or x = -1/2").status, "final");
  assert.equal(checkLine(eq, "x = 3").status, "wrong");
  const ineq: Question = { ...expandQ, work: { mode: "relation", start: "5 - 2x > 11" }, answers: [{ spec: { kind: "relation", value: "x < -3" } }] };
  assert.equal(checkLine(ineq, "-2x > 6").status, "valid");
  assert.equal(checkLine(ineq, "x < -3").status, "final");
  assert.equal(checkLine(ineq, "x > -3").status, "wrong");
});

/* ---------- Misconceptions ---------- */

test("misconceptions: each classic error is recognised", () => {
  const q = (start: string, mode: "expr" | "equation" | "relation" = "expr"): Question => ({ ...expandQ, work: { mode, start } });
  assert.equal(detectMisconception(q("(x + 4)^2"), "x^2 + 16"), "squareOfSum");
  assert.equal(detectMisconception(q("(x+3)/x"), "3"), "cancelTerms");
  assert.equal(detectMisconception(q("2x^2 + 3x - (x^2 - 4x + 1)"), "x^2 - x + 1"), "negDistribution");
  assert.equal(detectMisconception(q("|x - 3|"), "|x| - 3"), "modulusSum");
  assert.equal(detectMisconception(q("5 - 2x > 11", "relation"), "x > -3"), "inequalityFlip");
  // A known wrong answer from a generator: f(a) instead of f(−a).
  const rem: Question = { ...expandQ, work: undefined, answers: [{ spec: { kind: "number", value: "-4" } }], bugs: [{ misconception: "factorSign", value: "8" }] };
  assert.equal(detectMisconception(rem, "8", 0), "factorSign");
  assert.equal(detectMisconception(q("(x+4)^2"), "x^2 + 8x + 15"), null);
});

/* ---------- M/A marking with follow-through ---------- */

const exam: ExamQuestion = {
  generator: "t",
  seed: 1,
  model: [["3"], ["-8"]],
  intro: "f(x) = x³ + px − 4. When f(x) is divided by (x − 2) the remainder is 10.",
  parts: [
    {
      label: "(a)",
      prompt: "Find p.",
      inputs: [{ label: "p" }],
      marks: [
        { type: "M", text: "Use f(2) = 10", check: (c) => c.num(0) !== null },
        { type: "A", text: "p = 3", check: (c) => near(c.num(0), 3) },
      ],
      solution: [],
    },
    {
      label: "(b)",
      prompt: "Find the remainder when f(x) is divided by (x + 1).",
      inputs: [{ label: "R" }],
      marks: [
        { type: "M", text: "Use f(−1) with their p", ft: true, check: (c) => c.num(0) !== null && near(c.num(1), -1 - c.num(0)! - 4) },
        { type: "A", text: "R = −8", check: (c) => near(c.num(1), -8) },
      ],
      solution: [],
    },
  ],
};

test("exam marking: full marks, follow-through after a slip, and dependent A marks", () => {
  assert.equal(markExam(exam, [["3"], ["-8"]]).total, 4);
  // Wrong p = 4, but (b) is correct for p = 4: M1 (a), A0, then M1ft, A0.
  const ft = markExam(exam, [["4"], ["-9"]]);
  assert.deepEqual(ft.parts.map((p) => p.points.map((x) => x.got)), [[true, false], [true, false]]);
  assert.ok(ft.parts[1].points[0].ft);
  // Nothing typed: no marks, and A cannot be earned without its M.
  assert.equal(markExam(exam, [[""], ["-8"]]).parts[0].got, 0);
  assert.equal(markExam(exam, [["3"], ["5"]]).parts[1].got, 0);
});

/* ---------- Exact arithmetic ---------- */

test("fractions and polynomials: exact arithmetic and long division", () => {
  assert.ok(new Frac(1, 2).add(new Frac(1, 3)).eq(new Frac(5, 6)));
  assert.equal(new Frac(-6, -4).toString(), "3/2");
  const f = Poly.of(2, -3, 0, 5); // 2x³ − 3x² + 5
  const { quotient, remainder, steps } = f.divide(Poly.of(1, -2));
  assert.equal(quotient.toString(), "2x^2 + x + 2");
  assert.equal(remainder.toString(), "9");
  assert.ok(f.at(2).eq(9), "remainder theorem");
  assert.equal(steps.length, 3);
  assert.equal(Poly.fromRoots([1, -2]).toString(), "x^2 + x - 2");
  assert.equal(Poly.of(new Frac(1, 2), 0, -1).toString(), "(1/2)x^2 - 1");
  assert.equal(Poly.of(1, -1).toLatex(), "x - 1");
  assert.ok(exprEquivalent(E(f.toString()), E("2x^3 - 3x^2 + 5")));
});
