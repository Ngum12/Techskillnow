import { test } from "node:test";
import assert from "node:assert/strict";
import { failedComposeRules, failedTextRules, hasClosing, hasGreeting } from "@/lib/rules";
import en from "@/content/email-for-work/en";
import fr from "@/content/email-for-work/fr";
import type { ComposeTask, FixTextTask } from "@/content/types";

const goodApplication = {
  to: "jobs@sawalogistics.cm",
  cc: "m.ebai@sawalogistics.cm",
  subject: "Application for Office Assistant - Divine Ngum",
  attachments: ["CV.pdf"],
  body:
    "Dear Sir or Madam,\n\nI am writing to apply for the Office Assistant position at Sawa Logistics. I have two years of experience in customer service and I am organised and reliable. Please find my CV attached.\n\nThank you for your time.\n\nKind regards,\nDivine Ngum\nOffice assistant\n+237 677 12 34 56",
};

test("final task: a complete application passes, even with a 3-line signature", () => {
  assert.deepEqual(failedComposeRules((en.steps[14].task as ComposeTask).rules, goodApplication), []);
});

test("final task: an empty email gets one specific message per part", () => {
  const failed = failedComposeRules((en.steps[14].task as ComposeTask).rules, { to: "", cc: "", subject: "", body: "", attachments: [] });
  assert.ok(failed.includes("Attach your CV.pdf."));
  assert.equal(new Set(failed).size, failed.length);
  assert.ok(failed.length <= 7);
});

test("final task: SMS words and the wrong attachment are caught", () => {
  const failed = failedComposeRules((en.steps[14].task as ComposeTask).rules, {
    ...goodApplication,
    body: goodApplication.body.replace("Please find", "pls find"),
    attachments: ["CV.pdf", "photo.jpg"],
  });
  assert.equal(failed.length, 2);
});

test("subject line task (EN and FR)", () => {
  const enTask = en.steps[6].task as FixTextTask;
  assert.equal(failedTextRules(enTask.rules, "hello", enTask.initial).length, 4);
  assert.deepEqual(failedTextRules(enTask.rules, "Application for Sales Assistant – Nkeng Ateh", enTask.initial), []);
  const frTask = fr.steps[6].task as FixTextTask;
  assert.deepEqual(failedTextRules(frTask.rules, "Candidature au poste d’assistante commerciale – Nkeng Ateh", frTask.initial), []);
});

test("polite body task rejects all capitals and SMS words", () => {
  const task = en.steps[8].task as FixTextTask;
  const good = "Good morning. Could you please send me information about the job and how to apply? Thank you.";
  assert.deepEqual(failedTextRules(task.rules, good, task.initial), []);
  assert.deepEqual(failedTextRules(task.rules, good.toUpperCase(), task.initial), ["Do not write in all capital letters."]);
  const frTask = fr.steps[8].task as FixTextTask;
  assert.deepEqual(
    failedTextRules(frTask.rules, "Bonjour Madame, pourriez-vous m’envoyer des informations sur le poste et la procédure ? Merci beaucoup.", frTask.initial),
    [],
  );
});

test("greeting and closing detection in both languages", () => {
  assert.ok(hasGreeting("Madame, Monsieur,\nJe vous écris…"));
  assert.ok(!hasGreeting("Je vous écris…"));
  assert.ok(hasClosing("…\nCordialement,\nNkeng Ateh\nAssistante\n+237 670 00 00 00"));
  assert.ok(!hasClosing("Just the message."));
});

test("every task variant uses the same task type as the main task", () => {
  for (const course of [en, fr]) {
    for (const step of course.steps) {
      for (const v of step.variants ?? []) assert.equal(v.type, step.task?.type);
    }
  }
});

test("English and French courses have the same shape", () => {
  assert.equal(en.steps.length, fr.steps.length);
  assert.equal(en.assessment.questions.length, fr.assessment.questions.length);
  en.steps.forEach((s, i) => {
    assert.equal(fr.steps[i].task?.type, s.task?.type, `step ${i + 1}`);
    assert.equal(fr.steps[i].variants?.length ?? 0, s.variants?.length ?? 0, `step ${i + 1} variants`);
  });
  en.assessment.questions.forEach((q, i) => assert.equal(fr.assessment.questions[i].answer, q.answer, `question ${i + 1}`));
  assert.deepEqual(fr.assessment.warmup, en.assessment.warmup);
  for (const i of en.assessment.warmup) assert.ok(en.assessment.questions[i], `warm-up question ${i} exists`);
});
