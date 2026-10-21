import { test } from "node:test";
import assert from "node:assert/strict";
import { checkBullet, composeBullet, MAX_BULLET_CHARS } from "@/lib/cv/bullet";
import { extractTerms, matches, scoreCv, stem, stems } from "@/lib/cv/keywords";
import { countWords, emptyPortal, limitWords, referenceNumber, validateFile, validatePage } from "@/lib/cv/portal";
import { checkCoverLetter, copiesCv } from "@/lib/cv/letter";
import { checkCvMission } from "@/lib/mission-cv-check";
import { cvFileName, cvGaps, cvText, emptyCv, parseCv, withTailoring } from "@/lib/cv/model";

/* ---------- BulletBuilder rules ---------- */

test("bullet: a strong achievement line passes", () => {
  assert.deepEqual(checkBullet("Organised a fundraising day for 120 church members, raising 85 000 FCFA for the youth choir."), []);
  assert.deepEqual(checkBullet("Coordonné 3 sorties éducatives pour 40 élèves de la classe de 3e."), []);
});

test("bullet: weak openings, missing numbers and long lines are flagged", () => {
  assert.ok(checkBullet("Responsible for cleaning the shop every morning").includes("weakOpening"));
  assert.ok(checkBullet("In charge of the cash box at my aunt's shop").includes("weakOpening"));
  assert.ok(checkBullet("Chargée de la caisse dans la boutique familiale").includes("weakOpening"));
  assert.ok(checkBullet("Taught mathematics to younger pupils after school").includes("noNumber"));
  assert.ok(checkBullet("I sold phones to customers in the market every day").includes("firstPerson"));
  assert.ok(checkBullet("Sold 30 phones").includes("tooShort"));
  assert.ok(checkBullet(`Sold 30 phones ${"to happy customers in Mokolo market ".repeat(8)}`).includes("tooLong"));
  assert.deepEqual(checkBullet("   "), ["empty"]);
  assert.ok(MAX_BULLET_CHARS >= 150);
});

test("bullet: composing from verb, task and result", () => {
  assert.equal(composeBullet("Tutored", "6 pupils in mathematics", "and all passed the BEPC"), "Tutored 6 pupils in mathematics, and all passed the BEPC.");
  assert.equal(composeBullet("Organised", "a clean-up day.", ""), "Organised a clean-up day.");
  assert.equal(composeBullet("", "", ""), "");
});

/* ---------- KeywordMatcher scoring ---------- */

test("keywords: stemming joins word forms", () => {
  assert.equal(stem("organising"), stem("organised"));
  assert.equal(stem("organizing"), stem("organising"));
  assert.equal(stem("communication"), stem("communicating"));
  assert.equal(stem("customers"), stem("customer"));
});

test("keywords: synonyms match across words and languages", () => {
  assert.ok(matches("customer service", stems("Five years in service client at a supermarket")));
  assert.ok(matches("Excel", stems("Good with spreadsheets")));
  assert.ok(matches("bilingual", stems("Fluent in English and French")));
  assert.ok(!matches("driving licence", stems("I can drive a motorbike")));
});

test("keywords: terms near the top of the CV score more", () => {
  const terms = ["customer service", "Excel", "teamwork", "mobile money"];
  const low = scoreCv(terms, { top: "Motivated graduate.", rest: "Customer service at a shop. Excel. Teamwork." });
  const high = scoreCv(terms, { top: "Customer service graduate skilled in Excel and teamwork.", rest: "" });
  assert.equal(low.missing.join(), "mobile money");
  assert.equal(low.score, 45);
  assert.equal(high.score, 75);
  assert.ok(high.matched.every((m) => m.where === "top"));
});

test("keywords: extraction from a pasted advert finds synonyms and frequent words", () => {
  const terms = extractTerms(
    "We are recruiting a field officer. Must have experience in data collection and community mobilisation. Fieldwork in villages. Driving licence required. Reports every week.",
  );
  for (const t of ["data collection", "community", "driving licence", "report"]) assert.ok(terms.some((x) => matches(x, stems(t))), t);
  assert.ok(terms.length <= 15);
});

