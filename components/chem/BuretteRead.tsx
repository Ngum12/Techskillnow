"use client";
import { useEffect, useState } from "react";
import type { BuretteReadTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";
import { roundReading, validReadingFormat } from "@/lib/chem/titration";
import { BuretteZoom, type Eye } from "./BuretteZoom";

/** A level anywhere on the scale (not only on a graduation), as in a real burette. */
const randomLevel = () => Math.round((0.3 + Math.random() * 48) * 100) / 100;

/** Step 2: read the burette to the right precision, then see why eye level matters. */
export function BuretteRead({ task, passed, onPass }: { task: BuretteReadTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.chem.read;
  const { reportAttempt } = useLesson();
  const [round, setRound] = useState(passed ? task.rounds : 0);
  // Fixed on the server, random once the page is in the browser (avoids a hydration mismatch).
  const [level, setLevel] = useState(24.37);
  useEffect(() => setLevel(randomLevel()), []);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"ok" | "format" | "wrong" | null>(null);
  const [score, setScore] = useState(passed ? task.rounds : 0);
  const [eye, setEye] = useState<Eye>("above");
  const [parallaxAnswer, setParallaxAnswer] = useState<string | null>(passed ? "lower" : null);
  const readingsDone = round >= task.rounds;

  function check() {
    if (!validReadingFormat(value)) return setResult("format");
    const ok = Math.abs(Number(value) - level) <= 0.05 + 1e-9;
    setResult(ok ? "ok" : "wrong");
    reportAttempt(ok, ok ? [] : [`${value} vs ${level}`]);
    if (ok) setScore((n) => n + 1);
  }

  function next() {
    setRound(round + 1);
    setLevel(randomLevel());
    setValue("");
    setResult(null);
  }

  function retry() {
    setRound(0);
    setScore(0);
    setLevel(randomLevel());
    setValue("");
    setResult(null);
  }

  const aboveEffect = task.parallax.above.offset < 0 ? "lower" : "higher";

  if (!readingsDone) {
    return (
      <div>
        <p className="font-semibold">{task.instruction}</p>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-muted">{fmt(s.round, { n: round + 1, total: task.rounds })}</p>
        <div className="mt-2">
          <BuretteZoom level={level} label={s.zoomLabel} />
        </div>
        <label className="mt-4 block">
          <span className="label">{s.yourReading}</span>
          <div className="flex items-center gap-2">
            <input className="input text-lg" inputMode="decimal" placeholder="00.00" value={value} disabled={result !== null && result !== "format"} onChange={(e) => (setValue(e.target.value.replace(",", ".")), setResult(null))} />
            <span className="font-semibold">cm³</span>
          </div>
        </label>
        {result === null || result === "format" ? (
          <button type="button" className="btn btn-primary mt-3 w-full" disabled={!value.trim()} onClick={check}>
            {t.task.check}
          </button>
        ) : (
          <button type="button" className="btn btn-primary mt-3 w-full" onClick={next}>
            {round + 1 < task.rounds ? s.next : s.finishReadings}
          </button>
        )}
        {result === "format" && <Feedback kind="err" title={t.task.tryAgain} messages={[s.format]} />}
        {result === "ok" && <Feedback kind="ok" title={t.task.correct} messages={[fmt(s.right, { r: roundReading(level).toFixed(2) })]} />}
        {result === "wrong" && <Feedback kind="err" title={t.task.wrong} messages={[fmt(s.wrong, { r: roundReading(level).toFixed(2) })]} />}
      </div>
    );
  }

  if (score < task.required && !passed) {
    return (
      <div>
        <Feedback kind="err" title={fmt(s.score, { n: score, total: task.rounds })} messages={[fmt(s.need, { n: task.required })]} />
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={retry}>
          {s.again}
        </button>
      </div>
    );
  }

  return (
    <div>
      {!passed && <Feedback kind="ok" title={fmt(s.score, { n: score, total: task.rounds })} />}
      <h3 className="mt-5 text-lg font-bold">{s.parallaxTitle}</h3>
      <p className="mt-1">{s.parallaxIntro}</p>
      <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label={s.eye}>
        {(["above", "level", "below"] as const).map((e) => (
          <button key={e} type="button" role="radio" aria-checked={eye === e} onClick={() => setEye(e)} className={`min-h-11 rounded-xl border-2 text-sm font-semibold ${eye === e ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}>
            {s.eyes[e]}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <BuretteZoom level={24.3} eye={eye} parallax={{ above: task.parallax.above.offset, below: task.parallax.below.offset }} label={s.zoomLabel} />
      </div>
      <p className="mt-2 text-sm text-muted">{eye === "level" ? s.levelNote : task.parallax[eye].explain}</p>
      <fieldset className="mt-4">
        <legend className="font-semibold">{s.parallaxQuestion}</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["higher", "lower", "same"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setParallaxAnswer(a);
                const ok = a === aboveEffect;
                reportAttempt(ok, ok ? [] : [`parallax ${a}`]);
                if (ok) onPass();
              }}
              className={`min-h-11 rounded-xl border-2 font-semibold ${parallaxAnswer === a ? (a === aboveEffect ? "border-ok bg-ok-soft" : "border-err bg-err-soft") : "border-line bg-surface"}`}
            >
              {s.effects[a]}
            </button>
          ))}
        </div>
      </fieldset>
      {parallaxAnswer && parallaxAnswer !== aboveEffect && <Feedback kind="err" title={t.task.wrong} messages={[s.parallaxHint]} />}
      {parallaxAnswer === aboveEffect && <Feedback kind="ok" title={t.task.correct} messages={[task.parallax.above.explain, task.success]} />}
    </div>
  );
}
