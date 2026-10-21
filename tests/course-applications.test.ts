import { test } from "node:test";
import assert from "node:assert/strict";
import en from "@/content/applications/en";
import fr from "@/content/applications/fr";
import cvEn from "@/content/cv/en";
import type { ComposeTask, Course, Task } from "@/content/types";
import { failedComposeRules, failedTextRules } from "@/lib/rules";
import { emptyCv } from "@/lib/cv/model";
import { networkChecks } from "@/lib/cv/network-profile";
import { checkDossier, dossierOk } from "@/lib/cv/dossier";
import { expectedStatuses, scoreWeek, type WeekAction } from "@/lib/cv/inbox-week";
import { checkApplicationMission, fillTemplate } from "@/lib/mission-app-check";

/** The seven course 3 simulations: each must come in at least 3 scenario variants. */
const NEW_SIMULATIONS = ["opportunityBoard", "tracker", "evidence", "dossier", "inboxWeek", "networkProfile", "followUp"];

/** A task and the tasks inside it (sequences). */
const flat = (t: Task | undefined): Task[] => (!t ? [] : t.type === "sequence" ? t.tasks.flatMap(flat) : [t]);
const stepTasks = (c: Course, i: number) => [c.steps[i].task, ...(c.steps[i].variants ?? [])];
const allTasks = (c: Course) => c.steps.flatMap((s) => [s.task, ...(s.variants ?? [])].flatMap(flat));

test("course 3: English and French have the same shape", () => {
  assert.equal(en.steps.length, 15);
  assert.equal(fr.steps.length, 15);
  en.steps.forEach((s, i) => {
    const f = fr.steps[i];
    assert.deepEqual(flat(f.task).map((t) => t.type), flat(s.task).map((t) => t.type), `step ${i + 1}`);
    assert.equal(f.variants?.length ?? 0, s.variants?.length ?? 0, `step ${i + 1} variants`);
    assert.equal(f.illustration, s.illustration, `step ${i + 1} illustration`);
    assert.equal(f.variantGroup, s.variantGroup, `step ${i + 1} variantGroup`);
    assert.equal(f.cvSetup, s.cvSetup, `step ${i + 1} cvSetup`);
  });
  assert.equal(en.assessment.questions.length, 10);
  assert.deepEqual(fr.assessment.warmup, en.assessment.warmup);
  en.assessment.questions.forEach((q, i) => {
    assert.equal(fr.assessment.questions[i].answer, q.answer, `question ${i + 1}`);
    assert.equal(fr.assessment.questions[i].step, q.step, `question ${i + 1} step`);
    assert.ok(q.answer >= 0 && q.answer < q.options.length && q.step >= 1 && q.step <= 15, q.question);
  });
  assert.equal(en.mission!.kind, "application");
  assert.equal(fr.mission!.kind, "application");
  assert.deepEqual(Object.keys(fr.mission!.messages).sort(), Object.keys(en.mission!.messages).sort());
});

test("course 3: series, price, badge, a free first step that asks for a basic CV", () => {
  assert.equal(en.id, "applications");
  assert.equal(en.price, cvEn.price);
  assert.ok(en.usesCv && fr.usesCv);
  assert.equal(en.badge, "app-certificate-badge");
  assert.equal(en.freeSteps, 1);
  assert.ok(en.steps[0].cvSetup);
  assert.equal(en.steps[0].task?.type, "compareApps");
  assert.match(en.series ?? "", /2 of 4/);
});

test("course 3: every new simulation has at least 3 scenario variants", () => {
  for (const course of [en, fr]) {
    for (const type of NEW_SIMULATIONS) {
      const i = course.steps.findIndex((s) => flat(s.task).some((t) => t.type === type));
      assert.ok(i >= 0, `${type} is used`);
      const versions = stepTasks(course, i).filter((t) => flat(t).some((x) => x.type === type));
      assert.ok(versions.length >= 3, `${course.locale} ${type}: ${versions.length}`);
    }
  }
});

test("course 3: the evidence step and the letter step use the same advert for each variant", () => {
  for (const course of [en, fr]) {
    const ev = course.steps.findIndex((s) => s.task?.type === "evidence");
    const cl = course.steps.findIndex((s) => s.task?.type === "coverLetter");
    assert.equal(course.steps[ev].variantGroup, course.steps[cl].variantGroup);
    const evIds = stepTasks(course, ev).map((t) => (t?.type === "evidence" ? t.advert.id : ""));
    const clIds = stepTasks(course, cl).map((t) => (t?.type === "coverLetter" ? t.advert.id : ""));
    assert.deepEqual(evIds, clIds);
  }
});