test("keywords: tailoring improves the score by moving matched skills to the top", () => {
  const cv = parseCv({
    ...emptyCv(),
    profile: "Graduate looking for work.",
    skills: ["Football", "Music", "Drawing", "Cooking", "Dancing", "Customer service", "Excel"].map((name, i) => ({ id: `s${i}`, name, level: "good" })),
  });
  const terms = ["customer service", "Excel"];
  const before = scoreCv(terms, cvText(cv)).score;
  const tailored = withTailoring({ ...cv, tailored: { bank: { profile: "Friendly graduate with customer service experience.", skills: ["s5", "s6"] } } }, "bank");
  const after = scoreCv(terms, cvText(tailored)).score;
  assert.equal(before, 60);
  assert.equal(after, 100);
});

/* ---------- PortalSimulator validation ---------- */

const config = { wordLimit: 150, maxFileMb: 2, allowedTypes: ["pdf"] };

test("portal: required fields, email and Cameroon phone", () => {
  const v = { ...emptyPortal(), firstName: "Tabi", email: "tabi@", phone: "12345" };
  const e = validatePage("personal", v, config);
  assert.equal(e.lastName, "required");
  assert.equal(e.email, "email");
  assert.equal(e.phone, "phone");
  const ok = validatePage("personal", { ...v, lastName: "Ndip", email: "tabi.ndip@gmail.com", phone: "+237 677 12 34 56", city: "Buea" }, config);
  assert.deepEqual(ok, {});
});

test("portal: graduation year must be realistic", () => {
  const base = { ...emptyPortal(), qualification: "BSc", institution: "University of Buea" };
  assert.equal(validatePage("education", { ...base, year: "1890" }, config).year, "year");
  assert.deepEqual(validatePage("education", { ...base, year: "2024" }, config), {});
});

test("portal: motivation word limit is hard and has a minimum", () => {
  assert.equal(limitWords("one two three four", 2), "one two");
  assert.equal(countWords(limitWords("a ".repeat(200), 150)), 150);
  assert.equal(validatePage("motivation", { ...emptyPortal(), motivation: "word ".repeat(151) }, config).motivation, "tooLong");
  assert.equal(validatePage("motivation", { ...emptyPortal(), motivation: "word ".repeat(10) }, config).motivation, "tooShort");
  assert.deepEqual(validatePage("motivation", { ...emptyPortal(), motivation: "word ".repeat(80) }, config), {});
});

test("portal: file type and size", () => {
  assert.equal(validateFile(null, config), "required");
  assert.equal(validateFile({ name: "photo.jpg", size: 1000 }, config), "fileType");
  assert.equal(validateFile({ name: "Tabi_Ndip_CV.PDF", size: 3 * 1024 * 1024 }, config), "fileSize");
  assert.equal(validateFile({ name: "Tabi_Ndip_CV.pdf", size: 200 * 1024 }, config), null);
});

test("portal: reference numbers are stable per seed", () => {
  assert.equal(referenceNumber("NYF", "abc"), referenceNumber("NYF", "abc"));
  assert.match(referenceNumber("NYF", "abc"), /^NYF-\d{4}-\d{5}$/);
});

/* ---------- Cover letter ---------- */

test("cover letter: names role and org, proofs, request, no CV copy, length", () => {
  const advert = { role: "Field Assistant", org: "Ndolo Youth Foundation" };
  const good = {
    greeting: "Dear Mrs Fon,",
    opening: "I am applying for the Field Assistant position at Ndolo Youth Foundation, advertised on your website.",
    whyMe: "Last year I surveyed 60 households for a church health project. I also tutored 6 pupils in mathematics and all of them passed.",
    whyOrg: "Your work with young people in Bamenda matters to me because I grew up in a community that needed it.",
    closing: "I would welcome the opportunity to discuss my application in an interview.",
    signOff: "Yours sincerely,",
    name: "Tabi Ndip",
  };
  assert.deepEqual(checkCoverLetter(good, advert, ["Surveyed households"], 350), []);
  const bad = { ...good, opening: "I want a job.", closing: "Thanks.", whyMe: "I am hardworking." };
  assert.deepEqual(checkCoverLetter(bad, advert, [], 350).sort(), ["org", "proofs", "request", "role"].sort());
  assert.ok(copiesCv("I organised a fundraising day for 120 church members raising money", ["Organised a fundraising day for 120 church members, raising 85 000 FCFA"]));
});

