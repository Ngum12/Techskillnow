"use client";
import { useState } from "react";
import type { CoverLetterTask } from "@/content/types";
import { useLocale, useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import { checkCoverLetter, letterText, type LetterParts } from "@/lib/cv/letter";
import { countWords } from "@/lib/cv/portal";
import { cvFileName } from "@/lib/cv/model";
import { Feedback } from "./Feedback";
import { TutorTips } from "./TutorTips";

/** Structured cover letter: opening (role), why me (2 proofs), why this organisation, closing (request). */
export function CoverLetterBuilder({ task, passed, onPass }: { task: CoverLetterTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const locale = useLocale();
  const s = t.sim.letter;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const name = store?.cv.header.fullName ?? "";
  const [p, setP] = useState<LetterParts>({
    greeting: task.advert.contact ? fmt(s.dearNamed, { name: task.advert.contact }) : s.dearSirMadam,
    opening: "",
    whyMe: "",
    whyOrg: "",
    closing: "",
    signOff: s.signOff,
    name,
  });
  const [issues, setIssues] = useState<string[] | null>(passed ? [] : null);
  const [busy, setBusy] = useState(false);

  const cvLines = store ? [store.cv.profile, ...store.cv.experiences.flatMap((e) => e.bullets)] : [];
  const words = countWords(letterText(p));
  const set = (key: keyof LetterParts) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setP({ ...p, [key]: e.target.value });
    setIssues(null);
  };

  function check() {
    const found = checkCoverLetter(p, task.advert, cvLines, task.maxWords).map((i) => fmt(s.issues[i], { max: task.maxWords }));
    setIssues(found);
    reportAttempt(found.length === 0, found);
    if (found.length === 0) onPass();
  }

  async function exportPdf() {
    setBusy(true);
    try {
      const { makeLetterPdf, saveFile } = await import("@/components/cv/pdf");
      const h = store?.cv.header;
      const { blob } = await makeLetterPdf({
        name: p.name || name,
        contact: [h?.email, h?.phone, h?.city].filter(Boolean).join("  |  "),
        date: new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date()),
        recipient: [task.advert.contact, task.advert.org].filter(Boolean),
        paragraphs: [p.greeting, p.opening, p.whyMe, p.whyOrg, p.closing, `${p.signOff}\n${p.name}`],
      });
      saveFile(blob, cvFileName(p.name || name, s.fileSuffix));
    } finally {
      setBusy(false);
    }
  }

  const area = (key: keyof LetterParts, label: string, hint: string, rows = "min-h-28") => (
    <label className="mt-4 block">
      <span className="label">{label}</span>
      <span className="mb-1 block text-sm text-muted">{hint}</span>
      <textarea className={`input ${rows} leading-relaxed`} value={p[key]} onChange={set(key)} />
    </label>
  );

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <details className="card mt-3 p-3" open>
        <summary className="cursor-pointer font-semibold text-primary">
          {task.advert.role} · {task.advert.org}
        </summary>
        <p className="mt-2 whitespace-pre-line text-[0.95rem]">{task.advert.text}</p>
      </details>

      <label className="mt-4 block">
        <span className="label">{s.greeting}</span>
        <input className="input" value={p.greeting} onChange={set("greeting")} />
      </label>
      {area("opening", s.opening, fmt(s.openingHint, { role: task.advert.role, org: task.advert.org }), "min-h-24")}
      {area("whyMe", s.whyMe, s.whyMeHint, "min-h-36")}
      {area("whyOrg", s.whyOrg, fmt(s.whyOrgHint, { org: task.advert.org }))}
      {area("closing", s.closing, s.closingHint, "min-h-20")}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <label>
          <span className="label">{s.signOffLabel}</span>
          <input className="input" value={p.signOff} onChange={set("signOff")} />
        </label>
        <label>
          <span className="label">{s.name}</span>
          <input className="input" value={p.name} onChange={set("name")} />
        </label>
      </div>
      <p className={`mt-2 text-right text-sm ${words > task.maxWords ? "font-semibold text-err" : "text-muted"}`}>
        {fmt(s.words, { n: words, max: task.maxWords })}
      </p>

      <button type="button" className="btn btn-secondary mt-2 w-full" onClick={check}>
        {t.task.check}
      </button>
      {issues &&
        (issues.length === 0 ? (
          <>
            <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />
            <button type="button" className="btn btn-primary mt-3 w-full" disabled={busy} onClick={exportPdf}>
              {busy ? t.cv.downloading : s.download}
            </button>
          </>
        ) : (
          <Feedback kind="err" title={t.task.tryAgain} messages={issues} />
        ))}
      {issues && words > 20 && <TutorTips payload={() => ({ text: letterText(p) })} />}
    </div>
  );
}
