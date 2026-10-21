"use client";
import { useState } from "react";
import type { DossierTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { ReorderList } from "@/components/cv/ReorderList";
import { checkDossier, dossierOk, type DossierPick, type DossierResult } from "@/lib/cv/dossier";
import { Feedback } from "./Feedback";

/** Build a paper application file: pick the requested documents, the right number of copies, in order. */
export function DossierBuilder({ task, passed, onPass }: { task: DossierTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim3.dossier;
  const { reportAttempt } = useLesson();
  const [file, setFile] = useState<DossierPick[]>(() => (passed ? task.required : []));
  const [result, setResult] = useState<DossierResult | null>(null);
  const label = (id: string) => task.pile.find((p) => p.id === id)?.label ?? id;
  const inFile = (id: string) => file.some((f) => f.id === id);

  function toggle(id: string) {
    setFile(inFile(id) ? file.filter((f) => f.id !== id) : [...file, { id, copies: 1 }]);
    setResult(null);
  }
  function copies(id: string, delta: number) {
    setFile(file.map((f) => (f.id === id ? { ...f, copies: Math.max(1, Math.min(10, f.copies + delta)) } : f)));
    setResult(null);
  }

  function check() {
    const r = checkDossier(file, task.required);
    setResult(r);
    const ok = dossierOk(r);
    reportAttempt(ok, [...r.missing.map((id) => `missing ${label(id)}`), ...r.extra.map((id) => `extra ${label(id)}`)]);
    if (ok) onPass();
  }

  const messages = result
    ? [
        ...result.missing.map((id) => fmt(s.issues.missing, { doc: label(id) })),
        ...result.extra.map((id) => fmt(s.issues.extra, { doc: label(id) })),
        ...result.copies.map((c) => fmt(s.issues.copies, { doc: label(c.id), want: c.want, got: c.got })),
        ...(result.order ? [s.issues.order] : []),
      ]
    : [];

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <article className="card mt-3 p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{s.advert}</p>
        <h3 className="mt-1 font-bold">{task.advert.title}</h3>
        <p className="text-sm text-muted">{task.advert.org}</p>
        <p className="mt-2 whitespace-pre-line text-[0.95rem]">{task.advert.text}</p>
      </article>

      <h4 className="mt-5 font-bold">{s.pile}</h4>
      <p className="text-sm text-muted">{s.pileHelp}</p>
      <ul className="mt-2 grid grid-cols-1 gap-2">
        {task.pile.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              aria-pressed={inFile(p.id)}
              onClick={() => toggle(p.id)}
              className={`flex min-h-[52px] w-full items-center gap-3 rounded-xl border-2 px-3 py-2 text-left ${inFile(p.id) ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}
            >
              <span aria-hidden="true" className="text-xl">
                {inFile(p.id) ? "☑" : "☐"}
              </span>
              <span>
                <span className="block font-semibold">{p.label}</span>
                {p.detail && <span className="block text-sm text-muted">{p.detail}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <h4 className="mt-6 font-bold">{fmt(s.yourFile, { n: file.length })}</h4>
      {file.length === 0 ? (
        <p className="text-muted">{s.emptyFile}</p>
      ) : (
        <>
          <p className="mb-2 text-sm text-muted">{s.orderHelp}</p>
          <ReorderList
            items={file.map((f) => ({ id: f.id, label: `${label(f.id)} × ${f.copies}` }))}
            onChange={(ids) => {
              setFile(ids.map((id) => file.find((f) => f.id === id)!));
              setResult(null);
            }}
          />
          <div className="mt-3 space-y-2">
            {file.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-2 text-[0.95rem]">
                <span className="min-w-0 truncate">{label(f.id)}</span>
                <span className="flex shrink-0 items-center gap-1">
                  <button type="button" className="h-11 w-11 rounded-lg border border-line text-lg" aria-label={`${s.fewer}: ${label(f.id)}`} onClick={() => copies(f.id, -1)}>
                    −
                  </button>
                  <span className="w-14 text-center font-semibold">{fmt(s.copies, { n: f.copies })}</span>
                  <button type="button" className="h-11 w-11 rounded-lg border border-line text-lg" aria-label={`${s.more}: ${label(f.id)}`} onClick={() => copies(f.id, 1)}>
                    +
                  </button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <button type="button" className="btn btn-secondary mt-5 w-full" disabled={!file.length} onClick={check}>
        {t.task.check}
      </button>
      {result && (dossierOk(result) ? <Feedback kind="ok" title={t.task.correct} messages={[task.success]} /> : <Feedback kind="err" title={t.task.tryAgain} messages={messages} />)}
      <p className="mt-3 text-sm text-muted">{s.disclaimer}</p>
    </div>
  );
}
