import { test } from "node:test";
import assert from "node:assert/strict";
import { checkDossier, dossierOk } from "@/lib/cv/dossier";
import { expectedStatuses, hasAvailability, judge, scoreWeek, type WeekAction, type WeekEvent } from "@/lib/cv/inbox-week";
import { networkChecks, networkStrength } from "@/lib/cv/network-profile";
import { emptyCv } from "@/lib/cv/model";
import { trackerCsv } from "@/lib/cv/tracker-csv";
import { checkApplicationMission, checkReplyMission, fillTemplate, missionReference, pickReplyKind } from "@/lib/mission-app-check";

/* ---------- DossierBuilder ---------- */

const required = [
  { id: "letter", copies: 1 },
  { id: "cv", copies: 1 },
  { id: "diploma", copies: 2 },
  { id: "birth", copies: 1 },
  { id: "photos", copies: 4 },
];

test("dossier: the exact list in the right order passes", () => {
  assert.ok(dossierOk(checkDossier(required, required)));
});

test("dossier: missing, extra, wrong copies and wrong order are each flagged", () => {
  const r = checkDossier(
    [
      { id: "cv", copies: 1 },
      { id: "letter", copies: 1 },
      { id: "diploma", copies: 1 },
      { id: "photos", copies: 4 },
      { id: "family", copies: 1 },
    ],
    required,
  );
  assert.deepEqual(r.missing, ["birth"]);
  assert.deepEqual(r.extra, ["family"]);
  assert.deepEqual(r.copies, [{ id: "diploma", want: 2, got: 1 }]);
  assert.equal(r.order, true);
  assert.ok(!dossierOk(r));
});

/* ---------- InboxWeek ---------- */

const events: WeekEvent[] = [
  { id: "ack", at: 2, kind: "ack", application: "A" },
  { id: "doc", at: 20, kind: "missingDocument", application: "A", deadlineHours: 48 },
  { id: "scam", at: 30, kind: "scam", application: null },
  { id: "rej", at: 50, kind: "rejection", application: "B" },
  { id: "int", at: 70, kind: "interview", application: "A", deadlineHours: 48 },
];
const FILE = "Tabi_Ndip_HND_Diploma.pdf";
const good: WeekAction[] = [
  { eventId: "ack", type: "archive", at: 3 },
  { eventId: "doc", type: "reply", at: 30, reply: { text: "Dear Mrs Fon,\nPlease find attached my diploma.\nKind regards,\nTabi", attachments: [FILE] } },
  { eventId: "scam", type: "report", at: 31 },
  { eventId: "rej", type: "reply", at: 55, reply: { text: "Dear Sir, thank you for letting me know. I hope to apply again.", attachments: [] } },
  { eventId: "int", type: "reply", at: 80, reply: { text: "Dear Mrs Fon,\nThank you. I am available on Tuesday at 10:00 or Wednesday at 14:00.\nKind regards,\nTabi", attachments: [] } },
];

test("inbox week: availability needs a day and a time (EN and FR)", () => {
  assert.ok(hasAvailability("Tuesday at 10:00"));
  assert.ok(hasAvailability("mardi à 10h"));
  assert.ok(hasAvailability("on 18 November at 2 pm"));
  assert.ok(!hasAvailability("I am available any time"));
  assert.ok(!hasAvailability("Tuesday"));
});

test("inbox week: the right actions, on time, with the tracker updated score 100%", () => {
  const tracker = expectedStatuses(events);
  assert.deepEqual(tracker, { A: "interview", B: "rejected" });
  const r = scoreWeek(events, good, tracker, FILE);
  assert.equal(r.percent, 100);
  assert.equal(r.total, 7);
});

