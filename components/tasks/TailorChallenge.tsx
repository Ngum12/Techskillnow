"use client";
import { useMemo, useState } from "react";
import type { TailorTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import { ReorderList } from "@/components/cv/ReorderList";
import { cvText, withTailoring } from "@/lib/cv/model";
import { scoreCv } from "@/lib/cv/keywords";
import { ScoreBar } from "./KeywordMatcher";
import { Feedback } from "./Feedback";

/** One CV, two very different adverts: reorder skills and rewrite the profile for each; both scores must go up. */
export function TailorChallenge({ task, passed, onPass }: { task: TailorTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.tailor;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const [tab, setTab] = useState(0);
  const [done, setDone] = useState(passed);
  const [tried, setTried] = useState(false);

  const baselines = useMemo(
    () => (store ? task.adverts.map((a) => scoreCv(a.terms, cvText(withTailoring({ ...store.cv, tailored: {} }))).score) : []),
    // Baseline = the untailored CV when the step opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [task, store?.status],
  );
  if (!store) return null;
  const cv = store.cv;
  const advert = task.adverts[tab];
  const version = cv.tailored[advert.id] ?? { profile: cv.profile, skills: cv.skills.map((k) => k.id) };
  const skillIds = [...version.skills.filter((id) => cv.skills.some((k) => k.id === id)), ...cv.skills.filter((k) => !version.skills.includes(k.id)).map((k) => k.id)];
  const scores = task.adverts.map((a) => scoreCv(a.terms, cvText(withTailoring(cv, a.id))));
  // A CV already at 100% cannot go higher, so a perfect tailored score counts too.
  const improved = task.adverts.map((a, i) => !!cv.tailored[a.id] && (scores[i].score > baselines[i] || scores[i].score === 100));

  function save(patch: Partial<{ profile: string; skills: string[] }>) {
    store!.update((x) => ({ ...x, tailored: { ...x.tailored, [advert.id]: { profile: version.profile, skills: skillIds, ...patch } } }));
  }

  function check() {
    setTried(true);
    const ok = improved.every(Boolean);
    reportAttempt(ok, task.adverts.filter((_, i) => !improved[i]).map((a) => a.title));
    if (ok) {
      setDone(true);
      onPass();
    }
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <div className="mt-3 grid grid-cols-2 gap-2" role="tablist">
        {task.adverts.map((a, i) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={`min-h-[56px] rounded-xl border-2 px-3 py-2 text-left text-sm ${tab === i ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}
          >
            <span className="block font-semibold">{a.title}</span>
            <span className="block text-muted">
              {baselines[i]}% → {scores[i].score}% {improved[i] ? "✓" : ""}
            </span>
          </button>
        ))}
      </div>

      <details className="card mt-3 p-3">
        <summary className="cursor-pointer font-semibold text-primary">
          {s.readAdvert}: {advert.org}
        </summary>
        <p className="mt-2 whitespace-pre-line text-[0.95rem]">{advert.text}</p>
      </details>

      <div className="mt-4">
        <ScoreBar score={scores[tab].score} label={fmt(s.scoreFor, { before: baselines[tab] })} />
        {scores[tab].missing.length > 0 && <p className="mt-2 text-sm text-muted">{fmt(s.missing, { terms: scores[tab].missing.join(", ") })}</p>}
      </div>

      <p className="mt-5 font-semibold">1. {s.reorder}</p>
      <p className="mb-2 text-sm text-muted">{s.reorderHelp}</p>
      {cv.skills.length ? (
        <ReorderList items={skillIds.map((id) => ({ id, label: cv.skills.find((k) => k.id === id)?.name || "—" }))} onChange={(ids) => save({ skills: ids })} />
      ) : (
        <p className="text-muted">{s.noSkills}</p>
      )}

      <label className="mt-5 block">
        <span className="label">2. {s.rewrite}</span>
        <textarea className="input min-h-32" value={version.profile} onChange={(e) => save({ profile: e.target.value })} />
      </label>
      <p className="mt-1 text-sm text-muted">{s.truthful}</p>

      {!done && (
        <button type="button" className="btn btn-secondary mt-4 w-full" onClick={check}>
          {t.task.check}
        </button>
      )}
      {!done && improved.some((x) => !x) && improved.some(Boolean) && <p className="mt-2 text-sm text-muted">{s.bothNeeded}</p>}
      {done ? (
        <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />
      ) : (
        tried &&
        improved.some((x) => !x) && (
          <Feedback kind="err" title={t.task.tryAgain} messages={task.adverts.filter((_, i) => !improved[i]).map((a) => fmt(s.notImproved, { title: a.title }))} />
        )
      )}
    </div>
  );
}
