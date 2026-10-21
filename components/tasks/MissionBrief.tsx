"use client";
import { useEffect, useState } from "react";
import type { MissionBriefTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { useCv } from "@/components/cv/CvContext";
import { newId } from "@/lib/cv/model";

/** The final mission's job advert, shown on the last lesson step. With `track`, the learner adds it to their tracker first. */
export function MissionBrief({ task, passed, onPass }: { task: MissionBriefTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const store = useCv();
  const track = task.track;
  const tracked = !!track && !!store?.cv.tracker.some((r) => r.org === track.org && r.role === track.role);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (passed) return;
    if (!track || tracked) onPass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracked]);

  function addToTracker() {
    if (!store || !track) return;
    store.update((cv) =>
      cv.tracker.some((r) => r.org === track.org && r.role === track.role)
        ? cv
        : { ...cv, tracker: [...cv.tracker, { id: newId(), org: track.org, role: track.role, deadline: track.deadline, documents: track.documents, status: "toApply", date: "", reference: "", followUp: "" }] },
    );
    setAdded(true);
  }

  return (
    <div>
      <article className="card p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{t.sim.mission.advert}</p>
        <h3 className="mt-1 text-lg font-bold">{task.advert.title}</h3>
        <p className="text-muted">{task.advert.org}</p>
        <p className="mt-3 whitespace-pre-line">{task.advert.text}</p>
      </article>
      {track && store && (
        <button type="button" className={`btn mt-4 w-full ${tracked ? "btn-secondary" : "btn-primary"}`} disabled={tracked} onClick={addToTracker}>
          {tracked || added ? `✓ ${t.sim3.mission.added}` : t.sim3.mission.addToTracker}
        </button>
      )}
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
