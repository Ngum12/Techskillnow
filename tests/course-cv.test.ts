import { test } from "node:test";
import assert from "node:assert/strict";
import en from "@/content/cv/en";
import fr from "@/content/cv/fr";
import emailEn from "@/content/email-for-work/en";
import type { KeywordAdvert, Task } from "@/content/types";
import { matches, stems } from "@/lib/cv/keywords";
import { checkBullet, composeBullet } from "@/lib/cv/bullet";
import { failedTextRules } from "@/lib/rules";

const SIMULATIONS = new Set(["recruiterScan", "advertHighlight", "inbox", "sectionOrder", "cvProfile", "redPen", "keywordMatch", "tailor"]);

test("course 2: English and French have the same shape", () => {
  assert.equal(en.steps.length, fr.steps.length);
  en.steps.forEach((s, i) => {
    assert.equal(fr.steps[i].task?.type, s.task?.type, `step ${i + 1}`);
    assert.equal(fr.steps[i].variants?.length ?? 0, s.variants?.length ?? 0, `step ${i + 1} variants`);
    assert.equal(fr.steps[i].cvSection, s.cvSection, `step ${i + 1} cvSection`);
    assert.equal(fr.steps[i].illustration, s.illustration, `step ${i + 1} illustration`);
  });
  assert.deepEqual(fr.assessment.warmup, en.assessment.warmup);
  en.assessment.questions.forEach((q, i) => assert.equal(fr.assessment.questions[i].answer, q.answer, `question ${i + 1}`));
  assert.equal(en.mission.kind, "cv");
  assert.deepEqual(Object.keys(fr.mission.messages).sort(), Object.keys(en.mission.messages).sort());
});

test("course 2: pricing, CV flag and a free first lesson", () => {
  assert.equal(en.price, 1000);
  assert.equal(emailEn.price, 850);
  assert.ok(en.usesCv && fr.usesCv);
  assert.equal(en.freeSteps, 1);
  assert.equal(en.steps[0].task?.type, "recruiterScan");
});

test("course 2: every simulation has at least 3 scenario variants", () => {
  for (const course of [en, fr]) {
    course.steps.forEach((s, i) => {
      if (s.task && SIMULATIONS.has(s.task.type)) assert.ok(1 + (s.variants?.length ?? 0) >= 3, `${course.locale} step ${i + 1} (${s.task.type})`);
    });
  }
});

const allTasks = (tasks: (Task | undefined)[]) => tasks.filter((t): t is Task => !!t);

test("course 2: answer keys are valid", () => {
  for (const course of [en, fr]) {
    for (const step of course.steps) {
      for (const task of allTasks([step.task, ...(step.variants ?? [])])) {
        if (task.type === "recruiterScan") {
          for (const r of task.rounds) for (const q of r.questions) assert.ok(q.answer >= 0 && q.answer < q.options.length, q.question);
        }
        if (task.type === "sectionOrder") {
          for (const r of task.rounds) assert.deepEqual([...r.answer].sort(), r.sections.map((x) => x.id).sort(), r.persona);
        }
        if (task.type === "redPen") {
          const used = new Set(task.lines.flatMap((l) => l.parts.flatMap((p) => (typeof p === "string" ? [] : [p.error]))));
          const declared = new Set(task.errors.map((e) => e.id));
          assert.deepEqual([...used].sort(), [...declared].sort(), "every error is tappable and explained");
        }
        if (task.type === "inbox") for (const g of task.goals) assert.ok(task.emails.some((e) => e.id === g.target), g.target);
        if (task.type === "advertHighlight") {
          const phrases = task.advert.paragraphs.flat().filter((p) => typeof p !== "string");
          assert.ok(phrases.length >= 8, task.advert.title);
        }
      }
    }
  }
});

test("course 2: every curated advert term can be found when a CV contains it", () => {
  const adverts: KeywordAdvert[] = [];
  for (const course of [en, fr]) {
    for (const step of course.steps) {
      for (const task of allTasks([step.task, ...(step.variants ?? [])])) {
        if (task.type === "keywordMatch" || task.type === "tailor") adverts.push(...task.adverts);
      }
    }
  }
  for (const a of adverts) for (const term of a.terms) assert.ok(matches(term, stems(`My CV mentions ${term} clearly.`)), `${a.id}: ${term}`);
});

test("course 2: the bullet builder examples pass their own rules", () => {
  for (const course of [en, fr]) {
    const task = course.steps.find((s) => s.task?.type === "bulletBuilder")?.task;
    assert.ok(task && task.type === "bulletBuilder");
    const line = composeBullet(task.example.verb, task.example.task, task.example.result);
    assert.deepEqual(checkBullet(line), [], line);
    assert.ok(checkBullet(task.example.before).length > 0, "the 'before' example is weak");
  }
});

test("course 2: profile examples pass and the clichés fail", () => {
  for (const course of [en, fr]) {
    for (const step of course.steps) {
      for (const task of allTasks([step.task, ...(step.variants ?? [])])) {
        if (task.type !== "cvProfile") continue;
        assert.deepEqual(failedTextRules(task.own.rules, task.own.example), [], `${course.locale} own example`);
        assert.ok(failedTextRules(task.fix.rules, task.fix.initial, task.fix.initial).length > 0, `${course.locale} fix initial must fail`);
      }
    }
  }
});
