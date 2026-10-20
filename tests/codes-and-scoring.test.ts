import { test } from "node:test";
import assert from "node:assert/strict";
import { CODE_PATTERN, generateCode, normalizeCode, phoneForWhatsApp } from "@/lib/codes";
import { percent, questionsFor, scoreAssessment } from "@/lib/assessment";
import { checkMissionEmail, isGmail } from "@/lib/mission-check";
import en from "@/content/email-for-work/en";

test("generated codes are XXXX-XXXX without 0, O, 1 or I", () => {
  for (let i = 0; i < 5000; i++) {
    const code = generateCode();
    assert.match(code, CODE_PATTERN);
    assert.doesNotMatch(code, /[01OI]/);
  }
});

test("codes are normalised from what people type", () => {
  assert.equal(normalizeCode(" abcd 2345 "), "ABCD-2345");
  assert.equal(normalizeCode("abcd-2345"), "ABCD-2345");
  assert.equal(normalizeCode("ABCD-1234"), null);
  assert.equal(normalizeCode("ABC"), null);
});

test("WhatsApp numbers get the Cameroon prefix", () => {
  assert.equal(phoneForWhatsApp("677 12 34 56"), "237677123456");
  assert.equal(phoneForWhatsApp("+237 677 12 34 56"), "237677123456");
  assert.equal(phoneForWhatsApp("00237677123456"), "237677123456");
});

test("assessment scoring ignores junk answers", () => {
  const qs = en.assessment.questions;
  const perfect = qs.map((q) => q.answer);
  assert.deepEqual(scoreAssessment(qs, perfect), { score: qs.length, total: qs.length, wrong: [] });
  assert.equal(scoreAssessment(qs, "nonsense").score, 0);
  assert.equal(scoreAssessment(qs, perfect.slice(0, 5)).score, 5);
});

test("warm-up is short and optional-sized; final test uses all questions", () => {
  assert.equal(questionsFor(en, "pre").length, 5);
  assert.equal(questionsFor(en, "post").length, en.assessment.questions.length);
  assert.equal(percent(2, 5), 40);
  assert.equal(percent(9, 10), 90);
});

const words = ["application", "applying", "candidature"];
const realEmail = {
  from: "divine.ngum@gmail.com",
  subject: "Application for Office Assistant – Divine Ngum",
  text:
    "Dear Sir or Madam,\n\nI am applying for the Office Assistant position. I have experience in customer service, I am organised, and I would be glad to bring my skills to your team. Please find my CV attached.\n\nKind regards,\nDivine Ngum\n+237 677 12 34 56",
  attachments: [{ filename: "Divine_Ngum_CV.pdf", contentType: "application/pdf" }],
};

test("mission: a good real email passes", () => {
  assert.deepEqual(checkMissionEmail(words, "divine.ngum@gmail.com", realEmail), []);
});

test("mission: specific problems are reported", () => {
  const issues = checkMissionEmail(words, "divine.ngum@gmail.com", {
    ...realEmail,
    subject: "hello",
    text: "send me the job",
    attachments: [{ filename: "scan0012.pdf", contentType: "application/pdf" }],
  });
  assert.deepEqual([...issues].sort(), ["closing", "fileName", "greeting", "length", "signature", "subject"].sort());
});

test("mission: nickname addresses and missing PDFs are caught", () => {
  const issues = checkMissionEmail(words, "sweetbaby237@gmail.com", { ...realEmail, from: "sweetbaby237@gmail.com", attachments: [] });
  assert.ok(issues.includes("nickname"));
  assert.ok(issues.includes("pdf"));
});

test("Gmail address check", () => {
  assert.ok(isGmail("firstname.lastname@gmail.com"));
  assert.ok(!isGmail("someone@yahoo.com"));
  assert.ok(!isGmail("not an email"));
});
