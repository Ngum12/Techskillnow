import { test } from "node:test";
import assert from "node:assert/strict";
import course from "@/content/maths/functions/en";
import { lessons } from "@/content/maths/functions/lessons";
import { generators, examGenerators } from "@/content/maths/functions/generators";
import { topics } from "@/content/maths/registry";
import { runExam, runGenerator } from "@/lib/maths/run";
import { checkAnswer, numberValue } from "@/lib/maths/answer";
import { checkLine } from "@/lib/maths/stepcheck";
import { detectMisconception } from "@/lib/maths/misconceptions";
import { markExam } from "@/lib/maths/exam";
import { evaluate, parseExpr, tryParse } from "@/lib/maths/expr";
import { exprEquivalent } from "@/lib/maths/equiv";
import { runChain } from "@/lib/maths/functions";
import { pointMet } from "@/lib/chem/marking";
import type { AnswerSpec, GraphSpec, LessonPart, Question } from "@/lib/maths/types";

const SEEDS = Array.from({ length: 150 }, (_, i) => i * 7919 + 13);
const gen = (id: string) => generators.find((g) => g.id === id);
const exam = (id: string) => examGenerators.find((g) => g.id === id);

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

function graphParses(g: GraphSpec, where: string) {
  for (const c of g.curves) {
    if (c.param) for (const e of [c.param.x, c.param.y]) assert.doesNotThrow(() => parseExpr(e), `${where}: ${e}`);
    else assert.doesNotThrow(() => parseExpr(c.expr), `${where}: ${c.expr}`);
  }
  for (const e of Object.values(g.select?.exprs ?? {})) assert.doesNotThrow(() => parseExpr(e), `${where}: ${e}`);
  for (const p of g.params ?? []) assert.ok(p.min <= p.value && p.value <= p.max, `${where}: slider ${p.name}`);
  assert.ok(g.x[0] < g.x[1] && g.y[0] < g.y[1], `${where}: window`);
}

test("functions course: price, series, registry, free diagnostic and first lesson", async () => {
  assert.equal(course.id, "maths-functions");
  assert.equal(course.price, 500);
  assert.equal(course.series, "GCE A Level Maths · Pure Mathematics");
  assert.equal(course.steps.length, 11);
  assert.equal(course.freeSteps, 2);
  assert.equal(course.assessment.questions.length, 10);
  for (const q of course.assessment.questions) assert.ok(q.answer < q.options.length && q.step <= course.steps.length, q.question);
  for (const s of course.steps) for (const b of s.body) assert.ok(!/\$|\\/.test(b), `plain intro: ${b}`);
  const mod = await topics.functions();
  assert.equal(mod.generators.length, generators.length);
  // The Algebra prerequisites are available for the starting check.
  for (const id of ["pre.substitute", "pre.factorise", "pre.rearrange", "alg.ineq.quad", "alg.mod.eq"]) assert.ok(gen(id), id);
});

