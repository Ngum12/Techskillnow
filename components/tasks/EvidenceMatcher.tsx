"use client";
import { useMemo, useState } from "react";
import type { EvidenceTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import { matches, stems } from "@/lib/cv/keywords";
import type { CvData } from "@/lib/cv/model";
import { Feedback } from "./Feedback";

/** Everything in the CV that can serve as proof: achievement lines, education, skills. */
export function proofItems(cv: CvData): string[] {
  const items = [
    ...cv.experiences.flatMap((e) => e.bullets.filter((b) => b.trim()).map((b) => (e.title ? `${b} (${e.title})` : b))),
    ...cv.education.filter((e) => e.degree.trim()).map((e) => [e.degree, e.school].filter(Boolean).join(", ")),
    ...cv.skills.filter((k) => k.name.trim()).map((k) => k.name),
    ...cv.languages.filter((l) => l.name.trim()).map((l) => l.name),
  ];
  return [...new Set(items)].slice(0, 40);
}

/** A proof is strong if it shares the requirement's key words and shows a result (a number). */
export function proofStrength(proof: string, keywords: string[]): "strong" | "weak" {
  const st = stems(proof);
  return keywords.some((k) => matches(k, st)) && /\d/.test(proof) ? "strong" : "weak";
}

/** Link each requirement of the advert to proof from the learner's own CV; gaps stay visible. */
export function EvidenceMatcher({ task, passed, onPass }: { task: EvidenceTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim3.evidence;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const [done, setDone] = useState(passed);
  const items = useMemo(() => (store ? proofItems(store.cv) : []), [store]);
  if (!store) return null;

  const links = store.cv.evidence[task.advert.id] ?? [];
  const proofFor = (req: string) => links.find((l) => l.req === req)?.proof ?? "";
  const linked = task.advert.requirements.filter((r) => proofFor(r.id));
  const gaps = task.advert.requirements.filter((r) => !proofFor(r.id));

  function setLink(req: string, proof: string) {
    store!.update((cv) => {
      const current = (cv.evidence[task.advert.id] ?? []).filter((l) => l.req !== req);
      return { ...cv, evidence: { ...cv.evidence, [task.advert.id]: proof ? [...current, { req, proof }] : current } };
    });
  }

  function finish() {
    const ok = linked.length >= task.minLinks;
    reportAttempt(ok, gaps.map((g) => g.text));
    if (ok) {
      setDone(true);
      onPass();
    }
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <p className="mt-2 rounded-lg bg-primary-soft p-3">
        <span className="font-semibold">{task.advert.role}</span> · {task.advert.org}
      </p>
      {items.length === 0 && <p className="mt-3 rounded-lg bg-warn-soft p-3">{s.noCv}</p>}

      <ul className="mt-4 flex flex-col gap-3">
        {task.advert.requirements.map((r) => {
          const proof = proofFor(r.id);
          const strength = proof ? proofStrength(proof, r.keywords) : null;
          return (
            <li key={r.id} className={`card p-3 ${proof ? (strength === "strong" ? "border-2 border-ok" : "border-2 border-[#c98a00]") : "border-dashed"}`}>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">{s.requirement}</p>
              <p className="font-semibold">{r.text}</p>
              <label className="mt-2 block">
                <span className="text-sm text-muted">{s.proof}</span>
                <select className="input" value={proof} onChange={(e) => setLink(r.id, e.target.value)}>
                  <option value="">{s.gap}</option>
                  {items.map((i) => (
                    <option key={i} value={i}>
                      {i.length > 90 ? `${i.slice(0, 88)}…` : i}
                    </option>
                  ))}
                </select>
              </label>
              {strength === "strong" && <p className="mt-1 text-sm font-semibold text-ok">✓ {s.strong}</p>}
              {strength === "weak" && <p className="mt-1 text-sm text-[#8a5a00]">{s.weak}</p>}
            </li>
          );
        })}
      </ul>

      {gaps.length > 0 && (
        <div className="mt-4 rounded-xl bg-warn-soft p-3">
          <p className="font-semibold text-warn">{s.gaps}</p>
          <ul className="mt-1 list-disc pl-5">
            {gaps.map((g) => (
              <li key={g.id}>{g.text}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm">{s.gapHelp}</p>
        </div>
      )}

      <p className="mt-3 text-sm text-muted">{fmt(s.progress, { n: linked.length, total: task.advert.requirements.length, min: task.minLinks })}</p>
      {!done && (
        <button type="button" className="btn btn-primary mt-2 w-full" disabled={linked.length < task.minLinks} onClick={finish}>
          {s.useInLetter}
        </button>
      )}
      {done && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
