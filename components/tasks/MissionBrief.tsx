"use client";
import { useEffect } from "react";
import type { MissionBriefTask } from "@/content/types";
import { useT } from "@/components/I18n";

/** The final mission's job advert, shown on the last lesson step. Nothing to check here. */
export function MissionBrief({ task, passed, onPass }: { task: MissionBriefTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  useEffect(() => {
    if (!passed) onPass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <article className="card p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{t.sim.mission.advert}</p>
        <h3 className="mt-1 text-lg font-bold">{task.advert.title}</h3>
        <p className="text-muted">{task.advert.org}</p>
        <p className="mt-3 whitespace-pre-line">{task.advert.text}</p>
      </article>
      <ul className="mt-4 space-y-2">
        {task.points.map((p) => (
          <li key={p} className="flex gap-3">
            <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              ✓
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