test("course 3: answer keys and scenario data are consistent", () => {
  for (const course of [en, fr]) {
    for (const task of allTasks(course)) {
      if (task.type === "compareApps") for (const q of task.questions) assert.ok(q.answer >= 0 && q.answer < q.options.length, q.question);
      if (task.type === "multipleChoice") assert.ok(task.answer >= 0 && task.answer < task.options.length, task.question);
      if (task.type === "sectionOrder") for (const r of task.rounds) {
        assert.deepEqual([...r.answer].sort(), r.sections.map((x) => x.id).sort(), r.persona);
        assert.notDeepEqual(r.sections.map((x) => x.id), r.answer, `${r.persona} starts shuffled`);
      }
      if (task.type === "redPen") {
        const used = new Set(task.lines.flatMap((l) => l.parts.flatMap((p) => (typeof p === "string" ? [] : [p.error]))));
        assert.deepEqual([...used].sort(), task.errors.map((e) => e.id).sort());
      }
      if (task.type === "opportunityBoard") {
        const keep = task.listings.filter((l) => l.eligible && !l.expired && !l.fake);
        assert.ok(keep.length >= 2, task.persona);
        assert.ok(task.listings.some((l) => l.fake) && task.listings.some((l) => l.expired) && task.listings.some((l) => !l.eligible), task.persona);
        assert.equal(new Set(task.listings.map((l) => l.id)).size, task.listings.length);
      }
      if (task.type === "tracker") assert.ok(task.suggestions.length >= task.required);
      if (task.type === "evidence") assert.ok(task.advert.requirements.length > task.minLinks);
      if (task.type === "dossier") {
        const pile = new Set(task.pile.map((p) => p.id));
        for (const r of task.required) assert.ok(pile.has(r.id), r.id);
        assert.ok(task.pile.length > task.required.length, "there are distractors");
        assert.ok(dossierOk(checkDossier(task.required, task.required)));
      }
      if (task.type === "inboxWeek") {
        assert.ok(task.files.includes(task.requiredFile));
        for (const e of task.events) {
          if (e.kind === "missingDocument" || e.kind === "interview") assert.ok(e.deadlineHours, e.id);
          assert.equal(e.application === null, e.kind === "scam", e.id);
          assert.ok(e.at >= 0 && e.at < 168);
        }
        // The model behaviour scores 100%.
        const reply = (text: string, attachments: string[] = []) => ({ text, attachments });
        const fr = course.locale === "fr";
        const actions: WeekAction[] = task.events.map((e) => ({
          eventId: e.id,
          at: e.at + 1,
          ...(e.kind === "scam"
            ? { type: "report" as const }
            : e.kind === "ack"
              ? { type: "archive" as const }
              : e.kind === "missingDocument"
                ? { type: "reply" as const, reply: reply(fr ? "Bonjour,\nVeuillez trouver ci-joint mon diplôme.\nCordialement" : "Dear Sir or Madam,\nPlease find my diploma attached.\nKind regards", [task.requiredFile]) }
                : e.kind === "interview"
                  ? { type: "reply" as const, reply: reply(fr ? "Bonjour,\nMerci. Je suis disponible mardi à 10h.\nCordialement" : "Dear Sir or Madam,\nThank you. I am available on Tuesday at 10:00.\nKind regards") }
                  : { type: "reply" as const, reply: reply(fr ? "Bonjour,\nMerci pour votre réponse.\nCordialement" : "Dear Sir or Madam,\nThank you for letting me know.\nKind regards") }),
        }));
        const score = scoreWeek(task.events, actions, expectedStatuses(task.events), task.requiredFile);
        assert.equal(score.percent, 100, JSON.stringify(score.items));
      }
      if (task.type === "followUp") {
        assert.ok(task.window[0] > task.deadlineDay && task.window[1] <= task.days);
      }
    }
  }
});

