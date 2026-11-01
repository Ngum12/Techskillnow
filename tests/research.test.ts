import { test } from "node:test";
import assert from "node:assert/strict";
import course from "@/content/research/en";
import sourcesJson from "@/content/research/sources.json" with { type: "json" };
import { cleanQuery, estimateResults, genericResults, isAcademic, narrowerSearches, practiceAcademic, readQuery, search, suggestions, type Source } from "@/lib/research/search";
import { apaInText, apaReference, plainReference } from "@/lib/research/apa";
import { checkTopicCard, composeTopic } from "@/lib/research/topic";
import { abstractRoles, classifyPrompt } from "@/lib/research/reading";
import type { Task } from "@/content/types";

const SOURCES = sourcesJson as Source[];
const KINDS = ["journal", "thesis", "report", "book", "news", "blog", "encyclopedia", "forum"];
const facets = (q: string) => Object.values(readQuery(q).facets).filter(Boolean).length;

test("practice sources are complete and unique", () => {
  const ids = new Set<string>();
  for (const s of SOURCES) {
    assert.ok(!ids.has(s.id), `duplicate ${s.id}`);
    ids.add(s.id);
    assert.ok(KINDS.includes(s.kind), s.id);
    for (const k of ["site", "url", "title", "snippet", "abstract"] as const) assert.ok(s[k].length > 5, `${s.id}: ${k}`);
    assert.ok(s.year >= 2000 && s.year <= 2026, s.id);
    assert.ok(s.keywords.length >= 3, s.id);
    if (isAcademic(s)) assert.ok(s.authors.length >= 1, `${s.id}: academic sources have authors`);
    if (s.kind === "journal") assert.ok(s.venue && s.volume && s.pages, `${s.id}: journal details for the reference`);
    if (s.kind === "thesis") assert.ok(s.degree, `${s.id}: degree`);
  }
  assert.ok(SOURCES.filter(isAcademic).length >= 25);
});

test("reading a query: who, where, what about it, when", () => {
  const broad = readQuery("mobile money");
  assert.equal(broad.level, "broad");
  assert.deepEqual(broad.missing, ["population", "place", "angle", "time"]);
  const r = readQuery("Factors affecting loan repayment among microfinance clients in Fako (2019-2024)");
  assert.ok(r.facets.population && r.facets.place && r.facets.angle && r.facets.time);
  assert.equal(r.level, "researchable");
  assert.equal(readQuery("mobile money traders Buea").level, "focused");
  assert.ok(readQuery('"mobile money" traders filetype:pdf site:repository').operators.quotes);
  assert.ok(readQuery("x filetype:pdf").operators.pdf);
  assert.equal(readQuery("x site:repository").operators.site, "repository");
  assert.equal(readQuery("").level, "empty");
});

test("narrowing reduces the result count, and Scholar shows fewer results than Google", () => {
  const steps = ["mobile money", "mobile money traders", "mobile money traders in Buea", "effect of mobile money charges on traders in Buea 2020-2024"];
  const counts = steps.map((q) => estimateResults(readQuery(q)));
  for (let i = 1; i < counts.length; i++) assert.ok(counts[i] < counts[i - 1], `${steps[i]}: ${counts[i]} < ${counts[i - 1]}`);
  assert.ok(counts[0] > 50_000_000, "a broad search shows a huge number");
  assert.ok(estimateResults(readQuery("mobile money"), true) < counts[0]);
  assert.equal(estimateResults(readQuery("mobile money")), estimateResults(readQuery("mobile money")), "stable");
});

test("ranking: relevant academic sources first; operators filter", () => {
  const hits = search(SOURCES, "mobile money small businesses Douala");
  assert.equal(hits[0].source.id, "mm-sme-douala");
  const scholar = search(SOURCES, "mobile money", { scholar: true });
  assert.ok(scholar.length >= 3 && scholar.every((h) => isAcademic(h.source)));
  assert.ok(search(SOURCES, "mobile money filetype:pdf").every((h) => h.source.pdf));
  const repo = search(SOURCES, "loan repayment site:repository");
  assert.ok(repo.length >= 1 && repo.every((h) => /repository|repo\./i.test(h.source.url + h.source.site)));
  assert.ok(search(SOURCES, '"loan repayment"').every((h) => `${h.source.title} ${h.source.snippet} ${h.source.abstract}`.toLowerCase().includes("loan repayment")));
  assert.deepEqual(search(SOURCES, "zzzz qqqq"), []);
  // Every field in the funnel finds academic sources on Scholar.
  for (const q of ["exclusive breastfeeding mothers", "online learning students", "maize farmers", "cybersecurity small businesses", "land disputes", "loan repayment"]) assert.ok(search(SOURCES, q, { scholar: true }).length >= 1, q);
});

