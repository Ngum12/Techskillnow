"use client";
/** One card at a time: tap the bucket it belongs in, read why, move on. Used for topics, problems and sources. */
import { useState } from "react";
import type { CardSortTask } from "@/lib/research/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";

export function CardSort({ task, passed, onPass }: { task: CardSortTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.research.sort;
  const { reportAttempt } = useLesson();
  const [i, setI] = useState(passed ? task.cards.length : 0);
  const [picked, setPicked] = useState<string | null>(null);
  const [firstTry, setFirstTry] = useState(0);
  const [tried, setTried] = useState(false);
  const card = task.cards[i];
  const finished = i >= task.cards.length;
  const right = picked !== null && card && picked === card.answer;

  function pick(id: string) {
    if (right || !card) return;
    setPicked(id);
    const ok = id === card.answer;
    if (ok && !tried) setFirstTry((n) => n + 1);
    if (!ok) setTried(true);
    reportAttempt(ok, ok ? [] : [card.text]);
  }

  function next() {
    const n = i + 1;
    setI(n);
    setPicked(null);
    setTried(false);
    if (n >= task.cards.length) {
      if (firstTry >= task.required) onPass();
    }
  }

  if (finished) {
    const ok = passed || firstTry >= task.required;
    return (
      <div>
        <Feedback kind={ok ? "ok" : "err"} title={ok ? t.task.correct : s.again} messages={[ok ? task.success : fmt(s.score, { n: firstTry, total: task.cards.length, need: task.required })]} />
        {!ok && (
          <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => (setI(0), setFirstTry(0), setPicked(null), setTried(false))}>
            {s.retry}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted">{fmt(s.progress, { n: i + 1, total: task.cards.length })}</p>
      <div className="mt-2 rounded-2xl border-2 border-line bg-surface p-5 shadow-[0_10px_24px_-18px_rgba(20,28,51,0.5)]">
        <p className="text-[1.05rem] font-semibold leading-snug">{card.text}</p>
        {card.detail && <p className="mt-2 text-[0.88rem] text-muted">{card.detail}</p>}
      </div>
      <div className="mt-3 grid gap-2" role="radiogroup">
        {task.buckets.map((b) => {
          const state = picked === b.id ? (b.id === card.answer ? "ok" : "err") : right && b.id === card.answer ? "ok" : null;
          return (
            <button
              key={b.id}
              type="button"
              role="radio"
              aria-checked={picked === b.id}
              onClick={() => pick(b.id)}
              className={`min-h-12 rounded-xl border-2 px-4 py-2.5 text-left font-semibold ${state === "ok" ? "border-ok bg-ok-soft" : state === "err" ? "border-err bg-err-soft" : "border-line bg-surface"}`}
            >
              {b.label}
            </button>
          );
        })}
      </div>
      {picked !== null && (right ? <Feedback kind="ok" title={t.task.correct} messages={[card.why]} /> : <Feedback kind="err" title={t.task.wrong} messages={[s.tryOther]} />)}
      {right && (
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={next}>
          {i + 1 < task.cards.length ? s.next : s.finish}
        </button>
      )}
    </div>
  );
}
