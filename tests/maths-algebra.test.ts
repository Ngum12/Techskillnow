import { test } from "node:test";
import assert from "node:assert/strict";
import { generators, examGenerators } from "@/content/maths/algebra/generators";
import { runExam, runGenerator } from "@/lib/maths/run";
import { checkAnswer, numberValue } from "@/lib/maths/answer";
import { checkLine } from "@/lib/maths/stepcheck";
import { detectMisconception } from "@/lib/maths/misconceptions";
import { markExam } from "@/lib/maths/exam";
import { parseExpr, tryParse } from "@/lib/maths/expr";
import { exprEquivalent } from "@/lib/maths/equiv";
import type { AnswerSpec, Question } from "@/lib/maths/types";

const SEEDS = Array.from({ length: 150 }, (_, i) => i * 7919 + 13);

/** The value a learner would type for a spec. */
function typed(spec: AnswerSpec): string {
  switch (spec.kind) {
    case "solutions":
      return spec.values.map((v) => `${spec.variable ?? "x"} = ${v}`).join(" or ");
    case "choice":
      return String(spec.answer);
    default:
      return spec.value;
  }
}

test("generators: every question is complete and its own answers pass", () => {
  for (const g of generators) {
    const seen = new Set<string>();
    for (const seed of SEEDS) {
      const q: Question = runGenerator(g, seed);
      const where = `${g.id} seed ${seed}`;
      assert.ok(q.prompt.length > 10, where);
      assert.ok(q.solution.length > 0, where);
      assert.ok(!/NaN|undefined|Infinity/.test(JSON.stringify(q)), `${where}: ${q.prompt}`);
      seen.add(q.prompt);
      // For "give a factor" questions, the model's factor is on the last working line.
      const own = (spec: AnswerSpec) => (spec.kind === "factorOf" ? q.solution[q.solution.length - 1].value! : typed(spec));
      for (const a of q.answers) assert.ok(checkAnswer(a.spec, own(a.spec)).ok, `${where}: own answer ${own(a.spec)} rejected`);
      if (q.work) {
        assert.ok(tryParse(q.work.start), `${where}: start`);
        assert.equal(checkLine(q, own(q.answers[0].spec)).status, "final", `${where}: answer not final from ${q.work.start}`);
        // Every model line that carries a value is a valid step.
        for (const line of q.solution.filter((l) => l.value)) assert.notEqual(checkLine(q, line.value!).status, "wrong", `${where}: model line ${line.value}`);
      }
      // Known wrong answers are wrong, and are recognised as their misconception.
      for (const bug of q.bugs ?? []) {
        const spec = q.answers[bug.answer ?? 0].spec;
        // What a learner would type for this wrong answer ("x = 7/2" for a solve question).
        const input = spec.kind === "solutions" ? bug.value.split(";").map((v) => `x = ${v}`).join(" or ") : bug.value;
        const same = spec.kind === "number" ? numberValue(bug.value) === numberValue(spec.value) : spec.kind === "expr" ? exprEquivalent(parseExpr(bug.value), parseExpr(spec.value)) : false;
        if (same) continue; // e.g. a sign slip that happens to give the right number
        assert.ok(!checkAnswer(spec, input).ok, `${where}: bug ${bug.misconception} accepted as correct`);
        // When two mistakes give the same wrong value, either explanation is fine.
        const ids = (q.bugs ?? []).filter((b) => (b.answer ?? 0) === (bug.answer ?? 0) && b.value === bug.value).map((b) => b.misconception);
        assert.ok([bug.misconception, ...ids].includes(detectMisconception(q, input, bug.answer ?? 0) ?? ""), `${where}: ${input}`);
      }
      if (q.table) for (const row of q.table.rows) for (const cell of row.cells) if ("answer" in cell) assert.ok(checkAnswer(cell.answer, typed(cell.answer)).ok, where);
      if (q.answers[0]?.spec.kind === "choice") {
        const spec = q.answers[0].spec;
        assert.ok(spec.answer >= 0 && spec.answer < spec.options.length, where);
      }
    }
    assert.ok(seen.size > SEEDS.length / 10 || g.id === "alg.poly.isPoly", `${g.id}: not enough variety (${seen.size})`);
  }
});

