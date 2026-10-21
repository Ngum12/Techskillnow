"use client";
import { useEffect, useMemo, useState } from "react";
import type { InboxTask, PortalTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import { newId } from "@/lib/cv/model";
import {
  countWords,
  emptyPortal,
  limitWords,
  PORTAL_PAGES,
  referenceNumber,
  validatePage,
  type FileInfo,
  type PortalPage,
  type PortalValues,
} from "@/lib/cv/portal";
import { MockInbox } from "./MockInbox";
import { Feedback } from "./Feedback";

type Stage = PortalPage | "review" | "inbox" | "tracker" | "done";

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

/** A realistic online application portal, then the confirmation email and an application tracker. */
export function PortalSimulator({ task, passed, onPass }: { task: PortalTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.portal;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const [stage, setStage] = useState<Stage>(passed ? "done" : "personal");
  const [v, setV] = useState<PortalValues>(emptyPortal);
  // Optional session timeout: unsaved answers are lost when it ends, as on many real portals.
  const [sessionLeft, setSessionLeft] = useState<number | null>(task.sessionSeconds ?? null);
  const [draft, setDraft] = useState<{ values: PortalValues; stage: Stage } | null>(null);
  const [expired, setExpired] = useState<"lost" | "restored" | null>(null);
  const [savedNote, setSavedNote] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PortalValues, string>>>({});
  const [reference, setReference] = useState("");
  const [refInput, setRefInput] = useState("");
  const [refError, setRefError] = useState(false);
  const config = { wordLimit: task.wordLimit, maxFileMb: task.maxFileMb, allowedTypes: task.allowedTypes };
  const name = `${v.firstName} ${v.lastName}`.trim();

  // Sample files on the "phone", including ones that break the rules (wrong type, too big).
  const samples: FileInfo[] = useMemo(
    () => [
      { name: store?.cv.header.fullName ? `${store.cv.header.fullName.trim().split(/\s+/).join("_")}_CV.pdf` : "My_CV.pdf", size: 184 * 1024 },
      { name: "Cover_letter.pdf", size: 96 * 1024 },
      { name: "CV_scan_photo.jpg", size: 2.4 * 1024 * 1024 },
      { name: "Diploma_scan.pdf", size: (task.maxFileMb + 4) * 1024 * 1024 },
      { name: "Letter.docx", size: 41 * 1024 },
    ],
    [store?.cv.header.fullName, task.maxFileMb],
  );

  const set = (patch: Partial<PortalValues>) => {
    setV({ ...v, ...patch });
    const cleared = { ...errors };
    Object.keys(patch).forEach((k) => delete cleared[k as keyof PortalValues]);
    setErrors(cleared);
  };

  function fillFromCv() {
    if (!store) return;
    const h = store.cv.header;
    const [first, ...rest] = h.fullName.trim().split(/\s+/);
    const edu = store.cv.education[0];
    set({
      firstName: first ?? "",
      lastName: rest.join(" "),
      email: h.email,
      phone: h.phone,
      city: h.city,
      qualification: edu?.degree ?? "",
      institution: edu?.school ?? "",
      year: (edu?.end || "").replace(/\D/g, "").slice(0, 4),
    });
  }

  function next(page: PortalPage) {
    const e = validatePage(page, v, config);
    const msgs = Object.fromEntries(Object.entries(e).map(([k, code]) => [k, fmt(s.errors[code], { limit: task.wordLimit, mb: task.maxFileMb, types: task.allowedTypes.join(", ").toUpperCase() })]));
    setErrors(msgs);
    if (Object.keys(e).length) {
      reportAttempt(false, Object.values(msgs));
      return;
    }
    const i = PORTAL_PAGES.indexOf(page);
    setStage(i < PORTAL_PAGES.length - 1 ? PORTAL_PAGES[i + 1] : "review");
  }

  function submit() {
    setReference(referenceNumber(task.refPrefix, `${name}|${v.email}|${task.portalName}`));
    reportAttempt(true, []);
    setStage("inbox");
  }

  function saveTracker() {
    if (refInput.trim().toUpperCase() !== reference) {
      setRefError(true);
      reportAttempt(false, [s.refWrong]);
      return;
    }
    store?.update((cv) => ({
      ...cv,
      tracker: [...cv.tracker, { id: newId(), org: task.org, role: task.role, date: new Date().toISOString().slice(0, 10), reference, status: "applied", deadline: "", documents: "", followUp: "" }],
    }));
    setStage("done");
    onPass();
  }

  const inboxTask: InboxTask = {
    type: "inbox",
    emails: [
      {
        id: "confirm",
        from: `${task.org}`,
        fromEmail: `no-reply@${task.portalName.toLowerCase().replace(/[^a-z0-9]+/g, "")}.org`,
        subject: fmt(s.confirmSubject, { role: task.role, ref: reference }),
        preview: fmt(s.confirmPreview, { name: v.firstName }),
        body: fmt(s.confirmBody, { name: v.firstName, role: task.role, org: task.org, ref: reference }),
        time: s.now,
      },
      ...task.inbox,
    ],
    goals: [{ action: "open", target: "confirm", instruction: s.findEmail, wrong: s.wrongEmail, done: s.foundEmail }],
    success: s.foundEmail,
  };

  const field = (k: keyof PortalValues, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="mt-4 block">
      <span className="label">
        {label} <span className="text-err">*</span>
      </span>
      <input
        className={`input ${errors[k] ? "border-err" : ""}`}
        value={String(v[k] ?? "")}
        onChange={(e) => set({ [k]: e.target.value } as Partial<PortalValues>)}
        aria-invalid={!!errors[k]}
        {...props}
      />
      {errors[k] && <span className="mt-1 block text-sm text-err">{errors[k]}</span>}
    </label>
  );

  const filePick = (k: "cv" | "letter", label: string) => (
    <fieldset className="mt-4">
      <legend className="label">
        {label} <span className="text-err">*</span>
      </legend>
      <p className="text-sm text-muted">{fmt(s.fileRules, { types: task.allowedTypes.join(", ").toUpperCase(), mb: task.maxFileMb })}</p>
      {v[k] && (
        <p className="mt-2 flex items-center justify-between rounded-lg border border-line bg-surface p-2">
          <span className="truncate">
            📄 {v[k]!.name} · {kb(v[k]!.size)}
          </span>
          <button type="button" className="h-11 w-11 text-xl text-muted" aria-label={s.removeFile} onClick={() => set({ [k]: null } as Partial<PortalValues>)}>
            ×
          </button>
        </p>
      )}
      <div className="mt-2 grid gap-2">
        {samples.map((f) => (
          <button key={f.name} type="button" className="flex min-h-11 items-center justify-between rounded-lg border border-line bg-surface px-3 text-left" onClick={() => set({ [k]: f } as Partial<PortalValues>)}>
            <span className="truncate">{f.name}</span>
            <span className="shrink-0 text-sm text-muted">{kb(f.size)}</span>
          </button>
        ))}
        <label className="btn btn-ghost min-h-11 px-0">
          {s.fromPhone}
          <input
            type="file"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              // The file stays on the phone: only its name and size are checked.
              if (file) set({ [k]: { name: file.name, size: file.size } } as Partial<PortalValues>);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {errors[k] && <p className="mt-1 text-sm text-err">{errors[k]}</p>}
    </fieldset>
  );

  const inForm = PORTAL_PAGES.includes(stage as PortalPage) || stage === "review";
  useEffect(() => {
    if (sessionLeft === null || !inForm) return;
    if (sessionLeft <= 0) {
      // Session over: go back to the last saved draft, or start again.
      setV(draft?.values ?? emptyPortal());
      setStage(draft?.stage ?? "personal");
      setExpired(draft ? "restored" : "lost");
      setSessionLeft(task.sessionSeconds ?? null);
      return;
    }
    const id = setTimeout(() => setSessionLeft((x) => (x === null ? x : x - 1)), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLeft, inForm]);

  function saveDraft() {
    setDraft({ values: v, stage });
    setSessionLeft(task.sessionSeconds ?? null);
    setSavedNote(true);
    setExpired(null);
    setTimeout(() => setSavedNote(false), 2500);
  }

  const step = PORTAL_PAGES.indexOf(stage as PortalPage);
  return (
    <div>
      {stage !== "done" && stage !== "inbox" && stage !== "tracker" && (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="bg-[#1f3b57] px-4 py-3 text-white">
            <p className="text-sm opacity-80">{task.portalName}</p>
            <p className="font-bold">{fmt(s.applyFor, { role: task.role })}</p>
          </div>
          <div className="flex gap-1 px-4 pt-3" aria-hidden="true">
            {[...PORTAL_PAGES, "review"].map((p, i) => (
              <span key={p} className={`h-1.5 flex-1 rounded-full ${i <= (stage === "review" ? 4 : step) ? "bg-[#1f3b57]" : "bg-line"}`} />
            ))}
          </div>
          {sessionLeft !== null && (
            <div className={`mx-4 mt-3 flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${sessionLeft <= 30 ? "bg-err-soft text-err" : "bg-[#eef2f6]"}`} aria-live="polite">
              <span>{fmt(s.session, { time: `${Math.floor(sessionLeft / 60)}:${String(sessionLeft % 60).padStart(2, "0")}` })}</span>
              <button type="button" className="min-h-11 font-semibold underline" onClick={saveDraft}>
                {s.saveDraft}
              </button>
            </div>
          )}
          {savedNote && <p className="mx-4 mt-2 text-sm text-ok">✓ {s.draftSaved}</p>}
          {expired && <p className="mx-4 mt-2 rounded-lg bg-warn-soft p-2 text-sm text-warn">{expired === "lost" ? s.expiredLost : s.expiredRestored}</p>}
          <div className="p-4">
            {stage === "personal" && (
              <>
                <h4 className="text-lg font-bold">{s.pages.personal}</h4>
                {store && (
                  <button type="button" className="btn btn-ghost min-h-11 px-0" onClick={fillFromCv}>
                    {s.fillFromCv}
                  </button>
                )}
                {field("firstName", s.fields.firstName, { autoComplete: "given-name" })}
                {field("lastName", s.fields.lastName, { autoComplete: "family-name" })}
                {field("email", s.fields.email, { type: "email", inputMode: "email", autoCapitalize: "none" })}
                {field("phone", s.fields.phone, { type: "tel", inputMode: "tel", placeholder: "+237 6XX XX XX XX" })}
                {field("city", s.fields.city)}
              </>
            )}
            {stage === "education" && (
              <>
                <h4 className="text-lg font-bold">{s.pages.education}</h4>
                <label className="mt-4 block">
                  <span className="label">
                    {s.fields.qualification} <span className="text-err">*</span>
                  </span>
                  <select className={`input ${errors.qualification ? "border-err" : ""}`} value={v.qualification} onChange={(e) => set({ qualification: e.target.value })}>
                    <option value="">{s.select}</option>
                    {s.qualifications.map((q) => (
                      <option key={q}>{q}</option>
                    ))}
                    {v.qualification && !s.qualifications.includes(v.qualification) && <option>{v.qualification}</option>}
                  </select>
                  {errors.qualification && <span className="mt-1 block text-sm text-err">{errors.qualification}</span>}
                </label>
                {field("institution", s.fields.institution)}
                {field("year", s.fields.year, { inputMode: "numeric", maxLength: 4 })}
              </>
            )}
            {stage === "motivation" && (
              <>
                <h4 className="text-lg font-bold">{s.pages.motivation}</h4>
                <p className="mt-2 font-semibold">{task.motivationQuestion}</p>
                <textarea
                  className={`input mt-2 min-h-44 leading-relaxed ${errors.motivation ? "border-err" : ""}`}
                  value={v.motivation}
                  onChange={(e) => set({ motivation: limitWords(e.target.value, task.wordLimit) })}
                  aria-label={task.motivationQuestion}
                />
                <p className={`mt-1 text-right text-sm font-semibold ${countWords(v.motivation) >= task.wordLimit ? "text-err" : "text-muted"}`} aria-live="polite">
                  {fmt(s.wordCounter, { n: countWords(v.motivation), limit: task.wordLimit })}
                </p>
                {errors.motivation && <p className="text-sm text-err">{errors.motivation}</p>}
              </>
            )}
            {stage === "documents" && (
              <>
                <h4 className="text-lg font-bold">{s.pages.documents}</h4>
                {filePick("cv", s.fields.cv)}
                {filePick("letter", s.fields.letter)}
              </>
            )}
            {stage === "review" && (
              <>
                <h4 className="text-lg font-bold">{s.pages.review}</h4>
                <dl className="mt-3 space-y-2 text-[0.95rem]">
                  {[
                    [s.fields.firstName, name],
                    [s.fields.email, v.email],
                    [s.fields.phone, v.phone],
                    [s.fields.city, v.city],
                    [s.fields.qualification, `${v.qualification}, ${v.institution} (${v.year})`],
                    [s.pages.motivation, fmt(s.wordCounter, { n: countWords(v.motivation), limit: task.wordLimit })],
                    [s.fields.cv, v.cv?.name ?? ""],
                    [s.fields.letter, v.letter?.name ?? ""],
                  ].map(([k, val]) => (
                    <div key={k} className="border-b border-line pb-1">
                      <dt className="text-sm text-muted">{k}</dt>
                      <dd className="font-semibold">{val}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-sm text-muted">{s.reviewNote}</p>
              </>
            )}

            <div className="mt-5 flex gap-3">
              {stage !== "personal" && (
                <button
                  type="button"
                  className="btn btn-secondary flex-1"
                  onClick={() => setStage(stage === "review" ? "documents" : PORTAL_PAGES[Math.max(0, step - 1)])}
                >
                  {t.common.back}
                </button>
              )}
              {stage === "review" ? (
                <button type="button" className="btn flex-[2] bg-[#1f3b57] text-white" onClick={submit}>
                  {s.submit}
                </button>
              ) : (
                <button type="button" className="btn flex-[2] bg-[#1f3b57] text-white" onClick={() => next(stage as PortalPage)}>
                  {s.saveContinue}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {stage === "inbox" && (
        <>
          <p className="mb-3 rounded-lg bg-ok-soft p-3 font-semibold text-ok">{s.submittedNote}</p>
          <MockInbox task={inboxTask} passed={false} onPass={() => setStage("tracker")} />
        </>
      )}

      {stage === "tracker" && (
        <section>
          <h4 className="text-lg font-bold">{s.trackerTitle}</h4>
          <p className="mt-1 text-muted">{s.trackerHelp}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[30rem] text-left text-[0.95rem]">
              <thead>
                <tr className="border-b border-line text-sm text-muted">
                  {s.trackerCols.map((c) => (
                    <th key={c} className="py-1 pr-2 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(store?.cv.tracker ?? []).map((r) => (
                  <tr key={r.id} className="border-b border-line">
                    <td className="py-1 pr-2">{r.org}</td>
                    <td className="py-1 pr-2">{r.role}</td>
                    <td className="py-1 pr-2">{r.date}</td>
                    <td className="py-1 pr-2 font-mono">{r.reference}</td>
                    <td className="py-1">{r.status}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-2">{task.org}</td>
                  <td className="py-2 pr-2">{task.role}</td>
                  <td className="py-2 pr-2">{new Date().toISOString().slice(0, 10)}</td>
                  <td className="py-2 pr-2">
                    <input
                      className={`input font-mono uppercase ${refError ? "border-err" : ""}`}
                      placeholder={s.refPlaceholder}
                      value={refInput}
                      onChange={(e) => {
                        setRefInput(e.target.value);
                        setRefError(false);
                      }}
                      aria-label={s.trackerCols[3]}
                    />
                  </td>
                  <td className="py-2">{s.submitted}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {refError && <p className="mt-2 text-err">{s.refWrong}</p>}
          <button type="button" className="btn btn-primary mt-4 w-full" onClick={saveTracker} disabled={!refInput.trim()}>
            {s.saveTracker}
          </button>
        </section>
      )}

      {stage === "done" && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
