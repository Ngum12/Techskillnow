"use client";
import { useEffect, useMemo, useState } from "react";
import type { BulletBuilderTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import { checkBullet, composeBullet, MAX_BULLET_CHARS } from "@/lib/cv/bullet";
import { newId } from "@/lib/cv/model";
import { Feedback } from "./Feedback";
import { TutorTips } from "./TutorTips";

export function BulletBuilder({ task, passed, onPass }: { task: BulletBuilderTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.bullet;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const [expId, setExpId] = useState<string>("");
  const [verb, setVerb] = useState("");
  const [what, setWhat] = useState("");
  const [result, setResult] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(passed);

  const experiences = useMemo(() => store?.cv.experiences.filter((e) => e.title.trim()) ?? [], [store?.cv.experiences]);
  const strong = useMemo(
    () => (store?.cv.experiences ?? []).flatMap((e) => e.bullets).filter((b) => b.trim() && checkBullet(b).length === 0).length,
    [store?.cv.experiences],
  );

  // Strong lines written earlier (or on another phone) count too.
  useEffect(() => {
    if (!done && strong >= task.required) {
      setDone(true);
      onPass();
    }
  }, [strong, done, task.required, onPass]);

  if (!store) return null;
  const exp = experiences.find((e) => e.id === expId) ?? experiences[0];
  const line = composeBullet(verb, what, result);
  const issues = checkBullet(line);
  const before = exp?.bullets.find((b) => checkBullet(b).length > 0) ?? "";

  function addExperience() {
    if (!newTitle.trim()) return;
    const id = newId();
    store!.update((cv) => ({ ...cv, experiences: [...cv.experiences, { id, title: newTitle.trim(), org: newOrg.trim(), place: "", start: "", end: "", bullets: [] }] }));
    setExpId(id);
    setNewTitle("");
    setNewOrg("");
  }

  function add() {
    setChecked(true);
    reportAttempt(issues.length === 0, issues.map((i) => s.issues[i]));
    if (issues.length || !exp) return;
    store!.update((cv) => ({
      ...cv,
      experiences: cv.experiences.map((e) => {
        if (e.id !== exp.id) return e;
        // Replace the weak "before" line with the improved one, otherwise add it.
        const at = before ? e.bullets.indexOf(before) : -1;
        const bullets = at >= 0 ? e.bullets.map((b, i) => (i === at ? line : b)) : [...e.bullets, line].slice(0, 6);
        return { ...e, bullets };
      }),
    }));
    setVerb("");
    setWhat("");
    setResult("");
    setChecked(false);
  }

  function removeBullet(eid: string, index: number) {
    store!.update((cv) => ({ ...cv, experiences: cv.experiences.map((e) => (e.id === eid ? { ...e, bullets: e.bullets.filter((_, i) => i !== index) } : e)) }));
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>

      <div className="mt-3 rounded-xl bg-primary-soft p-3 text-[0.95rem]">
        <p className="font-semibold text-primary">{s.exampleTitle}</p>
        <p className="mt-1">
          <span className="font-semibold">{s.before}: </span>
          <span className="line-through decoration-err">{task.example.before}</span>
        </p>
        <p className="mt-1">
          <span className="font-semibold">{s.after}: </span>
          {composeBullet(task.example.verb, task.example.task, task.example.result)}
        </p>
      </div>

      <p className="mt-4 font-semibold" aria-live="polite">
        {fmt(s.progress, { n: Math.min(strong, task.required), total: task.required })}
      </p>

      {experiences.length === 0 ? (
        <p className="mt-2 text-muted">{s.noExperience}</p>
      ) : (
        <label className="mt-3 block">
          <span className="label">{s.experience}</span>
          <select className="input" value={exp?.id ?? ""} onChange={(e) => setExpId(e.target.value)}>
            {experiences.map((e) => (
              <option key={e.id} value={e.id}>
                {[e.title, e.org].filter(Boolean).join(" — ")}
              </option>
            ))}
          </select>
        </label>
      )}

      <details className="mt-2">
        <summary className="cursor-pointer py-2 font-semibold text-primary">{s.addExperience}</summary>
        <div className="grid gap-2">
          <input className="input" placeholder={s.titlePlaceholder} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} aria-label={s.titlePlaceholder} />
          <input className="input" placeholder={s.orgPlaceholder} value={newOrg} onChange={(e) => setNewOrg(e.target.value)} aria-label={s.orgPlaceholder} />
          <button type="button" className="btn btn-secondary" onClick={addExperience} disabled={!newTitle.trim()}>
            {s.addExperienceButton}
          </button>
        </div>
      </details>

      {exp && (
        <details className="mt-1">
          <summary className="cursor-pointer py-2 font-semibold text-primary">{s.editExperience}</summary>
          <div className="grid gap-2">
            {(["title", "org", "place"] as const).map((k) => (
              <input
                key={k}
                className="input"
                placeholder={s.editFields[k]}
                aria-label={s.editFields[k]}
                value={exp[k]}
                onChange={(e) => store.update((cv) => ({ ...cv, experiences: cv.experiences.map((x) => (x.id === exp.id ? { ...x, [k]: e.target.value } : x)) }))}
              />
            ))}
            <div className="grid grid-cols-2 gap-2">
              {(["start", "end"] as const).map((k) => (
                <input
                  key={k}
                  className="input"
                  placeholder={s.editFields[k]}
                  aria-label={s.editFields[k]}
                  value={exp[k]}
                  onChange={(e) => store.update((cv) => ({ ...cv, experiences: cv.experiences.map((x) => (x.id === exp.id ? { ...x, [k]: e.target.value } : x)) }))}
                />
              ))}
            </div>
            <button
              type="button"
              className="btn btn-ghost min-h-11 justify-start px-0 text-err"
              onClick={() => {
                if (window.confirm(s.deleteExperienceConfirm)) store.update((cv) => ({ ...cv, experiences: cv.experiences.filter((x) => x.id !== exp.id) }));
              }}
            >
              {s.deleteExperience}
            </button>
          </div>
        </details>
      )}

      {exp && (
        <>
          {before && (
            <p className="mt-3 rounded-lg border border-dashed border-line p-3 text-[0.95rem]">
              <span className="font-semibold">{s.yourBefore}: </span>
              {before}
            </p>
          )}

          <p className="mt-4 font-semibold">1. {s.pickVerb}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {task.verbs.map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={verb === v}
                onClick={() => setVerb(v)}
                className={`min-h-11 rounded-full border-2 px-3 ${verb === v ? "border-primary bg-primary text-white" : "border-line bg-surface"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <label className="mt-4 block">
            <span className="label">2. {s.what}</span>
            <input className="input" placeholder={task.example.task} value={what} onChange={(e) => setWhat(e.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="label">3. {s.result}</span>
            <input className="input" placeholder={task.example.result} value={result} onChange={(e) => setResult(e.target.value)} />
          </label>

          <div className="mt-4 rounded-xl border-2 border-primary bg-surface p-3">
            <p className="text-sm font-semibold text-muted">{s.preview}</p>
            <p className="mt-1 text-lg">{line || "…"}</p>
            <p className={`mt-1 text-right text-sm ${line.length > MAX_BULLET_CHARS ? "font-semibold text-err" : "text-muted"}`}>
              {line.length}/{MAX_BULLET_CHARS}
            </p>
          </div>
          {line && issues.length > 0 && (checked || issues.includes("weakOpening") || issues.includes("tooLong")) && (
            <Feedback kind="err" title={t.task.tryAgain} messages={issues.map((i) => s.issues[i])} />
          )}
          <button type="button" className="btn btn-primary mt-3 w-full" onClick={add} disabled={!line}>
            {s.add}
          </button>
          {line && <TutorTips payload={() => ({ text: line })} />}
        </>
      )}

      {experiences.some((e) => e.bullets.length) && (
        <section className="mt-6">
          <p className="font-semibold">{s.yourLines}</p>
          {experiences
            .filter((e) => e.bullets.length)
            .map((e) => (
              <div key={e.id} className="mt-2">
                <p className="text-sm font-semibold text-muted">{[e.title, e.org].filter(Boolean).join(" — ")}</p>
                <ul className="mt-1 space-y-1">
                  {e.bullets.map((b, i) => {
                    const ok = checkBullet(b).length === 0;
                    return (
                      <li key={i} className={`flex items-start gap-2 rounded-lg border p-2 ${ok ? "border-ok" : "border-line"}`}>
                        <span aria-hidden="true" className={ok ? "text-ok" : "text-muted"}>
                          {ok ? "✓" : "•"}
                        </span>
                        <span className="min-w-0 flex-1">{b}</span>
                        <button type="button" className="h-11 w-11 shrink-0 text-xl text-muted" aria-label={s.remove} onClick={() => removeBullet(e.id, i)}>
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </section>
      )}
      {done && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
