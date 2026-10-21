"use client";
import { useMemo, useState } from "react";
import type { KeywordMatchTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import { cvText, newId } from "@/lib/cv/model";
import { extractTerms, scoreCv } from "@/lib/cv/keywords";
import { Feedback } from "./Feedback";

export function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? "bg-ok" : score >= 40 ? "bg-[#c98a00]" : "bg-err";
  return (
    <div>
      <div className="flex items-end justify-between">
        <span className="font-semibold">{label}</span>
        <span className="text-2xl font-bold">{score}%</span>
      </div>
      <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}>
        <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

/** Match score between an advert's key terms and the learner's CV; missing terms can be added, truthfully. */
export function KeywordMatcher({ task, passed, onPass }: { task: KeywordMatchTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.keywords;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const [advertId, setAdvertId] = useState(task.adverts[0]?.id ?? "paste");
  const [pasted, setPasted] = useState("");
  const [honest, setHonest] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(passed);

  const advert = task.adverts.find((a) => a.id === advertId);
  const terms = useMemo(() => (advert ? advert.terms : pasted.trim().split(/\s+/).length >= 15 ? extractTerms(pasted) : []), [advert, pasted]);
  if (!store) return null;
  const result = terms.length ? scoreCv(terms, cvText(store.cv)) : null;

  function addSkill(term: string) {
    store!.update((cv) => (cv.skills.some((k) => k.name.toLowerCase() === term.toLowerCase()) ? cv : { ...cv, skills: [...cv.skills, { id: newId(), name: term, level: "good" }] }));
    setHonest((h) => ({ ...h, [term]: false }));
  }

  function finish() {
    if (!result) return;
    reportAttempt(true, result.missing);
    setDone(true);
    onPass();
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <div className="mt-3 flex flex-col gap-2" role="radiogroup" aria-label={s.pick}>
        {task.adverts.map((a) => (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={advertId === a.id}
            onClick={() => setAdvertId(a.id)}
            className={`min-h-[52px] rounded-xl border-2 px-4 py-2 text-left ${advertId === a.id ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}
          >
            <span className="block font-semibold">{a.title}</span>
            <span className="block text-sm text-muted">{a.org}</span>
          </button>
        ))}
        {task.allowPaste && (
          <button
            type="button"
            role="radio"
            aria-checked={advertId === "paste"}
            onClick={() => setAdvertId("paste")}
            className={`min-h-[52px] rounded-xl border-2 px-4 py-2 text-left font-semibold ${advertId === "paste" ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}
          >
            {s.pasteOwn}
          </button>
        )}
      </div>

      {advert && (
        <details className="card mt-3 p-3">
          <summary className="cursor-pointer font-semibold text-primary">{s.readAdvert}</summary>
          <p className="mt-2 whitespace-pre-line text-[0.95rem]">{advert.text}</p>
        </details>
      )}
      {advertId === "paste" && (
        <>
          <textarea className="input mt-3 min-h-40" placeholder={s.pastePlaceholder} value={pasted} onChange={(e) => setPasted(e.target.value)} aria-label={s.pasteOwn} />
          {pasted.trim() && terms.length === 0 && <p className="mt-1 text-sm text-muted">{s.pasteMore}</p>}
        </>
      )}

      {result && (
        <section className="mt-5">
          <ScoreBar score={result.score} label={s.score} />
          <p className="mt-4 font-semibold">{s.matched}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.matched.map((m) => (
              <span key={m.term} className={`rounded-full px-3 py-1 text-sm ${m.where === "top" ? "bg-ok text-white" : "bg-ok-soft text-ok"}`}>
                ✓ {m.term}
              </span>
            ))}
            {result.matched.length === 0 && <span className="text-muted">—</span>}
          </div>
          <p className="mt-1 text-sm text-muted">{s.topNote}</p>

          {result.missing.length > 0 && (
            <>
              <p className="mt-4 font-semibold">{s.missing}</p>
              <p className="mt-1 rounded-lg bg-warn-soft p-3 text-[0.95rem]">{s.honesty}</p>
              <ul className="mt-2 space-y-2">
                {result.missing.map((term) => (
                  <li key={term} className="card p-3">
                    <p className="font-semibold">{term}</p>
                    <label className="mt-2 flex min-h-11 items-center gap-3 text-[0.95rem]">
                      <input type="checkbox" className="h-5 w-5" checked={!!honest[term]} onChange={(e) => setHonest((h) => ({ ...h, [term]: e.target.checked }))} />
                      {s.iReallyHave}
                    </label>
                    <button type="button" className="btn btn-secondary mt-1 min-h-11 py-2 text-sm" disabled={!honest[term]} onClick={() => addSkill(term)}>
                      {s.addSkill}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {!done && (
            <button type="button" className="btn btn-primary mt-5 w-full" onClick={finish}>
              {s.done}
            </button>
          )}
        </section>
      )}
      {done && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
