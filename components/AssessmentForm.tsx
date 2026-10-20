"use client";
import { useState } from "react";
import Link from "next/link";
import { useT } from "./I18n";
import { fmt } from "@/lib/i18n";

type Result = { score: number; total: number; passed: boolean; wrong: { question: string; answer: string }[] };

/** One question per screen with big touch targets; the server scores the answers. */
export function AssessmentForm({ courseId, kind, questions }: { courseId: string; kind: "pre" | "post"; questions: { question: string; options: string[] }[] }) {
  const t = useT();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const total = questions.length;

  async function submit() {
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, kind, answers }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setResult(await res.json());
    } catch {
      setError(true);
    }
    setBusy(false);
  }

  function choose(option: number) {
    const next = [...answers];
    next[i] = option;
    setAnswers(next);
    if (i < total - 1) setI(i + 1);
  }

  function restart() {
    setResult(null);
    setAnswers([]);
    setI(0);
  }

  if (result && kind === "pre") {
    return (
      <div className="mt-6">
        <p className="rounded-xl bg-primary-soft p-4 font-semibold">{fmt(t.check.preDone, { score: result.score, total: result.total })}</p>
        <Link href={`/learn/${courseId}`} className="btn btn-primary mt-6 w-full">
          {t.common.continue}
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mt-6">
        <p className="text-3xl font-bold">{fmt(t.check.score, { score: result.score, total: result.total })}</p>
        <p className={`mt-2 text-lg font-semibold ${result.passed ? "text-ok" : "text-err"}`}>{result.passed ? t.check.passed : t.check.notPassed}</p>
        {result.wrong.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold">{t.check.wrongList}</p>
            <ul className="mt-2 space-y-3">
              {result.wrong.map((w) => (
                <li key={w.question} className="rounded-lg border border-line bg-surface p-3">
                  <p>{w.question}</p>
                  <p className="mt-1 font-semibold text-ok">→ {w.answer}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6 flex flex-col gap-3">
          {result.passed ? (
            <Link href={`/learn/${courseId}/finish`} className="btn btn-primary w-full">
              {t.common.continue}
            </Link>
          ) : (
            <>
              <button type="button" className="btn btn-primary w-full" onClick={restart}>
                {t.check.retry}
              </button>
              <Link href={`/learn/${courseId}?step=1`} className="btn btn-secondary w-full">
                {t.finish.continueLessons}
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const q = questions[i];
  const answeredAll = questions.every((_, qi) => answers[qi] !== undefined);
  return (
    <div className="mt-6">
      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
        <div className="h-full bg-primary" style={{ width: `${((i + 1) / total) * 100}%` }} />
      </div>
      <p className="mt-3 text-sm font-semibold text-muted">{fmt(t.check.question, { n: i + 1, total })}</p>
      <p className="mt-2 text-lg font-semibold">{q.question}</p>
      <div className="mt-3 flex flex-col gap-2">
        {q.options.map((option, oi) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(oi)}
            aria-pressed={answers[i] === oi}
            className={`min-h-[52px] rounded-xl border-2 px-4 py-3 text-left ${answers[i] === oi ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}
          >
            {option}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-err">
          {t.common.errorGeneric}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <button type="button" className="btn btn-secondary flex-1" disabled={i === 0} onClick={() => setI(i - 1)}>
          {t.common.back}
        </button>
        {i === total - 1 ? (
          <button type="button" className="btn btn-primary flex-[2]" disabled={!answeredAll || busy} onClick={submit}>
            {busy ? t.check.sending : t.check.submit}
          </button>
        ) : (
          <button type="button" className="btn btn-primary flex-[2]" disabled={answers[i] === undefined} onClick={() => setI(i + 1)}>
            {t.common.next}
          </button>
        )}
      </div>
    </div>
  );
}
