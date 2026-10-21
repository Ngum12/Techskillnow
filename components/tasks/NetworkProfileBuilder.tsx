"use client";
import { useEffect, useState } from "react";
import type { NetworkProfileTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import { NETWORK_CHECKS, networkChecks, networkStrength } from "@/lib/cv/network-profile";
import type { CvNetwork } from "@/lib/cv/model";
import { Feedback } from "./Feedback";

const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

/** A professional networking profile (generic layout, no platform branding) with a live strength meter. */
export function NetworkProfileBuilder({ task, passed, onPass }: { task: NetworkProfileTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim3.network;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const [skill, setSkill] = useState("");
  const [done, setDone] = useState(passed);
  const strength = store ? networkStrength(store.cv) : 0;

  // Start the skills list from the CV, once.
  useEffect(() => {
    if (store && store.status !== "loading" && store.cv.network.skills.length === 0 && store.cv.skills.length) {
      store.update((cv) => (cv.network.skills.length ? cv : { ...cv, network: { ...cv.network, skills: cv.skills.map((k) => k.name).filter(Boolean).slice(0, 8) } }));
    }
  }, [store]);

  useEffect(() => {
    if (!done && strength === 100) {
      setDone(true);
      reportAttempt(true, []);
      onPass();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strength, done]);

  if (!store) return null;
  const cv = store.cv;
  const n = cv.network;
  const checks = networkChecks(cv);
  const set = (patch: Partial<CvNetwork>) => store.update((x) => ({ ...x, network: { ...x.network, ...patch } }));
  const name = cv.header.fullName || s.yourName;
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const meter = strength >= 100 ? "bg-ok" : strength >= 60 ? "bg-[#c98a00]" : "bg-err";

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>

      <div className="sticky top-[5.5rem] z-[5] mt-3 rounded-xl border border-line bg-surface p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{s.strength}</span>
          <span className="text-xl font-bold">{strength}%</span>
        </div>
        <div className="mt-1 h-3 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full ${meter}`} style={{ width: `${strength}%` }} />
        </div>
      </div>

      <label className="mt-5 block">
        <span className="label">{s.headline}</span>
        <input className="input" value={n.headline} maxLength={160} onChange={(e) => set({ headline: e.target.value })} placeholder={task.headlineExample} />
        <span className="mt-1 block text-right text-sm text-muted">{n.headline.length}/120</span>
      </label>

      <label className="mt-3 block">
        <span className="label">{s.about}</span>
        <textarea className="input min-h-40 leading-relaxed" value={n.about} onChange={(e) => set({ about: e.target.value })} placeholder={s.aboutPlaceholder} />
        <span className={`mt-1 block text-right text-sm ${words(n.about) > 200 ? "font-semibold text-err" : "text-muted"}`}>{fmt(s.words, { n: words(n.about) })}</span>
      </label>
      <details className="rounded-lg bg-primary-soft p-3">
        <summary className="cursor-pointer font-semibold text-primary">{s.example}</summary>
        <p className="mt-2 text-[0.95rem]">{task.aboutExample}</p>
      </details>

      <div className="mt-5">
        <p className="label">{s.experience}</p>
        <p className="text-sm text-muted">{s.fromCv}</p>
        {cv.experiences.filter((e) => e.title).length === 0 ? (
          <p className="mt-2 rounded-lg bg-warn-soft p-3 text-[0.95rem]">{s.noExperience}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {cv.experiences
              .filter((e) => e.title)
              .map((e) => (
                <li key={e.id} className="rounded-lg border border-line p-3 text-[0.95rem]">
                  <p className="font-semibold">{[e.title, e.org].filter(Boolean).join(" · ")}</p>
                  {e.bullets[0] && <p className="text-muted">{e.bullets[0]}</p>}
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="mt-5">
        <p className="label">{fmt(s.skills, { n: n.skills.length })}</p>
        <div className="flex flex-wrap gap-2">
          {n.skills.map((k) => (
            <span key={k} className="flex min-h-11 items-center gap-1 rounded-full border border-line bg-surface pl-3">
              {k}
              <button type="button" className="h-11 w-9 text-lg text-muted" aria-label={`${s.remove}: ${k}`} onClick={() => set({ skills: n.skills.filter((x) => x !== k) })}>
                ×
              </button>
            </span>
          ))}
        </div>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const v = skill.trim();
            if (v && !n.skills.includes(v)) set({ skills: [...n.skills, v] });
            setSkill("");
          }}
        >
          <input className="input flex-1" value={skill} onChange={(e) => setSkill(e.target.value)} placeholder={s.addSkill} aria-label={s.addSkill} />
          <button type="submit" className="btn btn-secondary" disabled={!skill.trim()}>
            +
          </button>
        </form>
      </div>

      <div className="mt-5">
        <p className="label">{s.photoTitle}</p>
        {s.photoItems.map((item, i) => (
          <label key={item} className="mt-1 flex min-h-11 items-start gap-3">
            <input type="checkbox" className="mt-1 h-5 w-5" checked={!!n.photo[i]} onChange={(e) => set({ photo: n.photo.map((p, j) => (j === i ? e.target.checked : p)) })} />
            <span>{item}</span>
          </label>
        ))}
      </div>

      <section className="mt-5 rounded-xl border border-line p-3">
        <p className="font-semibold">{s.checksTitle}</p>
        <ul className="mt-2 space-y-1">
          {NETWORK_CHECKS.map((c) => (
            <li key={c} className={checks[c] ? "text-ok" : "text-muted"}>
              {checks[c] ? "✓" : "○"} {s.checks[c]}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5">
        <p className="font-semibold">{s.searchPreview}</p>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary">{initials}</span>
          <span className="min-w-0">
            <span className="block font-semibold">{name}</span>
            <span className="block truncate text-sm">{n.headline || s.noHeadline}</span>
            <span className="block text-sm text-muted">{cv.header.city}</span>
          </span>
        </div>
        <p className="mt-4 font-semibold">{s.recruiterPreview}</p>
        <div className="mt-2 rounded-xl border border-line bg-surface p-4">
          <p className="text-lg font-bold">{name}</p>
          <p>{n.headline || s.noHeadline}</p>
          <p className="mt-3 whitespace-pre-line text-[0.95rem]">{n.about || "…"}</p>
          {n.skills.length > 0 && <p className="mt-3 text-sm text-muted">{n.skills.join(" · ")}</p>}
        </div>
      </section>

      {done && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