test("generic pages, suggestions and narrower searches", () => {
  const g = genericResults("climate change");
  assert.deepEqual(g.map((s) => s.kind), ["encyclopedia", "blog", "forum"]);
  assert.ok(g.every((s) => !isAcademic(s)));
  assert.deepEqual(genericResults("  "), []);
  assert.ok(suggestions(SOURCES, "mobile").some((s) => s.startsWith("mobile money")));
  assert.deepEqual(suggestions(SOURCES, "m"), []);
  const n = narrowerSearches("mobile money");
  assert.ok(n.length >= 3 && n.every((q) => facets(q) >= 1), n.join(" | "));
});

test("APA references and in-text citations", () => {
  const journal = SOURCES.find((s) => s.id === "mm-review")!;
  assert.equal(plainReference(journal), "Ngwa, P. T., & Fotso, A. (2022). Mobile money and financial inclusion in Central Africa: a review of evidence. Wouri Journal of Business Studies, 9(2), 45–63.");
  assert.deepEqual(apaReference(journal).filter((p) => p.italic).map((p) => p.text), ["Wouri Journal of Business Studies", "9"]);
  assert.equal(apaInText(journal), "(Ngwa & Fotso, 2022)");
  const thesis = SOURCES.find((s) => s.id === "mm-sme-douala")!;
  assert.match(plainReference(thesis), /^Ebot, M\. C\. \(2023\)\. Effect of mobile money .*\[Bachelor's project, Sawa University\]\. Sawa University Repository\.$/);
  assert.equal(apaInText(thesis), "(Ebot, 2023)");
  assert.equal(apaInText({ authors: ["A, B.", "C, D.", "E, F."], year: 2020, site: "x" }), "(A et al., 2020)");
  for (const s of SOURCES) assert.ok(!/undefined|NaN/.test(plainReference(s)), s.id);
});

test("topic card checks, like a supervisor", () => {
  const good = {
    title: "Effect of mobile money charges on the savings of market traders in Buea (2020-2024)",
    problem: "Most market traders in Buea now receive payments by mobile money, yet many complain that withdrawal charges eat into their profits. Studies in Douala show that charges reduce use, but no study has measured their effect on savings in Buea.",
    questions: ["What is the level of mobile money use among market traders in Buea?", "How do withdrawal charges affect the amount traders save each month?"],
    objectives: ["To determine the level of mobile money use among market traders in Buea.", "To assess the effect of withdrawal charges on traders' monthly savings."],
    keywords: "mobile money, transaction charges, savings, market traders",
  };
  assert.deepEqual(checkTopicCard(good), []);
  assert.ok(checkTopicCard({ ...good, title: "Mobile money in Cameroon" }).includes("titleBroad"));
  assert.ok(checkTopicCard({ ...good, problem: "Charges are high." }).includes("problemShort"));
  assert.ok(checkTopicCard({ ...good, questions: [good.questions[0], "Charges and savings"] }).includes("questionForm"));
  assert.ok(checkTopicCard({ ...good, objectives: [good.objectives[0]] }).includes("objectivesCount"));
  assert.ok(checkTopicCard({ ...good, objectives: [good.objectives[0], "Savings of traders."] }).includes("objectiveVerb"));
  assert.ok(checkTopicCard({ ...good, keywords: "money" }).includes("keywords"));
  assert.equal(composeTopic({ idea: "loan repayment", angle: "factors affecting", population: "microfinance clients", place: "Fako", period: "2019–2024" }), "Factors affecting loan repayment among microfinance clients in Fako (2019–2024)");
});

test("smart reading: every academic abstract shows its aim and findings", () => {
  for (const s of SOURCES.filter(isAcademic)) {
    const roles = abstractRoles(s.abstract).map((x) => x.role);
    assert.equal(roles[0], "aim", s.id);
    if (s.kind !== "book") assert.ok(roles.includes("finding"), `${s.id}: ${roles.join(",")}`);
  }
  // "the recommended four visits" is a finding, not a recommendation.
  assert.notEqual(abstractRoles(SOURCES.find((s) => s.id === "anc-attendance")!.abstract)[1].role, "recommendation");
  assert.equal(abstractRoles("This study looked at X. The study recommends Y.")[1].role, "recommendation");
});

test("AI prompts: honest help, risky requests and misconduct", () => {
  for (const p of ["Help me narrow my topic", "Explain what a sampling frame is", "Suggest keywords to search", "Ask me questions about my problem statement"]) assert.equal(classifyPrompt(p), "honest", p);
  for (const p of ["Give me 5 references on mobile money", "Which studies on malaria in Buea should I cite?"]) assert.equal(classifyPrompt(p), "risky", p);
  for (const p of ["Write my literature review", "Write chapter two for me", "Paraphrase this so Turnitin will not detect it", "Make up the questionnaire results", "Fill the questionnaires for me", "generate my abstract"]) assert.equal(classifyPrompt(p), "misconduct", p);
});

test("any topic has research to open, and pasted descriptions are cleaned", () => {
  // A topic the course sources do not cover still gets a thesis and a journal article to open and save.
  const pasted = "• Drug Abuse Measures in Cameroon: Challenges • Source Type: Academic Thesis / Long Essay submitted to the Faculty at the University of Buea on Scribd. • Focus: Analyzes systemic barriers, enforcement failures, and legislative gaps.";
  const clean = cleanQuery(pasted);
  assert.ok(!/[•\n]/.test(clean) && !/\s{2}/.test(clean), clean);
  assert.ok(readQuery(clean).tooLong);
  assert.ok(!readQuery("drug abuse among students in Buea").tooLong);
  for (const q of [clean, "drug abuse students Buea", "climate change"]) {
    const p = practiceAcademic(q);
    assert.deepEqual(p.map((s) => s.kind), ["thesis", "journal"], q);
    assert.ok(p.every(isAcademic));
    for (const s of p) {
      assert.ok(s.title.split(" ").length <= 22, `short title: ${s.title}`);
      assert.ok(!/undefined|NaN|•/.test(JSON.stringify(s)), s.id);
      assert.ok(s.authors.length >= 1 && s.year >= 2021);
    }
    assert.equal(practiceAcademic(q)[0].id, p[0].id, "stable ids");
  }
  assert.ok(genericResults(pasted).every((s) => s.title.split(" ").length <= 20), "generic titles stay short");
  assert.deepEqual(practiceAcademic("   "), []);
});

/* ---------- The course ---------- */

const flat = (t: Task): Task[] => (t.type === "sequence" ? t.tasks.flatMap(flat) : [t]);
const tasks = course.steps.flatMap((s) => (s.task ? flat(s.task) : []));

test("research course: price, series, steps and assessment", () => {
  assert.equal(course.id, "research-project");
  assert.equal(course.price, 1000);
  assert.equal(course.track, "university");
  assert.equal(course.steps.length, 19);
  assert.equal(course.freeSteps, 3);
  assert.equal(course.steps[2].task?.type, "googleSearch", "the Google search is free to try");
  assert.equal(course.assessment.questions.length, 10);
  for (const q of course.assessment.questions) assert.ok(q.answer < q.options.length && q.step >= 1 && q.step <= course.steps.length, q.question);
  for (const s of course.steps) {
    assert.ok(s.body.length >= 1 && s.task, s.title);
    for (const b of s.body) assert.ok(!/\$|\\/.test(b), `plain intro: ${b}`);
  }
});

test("research course: every exercise can be completed", () => {
  for (const t of tasks) {
    switch (t.type) {
      case "googleSearch":
        for (const g of t.goals) if (g.kind === "narrow") assert.ok(g.facets >= 1 && g.facets <= 4);
        break;
      case "cardSort": {
        const ids = new Set(t.buckets.map((b) => b.id));
        for (const c of t.cards) assert.ok(ids.has(c.answer), c.text);
        assert.ok(t.required <= t.cards.length && t.required >= Math.ceil(t.cards.length * 0.6), t.instruction);
        for (const b of t.buckets) assert.ok(t.cards.some((c) => c.answer === b.id), `bucket ${b.id} is used`);
        break;
      }
      case "topicFunnel":
        // Every combination of the suggested choices makes a researchable topic.
        for (const f of t.fields)
          for (const population of f.populations)
            for (const place of f.places) {
              const title = composeTopic({ idea: f.ideas[0], population, place, angle: f.angles[0], period: f.periods[0] });
              assert.ok(facets(title) >= 3, `${f.id}: ${title}`);
            }
        break;
      case "alignment": {
        assert.equal(t.objectives.filter((o) => o.question === null).length, 1, "one objective does not fit");
        const answered = t.objectives.map((o) => o.question).filter((q) => q !== null);
        assert.deepEqual([...answered].sort(), t.questions.map((_, i) => i), "each question has one objective");
        break;
      }
      case "noteCard":
        assert.ok(SOURCES.some((s) => s.id === t.sourceId && isAcademic(s)), t.sourceId);
        for (const f of t.fields) assert.ok(f.answer < f.options.length && new Set(f.options).size === f.options.length, f.label);
        break;
      case "referenceBuilder":
        for (const r of t.rounds) {
          assert.ok(r.pieces.length >= 4 && new Set(r.pieces).size === r.pieces.length, r.label);
          assert.ok(r.intext.answer < r.intext.options.length, r.label);
        }
        break;
      case "dataTally": {
        assert.ok(t.responses.every((r) => r >= 0 && r < t.options.length));
        assert.ok(t.chart.answer < t.chart.options.length);
        const freq = t.options.map((_, i) => t.responses.filter((r) => r === i).length);
        assert.equal(freq.reduce((a, b) => a + b, 0), t.responses.length);
        // The model sentence in the success message matches the data.
        assert.match(t.success, new RegExp(`${Math.round((Math.max(...freq) / t.responses.length) * 100)}%`));
        break;
      }
      case "projectAnatomy": {
        const ids = new Set(t.pages.map((p) => p.id));
        assert.equal(t.pages[0].id, "cover");
        for (const q of t.quiz) assert.ok(ids.has(q.answer) && q.answer !== "cover", q.question);
        assert.ok(t.pages.some((p) => p.id.startsWith("ch")));
        break;
      }
      case "sectionOrder":
        for (const r of t.rounds) {
          assert.deepEqual([...r.answer].sort(), r.sections.map((s) => s.id).sort(), r.persona);
          assert.notDeepEqual(r.answer, r.sections.map((s) => s.id), `${r.persona}: shown out of order`);
        }
        break;
      case "redPen": {
        const used = t.lines.flatMap((l) => l.parts.flatMap((p) => (typeof p === "string" ? [] : [p.error])));
        assert.deepEqual([...used].sort(), t.errors.map((e) => e.id).sort());
        break;
      }
      case "multipleChoice":
        assert.ok(t.answer < t.options.length, t.question);
        break;
      case "interview":
        assert.ok(t.required <= t.cards.length);
        break;
      case "paperSkim": {
        const ids = new Set(t.paper.sections.map((x) => x.id));
        for (const q of t.questions) assert.ok(ids.has(q.answer), q.question);
        for (const sec of t.paper.sections) if (sec.key) assert.ok(sec.paragraphs.some((p) => p.includes(sec.key!)), `${sec.id}: key sentence is in the text`);
        for (const q of t.questions) assert.ok(t.paper.sections.find((x) => x.id === q.answer)!.key, `${q.answer}: has a highlight`);
        break;
      }
      case "aiAssistant": {
        for (const st of t.stages) {
          assert.ok(st.prompts.some((p) => p.ok), `${st.instruction}: an honest prompt exists`);
          assert.ok(st.prompts.some((p) => !p.ok), `${st.instruction}: a temptation exists`);
          // The written prompts are classified the same way as typed ones.
          for (const p of st.prompts) assert.equal(classifyPrompt(p.text.replace("{topic}", "mobile money")) === "misconduct", !p.ok, p.text);
        }
        // Each real reference is found on the practice Scholar; the invented one is not.
        for (const r of t.verify.refs) assert.equal(search(SOURCES, r.query, { scholar: true }).length > 0, r.real, r.text);
        assert.ok(t.verify.refs.some((r) => !r.real) && t.verify.refs.some((r) => r.real));
        assert.ok(t.disclosure.answer < t.disclosure.options.length);
        break;
      }
    }
  }
  // The note card and the references use real practice sources.
  assert.ok(tasks.some((t) => t.type === "googleSearch" && t.engine === "scholar"));
});

test("research course: no control characters in any text", () => {
  const bad = /[\r\t\f\v\b]/;
  const walk = (v: unknown, where: string): void => {
    if (typeof v === "string") assert.ok(!bad.test(v), `${where}: ${JSON.stringify(v)}`);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${where}.${k}`);
  };
  walk(course, "course");
  walk(SOURCES, "sources");
});
