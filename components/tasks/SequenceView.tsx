"use client";
import { useState } from "react";
import type { SequenceTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { Illustration } from "@/components/Illustration";
import { TaskView } from "./TaskView";

/** Several tasks in one step, one after the other ("Part 1 of 2"). */
export function SequenceView({ task, passed, onPass }: { task: SequenceTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const [index, setIndex] = useState(passed ? task.tasks.length - 1 : 0);
  const [doneIndex, setDoneIndex] = useState(passed ? task.tasks.length - 1 : -1);
  const last = index === task.tasks.length - 1;

  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{fmt(t.sim3.part, { n: index + 1, total: task.tasks.length })}</p>
      {task.images?.[index] && (
        <div className="mb-4">
          <Illustration name={task.images[index]!} />
        </div>
      )}
      <TaskView
        key={index}
        task={task.tasks[index]}
        passed={passed || doneIndex >= index}
        onPass={() => {
          setDoneIndex((d) => Math.max(d, index));
          if (last) onPass();
        }}
      />
      {!last && doneIndex >= index && (
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => setIndex(index + 1)}>
          {t.sim3.nextPart}
        </button>
      )}
    </div>
  );
}
