"use client";
import { useState } from "react";
import type { MultipleChoiceTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { Feedback } from "./Feedback";
import { useLesson } from "@/components/LessonContext";

export function MultipleChoice({ task, passed, onPass }: { task: MultipleChoiceTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const { reportAttempt } = useLesson();
  const [picked, setPicked] = useState<number | null>(passed ? task.answer : null);
  const correct = picked === task.answer;

  function pick(i: number) {
    if (correct) return;
    setPicked(i);
    reportAttempt(i === task.answer, i === task.answer ? [] : [task.options[i]]);
    if (i === task.answer) onPass();
  }

  return (
    <div>
      <p className="font-semibold">{task.question}</p>
      <div className="mt-3 flex flex-col gap-2" role="radiogroup">
        {task.options.map((option, i) => {
          const state = picked === i ? (i === task.answer ? "ok" : "err") : null;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={picked === i}
              onClick={() => pick(i)}
              className={`min-h-[52px] rounded-xl border-2 px-4 py-3 text-left ${
                state === "ok" ? "border-ok bg-ok-soft" : state === "err" ? "border-err bg-err-soft" : "border-line bg-surface"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {picked !== null &&
        (correct ? (
          <Feedback kind="ok" title={t.task.correct} messages={[task.explanation]} />
        ) : (
          <Feedback kind="err" title={t.task.wrong} messages={task.hints?.[picked] ? [task.hints[picked]!] : []} />
        ))}
    </div>
  );
}
