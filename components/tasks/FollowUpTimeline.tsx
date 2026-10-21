"use client";
import { useState } from "react";
import type { FollowUpTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { MockEmailCompose } from "./MockEmailCompose";
import { Feedback } from "./Feedback";

/** Pick the right day to follow up on an application, then write the follow-up email. */
export function FollowUpTimeline({ task, passed, onPass }: { task: FollowUpTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim3.followUp;
  const { reportAttempt } = useLesson();
  const [day, setDay] = useState<number | null>(passed ? task.window[0] : null);
  const right = day !== null && day >= task.window[0] && day <= task.window[1];

  function pick(d: number) {
    setDay(d);
    const ok = d >= task.window[0] && d <= task.window[1];
    reportAttempt(ok, ok ? [] : [`day ${d}`]);
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-2" role="radiogroup" aria-label={s.pick}>
        {Array.from({ length: task.days + 1 }, (_, d) => {
          const marker = d === 0 ? s.applied : d === task.deadlineDay ? s.deadline : null;
          const chosen = day === d;
          return (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={chosen}
              onClick={() => pick(d)}
              className={`flex min-h-16 min-w-14 shrink-0 flex-col items-center justify-center rounded-xl border-2 px-1 text-sm ${
                chosen ? (right ? "border-ok bg-ok-soft" : "border-err bg-err-soft") : marker ? "border-primary bg-primary-soft" : "border-line bg-surface"
              }`}
            >
              <span className="font-bold">{fmt(s.day, { n: d })}</span>
              {marker && <span className="text-[0.7rem] font-semibold text-primary">{marker}</span>}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted">{s.pick}</p>

      {day !== null && !right && <Feedback kind="err" title={t.task.wrong} messages={[day < task.window[0] ? task.feedback.early : task.feedback.late]} />}
      {right && (
        <>
          <Feedback kind="ok" title={t.task.correct} messages={[task.feedback.right]} />
          <div className="mt-5 border-t border-line pt-4">
            <MockEmailCompose task={task.compose} passed={passed} onPass={onPass} />
          </div>
        </>
      )}
    </div>
  );
}
