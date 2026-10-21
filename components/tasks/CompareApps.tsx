"use client";
import { useState } from "react";
import type { CompareAppsTask, SampleApplication } from "@/content/types";
import { useT } from "@/components/I18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "./Feedback";

function AppCard({ app }: { app: SampleApplication }) {
  const s = useT().sim3.compare;
  return (
    <article className="card overflow-hidden">
      <div className="border-b border-line bg-[#f2f6fc] px-4 py-2 text-sm">
        <p>
          <span className="text-muted">{s.from}: </span>
          {app.from}
        </p>
        <p>
          <span className="text-muted">{s.subject}: </span>
          <span className="font-semibold">{app.subject}</span>
        </p>
        <p>
          <span className="text-muted">{s.attachments}: </span>
          {app.attachments.length ? app.attachments.join(", ") : "—"}
        </p>
      </div>
      <p className="whitespace-pre-line px-4 py-3 text-[0.92rem] leading-relaxed">{app.body}</p>
      <p className="border-t border-line bg-bg px-4 py-2 text-sm font-semibold">{app.outcome}</p>
    </article>
  );
}

/** Two applications from candidates with the same CV: compare, then explain why one got an answer. */
export function CompareApps({ task, passed, onPass }: { task: CompareAppsTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim3.compare;
  const { reportAttempt } = useLesson();
  const [tab, setTab] = useState<"a" | "b">("a");
  const [answers, setAnswers] = useState<Record<number, number>>(() =>
    passed ? Object.fromEntries(task.questions.map((q, i) => [i, q.answer])) : {},
  );

  function pick(qi: number, oi: number) {
    if (answers[qi] === task.questions[qi].answer) return;
    const next = { ...answers, [qi]: oi };
    setAnswers(next);
    const q = task.questions[qi];
    reportAttempt(oi === q.answer, oi === q.answer ? [] : [q.options[oi]]);
    if (task.questions.every((qq, i) => next[i] === qq.answer)) onPass();
  }

  const done = task.questions.every((q, i) => answers[i] === q.answer);
  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <div className="mt-3 grid grid-cols-2 gap-2" role="tablist">
        {(["a", "b"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`min-h-11 rounded-xl border-2 font-semibold ${tab === k ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}
          >
            {task[k].label}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <AppCard app={task[tab]} />
      </div>
      <p className="mt-2 text-center text-sm text-muted">{s.switchHint}</p>

      <div className="mt-5 space-y-5">
        {task.questions.map((q, qi) => (
          <fieldset key={q.question}>
            <legend className="font-semibold">{q.question}</legend>
            <div className="mt-2 flex flex-col gap-2">
              {q.options.map((o, oi) => {
                const chosen = answers[qi] === oi;
                const style = chosen ? (oi === q.answer ? "border-ok bg-ok-soft" : "border-err bg-err-soft") : "border-line bg-surface";
                return (
                  <button key={o} type="button" aria-pressed={chosen} onClick={() => pick(qi, oi)} className={`min-h-[52px] rounded-xl border-2 px-4 py-3 text-left ${style}`}>
                    {o}
                  </button>
                );
              })}
            </div>
            {answers[qi] !== undefined && (
              <p className={`mt-2 ${answers[qi] === q.answer ? "text-ok" : "text-err"}`}>{answers[qi] === q.answer ? q.explanation : t.task.wrong}</p>
            )}
          </fieldset>
        ))}
      </div>
      {done && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
