import { test } from "node:test";
import assert from "node:assert/strict";
import course from "@/content/maths/algebra/en";
import { lessons } from "@/content/maths/algebra/lessons";
import { generators, examGenerators } from "@/content/maths/algebra/generators";
import { runExam, runGenerator } from "@/lib/maths/run";
import { parseExpr } from "@/lib/maths/expr";
import { pointMet } from "@/lib/chem/marking";
import type { GraphSpec, LessonPart } from "@/lib/maths/types";

const gen = (id: string) => generators.find((g) => g.id === id);
const exam = (id: string) => examGenerators.find((g) => g.id === id);

function graphParses(g: GraphSpec, where: string) {
  for (const e of [...g.curves.map((c) => c.expr), ...Object.values(g.select?.exprs ?? {})]) assert.doesNotThrow(() => parseExpr(e), `${where}: ${e}`);
}

test("algebra course: price, series, one step per lesson, free diagnostic and first lesson", () => {
  assert.equal(course.id, "maths-algebra");
  assert.equal(course.price, 500);
  assert.match(course.series ?? "", /GCE A Level Maths/);
  assert.equal(course.steps.length, lessons.length);
  assert.equal(course.freeSteps, 2);
  assert.equal(course.mission, undefined);
  assert.equal(course.assessment.questions.length, 10);
  for (const q of course.assessment.questions) assert.ok(q.answer < q.options.length && q.step <= course.steps.length, q.question);
  for (const s of course.steps) for (const b of s.body) assert.ok(!/\$|\\/.test(b), `plain intro: ${b}`);
});

test("algebra lessons: every part points at real generators and follows the rhythm", () => {
  for (const l of lessons) {
    const kinds = l.parts.map((p) => p.kind);
    if (l.id !== "alg-0") {
      assert.equal(kinds[kinds.length - 1], "mastery", `${l.id} ends with the mastery check`);
      for (const k of ["see", "worked", "practice", "traps", "exam", "sayItBack", "notebook"] as LessonPart["kind"][])
        assert.ok(kinds.includes(k) || (k === "see" && kinds.includes("table")) || (k === "see" && kinds.includes("division")), `${l.id} has ${k}`);
    }
    for (const p of l.parts) {
      const where = `${l.id} ${p.title}`;
      const ids =
        p.kind === "practice" || p.kind === "mastery"
          ? p.generators
          : p.kind === "gaps" || p.kind === "division" || p.kind === "table" || p.kind === "grid"
            ? [p.generator]
            : p.kind === "worked" && p.generator
              ? [p.generator]
              : p.kind === "diagnostic"
                ? p.skills.map((s) => s.generator)
                : [];
      for (const id of ids) assert.ok(gen(id), `${where}: unknown generator ${id}`);
      if (p.kind === "exam") assert.ok(exam(p.generator), `${where}: unknown exam ${p.generator}`);
      if (p.kind === "see" && p.graph) graphParses(p.graph, where);
      if (p.kind === "see") for (const q of p.questions) assert.ok(q.answer < q.options.length, `${where}: ${q.prompt}`);
      if (p.kind === "traps") for (const c of p.cards) assert.ok(c.wrong < c.lines.length && c.answer < c.options.length, `${where}: ${c.prompt}`);
      if (p.kind === "mastery") assert.ok(p.need <= p.count && p.need >= Math.ceil(p.count * 0.6), where);
      if (p.kind === "notebook") for (const b of p.page.blocks) if (b.type === "sketch") graphParses(b.graph, where);
      if (p.kind === "gaps")
        for (let seed = 1; seed < 200; seed++) {
          const q = runGenerator(gen(p.generator)!, seed);
          assert.ok(p.hide.some((i) => q.solution[i]?.value), `${where}: seed ${seed} has nothing to fill`);
        }
      if (p.kind === "division" || p.kind === "table" || p.kind === "grid") {
        const q = runGenerator(gen(p.generator)!, 5);
        assert.ok(p.kind === "division" ? q.division : p.kind === "table" ? q.table : q.grid, `${where}: missing ${p.kind} data`);
      }
      if (p.kind === "sayItBack") {
        // Each key idea is recognised in its own model sentence.
        for (const idea of p.ideas) assert.ok(pointMet(idea, idea.text), `${where}: ${idea.id}`);
        assert.ok(p.need <= p.ideas.length, where);
      }
    }
  }
});

test("algebra lessons: skills are unique and every lesson task carries the topic's skill map and hints", () => {
  const ids = lessons.flatMap((l) => l.skills.map((s) => s.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const s of course.steps) {
    assert.equal(s.task?.type, "mathsLesson");
    if (s.task?.type !== "mathsLesson") continue;
    assert.equal(s.task.topicSkills.length, ids.length);
    assert.ok(s.task.misconceptions.length >= 15);
  }
});

test("no control characters (from a lost backslash) anywhere in the lesson or question text", () => {
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
