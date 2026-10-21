"use client";
import { useEffect, useState } from "react";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { cvGaps, type CvGap } from "@/lib/cv/model";
import type { CvSection } from "@/content/types";
import { useCv } from "./CvContext";
import { CvPreview } from "./CvPreview";
import { useCvExport } from "./useCvExport";

/** Which lesson to open to fix each gap. */
const GAP_SECTION: Record<CvGap, CvSection> = {
  name: "header",
  email: "header",
  phone: "header",
  profile: "profile",
  experienceOrEducation: "education",
  skills: "education",
  languages: "education",
};

export function MyCvPanel({ onClose, goTo, sectionSteps }: { onClose: () => void; goTo: (step: number) => void; sectionSteps: Partial<Record<CvSection, number>> }) {
  const t = useT();
  const s = t.cv;
  const store = useCv();
  const { exportCv, busy, pages, fileName, error } = useCvExport();
  const [suggestions, setSuggestions] = useState<{ courseId: string; title: string }[]>([]);
  const [code, setCode] = useState("");
  const [linkState, setLinkState] = useState<{ kind: "idle" | "busy" | "done" | "error"; message?: string }>({ kind: "idle" });
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    if (!store) return;
    fetch(`/api/profile/link?course=${store.courseId}`)
      .then((r) => (r.ok ? r.json() : { suggestions: [] }))
      .then((d) => setSuggestions(d.suggestions ?? []))
      .catch(() => {});
  }, [store]);

  if (!store) return null;
  const { cv, status } = store;
  const gaps = cvGaps(cv);

  async function link(body: { previousCode?: string; fromCourseId?: string }) {
    setLinkState({ kind: "busy" });
    const res = await fetch("/api/profile/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: store!.courseId, ...body }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) {
      setLinkState({ kind: "done" });
      setSuggestions([]);
      setCode("");
      store!.reload();
    } else {
      const key = (data.error ?? "unavailable") as keyof typeof s.linkErrors;
      setLinkState({ kind: "error", message: s.linkErrors[key] ?? s.linkErrors.unavailable });
    }
  }

  async function remove() {
    if (!window.confirm(s.deleteConfirm)) return;
    if (await store!.remove()) setDeleted(true);
    else window.alert(t.common.errorGeneric);
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg" role="dialog" aria-modal="true" aria-labelledby="mycv-title">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div>
          <h2 id="mycv-title" className="text-lg font-bold">
            {s.myCv}
          </h2>
          <p className="text-sm text-muted" aria-live="polite">
            {s.status[status]}
          </p>
        </div>
        <button type="button" className="btn btn-secondary min-h-11 py-2" onClick={onClose}>
          {s.close}
        </button>
      </div>

      <div className="mx-auto w-full max-w-xl flex-1 overflow-y-auto px-5 pb-10 pt-4">
        <CvPreview cv={cv} />

        {gaps.length > 0 && (
          <section className="mt-5 rounded-xl bg-warn-soft p-4">
            <p className="font-bold text-warn">{s.gapsTitle}</p>
            <ul className="mt-2 space-y-2">
              {gaps.map((g) => {
                const step = sectionSteps[GAP_SECTION[g]];
                return (
                  <li key={g} className="flex items-center justify-between gap-3">
                    <span>{s.gaps[g]}</span>
                    {step && (
                      <button type="button" className="btn btn-ghost min-h-11 px-2 py-1" onClick={() => goTo(step)}>
                        {s.edit}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-5">
          <label className="label" htmlFor="cv-layout">
            {s.layout}
          </label>
          <select
            id="cv-layout"
            className="input"
            value={cv.layout}
            onChange={(e) => store.update((c) => ({ ...c, layout: e.target.value === "experienced" ? "experienced" : "fresher" }))}
          >
            <option value="fresher">{s.layoutFresher}</option>
            <option value="experienced">{s.layoutExperienced}</option>
          </select>
        </div>

        <button type="button" className="btn btn-primary mt-4 w-full" disabled={busy || !cv.header.fullName.trim()} onClick={() => exportCv(cv)}>
          {busy ? s.downloading : s.download}
        </button>
        {fileName && pages !== null && (
          <p className={`mt-2 text-sm ${pages > 2 ? "font-semibold text-err" : "text-muted"}`} role="status">
            {pages > 2 ? fmt(s.tooLong, { pages }) : fmt(s.downloaded, { file: fileName })}
          </p>
        )}
        {error && <p className="mt-2 text-sm text-err">{t.common.errorGeneric}</p>}

        <section className="mt-8 border-t border-line pt-5">
          <h3 className="text-lg font-bold">{s.settings}</h3>

          <div className="mt-4">
            <p className="font-semibold">{s.linkTitle}</p>
            <p className="mt-1 text-muted">{s.linkText}</p>
            {suggestions.map((sg) => (
              <button
                key={sg.courseId}
                type="button"
                className="btn btn-secondary mt-3 w-full"
                disabled={linkState.kind === "busy"}
                onClick={() => link({ fromCourseId: sg.courseId })}
              >
                {fmt(s.linkSuggest, { course: sg.title })}
              </button>
            ))}
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                link({ previousCode: code });
              }}
            >
              <input
                className="input flex-1 font-mono uppercase tracking-widest"
                placeholder="ABCD-2345"
                aria-label={s.linkLabel}
                autoCapitalize="characters"
                autoComplete="off"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary" disabled={linkState.kind === "busy" || code.trim().length < 8}>
                {s.linkButton}
              </button>
            </form>
            {linkState.kind === "done" && <p className="mt-2 text-ok">{s.linked}</p>}
            {linkState.kind === "error" && (
              <p className="mt-2 text-err" role="alert">
                {linkState.message}
              </p>
            )}
          </div>

          <div className="mt-6">
            <p className="font-semibold">{s.deleteTitle}</p>
            <p className="mt-1 text-muted">{s.deleteText}</p>
            {deleted ? (
              <p className="mt-2 text-ok">{s.deleted}</p>
            ) : (
              <button type="button" className="btn btn-danger mt-3 w-full" onClick={remove}>
                {s.deleteButton}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
