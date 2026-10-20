"use client";
import { useEffect, useState } from "react";
import { useT } from "./I18n";
import { fmt } from "@/lib/i18n";

type Question = { question: string; options: string[]; answer: number };

/** Spaced review: two quick questions about earlier steps before the lesson continues. */
export function ReviewCard({ courseId, upto, onDone }: { courseId: string; upto: number; onDone: () => void }) {
  const t = useT();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [picked, setPicked] = useState<Record<number, number>>({});

  useEffect(() => {
    fetch(`/api/review?course=${courseId}&upto=${upto}`)
      .then((r) => (r.ok ? r.json() : { questions: [] }))
      .then((d) => (d.questions?.length ? setQuestions(d.questions) : onDone()))
      .catch(onDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, upto]);

  if (!questions) return <p className="py-16 text-center text-muted">{t.common.loading}</p>;

  return (
    <section>
      <h1 className="text-2xl font-bold">{t.review.title}</h1>
      <p className="mt-1 text-muted">{t.review.intro}</p>
      {questions.map((q, qi) => (
        <div key={q.question} className="mt-6">
          <p className="font-semibold">{q.question}</p>
          <div className="mt-2 flex flex-col gap-2">
            {q.options.map((option, i) => {
              const chosen = picked[qi];
              const show = chosen !== undefined;
              const style = show && i === q.answer ? "border-ok bg-ok-soft" : show && i === chosen ? "border-err bg-err-soft" : "border-line bg-surface";
              return (
                <button
                  key={option}
                  type="button"
                  disabled={show}
                  onClick={() => setPicked({ ...picked, [qi]: i })}
                  className={`min-h-[52px] rounded-xl border-2 px-4 py-3 text-left disabled:opacity-100 ${style}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {picked[qi] !== undefined && (
            <p className={`mt-2 font-semibold ${picked[qi] === q.answer ? "text-ok" : "text-err"}`}>
              {picked[qi] === q.answer ? t.task.correct : fmt(t.review.answer, { answer: q.options[q.answer] })}
            </p>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-primary mt-8 w-full" disabled={Object.keys(picked).length < questions.length} onClick={onDone}>
        {t.review.continue}
      </button>
    </section>
  );
}
