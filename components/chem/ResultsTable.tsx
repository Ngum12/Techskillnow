"use client";
import { useEffect, useState } from "react";
import type { ResultsTableTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";
import { checkResultsTable, type TableIssue } from "@/lib/chem/results";
import { BuretteZoom } from "./BuretteZoom";

type Readings = { initial: number[]; final: number[] };
const step = (v: number) => Math.round(v * 20) / 20;

/** Three titrations (rough, 1, 2) with readings exactly on a 0.05 graduation. */
function makeReadings(): Readings {
  const titre = 20 + Math.random() * 10;
  const titres = [titre + 0.4 + Math.random() * 0.6, titre + 0.05, titre];
  const initial = titres.map(() => step(Math.random() * 2));
  return { initial, final: titres.map((v, i) => step(initial[i] + v)) };
}

const COLS = 3;

/** Step 3: record readings in a results table the way an examiner expects. */
export function ResultsTable({ task, passed, onPass }: { task: ResultsTableTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.chem.table;
  const { reportAttempt } = useLesson();
  const [r, setR] = useState<Readings>({ initial: [0.5, 1.2, 0.3], final: [25.4, 25.85, 24.9] });
  useEffect(() => setR(makeReadings()), []);
  const [view, setView] = useState(0);
  const [headings, setHeadings] = useState(["", "", ""]);
  const [values, setValues] = useState<string[][]>(() => [0, 1, 2].map(() => Array(COLS).fill("")));
  const [result, setResult] = useState<{ issues: TableIssue[]; cells: Record<string, boolean> } | null>(passed ? { issues: [], cells: {} } : null);

  const shots = [0, 1, 2].flatMap((c) => [
    { col: c, when: "initial" as const, level: r.initial[c] },
    { col: c, when: "final" as const, level: r.final[c] },
  ]);
  const shot = shots[view];
  const colName = (c: number) => (c === 0 ? s.rough : String(c));

  function check() {
    const res = checkResultsTable({ headings, values }, r);
    setResult(res);
    reportAttempt(res.issues.length === 0, res.issues);
    if (res.issues.length === 0) onPass();
  }

  function setCell(ri: number, ci: number, v: string) {
    setValues((cur) => cur.map((row, i) => (i === ri ? row.map((x, j) => (j === ci ? v.replace(",", ".") : x)) : row)));
    setResult(null);
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {shots.map((sh, i) => (
          <button key={i} type="button" onClick={() => setView(i)} aria-pressed={view === i} className={`min-h-11 rounded-lg border-2 px-1 text-xs font-semibold ${view === i ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}>
            {colName(sh.col)} · {sh.when === "initial" ? s.before : s.after}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center font-semibold">
        {fmt(s.showing, { col: colName(shot.col), when: shot.when === "initial" ? s.before : s.after })}
      </p>
      <div className="mt-2">
        <BuretteZoom level={shot.level} label={s.zoomLabel} />
      </div>

      <h3 className="mt-5 font-bold">{s.tableTitle}</h3>
      <p className="text-sm text-muted">{s.tableHelp}</p>
      <div className="mt-3 space-y-4">
        {[0, 1, 2].map((ri) => (
          <div key={ri} className="card p-3">
            <input
              className="input"
              placeholder={s.headingPlaceholder}
              aria-label={fmt(s.headingLabel, { n: ri + 1 })}
              value={headings[ri]}
              onChange={(e) => (setHeadings(headings.map((h, i) => (i === ri ? e.target.value : h))), setResult(null))}
            />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {Array.from({ length: COLS }, (_, ci) => {
                const bad = result?.cells[`${ri}:${ci}`] === false;
                return (
                  <label key={ci} className="block">
                    <span className="text-xs text-muted">{colName(ci)}</span>
                    <input className={`input px-2 text-center ${bad ? "border-err" : ""}`} inputMode="decimal" value={values[ri][ci]} onChange={(e) => setCell(ri, ci, e.target.value)} />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-primary mt-4 w-full" onClick={check}>
        {t.task.check}
      </button>
      {result && result.issues.length > 0 && <Feedback kind="err" title={t.task.tryAgain} messages={result.issues.map((i) => s.issues[i])} />}
      {result && result.issues.length === 0 && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
