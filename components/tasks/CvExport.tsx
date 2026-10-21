"use client";
import { useState } from "react";
import type { CvExportTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import { CvPreview } from "@/components/cv/CvPreview";
import { useCvExport } from "@/components/cv/useCvExport";
import { cvFileName, cvGaps } from "@/lib/cv/model";
import { Feedback } from "./Feedback";

/** Step 11: preview, check completeness, and download Firstname_Lastname_CV.pdf (max 2 pages). */
export function CvExport({ task, passed, onPass }: { task: CvExportTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const c = t.cv;
  const s = t.sim.export;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const { exportCv, busy, pages, error } = useCvExport();
  const [done, setDone] = useState(passed);
  if (!store) return null;
  const cv = store.cv;
  const gaps = cvGaps(cv);

  async function download() {
    const n = await exportCv(cv);
    if (n === null) return;
    const ok = n <= 2;
    reportAttempt(ok, ok ? [] : [fmt(c.tooLong, { pages: n })]);
    if (ok && !done) {
      setDone(true);
      onPass();
    }
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <div className="mt-3">
        <CvPreview cv={cv} />
      </div>

      {gaps.length > 0 ? (
        <Feedback kind="err" title={c.gapsTitle} messages={gaps.map((g) => c.gaps[g])} />
      ) : (
        <p className="mt-3 rounded-lg bg-ok-soft p-3 font-semibold text-ok">{s.complete}</p>
      )}

      <label className="mt-4 block">
        <span className="label">{c.layout}</span>
        <select
          className="input"
          value={cv.layout}
          onChange={(e) => store.update((x) => ({ ...x, layout: e.target.value === "experienced" ? "experienced" : "fresher" }))}
        >
          <option value="fresher">{c.layoutFresher}</option>
          <option value="experienced">{c.layoutExperienced}</option>
        </select>
      </label>

      <p className="mt-4 text-sm text-muted">{fmt(s.fileName, { file: cvFileName(cv.header.fullName) })}</p>
      <button type="button" className="btn btn-primary mt-2 w-full" disabled={busy || gaps.length > 0} onClick={download}>
        {busy ? c.downloading : c.download}
      </button>
      {pages !== null && pages > 2 && <Feedback kind="err" title={t.task.tryAgain} messages={[fmt(c.tooLong, { pages })]} />}
      {error && <p className="mt-2 text-err">{t.common.errorGeneric}</p>}
      {done && <Feedback kind="ok" title={t.task.correct} messages={[task.success, s.findIt]} />}
    </div>
  );
}
