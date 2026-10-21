"use client";
import { useState } from "react";
import type { CvProfileTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import { failedTextRules } from "@/lib/rules";
import { countWords } from "@/lib/cv/portal";
import { Feedback } from "./Feedback";
import { TutorTips } from "./TutorTips";

/** Part 1: fix a weak sample profile. Part 2: write the learner's own, saved to their CV. */
export function CvProfile({ task, passed, onPass }: { task: CvProfileTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.profile;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const [phase, setPhase] = useState<"fix" | "own">(passed ? "own" : "fix");
  const [fixText, setFixText] = useState(task.fix.initial);
  const [result, setResult] = useState<string[] | null>(passed ? [] : null);
  if (!store) return null;
  const own = store.cv.profile;

  function checkFix() {
    const failed = failedTextRules(task.fix.rules, fixText, task.fix.initial);
    setResult(failed);
    reportAttempt(failed.length === 0, failed);
  }

  function checkOwn() {
    const failed = failedTextRules(task.own.rules, own);
    setResult(failed);
    reportAttempt(failed.length === 0, failed);
    if (failed.length === 0) onPass();
  }

  if (phase === "fix") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{s.part1}</p>
        <p className="mt-1 font-semibold">{task.fix.instruction}</p>
        <textarea
          className="input mt-3 min-h-36 leading-relaxed"
          value={fixText}
          onChange={(e) => {
            setFixText(e.target.value);
            setResult(null);
          }}
          aria-label={task.fix.instruction}
        />
        {result?.length !== 0 && (
          <button type="button" className="btn btn-secondary mt-3 w-full" onClick={checkFix}>
            {t.task.check}
          </button>
        )}
        {result && result.length > 0 && <Feedback kind="err" title={t.task.tryAgain} messages={result} />}
        {result && result.length === 0 && (
          <>
            <Feedback kind="ok" title={t.task.correct} messages={[s.fixDone]} />
            <button
              type="button"
              className="btn btn-primary mt-3 w-full"
              onClick={() => {
                setPhase("own");
                setResult(null);
              }}
            >
              {s.toOwn}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">{s.part2}</p>
      <p className="mt-1 font-semibold">{task.own.instruction}</p>
      <details className="mt-2 rounded-lg bg-primary-soft p-3">
        <summary className="cursor-pointer font-semibold text-primary">{s.example}</summary>
        <p className="mt-2">{task.own.example}</p>
      </details>
      <textarea
        className="input mt-3 min-h-36 leading-relaxed"
        value={own}
        onChange={(e) => {
          const value = e.target.value;
          store.update((cv) => ({ ...cv, profile: value }));
          setResult(null);
        }}
        placeholder={s.placeholder}
        aria-label={task.own.instruction}
      />
      <p className="mt-1 text-right text-sm text-muted">{fmt(s.words, { n: countWords(own) })}</p>
      <button type="button" className="btn btn-secondary mt-2 w-full" onClick={checkOwn}>
        {t.task.check}
      </button>
      {result &&
        (result.length === 0 ? (
          <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />
        ) : (
          <Feedback kind="err" title={t.task.tryAgain} messages={result} />
        ))}
      {result && own.trim() && <TutorTips payload={() => ({ text: own })} />}
    </div>
  );
}
