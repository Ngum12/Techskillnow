"use client";
import { useState } from "react";
import type { FixTextTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { failedTextRules } from "@/lib/rules";
import { Feedback } from "./Feedback";
import { TutorTips } from "./TutorTips";
import { useLesson } from "@/components/LessonContext";

export function FixTheText({ task, passed, onPass }: { task: FixTextTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const { reportAttempt } = useLesson();
  const [text, setText] = useState(task.initial);
  const [result, setResult] = useState<string[] | null>(passed ? [] : null);

  function check() {
    const failed = failedTextRules(task.rules, text, task.initial);
    setResult(failed);
    reportAttempt(failed.length === 0, failed);
    if (failed.length === 0) onPass();
  }

  const Field = task.multiline ? "textarea" : "input";
  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <Field
        className={`input mt-3 ${task.multiline ? "min-h-40 leading-relaxed" : ""}`}
        value={text}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          setText(e.target.value);
          if (result?.length) setResult(null);
        }}
        aria-label={task.instruction}
        spellCheck
      />
      <button type="button" className="btn btn-secondary mt-3 w-full" onClick={check}>
        {t.task.check}
      </button>
      {result &&
        (result.length === 0 ? (
          <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />
        ) : (
          <Feedback kind="err" title={t.task.tryAgain} messages={result} />
        ))}
      {result && text !== task.initial && <TutorTips payload={() => ({ text })} />}
    </div>
  );
}
