"use client";
import { useEffect, useState } from "react";
import type { ChemCalcTask, ChemMode } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";
import { CALC_BOXES, markCalculation, sig3, type BoxMark, type CalcBoxId, type CalcData } from "@/lib/chem/calc";
import { createExperiment, exactEndPoint, roundReading, type TitrationSystem } from "@/lib/chem/titration";
import { labStore } from "@/lib/chem/lab-store";
import { ModeSwitch } from "./ModeSwitch";

/** Step boxes for the calculation, each marked separately with error carried forward. */
export function CalcBoxes({ data, sys, hints, relTolerance, onMarked, locked = false }: { data: CalcData; sys: TitrationSystem; hints: boolean; relTolerance: number; onMarked: (marks: BoxMark[]) => void; locked?: boolean }) {
  const t = useT();
  const s = t.chem.calc;
  const [answers, setAnswers] = useState<Partial<Record<CalcBoxId, string>>>({});
  const [marks, setMarks] = useState<BoxMark[] | null>(null);
  const boxes = CALC_BOXES.filter((id) => id !== "massConc" || data.molarMass);
  const vars = { b: sys.burette.formula, f: sys.flask.formula, titre: data.titre.toFixed(2), v: data.pipetteVolume.toFixed(1), M: String(data.molarMass ?? ""), equation: sys.equation };

  function check() {
    const m = markCalculation(data, answers, relTolerance);
    setMarks(m);
    onMarked(m);
  }

  return (
    <div>
      <div className="card p-3 text-[0.95rem]">
        <p className="font-semibold">{sys.equation}</p>
        <p className="mt-1">{fmt(s.given, { titre: data.titre.toFixed(2), b: sys.burette.formula, c: data.knownConc.toFixed(3), v: data.pipetteVolume.toFixed(1), f: sys.flask.formula })}</p>
      </div>
      <ol className="mt-3 space-y-3">
        {boxes.map((id, i) => {
          const m = marks?.find((x) => x.id === id);
          return (
            <li key={id} className={`card p-3 ${m ? (m.ok ? "border-ok" : "border-err") : ""}`}>
              <label className="block">
                <span className="font-semibold">
                  {i + 1}. {fmt(s.boxes[id], vars)}
                </span>
                {hints && <span className="mt-0.5 block text-sm text-muted">{fmt(s.hints[id], vars)}</span>}
                <input
                  className="input mt-2"
                  inputMode="text"
                  autoCapitalize="none"
                  disabled={locked || (!!m && marks!.every((x) => x.ok))}
                  placeholder={s.placeholder}
                  value={answers[id] ?? ""}
                  onChange={(e) => (setAnswers({ ...answers, [id]: e.target.value }), setMarks(null))}
                />
              </label>
              {m && (
                <p className={`mt-1 text-sm font-semibold ${m.ok ? "text-ok" : "text-err"}`}>
                  {m.ok ? (m.ecf ? `✓ ${s.ecf}` : "✓") : m.value === null ? s.notNumber : `✕ ${hints ? fmt(s.expected, { v: sig3(m.expected) }) : ""}`}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {!locked && (
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={check}>
          {t.task.check}
        </button>
      )}
    </div>
  );
}

/** Calculation data from the learner's last titration, or new random values. */
function makeData(task: ChemCalcTask, fresh: boolean): { data: CalcData; sys: TitrationSystem } {
  const { systems, settings } = task.lab;
  const last = fresh ? null : labStore.result();
  const sysFor = (id: string) => systems.find((x) => x.id === id) ?? systems[0];
  if (last && last.mean > 0) {
    const sys = sysFor(last.systemId);
    return { sys, data: { titre: last.mean, knownConc: sys.burette.conc, pipetteVolume: settings.apparatus.pipetteVolume, ratio: sys.ratio, molarMass: sys.flask.molarMass } };
  }
  const exp = createExperiment(systems, Math.random);
  const sys = sysFor(exp.systemId);
  const titre = roundReading(exactEndPoint(sys, exp.flaskConc, settings.apparatus.pipetteVolume) + (Math.random() - 0.5) * 0.2);
  return { sys, data: { titre, knownConc: sys.burette.conc, pipetteVolume: settings.apparatus.pipetteVolume, ratio: sys.ratio, molarMass: sys.flask.molarMass } };
}

/** Step 7: the calculation in boxes. Learn shows the formula for each box; Practise gives new values each time. */
export function ChemCalc({ task, passed, onPass }: { task: ChemCalcTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.chem.calc;
  const { reportAttempt } = useLesson();
  const [mode, setMode] = useState<ChemMode>("learn");
  const [state, setState] = useState<{ data: CalcData; sys: TitrationSystem } | null>(null);
  const [round, setRound] = useState(0);
  const [allOk, setAllOk] = useState(passed);
  useEffect(() => setState(makeData(task, false)), [task]);

  function fresh(m: ChemMode = mode) {
    setMode(m);
    setState(makeData(task, m === "practise"));
    setRound((r) => r + 1);
  }

  if (!state) return null;
  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <ModeSwitch modes={["learn", "practise"]} mode={mode} onChange={fresh} />
      <div className="mt-3">
        <CalcBoxes
          key={round}
          data={state.data}
          sys={state.sys}
          hints={mode === "learn"}
          relTolerance={task.lab.settings.calculation.relativeTolerance}
          onMarked={(m) => {
            const ok = m.every((b) => b.ok);
            reportAttempt(ok, m.filter((b) => !b.ok).map((b) => b.id));
            if (ok) {
              setAllOk(true);
              onPass();
            }
          }}
        />
      </div>
      {allOk && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
      {mode === "practise" && (
        <button type="button" className="btn btn-secondary mt-3 w-full" onClick={() => fresh("practise")}>
          {s.newValues}
        </button>
      )}
    </div>
  );
}