test("inbox week: late, missing attachment, replying to a scam and no availability are caught", () => {
  assert.equal(judge(events[1], { ...good[1], at: 80 }, FILE).issue, "late");
  assert.equal(judge(events[1], { ...good[1], reply: { text: good[1].reply!.text, attachments: [] } }, FILE).issue, "missingAttachment");
  assert.equal(judge(events[2], { eventId: "scam", type: "reply", at: 31, reply: { text: "ok", attachments: [] } }, FILE).issue, "repliedToScam");
  assert.equal(judge(events[4], { ...good[4], reply: { text: "Dear Mrs Fon, thank you, any time is fine.", attachments: [] } }, FILE).issue, "noAvailability");
  assert.equal(judge(events[3], { ...good[3], reply: { text: "ok", attachments: [] } }, FILE).issue, "notGracious");
  assert.equal(judge(events[0], undefined, FILE).issue, "noAction");
  const partial = scoreWeek(events, good.slice(0, 3), { A: "acknowledged", B: "" }, FILE);
  assert.equal(partial.points, 3);
});

/* ---------- NetworkProfileBuilder ---------- */

test("network profile: strength checks", () => {
  const cv = emptyCv();
  assert.equal(networkStrength(cv), 0);
  cv.network = {
    headline: "Marketing graduate (HND) | Seeking a sales or customer service role in Douala",
    about:
      "I help shops sell more and keep customers happy. I studied marketing at HIC Buea and spent two years selling phones in Mokolo market, where I served more than 50 customers a day. I am now looking for a sales or customer service role where I can grow.",
    skills: ["Sales", "Customer service", "Mobile Money", "Excel", "English and French"],
    photo: [true, true, true],
  };
  cv.experiences = [{ id: "e", title: "Sales assistant", org: "", place: "", start: "", end: "", bullets: ["Served 50+ customers a day"] }];
  const c = networkChecks(cv);
  assert.ok(Object.values(c).every(Boolean), JSON.stringify(c));
  assert.equal(networkStrength(cv), 100);
  cv.network.about = "Short.";
  cv.network.headline = "Hello";
  const d = networkChecks(cv);
  assert.ok(!d.aboutLength && !d.headlineSeek && !d.headlineLength);
  assert.ok(networkChecks({ ...cv, network: { ...cv.network, headline: "Diplômée en comptabilité, en recherche d’un poste d’assistante" } }).headlineSeek);
});

test("tracker: CSV export quotes commas and keeps accents", () => {
  const csv = trackerCsv(
    [{ id: "1", org: "Sawa Microfinance, Douala", role: "Chargée de clientèle", deadline: "2026-11-30", documents: "CV, letter", status: "applied", followUp: "", date: "", reference: "" }],
    ["Organisation", "Role", "Deadline", "Documents", "Status", "Follow-up", "Applied", "Reference"],
    (s) => s,
  );
  assert.ok(csv.startsWith("﻿"));
  assert.ok(csv.includes('"Sawa Microfinance, Douala",Chargée de clientèle,2026-11-30,"CV, letter",applied'));
});

/* ---------- Final mission ---------- */

const cvText = "Tabi Ndip\ntabi.ndip@gmail.com +237 677 12 34 56\nPROFILE\n...\nEXPERIENCE\n...\nEDUCATION\n...\nSKILLS\n...";
const letterText =
  "Dear Mrs Fon,\n\nI am applying for the Youth Programme Officer position at Kribi Youth Network. Last year I organised 12 training sessions for 40 young people.\n\nKind regards,\nTabi Ndip\n+237 677 12 34 56";
const app = {
  from: "tabi.ndip@gmail.com",
  subject: "Application for Youth Programme Officer – Tabi Ndip",
  text: "Dear Mrs Fon,\n\nPlease find attached my application for the Youth Programme Officer position: my CV and cover letter.\n\nKind regards,\nTabi Ndip\n+237 677 12 34 56",
  attachments: [
    { filename: "Tabi_Ndip_CV.pdf", contentType: "application/pdf", pages: 1, text: cvText },
    { filename: "Tabi_Ndip_Cover_Letter.pdf", contentType: "application/pdf", pages: 1, text: letterText },
  ],
};
const cfg = { gmail: "tabi.ndip@gmail.com", name: "Tabi Ndip", roleWords: ["youth programme officer", "youth program officer"], orgWords: ["kribi youth network"] };