test("functions generators: every question is complete, its own answers pass, and known errors are named", () => {
  for (const g of generators.filter((x) => !/^(pre|alg)\./.test(x.id))) {
    const seen = new Set<string>();
    for (const seed of SEEDS) {
      const q: Question = runGenerator(g, seed);
      const where = `${g.id} seed ${seed}`;
      assert.ok(q.prompt.length > 10, where);
      assert.ok(q.solution.length > 0, where);
      assert.ok(!/NaN|undefined|Infinity/.test(JSON.stringify(q)), `${where}: ${JSON.stringify(q).slice(0, 300)}`);
      seen.add(q.prompt + JSON.stringify([q.graph, q.mapping, q.answers]));
      for (const a of q.answers) assert.ok(checkAnswer(a.spec, typed(a.spec)).ok, `${where}: own answer ${typed(a.spec)} rejected`);
      if (q.work) {
        assert.ok(tryParse(q.work.start), `${where}: start ${q.work.start}`);
        assert.equal(checkLine(q, typed(q.answers[0].spec)).status, "final", `${where}: answer not final from ${q.work.start}`);
        for (const line of q.solution.filter((l) => l.value)) assert.notEqual(checkLine(q, line.value!).status, "wrong", `${where}: model line ${line.value}`);
      }
      for (const bug of q.bugs ?? []) {
        const spec = q.answers[bug.answer ?? 0].spec;
        const input = spec.kind === "solutions" ? bug.value.split(";").map((v) => `x = ${v}`).join(" or ") : bug.value;
        const same = spec.kind === "number" ? numberValue(bug.value) === numberValue(spec.value) : spec.kind === "expr" ? exprEquivalent(parseExpr(bug.value), parseExpr(spec.value)) : false;
        if (same) continue;
        assert.ok(!checkAnswer(spec, input).ok, `${where}: bug ${bug.misconception} (${input}) accepted as correct`);
        const ids = (q.bugs ?? []).filter((b) => (b.answer ?? 0) === (bug.answer ?? 0) && b.value === bug.value).map((b) => b.misconception);
        assert.ok([bug.misconception, ...ids].includes(detectMisconception(q, input, bug.answer ?? 0) ?? ""), `${where}: ${input} not recognised as ${bug.misconception}`);
      }
      for (const a of q.answers) if (a.spec.kind === "choice") assert.ok(a.spec.answer >= 0 && a.spec.answer < a.spec.options.length && new Set(a.spec.options).size === a.spec.options.length, `${where}: choice`);
      if (q.graph) graphParses(q.graph, where);
      if (q.sketch) graphParses(q.sketch.graph, where);
      for (const og of q.optionGraphs ?? []) graphParses(og, where);
      if (q.optionGraphs) assert.equal(q.optionGraphs.length, (q.answers[0].spec as { options: string[] }).options.length, where);
      if (q.mapping) for (const [i, j] of q.mapping.arrows) assert.ok(q.mapping.left[i] !== undefined && q.mapping.right[j] !== undefined, `${where}: arrow`);
    }
    assert.ok(seen.size > SEEDS.length / 10, `${g.id}: not enough variety (${seen.size})`);
  }
});

test("composites: fg and gf are different, and fg(a) agrees with the function machine", () => {
  const g = gen("fn.comp.eval")!;
  for (const seed of SEEDS) {
    const q = runGenerator(g, seed);
    const m = q.prompt.match(/f\(x\) = (.+?)\$ and \$g\(x\) = (.+?)\$\. Find \$(fg|gf)\((-?\d+)\)/)!;
    assert.ok(m, q.prompt);
    const lin = (t: string) => t.replace(/x\^\{(\d)\}/g, "x^$1");
    const machines = [{ name: "f", expr: lin(m[1]) }, { name: "g", expr: lin(m[2]) }];
    const out = runChain(machines, [...m[3]].reverse(), Number(m[4]));
    assert.equal(String(out[out.length - 1]), (q.answers[0].spec as { value: string }).value, `seed ${seed}`);
  }
  const e = gen("fn.comp.expr")!;
  for (const seed of SEEDS) {
    const q = runGenerator(e, seed);
    const bug = q.bugs!.find((b) => b.misconception === "compositeOrder")!;
    assert.ok(!exprEquivalent(parseExpr(bug.value), parseExpr((q.answers[0].spec as { value: string }).value)), `seed ${seed}: fg = gf`);
  }
});

test("inverses: the domain of f⁻¹ is exactly where the inverse formula works (the range of f)", () => {
  const g = gen("fn.inv.domain")!;
  for (const seed of SEEDS) {
    const q = runGenerator(g, seed);
    const inv = parseExpr((q.answers[0].spec as { value: string }).value);
    const dom = tryParse((q.answers[1].spec as { value: string }).value)!;
    assert.equal(q.answers[1].emptyHint, "inverseDomain");
    // (x − q)² + p works for every x; its domain comes only from the range of f.
    if (!/sqrt|\/x/.test((q.answers[0].spec as { value: string }).value)) continue;
    for (let x = -9.75; x <= 9.75; x += 0.5) {
      const inDomain = dom.or.some((c) => {
        const v = evaluate(c.parts[1], {});
        const op = c.ops[0];
        return op === ">=" ? x >= v : op === "!=" ? x !== v : false;
      });
      assert.equal(Number.isFinite(evaluate(inv, { x })), inDomain, `seed ${seed}: x = ${x}, ${q.prompt}`);
    }
  }
  // f⁻¹(f(x)) = x for the linear and rational inverses.
  const e = gen("fn.inv.expr")!;
  for (const seed of SEEDS) {
    const q = runGenerator(e, seed);
    assert.ok(!q.bugs?.some((b) => b.misconception === "inverseReciprocal" && exprEquivalent(parseExpr(b.value), parseExpr((q.answers[0].spec as { value: string }).value))), `seed ${seed}`);
  }
});

