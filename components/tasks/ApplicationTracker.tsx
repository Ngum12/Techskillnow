"use client";
import { useEffect, useState } from "react";
import type { TrackerTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import { newId, type CvTrackerRow } from "@/lib/cv/model";
import { trackerCsv } from "@/lib/cv/tracker-csv";
import { Feedback } from "./Feedback";

export const TRACKER_STATUSES = ["toApply", "applied", "acknowledged", "documentsSent", "interview", "offer", "rejected"] as const;

const complete = (r: CvTrackerRow) => !!(r.org.trim() && r.role.trim() && r.deadline.trim());

/** The learner's application tracker: persists in the shared profile, used by every "Get the Job" course. */
export function ApplicationTracker({ task, passed, onPass }: { task: TrackerTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim3.tracker;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const [done, setDone] = useState(passed);
  const rows = store?.cv.tracker ?? [];
  const ready = rows.filter(complete).length;

  useEffect(() => {
    if (!done && ready >= task.required) {
      setDone(true);
      reportAttempt(true, []);
      onPass();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, done, task.required]);

  if (!store) return null;
  const update = (id: string, patch: Partial<CvTrackerRow>) => store.update((cv) => ({ ...cv, tracker: cv.tracker.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  const add = (seed: Partial<CvTrackerRow> = {}) =>
    store.update((cv) => ({
      ...cv,
      tracker: [...cv.tracker, { id: newId(), org: "", role: "", date: "", reference: "", status: "toApply", deadline: "", documents: "", followUp: "", ...seed }],
    }));
  const remove = (id: string) => store.update((cv) => ({ ...cv, tracker: cv.tracker.filter((r) => r.id !== id) }));
  const statusLabel = (st: string) => (s.statuses as Record<string, string>)[st] ?? st;

  function exportCsv() {
    const blob = new Blob([trackerCsv(rows, s.csvHeaders, statusLabel)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TechSkillNow_applications.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  const suggestions = task.suggestions.filter((sg) => !rows.some((r) => r.org === sg.org && r.role === sg.role));
  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <p className="mt-2 font-semibold text-primary" aria-live="polite">
        {fmt(s.progress, { n: Math.min(ready, task.required), total: task.required })}
      </p>

      {suggestions.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-muted">{s.suggested}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {suggestions.map((sg) => (
              <li key={`${sg.org}-${sg.role}`} className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-line p-2">
                <span className="min-w-0 text-[0.95rem]">
                  <span className="font-semibold">{sg.role}</span> · {sg.org}
                </span>
                <button type="button" className="btn btn-secondary min-h-11 shrink-0 py-2 text-sm" onClick={() => add({ ...sg, status: "toApply" })}>
                  + {s.add}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-3">
        {rows.map((r) => (
          <li key={r.id} className={`card p-3 ${complete(r) ? "border-ok" : ""}`}>
            <div className="grid grid-cols-2 gap-2">
              <input className="input col-span-2" placeholder={s.cols.org} aria-label={s.cols.org} value={r.org} onChange={(e) => update(r.id, { org: e.target.value })} />
              <input className="input col-span-2" placeholder={s.cols.role} aria-label={s.cols.role} value={r.role} onChange={(e) => update(r.id, { role: e.target.value })} />
              <label>
                <span className="text-sm text-muted">{s.cols.deadline}</span>
                <input type="date" className="input" value={r.deadline} onChange={(e) => update(r.id, { deadline: e.target.value })} />
              </label>
              <label>
                <span className="text-sm text-muted">{s.cols.followUp}</span>
                <input type="date" className="input" value={r.followUp} onChange={(e) => update(r.id, { followUp: e.target.value })} />
              </label>
              <input className="input col-span-2" placeholder={s.cols.documents} aria-label={s.cols.documents} value={r.documents} onChange={(e) => update(r.id, { documents: e.target.value })} />
              <label className="col-span-2">
                <span className="text-sm text-muted">{s.cols.status}</span>
                <select className="input" value={r.status || "toApply"} onChange={(e) => update(r.id, { status: e.target.value })}>
                  {TRACKER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {statusLabel(st)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {r.reference && <p className="mt-2 text-sm text-muted">{fmt(s.reference, { ref: r.reference })}</p>}
            <button type="button" className="btn btn-ghost mt-1 min-h-11 justify-start px-0 text-sm text-err" onClick={() => remove(r.id)}>
              {s.remove}
            </button>
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="mt-3 text-muted">{s.empty}</p>}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" className="btn btn-secondary" onClick={() => add()}>
          + {s.addRow}
        </button>
        <button type="button" className="btn btn-secondary" onClick={exportCsv} disabled={!rows.length}>
          ⬇ {s.export}
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">{s.exportHelp}</p>
      {done && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
