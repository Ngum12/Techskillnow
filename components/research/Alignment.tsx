"use client";
/** Questions and objectives must match one to one. The learner pairs each objective with its question, or rejects it. */
import { useState } from "react";
import type { AlignmentTask } from "@/lib/research/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";

export function Alignment({ task, passed, onPass }: { task: AlignmentTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.research.align;
  const { reportAttempt } = useLesson();
  const none = -1;
  const [choice, setChoice] = useState<(number | null)[]>(() => task.objectives.map((o) => (passed ? (o.question ?? none) : null)));
  const [checked, setChecked] = useState(passed);
  const want = (i: number) => task.objectives[i].question ?? none;
  const wrong = task.objectives.map((_, i) => choice[i] !== want(i));
  const allOk = checked && !wrong.some(Boolean);

  function check() {
    setChecked(true);
    const bad = task.objectives.filter((_, i) => choice[i] !== want(i)).map((o) => o.text);
    reportAttempt(bad.length === 0, bad);
    if (!bad.length) onPass();
  }

  return (
    <div>
      <div className="rounded-xl border border-line bg-[#fbfaf6] p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{s.topic}</p>
        <p className="mt-1 font-semibold">{task.topic}</p>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted">{s.problem}</p>
        <p className="mt-1 text-[0.92rem]">{task.problem}</p>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted">{s.questions}</p>
        <ol className="mt-1 space-y-1">
          {task.questions.map((q, i) => (
            <li key={q} className="text-[0.92rem]">
              <b>RQ{i + 1}.</b> {q}
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-5 font-semibold">{s.instruction}</p>
      <ol className="mt-3 space-y-4">
        {task.objectives.map((o, i) => (
          <li key={o.text} className={`rounded-xl border-2 p-3 ${checked ? (wrong[i] ? "border-err bg-err-soft" : "border-ok bg-ok-soft") : "border-line bg-surface"}`}>
            <p className="text-[0.95rem]">{o.text}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[...task.questions.map((_, q) => q), none].map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={allOk}
                  onClick={() => (setChoice(choice.map((c, k) => (k === i ? q : c))), setChecked(false))}
                  className={`min-h-10 rounded-full border-2 px-3 text-sm font-semibold ${choice[i] === q ? "border-primary bg-primary text-white" : "border-line bg-white"}`}
                >
                  {q === none ? s.none : `RQ${q + 1}`}
                </button>
              ))}
            </div>
            {checked && wrong[i] && <p className="mt-2 text-sm">{o.why}</p>}
          </li>
        ))}
      </ol>
      {!allOk && (
        <button type="button" className="btn btn-primary mt-4 w-full" disabled={choice.some((c) => c === null)} onClick={check}>
          {t.task.check}
        </button>
      )}
      {checked && (allOk ? <Feedback kind="ok" title={t.task.correct} messages={[task.success]} /> : <Feedback kind="err" title={t.task.wrong} messages={[fmt(s.wrongCount, { n: wrong.filter(Boolean).length })]} />)}
    </div>
  );
}