test("misconceptions: ranges written with x, empty inverse domains, and every hint exists", async () => {
  const q = runGenerator(gen("fn.range")!, 1);
  const spec = q.answers[0].spec as { kind: "range"; value: string };
  const slip = checkAnswer(spec, spec.value.replace(/y/g, "x"));
  assert.equal(slip.ok, false);
  assert.equal(slip.mis, "rangeInX");
  const ids = new Set(course.steps[1].task?.type === "mathsLesson" ? course.steps[1].task.misconceptions.map((m) => m.id) : []);
  for (const g of generators) for (const seed of SEEDS.slice(0, 50)) for (const bug of runGenerator(g, seed).bugs ?? []) assert.ok(ids.has(bug.misconception), `missing hint for ${bug.misconception}`);
  for (const id of ["inverseReciprocal", "compositeOrder", "translateDirection", "stretchFactor", "inverseDomain", "rangeInX", "modulusDelete"]) assert.ok(ids.has(id), id);
  const own = (await import("@/content/maths/functions/misconceptions.json", { with: { type: "json" } })).default as { id: string; hint: string }[];
  assert.equal(new Set(own.map((r) => r.id)).size, own.length, "duplicate hint ids");
  for (const r of own) assert.ok(r.hint.length > 20, r.id);
});

test("functions exams: model answers earn full marks, blanks earn nothing, follow-through works", () => {
  for (const g of examGenerators) {
    for (const seed of SEEDS.slice(0, 120)) {
      const q = runExam(g, seed);
      const where = `${g.id} seed ${seed}`;
      assert.equal(q.model.length, q.parts.length, where);
      q.parts.forEach((p, i) => assert.equal(q.model[i].length, p.inputs.length, `${where} part ${i}`));
      const full = markExam(q, q.model);
      assert.equal(full.total, full.max, `${where}: ${JSON.stringify(full.parts.map((p) => p.points.filter((x) => !x.got).map((x) => x.text)))} model ${JSON.stringify(q.model)}`);
      assert.equal(markExam(q, q.model.map((p) => p.map(() => ""))).total, 0, `${where}: blank scores 0`);
    }
  }
  // Composite: a slip in the constant of fg(x) keeps M1 in (a), and solving with their fg keeps M1 in (c).
  const g = exam("exam.fn.composite")!;
  for (const seed of SEEDS.slice(0, 40)) {
    const q = runExam(g, seed);
    const wrongFg = `${q.model[0][0]} + 1`;
    const res = markExam(q, [[wrongFg], q.model[1], ["x = 1000"]]);
    assert.equal(res.parts[0].points[0].got, true, "M1 for the method");
    assert.equal(res.parts[0].points[1].got, false, "A1 lost");
  }
  // Inverse: the domain mark follows through from the range they gave.
  const inv = exam("exam.fn.inverse")!;
  const q = runExam(inv, 5);
  const res = markExam(q, [["f(x) >= 100"], [""], ["x >= 100"]]);
  assert.equal(res.parts[2].points[0].got, true);
});