test("application mission: a complete application passes", () => {
  assert.deepEqual(checkApplicationMission(app, cfg), []);
});

test("application mission: specific feedback for each problem", () => {
  assert.deepEqual(checkApplicationMission({ ...app, attachments: [app.attachments[0]] }, cfg), ["twoPdfs"]);
  const badNames = checkApplicationMission({ ...app, attachments: [{ ...app.attachments[0], filename: "cv.pdf" }, { ...app.attachments[1], filename: "letter final.pdf" }] }, cfg);
  assert.deepEqual(badNames.sort(), ["cvFileName", "letterFileName"].sort());
  const badLetter = checkApplicationMission(
    { ...app, attachments: [app.attachments[0], { ...app.attachments[1], text: "I want this job. " + "word ".repeat(360) }] },
    cfg,
  );
  for (const i of ["letterRole", "letterOrg", "letterLength", "letterGreeting", "letterClosing", "letterSignature"]) assert.ok(badLetter.includes(i as never), i);
  assert.deepEqual(checkApplicationMission({ ...app, attachments: [{ ...app.attachments[0], pages: 3 }, app.attachments[1]] }, cfg), ["cvPages"]);
  assert.deepEqual(checkApplicationMission({ ...app, subject: "My documents", text: "see attached " + "x ".repeat(160) }, cfg).sort(), ["bodyClosing", "bodyGreeting", "bodyLength", "bodySignature", "subject"].sort());
  assert.deepEqual(checkApplicationMission({ ...app, attachments: [{ filename: "Tabi_Ndip_CV.pdf" }, { filename: "Tabi_Ndip_Cover_Letter.pdf" }] }, cfg), ["unreadable"]);
});

test("reply mission: missing document and interview answers", () => {
  const doc = { from: "tabi.ndip@gmail.com", subject: "Re: Missing document", text: "Dear Mrs Fon,\nPlease find attached my HND diploma.\nKind regards,\nTabi\n\nOn Mon, Kribi wrote:\n> please send", attachments: [{ filename: "Tabi_Ndip_HND_Diploma.pdf" }] };
  assert.deepEqual(checkReplyMission("missing_document", doc, "tabi.ndip@gmail.com"), []);
  assert.deepEqual(checkReplyMission("missing_document", { ...doc, attachments: [] }, "tabi.ndip@gmail.com"), ["reply_attachment"]);
  assert.deepEqual(checkReplyMission("missing_document", { ...doc, attachments: [{ filename: "IMG_2231.jpg" }] }, "tabi.ndip@gmail.com"), ["reply_attachmentName"]);
  const interview = { ...doc, attachments: [], text: "Dear Mrs Fon,\nThank you for the invitation. I am available on Tuesday at 10:00.\nKind regards,\nTabi" };
  assert.deepEqual(checkReplyMission("interview", interview, "tabi.ndip@gmail.com"), []);
  assert.deepEqual(checkReplyMission("interview", { ...interview, text: "ok see you" }, "tabi.ndip@gmail.com").sort(), ["reply_availability", "reply_closing", "reply_greeting", "reply_thanks"].sort());
});

test("auto-reply: stable per learner, both kinds used, templates filled", () => {
  assert.equal(pickReplyKind("ABCD-2345"), pickReplyKind("ABCD-2345"));
  const kinds = new Set(Array.from({ length: 40 }, (_, i) => pickReplyKind(`CODE-${i}`)));
  assert.equal(kinds.size, 2);
  assert.match(missionReference("KYN", "ABCD-2345"), /^KYN-\d{5}$/);
  assert.equal(fillTemplate("Dear {name}, about {role} ({ref})", { name: "Tabi", role: "Officer", ref: "KYN-12345" }), "Dear Tabi, about Officer (KYN-12345)");
});