test("generators: division layouts match the arithmetic", () => {
  for (const id of ["num.longdiv", "alg.poly.div"]) {
    const g = generators.find((x) => x.id === id)!;
    for (const seed of SEEDS) {
      const q = runGenerator(g, seed);
      const d = q.division!;
      assert.ok(d.stages.length >= 1, `${id} ${seed}`);
      assert.equal(d.quotient.length, d.dividend.length);
      // Every quotient cell belongs to a stage.
      d.quotient.forEach((c, i) => assert.equal(!!c, d.quotientStage[i] >= 0, `${id} ${seed} col ${i}`));
      if (id === "num.longdiv") {
        const n = Number(d.dividend.join(""));
        const quotient = Number(q.answers[0].spec.kind === "number" ? q.answers[0].spec.value : NaN);
        const rem = Number(q.answers[1].spec.kind === "number" ? q.answers[1].spec.value : NaN);
        assert.equal(Number(d.quotient.join("") || "0"), quotient, `${seed}`);
        assert.equal(n, quotient * Number(d.divisor) + rem);
        assert.equal(Number(d.stages[d.stages.length - 1].after.join("")), rem);
      }
    }
  }
});

test("exam generators: model answers earn full marks; a slip keeps the method and follow-through marks", () => {
  for (const g of examGenerators) {
    for (const seed of SEEDS.slice(0, 120)) {
      const q = runExam(g, seed);
      const where = `${g.id} seed ${seed}`;
      assert.equal(q.model.length, q.parts.length, where);
      q.parts.forEach((p, i) => assert.equal(q.model[i].length, p.inputs.length, `${where} part ${i}`));
      const full = markExam(q, q.model);
      assert.equal(full.total, full.max, `${where}: ${JSON.stringify(full.parts.map((p) => p.points.filter((x) => !x.got).map((x) => x.text)))}`);
      assert.equal(markExam(q, q.model.map((p) => p.map(() => ""))).total, 0, `${where}: blank scores 0`);
    }
  }
  // Follow-through: wrong p and q in (a) that still satisfy the first condition; (b) done correctly with them.
  const g = examGenerators.find((x) => x.id === "exam.rem.unknowns")!;
  for (const seed of SEEDS.slice(0, 60)) {
    const q = runExam(g, seed);
    const [p, qq] = q.model[0].map(Number);
    const res = markExam(q, [[String(p + 1), String(qq)], ["999"]]);
    assert.equal(res.parts[0].points[2].got, false, "A1 for p lost");
    assert.equal(res.parts[1].points[0].got, false, "999 is not f(b) for their values");
  }
});

test("misconceptions file covers every id the generators and rules use", async () => {
  const rules = (await import("@/content/maths/algebra/misconceptions.json", { with: { type: "json" } })).default as { id: string; hint: string }[];
  const ids = new Set(rules.map((r) => r.id));
  for (const g of generators)
    for (const seed of SEEDS.slice(0, 40))
      for (const bug of runGenerator(g, seed).bugs ?? []) assert.ok(ids.has(bug.misconception), `missing hint for ${bug.misconception}`);
  for (const id of ["squareOfSum", "negDistribution", "cancelTerms", "modulusSum", "inequalityFlip", "unknownSign"]) assert.ok(ids.has(id), id);
  for (const r of rules) assert.ok(r.hint.length > 20, r.id);
});

import { latexToLinear, sameLine } from "@/lib/maths/equiv";

test("division layouts: every cell a learner fills can be read and checked", () => {
  assert.equal(latexToLinear("-2x^{2}"), "-2x^2");
  assert.equal(latexToLinear("+6"), "6");
  assert.equal(latexToLinear(String.raw`\frac{1}{2}x`), "(1/2)x");
  assert.ok(sameLine("-2x^2", "-2x^2"));
  assert.ok(sameLine("0x^2", "0"));
  assert.ok(!sameLine("x^2", "-x^2"));
  const g = generators.find((x) => x.id === "alg.poly.div")!;
  for (const seed of SEEDS) {
    const d = runGenerator(g, seed).division!;
    const cells = [...d.quotient, ...d.stages.flatMap((s) => [...s.product, ...s.after])].filter(Boolean);
    for (const c of cells) {
      const lin = latexToLinear(c);
      assert.ok(tryParse(lin), `seed ${seed}: "${c}" → "${lin}"`);
      assert.ok(sameLine(lin, lin), `seed ${seed}: ${lin}`);
    }
  }
});

test("working lines: substituted values are bracketed and no control characters slip into LaTeX", () => {
  for (const g of generators)
    for (const seed of SEEDS.slice(0, 100)) {
      const q = runGenerator(g, seed);
      for (const l of q.solution) {
        assert.ok(!/[\r\n\t\f\v]/.test(l.latex), `${g.id} ${seed}: control character in ${JSON.stringify(l.latex)}`);
        assert.ok(!/\d\d\^\{/.test(l.latex.replace(/\left\([^)]*\right\)/g, "")) || g.id === "num.longdiv", `${g.id} ${seed}: unbracketed substitution in ${l.latex}`);
      }
    }
});
