"use client";
import { useEffect, useState } from "react";
import type { CvEducationSkillsTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import { LANGUAGE_LEVELS, newId, SKILL_LEVELS, type CvData, type CvEducation } from "@/lib/cv/model";
import { Feedback } from "./Feedback";

type Issue = "education" | "skills" | "languages";

export function CvEducationSkills({ task, passed, onPass }: { task: CvEducationSkillsTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.eduSkills;
  const c = t.cv;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const [issues, setIssues] = useState<Issue[] | null>(passed ? [] : null);

  // Start with English and French, the two languages every Cameroonian employer asks about.
  useEffect(() => {
    if (store && store.status !== "loading" && store.cv.languages.length === 0) {
      store.update((cv) =>
        cv.languages.length
          ? cv
          : {
              ...cv,
              languages: [
                { id: newId(), name: s.english, level: "good" },
                { id: newId(), name: s.french, level: "good" },
              ],
            },
      );
    }
  }, [store, s.english, s.french]);

  if (!store) return null;
  const cv = store.cv;
  const set = (fn: (cv: CvData) => CvData) => {
    store.update(fn);
    if (issues?.length) setIssues(null);
  };
  const setEdu = (id: string, patch: Partial<CvEducation>) => set((x) => ({ ...x, education: x.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));

  function check() {
    const found: Issue[] = [];
    if (!cv.education.some((e) => e.degree.trim() && e.school.trim())) found.push("education");
    if (cv.skills.filter((x) => x.name.trim()).length < task.minSkills) found.push("skills");
    if (cv.languages.filter((l) => l.name.trim()).length < 2) found.push("languages");
    setIssues(found);
    reportAttempt(found.length === 0, found.map((i) => fmt(s.issues[i], { n: task.minSkills })));
    if (found.length === 0) onPass();
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>

      <h3 className="mt-5 text-lg font-bold">{c.sections.education}</h3>
      {cv.education.map((e) => (
        <div key={e.id} className="card mt-3 grid gap-2 p-3">
          <input className="input" placeholder={s.degree} aria-label={s.degree} value={e.degree} onChange={(ev) => setEdu(e.id, { degree: ev.target.value })} />
          <input className="input" placeholder={s.school} aria-label={s.school} value={e.school} onChange={(ev) => setEdu(e.id, { school: ev.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <input className="input" placeholder={s.place} aria-label={s.place} value={e.place} onChange={(ev) => setEdu(e.id, { place: ev.target.value })} />
            <input className="input" placeholder={s.start} aria-label={s.start} inputMode="numeric" value={e.start} onChange={(ev) => setEdu(e.id, { start: ev.target.value })} />
            <input className="input" placeholder={s.end} aria-label={s.end} inputMode="numeric" value={e.end} onChange={(ev) => setEdu(e.id, { end: ev.target.value })} />
          </div>
          <input className="input" placeholder={s.details} aria-label={s.details} value={e.details} onChange={(ev) => setEdu(e.id, { details: ev.target.value })} />
          <button type="button" className="btn btn-ghost min-h-11 justify-start px-0 text-err" onClick={() => set((x) => ({ ...x, education: x.education.filter((y) => y.id !== e.id) }))}>
            {s.remove}
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary mt-3 w-full"
        onClick={() => set((x) => ({ ...x, education: [...x.education, { id: newId(), degree: "", school: "", place: "", start: "", end: "", details: "" }] }))}
      >
        {s.addEducation}
      </button>

      <h3 className="mt-6 text-lg font-bold">{c.sections.skills}</h3>
      <p className="mt-1 rounded-lg bg-warn-soft p-3 text-[0.95rem]">{task.honesty}</p>
      {cv.skills.map((k) => (
        <div key={k.id} className="mt-2 flex gap-2">
          <input
            className="input flex-[3]"
            placeholder={s.skill}
            aria-label={s.skill}
            value={k.name}
            onChange={(ev) => set((x) => ({ ...x, skills: x.skills.map((y) => (y.id === k.id ? { ...y, name: ev.target.value } : y)) }))}
          />
          <select
            className="input flex-[2]"
            aria-label={s.level}
            value={k.level}
            onChange={(ev) => set((x) => ({ ...x, skills: x.skills.map((y) => (y.id === k.id ? { ...y, level: ev.target.value as typeof k.level } : y)) }))}
          >
            {SKILL_LEVELS.map((l) => (
              <option key={l} value={l}>
                {c.skillLevels[l]}
              </option>
            ))}
          </select>
          <button type="button" className="h-[52px] w-11 shrink-0 text-xl text-muted" aria-label={s.remove} onClick={() => set((x) => ({ ...x, skills: x.skills.filter((y) => y.id !== k.id) }))}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-secondary mt-3 w-full" onClick={() => set((x) => ({ ...x, skills: [...x.skills, { id: newId(), name: "", level: "good" }] }))}>
        {s.addSkill}
      </button>
      <p className="mt-2 text-sm text-muted">{s.levelsHelp}</p>

      <h3 className="mt-6 text-lg font-bold">{c.sections.languages}</h3>
      {cv.languages.map((l) => (
        <div key={l.id} className="mt-2 flex gap-2">
          <input
            className="input flex-[3]"
            aria-label={s.language}
            value={l.name}
            onChange={(ev) => set((x) => ({ ...x, languages: x.languages.map((y) => (y.id === l.id ? { ...y, name: ev.target.value } : y)) }))}
          />
          <select
            className="input flex-[2]"
            aria-label={s.level}
            value={l.level}
            onChange={(ev) => set((x) => ({ ...x, languages: x.languages.map((y) => (y.id === l.id ? { ...y, level: ev.target.value as typeof l.level } : y)) }))}
          >
            {LANGUAGE_LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {c.languageLevels[lv]}
              </option>
            ))}
          </select>
          <button type="button" className="h-[52px] w-11 shrink-0 text-xl text-muted" aria-label={s.remove} onClick={() => set((x) => ({ ...x, languages: x.languages.filter((y) => y.id !== l.id) }))}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-secondary mt-3 w-full" onClick={() => set((x) => ({ ...x, languages: [...x.languages, { id: newId(), name: "", level: "good" }] }))}>
        {s.addLanguage}
      </button>
      <p className="mt-2 text-sm text-muted">{s.languageHelp}</p>

      <h3 className="mt-6 text-lg font-bold">{c.sections.interests}</h3>
      <input className="input mt-2" placeholder={s.interests} aria-label={c.sections.interests} value={cv.interests} onChange={(ev) => set((x) => ({ ...x, interests: ev.target.value }))} />

      <button type="button" className="btn btn-secondary mt-6 w-full" onClick={check}>
        {t.task.check}
      </button>
      {issues &&
        (issues.length === 0 ? (
          <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />
        ) : (
          <Feedback kind="err" title={t.task.tryAgain} messages={issues.map((i) => fmt(s.issues[i], { n: task.minSkills }))} />
        ))}
    </div>
  );
}