test("functions lessons: every part points at real generators and follows the rhythm", () => {
  assert.equal(lessons.length, 11);
  for (const l of lessons) {
    const kinds = l.parts.map((p) => p.kind);
    if (l.id !== "fn-0") {
      assert.equal(kinds[kinds.length - 1], "mastery", `${l.id} ends with the mastery check`);
      assert.ok(kinds.includes("see") || kinds.includes("machine") || kinds.includes("transform"), `${l.id} has a see-it part`);
      for (const k of ["paper", "worked", "gaps", "practice", "traps", "exam", "sayItBack", "notebook"] as LessonPart["kind"][]) assert.ok(kinds.includes(k), `${l.id} has ${k}`);
    }
    for (const p of l.parts) {
      const where = `${l.id} ${p.title}`;
      const ids =
        p.kind === "practice" || p.kind === "mastery"
          ? p.generators
          : p.kind === "gaps" || p.kind === "sketch"
            ? [p.generator]
            : p.kind === "worked" && p.generator
              ? [p.generator]
              : p.kind === "diagnostic"
                ? p.skills.map((s) => s.generator)
                : [];
      for (const id of ids) assert.ok(gen(id), `${where}: unknown generator ${id}`);
      if (p.kind === "diagnostic") for (const s of p.skills) assert.equal(gen(s.generator)!.skill, s.id, `${where}: skill id for ${s.generator}`);
      if (p.kind === "exam") assert.ok(exam(p.generator), `${where}: unknown exam ${p.generator}`);
      if (p.kind === "see" && p.graph) graphParses(p.graph, where);
      if (p.kind === "see" || p.kind === "machine" || p.kind === "transform") for (const q of p.questions) assert.ok(q.answer < q.options.length, `${where}: ${q.prompt}`);
      if (p.kind === "machine") {
        for (const m of p.machines) assert.doesNotThrow(() => parseExpr(m.expr), where);
        for (const name of p.order) assert.ok(p.machines.some((m) => m.name === name), where);
        if (p.backwards) for (const m of p.machines) assert.ok(m.inverse, `${where}: ${m.name} needs an inverse`);
      }
      if (p.kind === "transform") {
        assert.doesNotThrow(() => parseExpr(p.base), where);
        for (const pt of p.points) assert.ok(Number.isFinite(evaluate(parseExpr(p.base), { x: pt.x })), `${where}: point ${pt.label}`);
      }
      if (p.kind === "sketch") assert.ok(runGenerator(gen(p.generator)!, 3).sketch, `${where}: no sketch data`);
      if (p.kind === "traps") for (const c of p.cards) assert.ok(c.wrong < c.lines.length && c.answer < c.options.length, `${where}: ${c.prompt}`);
      if (p.kind === "mastery") assert.ok(p.need <= p.count && p.need >= Math.ceil(p.count * 0.6), where);
      if (p.kind === "notebook") for (const b of p.page.blocks) if (b.type === "sketch") graphParses(b.graph, where);
      if (p.kind === "gaps")
        for (let seed = 1; seed < 200; seed++) {
          const q = runGenerator(gen(p.generator)!, seed);
          assert.ok(p.hide.some((i) => q.solution[i < 0 ? q.solution.length + i : i]?.value), `${where}: seed ${seed} has nothing to fill`);
        }
      if (p.kind === "sayItBack") {
        for (const idea of p.ideas) assert.ok(pointMet(idea, idea.text), `${where}: ${idea.id}`);
        assert.ok(p.need <= p.ideas.length, where);
      }
    }
  }
  const ids = lessons.flatMap((l) => l.skills.map((s) => s.id));
  assert.equal(new Set(ids).size, ids.length, "skills are unique");
});

test("functions: no control characters anywhere in lesson or question text", () => {
  const bad = /[\r\t\f\v\b]/;
  const walk = (v: unknown, where: string): void => {
    if (typeof v === "string") assert.ok(!bad.test(v), `${where}: ${JSON.stringify(v)}`);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${where}.${k}`);
  };
  walk(lessons, "lessons");
  for (const g of generators) for (let seed = 1; seed < 60; seed++) walk(runGenerator(g, seed), g.id);
  for (const g of examGenerators) for (let seed = 1; seed < 30; seed++) walk(JSON.parse(JSON.stringify(runExam(g, seed), (k, v) => (typeof v === "function" ? undefined : v))), g.id);
});
