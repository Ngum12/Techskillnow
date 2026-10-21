"use client";
import { useEffect, useRef, useState } from "react";
import type { ChemMode, TitrationLabTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";
import {
  GOOD_PREP,
  checkChosenTitres,
  createExperiment,
  createRun,
  exactEndPoint,
  flaskState,
  levelAfter,
  meanTitre,
  prepEffects,
  roundReading,
  showsFlash,
  validReadingFormat,
  type Experiment,
  type PrepChoices,
  type Run,
  type TitrationSystem,
} from "@/lib/chem/titration";
import { assembleMethod } from "@/lib/chem/marking";
import { markMock } from "@/lib/chem/exam";
import type { BoxMark } from "@/lib/chem/calc";
import { labStore } from "@/lib/chem/lab-store";
import { Burette, Flask, Stand, Tile } from "./Apparatus";
import { BuretteZoom, type Eye } from "./BuretteZoom";
import { NotebookCheckpoint, MethodReview } from "./Notebook";
import { ModeSwitch } from "./ModeSwitch";
import { CalcBoxes } from "./ChemCalc";

type Reading = { typed: string; actual: number };
type RunRecord = { initial: Reading | null; final: Reading | null; titre: number; delivered: number; endPoint: number; rough: boolean };
type Stage = "intro" | "prepare" | "runs" | "choose" | "summary" | "calc" | "marks" | "notebook" | "done";
type Lab = TitrationLabTask["lab"];

/* ---------- The bench ---------- */

function LabBench(p: { level: number; funnel: boolean; bubble: boolean; flowing: boolean; fill: number; colour: string; flash: boolean; flashColour: string; swirling: boolean; drop: number }) {
  return (
    <svg viewBox="0 0 170 384" className="block h-auto w-full select-none" aria-hidden="true">
      <rect x={0} y={372} width={170} height={12} fill="#d9cbb5" />
      <g transform="translate(78 22)">
        <Stand height={349} />
        <Burette level={p.level} funnel={p.funnel} bubble={p.bubble} flowing={p.flowing} />
      </g>
      {p.drop > 0 && <circle key={p.drop} cx={85} cy={300} r={2.4} fill="#cfe3f1" stroke="#7fa6bf" strokeWidth={0.6} className="chem-drop" />}
      {p.flowing && <rect x={84} y={298} width={2} height={44} fill="#cfe3f1" />}
      <g transform="translate(40 364)">
        <Tile width={92} />
      </g>
      <g transform="translate(54 292)">
        <Flask fill={p.fill} colour={p.colour} flash={p.flash} flashColour={p.flashColour} swirling={p.swirling} />
      </g>
    </svg>
  );
}

/* ---------- One reading of the burette ---------- */

function ReadingStep({ title, actual, strict, hints, parallax, onConfirm }: { title: string; actual: number; strict: boolean; hints: boolean; parallax: { above: number; below: number }; onConfirm: (typed: string) => void }) {
  const t = useT();
  const s = t.chem.lab;
  const [eye, setEye] = useState<Eye>("level");
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  function confirm() {
    const v = value.trim();
    if (strict && !validReadingFormat(v)) return setMsg(s.readingFormat);
    if (!strict && Number.isNaN(Number(v))) return setMsg(s.readingFormat);
    if (hints && Math.abs(Number(v) - actual) > 0.05 + 1e-9) return setMsg(eye === "level" ? s.readAgain : s.readAgainEye);
    onConfirm(v);
  }

  return (
    <div>
      <p className="font-semibold">{title}</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={t.chem.read.eye}>
        {(["above", "level", "below"] as const).map((e) => (
          <button key={e} type="button" role="radio" aria-checked={eye === e} onClick={() => setEye(e)} className={`min-h-11 rounded-lg border-2 text-xs font-semibold ${eye === e ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}>
            {t.chem.read.eyes[e]}
          </button>
        ))}
      </div>
      <div className="mt-2">
        <BuretteZoom level={actual} eye={eye} parallax={parallax} label={t.chem.read.zoomLabel} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input className="input text-lg" inputMode="decimal" placeholder="00.00" aria-label={title} value={value} onChange={(e) => (setValue(e.target.value.replace(",", ".")), setMsg(null))} />
        <span className="font-semibold">cm³</span>
      </div>
      {msg && <p className="mt-2 text-sm font-semibold text-err">{msg}</p>}
      <button type="button" className="btn btn-primary mt-3 w-full" disabled={!value.trim()} onClick={confirm}>
        {s.record}
      </button>
    </div>
  );
}

/* ---------- One titration ---------- */

function TitrationRun({ run, sys, lab, prep, hints, rough, exam, onDone }: { run: Run; sys: TitrationSystem; lab: Lab; prep: PrepChoices; hints: boolean; rough: boolean; exam: boolean; onDone: (r: RunRecord) => void }) {
  const t = useT();
  const s = t.chem.lab;
  const settings = lab.settings;
  const indicator = lab.indicators.find((i) => i.id === sys.indicator) ?? lab.indicators[0];
  const [sub, setSub] = useState<"readInitial" | "pipette" | "indicator" | "titrate" | "readFinal">("readInitial");
  const [initial, setInitial] = useState("");
  const [delivered, setDelivered] = useState(0);
  const [flash, setFlash] = useState(false);
  const [swirling, setSwirling] = useState(false);
  const [flowing, setFlowing] = useState(false);
  const [drop, setDrop] = useState(0);
  const [fill, setFill] = useState(0);
  const [indicatorIn, setIndicatorIn] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const deliveredRef = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxDeliver = settings.apparatus.buretteCapacity - run.initialLevel - 0.5;
  const parallax = { above: lab.errors.parallax.above.offset, below: lab.errors.parallax.below.offset };

  function add(v: number) {
    const next = Math.min(maxDeliver, deliveredRef.current + v);
    deliveredRef.current = next;
    setDelivered(next);
    if (showsFlash(next, run.endPoint, settings)) setFlash(true);
  }
  function startFlow() {
    if (timer.current) return;
    setFlowing(true);
    timer.current = setInterval(() => add(settings.apparatus.fastFlowPerSecond / 10), 100);
  }
  function stopFlow() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setFlowing(false);
  }
  useEffect(() => stopFlow, []);

  function swirl() {
    setSwirling(true);
    setFlash(false);
    setTimeout(() => setSwirling(false), 1000);
  }

  const state = flaskState(delivered, run.endPoint, settings);
  const colour = indicatorIn ? indicator.colours[state] : "#eef3f6";
  const level = levelAfter(run, delivered);
  const remaining = run.endPoint - delivered;
  let hint: string | null = null;
  if (hints && sub === "titrate") {
    if (delivered >= run.endPoint + 0.3) hint = s.overshotHint;
    else if (delivered >= run.endPoint) hint = fmt(s.endHint, { colour: indicator.words[state] });
    else if (remaining <= settings.endPoint.slowDownWarning) hint = s.slowDown;
    else if (rough) hint = s.roughHint;
  }

  const bench = (
    <LabBench
      level={level}
      funnel={!prep.funnelRemoved}
      bubble={!prep.jetFilled && delivered < 0.4}
      flowing={flowing}
      fill={fill * ((settings.apparatus.pipetteVolume + delivered) / 80)}
      colour={colour}
      flash={flash && indicatorIn}
      flashColour={indicator.colours.endPoint}
      swirling={swirling}
      drop={drop}
    />
  );

  if (sub === "readInitial" || sub === "readFinal") {
    const isInitial = sub === "readInitial";
    return (
      <ReadingStep
        key={sub}
        title={isInitial ? s.readInitial : s.readFinal}
        actual={isInitial ? run.initialLevel : level}
        strict={!exam}
        hints={hints}
        parallax={parallax}
        onConfirm={(typed) => {
          if (isInitial) {
            setInitial(typed);
            setSub("pipette");
          } else {
            onDone({
              initial: { typed: initial, actual: run.initialLevel },
              final: { typed, actual: level },
              titre: Math.round((Number(typed) - Number(initial)) * 100) / 100,
              delivered,
              endPoint: run.endPoint,
              rough,
            });
          }
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-[42%_1fr] gap-3">
      <div>{bench}</div>
      <div className="flex flex-col gap-2">
        {sub === "pipette" && (
          <>
            <p className="font-semibold">{fmt(s.pipetteStep, { v: settings.apparatus.pipetteVolume.toFixed(1), f: sys.flask.name })}</p>
            <button type="button" className="btn btn-primary" onClick={() => (setFill(1), setSub("indicator"))}>
              {s.pipetteButton}
            </button>
          </>
        )}
        {sub === "indicator" && (
          <>
            <p className="font-semibold">{s.indicatorStep}</p>
            {lab.indicators.map((ind) => (
              <button
                key={ind.id}
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (ind.id !== indicator.id) return setMsg(hints ? fmt(s.indicatorHint, { name: indicator.name }) : s.wrongIndicator);
                  setMsg(null);
                  setIndicatorIn(true);
                  setSub("titrate");
                }}
              >
                {ind.name}
              </button>
            ))}
            {msg && <p className="text-sm font-semibold text-err">{msg}</p>}
          </>
        )}
        {sub === "titrate" && (
          <>
            <p className="text-sm text-muted">{fmt(s.added, { v: delivered.toFixed(2) })}</p>
            <button
              type="button"
              className={`btn min-h-16 touch-none select-none ${flowing ? "btn-primary" : "btn-secondary"}`}
              onPointerDown={(e) => {
                startFlow();
                // Keep the tap open while the finger stays down, even if it slides off the button.
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {}
              }}
              onPointerUp={stopFlow}
              onPointerCancel={stopFlow}
              onLostPointerCapture={stopFlow}
              onContextMenu={(e) => e.preventDefault()}
              onKeyDown={(e) => e.key === " " && startFlow()}
              onKeyUp={stopFlow}
            >
              {s.hold}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => (add(settings.apparatus.dropVolume), setDrop((d) => d + 1))}>
              💧 {s.drop}
            </button>
            <button type="button" className="btn btn-secondary" onClick={swirl}>
              ↻ {s.swirl}
            </button>
            <button type="button" className="btn btn-primary mt-2" disabled={delivered <= 0} onClick={() => (stopFlow(), setSub("readFinal"))}>
              {s.stopRead}
            </button>
            {hint && <p className="rounded-lg bg-warn-soft p-2 text-sm">{hint}</p>}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Preparing the apparatus ---------- */

function PrepareForm({ lab, hints, onDone }: { lab: Lab; hints: boolean; onDone: (p: PrepChoices) => void }) {
  const t = useT();
  const s = t.chem.lab;
  const [c, setC] = useState<Partial<PrepChoices>>({});
  const rinse = (item: "burette" | "pipette" | "flask") => (
    <fieldset key={item} className="card p-3">
      <legend className="px-1 font-semibold">{s.rinseQuestion[item]}</legend>
      {hints && <p className="text-sm text-muted">{s.prepHints[item]}</p>}
      <div className="mt-2 flex flex-col gap-2">
        {lab.errors.rinse[item].map((o) => (
          <button key={o.id} type="button" aria-pressed={c[item] === o.id} onClick={() => setC({ ...c, [item]: o.id })} className={`min-h-11 rounded-xl border-2 px-3 py-2 text-left ${c[item] === o.id ? "border-primary bg-primary-soft font-semibold" : "border-line bg-surface"}`}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
  const yesNo = (key: "funnelRemoved" | "jetFilled", label: string, yes: string, no: string, hint: string) => (
    <fieldset key={key} className="card p-3">
      <legend className="px-1 font-semibold">{label}</legend>
      {hints && <p className="text-sm text-muted">{hint}</p>}
      <div className="mt-2 grid grid-cols-1 gap-2">
        {([true, false] as const).map((v) => (
          <button key={String(v)} type="button" aria-pressed={c[key] === v} onClick={() => setC({ ...c, [key]: v })} className={`min-h-11 rounded-xl border-2 px-3 py-2 text-left ${c[key] === v ? "border-primary bg-primary-soft font-semibold" : "border-line bg-surface"}`}>
            {v ? yes : no}
          </button>
        ))}
      </div>
    </fieldset>
  );
  const complete = c.burette && c.pipette && c.flask && c.funnelRemoved !== undefined && c.jetFilled !== undefined;
  return (
    <div className="space-y-3">
      <div className="mx-auto w-28">
        <svg viewBox="-20 -24 60 290" className="block w-full" aria-hidden="true">
          <Burette level={c.burette ? 0.4 : 50} funnel={c.funnelRemoved !== true} bubble={c.jetFilled !== true} />
        </svg>
      </div>
      {rinse("burette")}
      {yesNo("funnelRemoved", s.funnelQuestion, s.funnelYes, s.funnelNo, s.prepHints.funnel)}
      {yesNo("jetFilled", s.jetQuestion, s.jetYes, s.jetNo, s.prepHints.jet)}
      {rinse("pipette")}
      {rinse("flask")}
      <button type="button" className="btn btn-primary w-full" disabled={!complete} onClick={() => onDone(c as PrepChoices)}>
        {s.prepDone}
      </button>
    </div>
  );
}

/* ---------- The lab step ---------- */

export function TitrationLab({ task, passed, onPass }: { task: TitrationLabTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.chem.lab;
  const { reportAttempt } = useLesson();
  const { lab, phase } = task;
  const isExam = phase === "exam";
  const [mode, setMode] = useState<ChemMode>(isExam ? "exam" : "learn");
  const hints = mode === "learn";
  const [exp, setExp] = useState<Experiment | null>(null);
  const [prep, setPrep] = useState<PrepChoices>(GOOD_PREP);
  const [stage, setStage] = useState<Stage>(passed ? "done" : isExam ? "intro" : phase === "prepare" ? "prepare" : "runs");
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [chosen, setChosen] = useState<number[]>([]);
  const [chooseIssues, setChooseIssues] = useState<string[] | null>(null);
  const [mean, setMean] = useState<number | null>(null);
  const [concordantOk, setConcordantOk] = useState(false);
  const [calcMarks, setCalcMarks] = useState<BoxMark[]>([]);
  const [nb, setNb] = useState(0);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [attempt, setAttempt] = useState(0);

  // Set up an experiment (in the browser only: values are random).
  useEffect(() => {
    const fresh = mode !== "learn" || isExam;
    let e = fresh ? null : labStore.experiment();
    if (!e || !lab.systems.some((x) => x.id === e!.systemId)) e = createExperiment(lab.systems, Math.random);
    if (!fresh) labStore.setExperiment(e);
    setExp(e);
    setPrep(phase === "prepare" || isExam ? GOOD_PREP : (labStore.prep() ?? GOOD_PREP));
    // Step 6 continues from the rough titration of step 5 when it was the same experiment.
    const last = labStore.result();
    if (phase === "accurate" && !fresh && last && last.systemId === e.systemId && last.flaskConc === e.flaskConc && last.titres.length) {
      setRuns([{ initial: null, final: null, titre: last.titres[last.roughIndex] ?? last.titres[0], delivered: 0, endPoint: 0, rough: true }]);
    } else setRuns([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, attempt]);

  // Exam clock.
  useEffect(() => {
    if (!deadline || stage === "marks" || stage === "done") return;
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= deadline) setStage("marks");
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, stage]);

  if (!exp) return null;
  const sys = lab.systems.find((x) => x.id === exp.systemId) ?? lab.systems[0];
  const prepResult = prepEffects(prep, lab.errors);
  const perfect = exactEndPoint(sys, exp.flaskConc, lab.settings.apparatus.pipetteVolume);
  const accurate = runs.map((r, i) => ({ r, i })).filter((x) => !x.r.rough);
  const roughIndex = runs.findIndex((r) => r.rough);

  function restart(m: ChemMode = mode) {
    setMode(m);
    setStage(isExam ? "intro" : phase === "prepare" ? "prepare" : "runs");
    setChosen([]);
    setChooseIssues(null);
    setMean(null);
    setConcordantOk(false);
    setCalcMarks([]);
    setNb(0);
    setDeadline(null);
    setAttempt((a) => a + 1);
  }

  /** After a lab stage: the notebook checkpoints, or straight to done if there are none. */
  function toNotebook() {
    if (task.notebook.length) return setStage("notebook");
    setStage("done");
    onPass();
  }

  function finishRun(rec: RunRecord) {
    const next = [...runs, rec];
    setRuns(next);
    if (phase === "rough") {
      labStore.setResult({ systemId: exp!.systemId, flaskConc: exp!.flaskConc, titres: [rec.titre], chosen: [], mean: 0, roughIndex: 0 });
      toNotebook();
    }
  }

  function choose() {
    const titres = runs.map((r) => r.titre);
    const issues = checkChosenTitres(titres, chosen, { roughIndex: roughIndex >= 0 ? roughIndex : undefined, tolerance: lab.settings.concordance.tolerance, minimum: lab.settings.concordance.minimum });
    setChooseIssues(issues);
    reportAttempt(issues.length === 0, issues);
    if (issues.length && !isExam) return;
    // In the exam a poor choice costs the concordance marks; the mean of what was chosen is still used.
    const m = meanTitre(chosen.map((i) => titres[i]));
    setMean(m);
    setConcordantOk(issues.length === 0);
    if (!isExam) labStore.setResult({ systemId: exp!.systemId, flaskConc: exp!.flaskConc, titres, chosen, mean: m, roughIndex: Math.max(0, roughIndex) });
    setStage(isExam ? "calc" : "summary");
  }

  function afterNotebook() {
    if (nb + 1 < task.notebook.length) return setNb(nb + 1);
    setStage("done");
    onPass();
  }

  const clock = deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;
  const header = (
    <>
      <p className="font-semibold">{task.instruction}</p>
      {!isExam && stage !== "done" && <ModeSwitch modes={["learn", "practise"]} mode={mode} onChange={(m) => restart(m)} />}
      {isExam && deadline && stage !== "marks" && stage !== "done" && (
        <p className={`sticky top-[5.5rem] z-[5] mt-3 rounded-xl px-3 py-2 text-center font-mono text-lg font-bold text-white ${clock < 120 ? "bg-err" : "bg-ink"}`} aria-live="off">
          ⏱ {Math.floor(clock / 60)}:{String(clock % 60).padStart(2, "0")}
        </p>
      )}
      {stage !== "done" && stage !== "intro" && <p className="mt-3 rounded-lg bg-bg p-2 text-sm">{fmt(s.experiment, { title: sys.title, b: sys.burette.name, c: sys.burette.conc.toFixed(3), f: sys.flask.name })}</p>}
    </>
  );

  /* Stages */
  let body: React.ReactNode = null;

  if (stage === "done") {
    body = (
      <>
        <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />
        <button type="button" className="btn btn-secondary mt-4 w-full" onClick={() => restart(isExam ? "exam" : "practise")}>
          {isExam ? s.retryMock : s.practiseAgain}
        </button>
      </>
    );
  } else if (stage === "intro") {
    body = (
      <div className="mt-4">
        <p>{fmt(s.examIntro, { minutes: task.exam?.minutes ?? 25 })}</p>
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => (setDeadline(Date.now() + (task.exam?.minutes ?? 25) * 60_000), setNow(Date.now()), setStage("prepare"))}>
          {s.startExam}
        </button>
      </div>
    );
  } else if (stage === "prepare") {
    body = (
      <div className="mt-4">
        <PrepareForm
          lab={lab}
          hints={hints}
          onDone={(p) => {
            setPrep(p);
            if (!isExam) labStore.setPrep(p);
            if (isExam) setStage("runs");
            else toNotebook();
          }}
        />
      </div>
    );
  } else if (stage === "runs") {
    const runIndex = runs.length;
    const isRough = phase === "rough" || (runs.length === 0 && (phase === "accurate" || isExam));
    const canChoose = accurate.length >= 2;
    const wantMore = phase !== "rough" && runs.length < 7;
    body = (
      <div className="mt-4">
        {runs.length > 0 && <TitreTable runs={runs} />}
        {(runs.length === 0 || wantMore) && (
          <section className="mt-4">
            <h3 className="font-bold">{isRough ? s.roughTitle : fmt(s.accurateTitle, { n: accurate.length + 1 })}</h3>
            <div className="mt-2">
              <TitrationRun key={`${attempt}-${runIndex}`} run={createRun(exp, sys, lab.settings, prepResult, runIndex)} sys={sys} lab={lab} prep={prep} hints={hints} rough={isRough} exam={isExam} onDone={finishRun} />
            </div>
          </section>
        )}
        {canChoose && (
          <div className="mt-4 rounded-xl bg-primary-soft p-3">
            <p className="font-semibold">{s.enoughTitres}</p>
            <button type="button" className="btn btn-primary mt-2 w-full" onClick={() => setStage("choose")}>
              {s.chooseButton}
            </button>
          </div>
        )}
      </div>
    );
  } else if (stage === "choose") {
    body = (
      <div className="mt-4">
        <p className="font-semibold">{s.chooseHelp}</p>
        <ul className="mt-2 space-y-2">
          {runs.map((r, i) => (
            <li key={i}>
              <label className="flex min-h-11 items-center gap-3 rounded-xl border-2 border-line bg-surface px-3">
                <input type="checkbox" className="h-5 w-5" checked={chosen.includes(i)} onChange={(e) => (setChosen(e.target.checked ? [...chosen, i] : chosen.filter((x) => x !== i)), setChooseIssues(null))} />
                <span className="flex-1">{r.rough ? s.rough : fmt(s.titrationN, { n: runs.slice(0, i + 1).filter((x) => !x.rough).length })}</span>
                <span className="font-mono font-semibold">{r.titre.toFixed(2)} cm³</span>
              </label>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-primary mt-3 w-full" disabled={!chosen.length} onClick={choose}>
          {s.average}
        </button>
        <button type="button" className="btn btn-ghost mt-1 w-full" onClick={() => setStage("runs")}>
          {s.anotherTitration}
        </button>
        {chooseIssues && chooseIssues.length > 0 && <Feedback kind="err" title={t.task.tryAgain} messages={chooseIssues.map((i) => s.chooseIssues[i as keyof typeof s.chooseIssues])} />}
      </div>
    );
  } else if (stage === "summary") {
    body = (
      <div className="mt-4">
        <Summary runs={runs} mean={mean} perfect={perfect} explanations={prepResult.explanations} />
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={toNotebook}>
          {s.toNotebook}
        </button>
      </div>
    );
  } else if (stage === "calc") {
    body = (
      <div className="mt-4">
        <h3 className="font-bold">{s.calcTitle}</h3>
        {mean === null ? (
          <p className="mt-2">{s.noMean}</p>
        ) : (
          <div className="mt-2">
            <CalcBoxes
              data={{ titre: mean, knownConc: sys.burette.conc, pipetteVolume: lab.settings.apparatus.pipetteVolume, ratio: sys.ratio, molarMass: sys.flask.molarMass }}
              sys={sys}
              hints={false}
              relTolerance={lab.settings.calculation.relativeTolerance}
              onMarked={setCalcMarks}
            />
          </div>
        )}
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => setStage("marks")}>
          {s.handIn}
        </button>
      </div>
    );
  } else if (stage === "marks" && task.exam) {
    const readings = runs.flatMap((r) => [r.initial, r.final]).filter((x): x is Reading => !!x);
    const result = markMock({
      perfectTitre: perfect,
      mean,
      concordantChoice: concordantOk,
      readings,
      calc: calcMarks,
      calcBoxes: sys.flask.molarMass ? 5 : 4,
      marking: task.exam,
    });
    const notebook = labStore.notebook();
    const sections = assembleMethod(task.allCheckpoints ?? task.notebook, Object.fromEntries(Object.entries(notebook).map(([k, v]) => [k, v.text])));
    body = (
      <div className="mt-4">
        <section className="card p-4">
          <h3 className="text-lg font-bold">{fmt(s.marksTitle, { got: result.total, max: result.max })}</h3>
          <ul className="mt-2 space-y-1">
            {result.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span>{s.markItems[i.id]}</span>
                <span className="font-semibold">
                  {i.got} / {i.max}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">{fmt(s.perfectWas, { perfect: roundReading(perfect).toFixed(2), mean: mean === null ? "—" : mean.toFixed(2) })}</p>
          {prepResult.explanations.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {prepResult.explanations.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </section>
        {result.passed ? (
          <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />
        ) : (
          <>
            <Feedback kind="err" title={fmt(s.notPassed, { n: task.exam.passPercent })} messages={[s.tryMock]} />
            <button type="button" className="btn btn-primary mt-3 w-full" onClick={() => restart("exam")}>
              {s.retryMock}
            </button>
          </>
        )}
        <MarksEffect passed={result.passed} percent={result.percent} onPass={onPass} report={reportAttempt} />
        <MethodReview sections={sections} />
      </div>
    );
  } else if (stage === "notebook") {
    const cp = task.notebook[nb];
    body = cp ? <NotebookCheckpoint key={cp.id} checkpoint={cp} paperLabel={task.paperLabel} onDone={afterNotebook} /> : null;
  }

  return (
    <div>
      {header}
      {body}
    </div>
  );
}

/** Reports the mock result once (not on every render). */
function MarksEffect({ passed, percent, onPass, report }: { passed: boolean; percent: number; onPass: () => void; report: (ok: boolean, failed: string[]) => void }) {
  useEffect(() => {
    report(passed, passed ? [] : [`mock ${percent}%`]);
    if (passed) onPass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function TitreTable({ runs }: { runs: RunRecord[] }) {
  const s = useT().chem.lab;
  let n = 0;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[300px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="py-1 pr-2" />
            {runs.map((r, i) => (
              <th key={i} className="py-1 pr-2 text-right">
                {r.rough ? s.rough : (++n).toString()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(["final", "initial"] as const).map((k) => (
            <tr key={k} className="border-b border-line">
              <td className="py-1 pr-2">{s.tableRows[k]}</td>
              {runs.map((r, i) => (
                <td key={i} className="py-1 pr-2 text-right font-mono">
                  {r[k]?.typed ?? "—"}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="py-1 pr-2 font-semibold">{s.tableRows.titre}</td>
            {runs.map((r, i) => (
              <td key={i} className="py-1 pr-2 text-right font-mono font-semibold">
                {r.titre.toFixed(2)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Summary({ runs, mean, perfect, explanations }: { runs: RunRecord[]; mean: number | null; perfect: number; explanations: string[] }) {
  const s = useT().chem.lab;
  const readingErrors = runs.flatMap((r) => [r.initial, r.final]).filter((x): x is Reading => !!x && Math.abs(Number(x.typed) - x.actual) > 0.05 + 1e-9);
  const overshoots = runs.filter((r) => !r.rough && r.endPoint > 0 && r.delivered - r.endPoint > 0.15);
  return (
    <section>
      <TitreTable runs={runs} />
      <div className="card mt-4 p-4">
        <p className="text-lg font-bold">{fmt(s.meanIs, { mean: mean?.toFixed(2) ?? "—" })}</p>
        <p className="mt-1 text-muted">{fmt(s.perfectIs, { perfect: roundReading(perfect).toFixed(2) })}</p>
        <h4 className="mt-3 font-bold">{s.whatHappened}</h4>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {explanations.map((e) => (
            <li key={e}>{e}</li>
          ))}
          {readingErrors.map((r, i) => (
            <li key={`r${i}`}>{fmt(s.readingOff, { typed: r.typed, actual: roundReading(r.actual).toFixed(2) })}</li>
          ))}
          {overshoots.map((r, i) => (
            <li key={`o${i}`}>{fmt(s.overshoot, { v: (r.delivered - r.endPoint).toFixed(2) })}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
