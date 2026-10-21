import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GOOD_PREP,
  areConcordant,
  bestConcordantSet,
  checkChosenTitres,
  createExperiment,
  createRun,
  exactEndPoint,
  flaskState,
  levelAfter,
  meanTitre,
  prepEffects,
  rng,
  roundReading,
  showsFlash,
  validReadingFormat,
  type PrepChoices,
  type TitrationSystem,
} from "@/lib/chem/titration";
import { CALC_BOXES, correctChain, markCalculation, parseNumber } from "@/lib/chem/calc";
import { assembleMethod, clozeGapOk, fillCloze, markCheckpoint, parseCloze, pointMet, scaffoldFor, shuffledOrder } from "@/lib/chem/marking";
import { checkResultsTable } from "@/lib/chem/results";
import { apparatus, chemSettings as settings, checkpoints, errorData, indicators, systems } from "@/content/chem/data";

const sys = (id: string) => systems.find((s) => s.id === id) as TitrationSystem;
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} ≠ ${b}`);

/* ---------- End point maths ---------- */

test("titration: end point for each mole ratio", () => {
  near(exactEndPoint(sys("hcl-naoh"), 0.1, 25), 25); // 1:1
  near(exactEndPoint(sys("hcl-naoh"), 0.08, 25), 20);
  near(exactEndPoint(sys("h2so4-naoh"), 0.1, 25), 25); // 1 H2SO4 : 2 NaOH, 0.0500 acid
  near(exactEndPoint(sys("h2so4-naoh"), 0.12, 25), 30);
  near(exactEndPoint(sys("hcl-na2co3"), 0.05, 25), 25); // 2 HCl : 1 Na2CO3
  near(exactEndPoint(sys("hcl-na2co3"), 0.04, 25), 20);
});

test("titration: every system gives a realistic titre over its whole range", () => {
  for (const s of systems) {
    for (const c of s.flask.concRange) {
      const v = exactEndPoint(s, c, settings.apparatus.pipetteVolume);
      assert.ok(v >= 10 && v <= 45, `${s.id} at ${c}: ${v}`);
    }
    assert.ok(indicators.some((i) => i.id === s.indicator), s.indicator);
  }
});

test("titration: experiments stay in range, to 3 significant figures, and runs are reproducible", () => {
  const r = rng(42);
  for (let i = 0; i < 200; i++) {
    const e = createExperiment(systems, r);
    const s = sys(e.systemId);
    assert.ok(e.flaskConc >= s.flask.concRange[0] - 1e-9 && e.flaskConc <= s.flask.concRange[1] + 1e-9);
    assert.equal(Number(e.flaskConc.toPrecision(3)), e.flaskConc);
    const prep = prepEffects(GOOD_PREP, errorData);
    const run = createRun(e, s, settings, prep, 1);
    assert.deepEqual(run, createRun(e, s, settings, prep, 1));
    assert.ok(Math.abs(run.endPoint - exactEndPoint(s, e.flaskConc, 25)) <= settings.realism.runJitter + 1e-9, "small variation only");
    near(roundReading(run.initialLevel), run.initialLevel);
  }
  assert.equal(createExperiment(systems, rng(1), "hcl-na2co3").systemId, "hcl-na2co3");
});

/** The titre a learner would record with these preparation choices (reading the burette correctly). */
function recordedTitre(choices: Partial<PrepChoices>): number {
  const s = sys("hcl-naoh");
  const prep = prepEffects({ ...GOOD_PREP, ...choices }, errorData);
  const run = { endPoint: exactEndPoint(s, 0.1, 25, prep), initialLevel: 0.5, readingOffset: prep.readingOffset };
  return levelAfter(run, run.endPoint) - run.initialLevel;
}

test("titration: each preparation error moves the titre the right way", () => {
  const good = recordedTitre({});
  near(good, 25);
  assert.ok(recordedTitre({ burette: "water" }) > good, "burette rinsed with water: too high");
  assert.ok(recordedTitre({ pipette: "water" }) < good, "pipette rinsed with water: too low");
  assert.ok(recordedTitre({ flask: "alkali" }) > good, "flask rinsed with alkali: too high");
  near(recordedTitre({ flask: "water" }), good); // distilled water in the flask: no effect
  assert.ok(recordedTitre({ funnelRemoved: false }) !== good, "funnel left in: inaccurate");
  assert.ok(recordedTitre({ jetFilled: false }) > good, "air bubble in the jet: too high");
  assert.equal(prepEffects(GOOD_PREP, errorData).explanations.length, 1, "only the 'flask rinsed with water: no effect' lesson");
  assert.equal(prepEffects({ ...GOOD_PREP, burette: "water", jetFilled: false }, errorData).explanations.length, 3);
});

test("titration: parallax readings go the stated way", () => {
  assert.ok(errorData.parallax.above.offset < 0 && errorData.parallax.below.offset > 0);
});

test("titration: readings to 2 dp ending in 0 or 5", () => {
  assert.equal(roundReading(23.47), 23.45);
  assert.equal(roundReading(23.48), 23.5);
  assert.equal(roundReading(0.024), 0);
  for (const ok of ["23.45", "0.00", "9.50"]) assert.ok(validReadingFormat(ok), ok);
  for (const bad of ["23.4", "23.47", "23", "23.450"]) assert.ok(!validReadingFormat(bad), bad);
});

test("titration: local flash near the end point, permanent change after it", () => {
  const e = 24;
  assert.equal(flaskState(10, e, settings), "alkali");
  assert.ok(!showsFlash(10, e, settings));
  assert.ok(showsFlash(23.5, e, settings));
  assert.equal(flaskState(23.95, e, settings), "alkali");
  assert.equal(flaskState(24, e, settings), "endPoint");
  assert.equal(flaskState(24.05, e, settings), "endPoint");
  assert.equal(flaskState(24.3, e, settings), "excessAcid");
  assert.ok(!showsFlash(24.3, e, settings));
});

/* ---------- Concordance ---------- */

test("concordance: within 0.10 cm³, best set and the learner's choice", () => {
  assert.ok(areConcordant([24.1, 24.2]));
  assert.ok(areConcordant([24.1, 24.15, 24.2]));
  assert.ok(!areConcordant([24.1, 24.25]));
  assert.ok(!areConcordant([24.1]));
  const titres = [25.0, 24.3, 24.1, 24.15]; // index 0 is the rough titration
  assert.deepEqual(bestConcordantSet(titres.slice(1)), [1, 2]);
  assert.deepEqual(checkChosenTitres(titres, [2, 3], { roughIndex: 0 }), []);
  assert.deepEqual(checkChosenTitres(titres, [1, 2], { roughIndex: 0 }), ["notConcordant"]);
  assert.deepEqual(checkChosenTitres(titres, [2], { roughIndex: 0 }), ["tooFew"]);
  assert.ok(checkChosenTitres(titres, [0, 2, 3], { roughIndex: 0 }).includes("includesRough"));
  assert.deepEqual(checkChosenTitres([25, 24.1, 24.15, 24.2], [1, 2], { roughIndex: 0 }), ["missedConcordant"]);
  assert.equal(meanTitre([24.1, 24.15]), 24.13);
});

/* ---------- Calculations with error carried forward ---------- */

const DATA = { titre: 24.0, knownConc: 0.1, pipetteVolume: 25, ratio: { burette: 2, flask: 1 }, molarMass: 106 };

test("calc: numbers as learners type them", () => {
  for (const [text, want] of [
    ["0.0024", 0.0024],
    ["2.4e-3", 0.0024],
    ["2.4 x 10^-3", 0.0024],
    ["2.4×10⁻³", 0.0024],
    ["2.4 × 10-3", 0.0024],
    ["0,5", 0.5],
    ["1/2", 0.5],
    ["0.0480 mol dm-3", 0.048],
    ["5.09 g/dm3", 5.09],
  ] as const) {
    const v = parseNumber(text);
    assert.ok(v !== null && Math.abs(v - want) < 1e-9, `${text} → ${v}`);
  }
  assert.equal(parseNumber("abc"), null);
  assert.equal(parseNumber(""), null);
});

test("calc: correct answers score every box", () => {
  const right = correctChain(DATA);
  near(right.molesKnown, 0.0024);
  near(right.ratio, 0.5);
  near(right.molesUnknown, 0.0012);
  near(right.conc, 0.048);
  near(right.massConc, 5.088, 1e-9);
  const marks = markCalculation(DATA, { molesKnown: "2.40e-3", ratio: "1/2", molesUnknown: "0.00120", conc: "0.0480", massConc: "5.09" });
  assert.deepEqual(marks.map((m) => m.id), CALC_BOXES);
  assert.ok(marks.every((m) => m.ok && !m.ecf), JSON.stringify(marks));
});

test("calc: a slip early on still earns the later method marks (ECF)", () => {
  // Used 24.0 dm³ instead of cm³: moles 1000× too big, then correct working.
  const marks = markCalculation(DATA, { molesKnown: "2.4", ratio: "0.5", molesUnknown: "1.2", conc: "48", massConc: "5088" });
  const by = Object.fromEntries(marks.map((m) => [m.id, m]));
  assert.ok(!by.molesKnown.ok);
  assert.ok(by.ratio.ok && !by.ratio.ecf);
  assert.ok(by.molesUnknown.ok && by.molesUnknown.ecf);
  assert.ok(by.conc.ok && by.conc.ecf);
  assert.ok(by.massConc.ok && by.massConc.ecf);
  // Wrong mole ratio (2 instead of 1/2): later boxes consistent with it still score.
  const r = Object.fromEntries(markCalculation(DATA, { molesKnown: "0.0024", ratio: "2", molesUnknown: "0.0048", conc: "0.192" }).map((m) => [m.id, m]));
  assert.ok(!r.ratio.ok && r.molesUnknown.ok && r.molesUnknown.ecf && r.conc.ok);
  // A wrong later box is wrong even when earlier boxes are right.
  const w = Object.fromEntries(markCalculation(DATA, { molesKnown: "0.0024", ratio: "0.5", molesUnknown: "0.0024" }).map((m) => [m.id, m]));
  assert.ok(w.molesKnown.ok && !w.molesUnknown.ok);
  // Without a molar mass there is no mass-concentration box.
  assert.ok(!markCalculation({ ...DATA, molarMass: undefined }, {}).some((m) => m.id === "massConc"));
});

/* ---------- Lab notebook ---------- */

test("notebook: every model answer meets all its marking points; the cloze matches the model", () => {
  assert.ok(checkpoints.length >= 5 && checkpoints.length <= 7);
  for (const cp of checkpoints) {
    const model = cp.sentences.join(" ");
    const mark = markCheckpoint(cp, model);
    assert.deepEqual(mark.missed, [], `${cp.id} model misses ${mark.missed}`);
    assert.equal(cp.cloze.length, cp.sentences.length, cp.id);
    cp.cloze.forEach((line, i) => {
      assert.equal(fillCloze(line), cp.sentences[i], `${cp.id} cloze ${i}`);
      assert.ok(parseCloze(line).some((p) => typeof p !== "string"), `${cp.id} cloze ${i} has a gap`);
    });
    assert.deepEqual(markCheckpoint(cp, "").met, []);
  }
});

test("notebook: synonyms count, the wrong thing does not, and stuffing earns nothing", () => {
  const prepare = checkpoints.find((c) => c.id === "prepare")!;
  const pipette = checkpoints.find((c) => c.id === "pipette")!;
  const concordance = checkpoints.find((c) => c.id === "concordance")!;
  const point = (cp: typeof prepare, id: string) => cp.points.find((p) => p.id === id)!;
  assert.ok(pointMet(point(prepare, "rinseAcid"), "I washed the burette out with some of the HCl."));
  assert.ok(pointMet(point(prepare, "removeFunnel"), "Then I took out the funnel."));
  assert.ok(!pointMet(point(pipette, "rinseAlkali"), "I rinsed the pipette with distilled water."));
  assert.ok(!pointMet(point(pipette, "rinseAlkali"), "The flask was rinsed with water. The alkali was then added with a pipette."));
  assert.ok(pointMet(point(concordance, "concordant"), "Repeat until two titres agree within 0.10 cm3."));
  const stuffed = Array(40).fill("rinse burette acid vertical funnel remove jet initial reading").join(" ");
  const m = markCheckpoint(prepare, stuffed);
  assert.ok(m.tooLong && m.met.length === 0);
});

test("notebook: cloze gaps accept synonyms, scaffolding fades, and the full method assembles", () => {
  assert.ok(clozeGapOk({ answers: ["eye level", "eye-level"] }, " Eye-level "));
  assert.ok(!clozeGapOk({ answers: ["acid"] }, "water"));
  assert.deepEqual([1, 2, 3, 7].map(scaffoldFor), ["order", "cloze", "free", "free"]);
  for (let seed = 1; seed < 50; seed++) {
    const o = shuffledOrder(5, seed);
    assert.deepEqual([...o].sort(), [0, 1, 2, 3, 4]);
    assert.ok(o.some((v, i) => v !== i));
  }
  const method = assembleMethod(checkpoints, { prepare: prepare0() });
  assert.equal(method.length, checkpoints.length);
  assert.ok(method[0].points.every((p) => p.met));
  assert.ok(method[1].points.every((p) => !p.met));
});
const prepare0 = () => checkpoints.find((c) => c.id === "prepare")!.sentences.join(" ");

/* ---------- Results table ---------- */

test("results table: units, decimal places, readings and subtraction", () => {
  const expected = { initial: [0.5, 1.2], final: [24.95, 25.5] };
  const good = { headings: ["Final burette reading / cm³", "Initial burette reading / cm³", "Titre / cm³"], values: [["24.95", "25.50"], ["0.50", "1.20"], ["24.45", "24.30"]] };
  assert.deepEqual(checkResultsTable(good, expected).issues, []);
  const bad = checkResultsTable({ headings: ["Final reading", "Initial reading / cm3", "Titre (cm³)"], values: [["24.95", "25.5"], ["0.50", "1.20"], ["24.45", "24.40"]] }, expected);
  assert.deepEqual(bad.issues.sort(), ["decimals", "subtraction", "units"].sort());
  assert.ok(checkResultsTable({ ...good, values: [["24.95", "25.50"], ["0.50", "1.25"], ["24.45", "24.25"]] }, expected).issues.includes("reading"));
  assert.ok(checkResultsTable({ ...good, values: [["24.97", "25.50"], ["0.50", "1.20"], ["24.47", "24.30"]] }, { initial: [0.5, 1.2], final: [24.97, 25.5] }).issues.includes("precision"));
  assert.ok(checkResultsTable({ ...good, headings: ["Final / cm³", "Something / cm³", "Titre / cm³"] }, expected).issues.includes("missingRow"));
});

/* ---------- Data files ---------- */

test("data: rinse options, scenarios, challenges and apparatus tasks are consistent", () => {
  for (const item of ["burette", "pipette", "flask"] as const) {
    assert.equal(errorData.rinse[item].filter((o) => o.correct).length, 1, item);
    assert.ok(errorData.rinse[item].some((o) => o.id === GOOD_PREP[item]), item);
  }
  for (const s of errorData.scenarios) {
    assert.ok(["higher", "lower", "none"].includes(s.effect), s.id);
    assert.ok(s.answer >= 0 && s.answer < s.reasons.length, s.id);
  }
  assert.ok(errorData.scenarios.some((s) => s.effect === "none"), "teaches 'no change'");
  for (const c of errorData.methodChallenges) assert.ok(c.faulty >= 0 && c.faulty < c.lines.length && c.answer < c.reasons.length, c.id);
  for (const t of apparatus.tasks) assert.ok(apparatus.items.some((i) => i.id === t.answer), t.answer);
});

/* ---------- Mock exam marks and the course ---------- */

import { markMock } from "@/lib/chem/exam";
import chemCourse from "@/content/chem/en";

test("mock exam: accuracy bands, concordance, recording and calculation marks", () => {
  const marking = settings.exam;
  const calcAll = markCalculation(DATA, { molesKnown: "0.0024", ratio: "0.5", molesUnknown: "0.0012", conc: "0.048", massConc: "5.09" });
  const good = markMock({ perfectTitre: 24.0, mean: 24.1, concordantChoice: true, readings: [{ typed: "0.50", actual: 0.5 }, { typed: "24.60", actual: 24.6 }], calc: calcAll, calcBoxes: 5, marking });
  assert.equal(good.total, good.max);
  assert.ok(good.passed);
  const off = markMock({ perfectTitre: 24.0, mean: 24.5, concordantChoice: false, readings: [{ typed: "0.5", actual: 0.5 }], calc: [], calcBoxes: 5, marking });
  const by = Object.fromEntries(off.items.map((i) => [i.id, i.got]));
  assert.equal(by.accuracy, 1); // within 0.8 but not 0.4
  assert.equal(by.concordance, 0);
  assert.equal(by.recording, 1); // value right, format wrong
  assert.equal(by.calculation, 0);
  assert.ok(!off.passed);
  assert.equal(markMock({ perfectTitre: 24, mean: null, concordantChoice: false, readings: [], calc: [], calcBoxes: 4, marking }).total, 0);
});

test("course: nine steps, a free first step, no mission, every lab step has its data", () => {
  assert.equal(chemCourse.id, "chem-titration");
  assert.equal(chemCourse.steps.length, 9);
  assert.equal(chemCourse.freeSteps, 1);
  assert.equal(chemCourse.mission, undefined);
  assert.equal(chemCourse.price, 1000);
  assert.equal(chemCourse.assessment.questions.length, 10);
  for (const q of chemCourse.assessment.questions) assert.ok(q.answer < q.options.length && q.step >= 1 && q.step <= 9, q.question);
  const labs = chemCourse.steps.map((s) => s.task).filter((t) => t?.type === "titrationLab");
  assert.deepEqual(labs.map((t) => t!.type === "titrationLab" && t.phase), ["prepare", "rough", "accurate", "exam"]);
  // The notebook checkpoints of steps 4–6 cover every checkpoint exactly once.
  const asked = labs.flatMap((t) => (t!.type === "titrationLab" ? t.notebook.map((c) => c.id) : []));
  assert.deepEqual([...asked].sort(), checkpoints.map((c) => c.id).sort());
});
