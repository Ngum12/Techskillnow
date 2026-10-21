"use client";
import { useEffect, useState } from "react";
import type { RecruiterScanTask, SampleCv } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "./Feedback";

/** A sample CV: "messy" mimics the common crowded layout, "clean" a recruiter-friendly one. */
export function SampleCvView({ cv }: { cv: SampleCv }) {
  if (cv.layout === "messy") {
    return (
      <div className="rounded-lg border border-line bg-white p-3 text-[0.68rem] leading-tight text-ink">
        <p className="text-center font-serif text-base italic underline">CURRICULUM VITAE</p>
        <p className="mt-1 text-center font-serif italic">{cv.name}</p>
        <p className="text-center">{cv.contact}</p>
        {cv.sections.map((s) => (
          <div key={s.heading} className="mt-1.5">
            <p className="font-bold uppercase underline">{s.heading}</p>
            <p className="text-justify">{s.lines.join(" ")}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-line bg-white p-4 text-[0.8rem] leading-snug text-ink">
      <p className="text-lg font-bold">{cv.name}</p>
      <p className="text-muted">{cv.contact}</p>
      {cv.sections.map((s) => (
        <div key={s.heading} className="mt-2.5">
          <p className="border-b-2 border-primary text-[0.72rem] font-bold uppercase tracking-wider text-primary">{s.heading}</p>
          <ul className="mt-1 list-disc pl-4">
            {s.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

type Phase = "ready" | "showing" | "questions" | "result";

export function RecruiterScan({ task, passed, onPass }: { task: RecruiterScanTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.scan;
  const { reportAttempt } = useLesson();
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>(passed ? "result" : "ready");
  const [left, setLeft] = useState(task.seconds);
  const [answers, setAnswers] = useState<number[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const current = task.rounds[round];

  useEffect(() => {
    if (phase !== "showing") return;
    if (left <= 0) {
      setPhase("questions");
      return;
    }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, left]);

  function start() {
    setLeft(task.seconds);
    setAnswers([]);
    setPhase("showing");
  }

  function submit() {
    const score = current.questions.filter((q, i) => answers[i] === q.answer).length;
    const next = [...scores];
    next[round] = score;
    setScores(next);
    reportAttempt(true, []);
    if (round < task.rounds.length - 1) {
      setRound(round + 1);
      setPhase("ready");
    } else {
      setPhase("result");
      onPass();
    }
  }

  if (phase === "result") {
    return (
      <div>
        {scores.length === task.rounds.length && (
          <div className="grid grid-cols-2 gap-3">
            {task.rounds.map((r, i) => (
              <div key={r.label} className={`rounded-xl p-4 text-center ${i === 0 ? "bg-err-soft" : "bg-ok-soft"}`}>
                <p className="text-sm font-semibold">{r.label}</p>
                <p className="text-3xl font-bold">
                  {scores[i]}/{r.questions.length}
                </p>
              </div>
            ))}
          </div>
        )}
        <Feedback kind="ok" title={t.task.correct} messages={[task.lesson]} />
      </div>
    );
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-muted">
        {fmt(s.round, { n: round + 1, total: task.rounds.length })} · {current.label}
      </p>

      {phase === "ready" && (
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={start}>
          {fmt(s.start, { n: task.seconds })}
        </button>
      )}

      {phase === "showing" && (
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between rounded-lg bg-ink px-3 py-2 text-white" aria-live="polite">
            <span className="font-semibold">{s.look}</span>
            <span className="font-mono text-2xl font-bold">{left}s</span>
          </div>
          <SampleCvView cv={current.cv} />
        </div>
      )}

      {phase === "questions" && (
        <div className="mt-4 space-y-5">
          <p className="rounded-lg bg-primary-soft p-3 font-semibold">{s.hidden}</p>
          {current.questions.map((q, qi) => (
            <fieldset key={q.question}>
              <legend className="font-semibold">{q.question}</legend>
              <div className="mt-2 flex flex-col gap-2">
                {q.options.map((o, oi) => (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={answers[qi] === oi}
                    onClick={() => setAnswers((a) => Object.assign([...a], { [qi]: oi }))}
                    className={`min-h-[52px] rounded-xl border-2 px-4 py-3 text-left ${answers[qi] === oi ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <button
            type="button"
            className="btn btn-primary w-full"
            disabled={current.questions.some((_, i) => answers[i] === undefined)}
            onClick={submit}
          >
            {t.task.check}
          </button>
        </div>
      )}
    </div>
  );
}