/* ---------- Final CV mission ---------- */

const cvPdfText =
  "Tabi Ndip\ntabi.ndip@gmail.com · +237 677 12 34 56 · Buea\nPROFILE\nGraduate...\nEXPERIENCE\nVolunteer...\nEDUCATION\nBSc...\nSKILLS\nExcel";
const good = {
  from: "tabi.ndip@gmail.com",
  subject: "Application for Programme Assistant – Tabi Ndip",
  text: "Dear Sir or Madam,\n\nPlease find my CV attached for the Programme Assistant role.\n\nKind regards,\nTabi Ndip\n+237 677 12 34 56",
  attachments: [{ filename: "Tabi_Ndip_CV.pdf", contentType: "application/pdf", pages: 1, text: cvPdfText }],
};
const role = ["programme assistant", "program assistant"];

test("cv mission: a complete, well-named 1-page CV passes", () => {
  assert.deepEqual(checkCvMission(good, "tabi.ndip@gmail.com", role), []);
});

test("cv mission: each problem gets its own feedback", () => {
  assert.deepEqual(checkCvMission({ ...good, from: "other@gmail.com" }, "tabi.ndip@gmail.com", role), ["gmail"]);
  assert.deepEqual(checkCvMission({ ...good, subject: "My CV" }, "tabi.ndip@gmail.com", role), ["subject"]);
  assert.deepEqual(checkCvMission({ ...good, attachments: [] }, "tabi.ndip@gmail.com", role), ["pdf"]);
  assert.deepEqual(
    checkCvMission({ ...good, attachments: [{ ...good.attachments[0], filename: "scan0012.pdf" }] }, "tabi.ndip@gmail.com", role),
    ["fileName"],
  );
  assert.deepEqual(checkCvMission({ ...good, attachments: [{ ...good.attachments[0], pages: 4 }] }, "tabi.ndip@gmail.com", role), ["pages"]);
  assert.deepEqual(
    checkCvMission({ ...good, attachments: [{ ...good.attachments[0], text: "PROFILE only, no contact, nothing else" }] }, "tabi.ndip@gmail.com", role).sort(),
    ["cvEmail", "cvPhone", "cvSections"].sort(),
  );
  assert.deepEqual(checkCvMission({ ...good, attachments: [{ filename: "Tabi_Ndip_CV.pdf" }] }, "tabi.ndip@gmail.com", role), ["unreadable"]);
  assert.deepEqual(checkCvMission({ ...good, text: "cv attached" }, "tabi.ndip@gmail.com", role).sort(), ["closing", "greeting", "signature"].sort());
});

/* ---------- CV model ---------- */

test("cv model: untrusted input is cleaned and limited", () => {
  const cv = parseCv({ header: { fullName: "x".repeat(500), showDob: "yes" }, skills: Array(50).fill({ name: "Excel", level: "god" }), evil: 1 });
  assert.equal(cv.header.fullName.length, 80);
  assert.equal(cv.header.showDob, false);
  assert.equal(cv.skills.length, 20);
  assert.equal(cv.skills[0].level, "good");
  assert.ok(!("evil" in cv));
});

test("cv model: file name and gaps", () => {
  assert.equal(cvFileName("Nkeng  Ateh-Fon"), "Nkeng_Ateh_Fon_CV.pdf");
  assert.equal(cvFileName("Ébénézer Tchoua"), "Ebenezer_Tchoua_CV.pdf");
  assert.deepEqual(cvGaps(emptyCv()), ["name", "email", "phone", "profile", "experienceOrEducation", "skills", "languages"]);
});