test("course 3: model answers pass the text rules and the bad versions fail", () => {
  for (const course of [en, fr]) {
    for (const s of course.steps) {
      for (const t of [s.task, ...(s.variants ?? [])]) {
        if (t?.type !== "sequence" || t.tasks[1]?.type !== "fixText" || t.tasks[0].type !== "multipleChoice") continue;
        const [mc, fix] = t.tasks;
        assert.ok(failedTextRules(fix.rules, fix.initial, fix.initial).length > 0, `${course.locale}: the bad opening fails`);
        assert.deepEqual(failedTextRules(fix.rules, mc.options[mc.answer], fix.initial), [], `${course.locale}: the best option passes`);
      }
    }
  }
});

test("course 3: the apply-by-email task accepts a correct application and refuses the junk files", () => {
  for (const course of [en, fr]) {
    const step = course.steps.find((s) => s.task?.type === "compose" && s.task.files.length === 4)!;
    for (const t of [step.task, ...(step.variants ?? [])] as ComposeTask[]) {
      const to = t.rules.find((r) => r.kind === "equals")!;
      const [cv, letter] = t.files.filter((f) => /_(CV|Cover_Letter|Lettre_de_motivation)\.pdf$/.test(f));
      const name = cv.replace("_CV.pdf", "").replace("_", " ");
      const roleRule = t.rules.find((r) => "words" in r && r.field === "subject")!;
      const role = "words" in roleRule ? roleRule.words[0] : "";
      const body =
        course.locale === "fr"
          ? `Madame, Monsieur,\n\nJe vous adresse ma candidature au poste de ${role}. Vous trouverez ci-joints mon CV et ma lettre.\n\nCordialement,\n${name}`
          : `Dear Sir or Madam,\n\nI am applying for the ${role} position. Please find attached my CV and cover letter.\n\nKind regards,\n${name}`;
      const values = { to: "value" in to ? to.value : "", cc: "", subject: `${role} – ${name}`, body, attachments: [cv, letter] };
      assert.deepEqual(failedComposeRules(t.rules, values), [], `${course.locale} ${t.instruction}`);
      assert.ok(failedComposeRules(t.rules, { ...values, attachments: t.files }).length > 0, "junk files are refused");
    }
  }
});

test("course 3: network examples reach the headline and about checks", () => {
  for (const course of [en, fr]) {
    const i = course.steps.findIndex((s) => s.task?.type === "networkProfile");
    for (const t of stepTasks(course, i)) {
      if (t?.type !== "networkProfile") continue;
      const cv = emptyCv();
      cv.network = { headline: t.headlineExample, about: t.aboutExample, skills: [], photo: [false, false, false] };
      const c = networkChecks(cv);
      assert.ok(c.headlineRole && c.headlineSeek && c.headlineLength && c.aboutLength && c.aboutFirstPerson, `${course.locale}: ${JSON.stringify(c)}`);
    }
  }
});

test("course 3: the mission accepts a letter in either language and fills every reply template", () => {
  const roleWords = [...en.mission!.subjectWords, ...fr.mission!.subjectWords];
  const orgWords = [...(en.mission!.orgWords ?? []), ...(fr.mission!.orgWords ?? [])];
  const cv = { filename: "Awa_Bello_CV.pdf", contentType: "application/pdf", pages: 1, text: "Awa Bello\nFormation\nCompétences" };
  const letter = {
    filename: "Awa_Bello_Lettre_de_motivation.pdf",
    contentType: "application/pdf",
    pages: 1,
    text: "Madame, Monsieur,\nJe vous adresse ma candidature au poste d'assistant(e) administratif(ve) chez Nyanga Youth Futures.\nVeuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\nAwa Bello",
  };
  const issues = checkApplicationMission(
    {
      from: "awa.bello@gmail.com",
      subject: "Candidature au poste d'assistant(e) administratif(ve) – Awa Bello",
      text: "Madame, Monsieur,\n\nJe vous adresse ma candidature au poste d'assistant(e) administratif(ve). Vous trouverez ci-joints mon CV et ma lettre.\n\nCordialement,\nAwa Bello\n+237 6 77 12 34 56",
      attachments: [cv, letter],
    },
    { gmail: "awa.bello@gmail.com", name: "Awa Bello", roleWords, orgWords },
  );
  assert.deepEqual(issues, []);
  for (const course of [en, fr]) {
    for (const r of Object.values(course.mission!.replies ?? {})) {
      for (const text of [r.subject, r.body]) {
        assert.doesNotMatch(fillTemplate(text, { name: "Awa", role: "R", org: "O", ref: "NYF-12345" }), /\{\w+\}/);
      }
    }
    assert.ok(course.mission!.replies?.missing_document && course.mission!.replies.interview);
  }
});
