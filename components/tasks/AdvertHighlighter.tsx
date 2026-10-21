"use client";
import { useMemo, useState } from "react";
import type { AdvertHighlightTask, AdvertLabel } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "./Feedback";

type Choice = AdvertLabel | "none";
const LABELS: Choice[] = ["must", "nice", "deadline", "documents", "apply", "none"];
const COLORS: Record<Choice, string> = {
  must: "bg-[#fde2c8] border-[#b4471f]",
  nice: "bg-[#e3eefb] border-[#1a5fb4]",
  deadline: "bg-[#fbe3e6] border-[#a3261b]",
  documents: "bg-[#ece4f7] border-[#5b3a8c]",
  apply: "bg-ok-soft border-ok",
  none: "bg-[#eeeeea] border-[#8a8f8b]",
};

export function AdvertHighlighter({ task, passed, onPass }: { task: AdvertHighlightTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.advert;
  const { reportAttempt } = useLesson();
  // Every tappable phrase gets an index in reading order.
  const phrases = useMemo(
    () => task.advert.paragraphs.flatMap((p) => p.filter((part): part is Exclude<typeof part, string> => typeof part !== "string")),
    [task],
  );
  const [labels, setLabels] = useState<Record<number, Choice>>({});
  const [open, setOpen] = useState<number | null>(null);
  const [checked, setChecked] = useState(passed);
  const correctOf = (i: number): Choice => phrases[i].label ?? "none";

  const results = phrases.map((_, i) => labels[i] === correctOf(i));
  const score = results.filter(Boolean).length;
  const percent = Math.round((score / phrases.length) * 100);

  function check() {
    setChecked(true);
    const misses = phrases.filter((_, i) => !results[i]).map((p) => p.text);
    const ok = percent >= task.passPercent;
    reportAttempt(ok, misses);
    if (ok) onPass();
  }

  let index = -1;
  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
        {LABELS.map((l) => (
          <span key={l} className={`rounded-full border px-2 py-0.5 ${COLORS[l]}`}>
            {s.labels[l]}
          </span>
        ))}
      </div>

      <article className="card mt-3 p-4">
        <p className="text-sm text-muted">
          {task.advert.org} · {task.advert.location}
        </p>
        <h3 className="text-lg font-bold">{task.advert.title}</h3>
        {task.advert.paragraphs.map((para, pi) => (
          <p key={pi} className="mt-3 leading-loose">
            {para.map((part, k) => {
              if (typeof part === "string") return <span key={k}>{part}</span>;
              const i = ++index;
              const chosen = labels[i];
              const wrong = checked && chosen !== correctOf(i);
              return (
                <button
                  key={k}
                  type="button"
                  disabled={checked && !wrong}
                  onClick={() => setOpen(i)}
                  className={`mx-0.5 rounded border-b-2 px-1 text-left ${chosen ? COLORS[chosen] : "border-dashed border-primary bg-primary-soft"} ${
                    wrong ? "outline outline-2 outline-err" : ""
                  }`}
                >
                  {part.text}
                </button>
              );
            })}
          </p>
        ))}
      </article>

      {open !== null && (
        <div className="fixed inset-x-0 bottom-0 z-30 rounded-t-2xl border-t border-line bg-surface p-4 shadow-2xl" role="dialog" aria-label={s.choose}>
          <p className="font-semibold">“{phrases[open].text}”</p>
          <p className="mb-2 text-sm text-muted">{s.choose}</p>
          <div className="grid grid-cols-2 gap-2">
            {LABELS.map((l) => (
              <button
                key={l}
                type="button"
                className={`min-h-[52px] rounded-xl border-2 px-3 text-left font-semibold ${COLORS[l]}`}
                onClick={() => {
                  setLabels({ ...labels, [open]: l });
                  setOpen(null);
                  if (checked) setChecked(false);
                }}
              >
                {s.labels[l]}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-ghost mt-2 w-full" onClick={() => setOpen(null)}>
            {t.common.close}
          </button>
        </div>
      )}

      <p className="mt-3 text-sm text-muted">{fmt(s.progress, { n: Object.keys(labels).length, total: phrases.length })}</p>
      {!checked && (
        <button type="button" className="btn btn-secondary mt-2 w-full" onClick={check} disabled={Object.keys(labels).length < phrases.length}>
          {t.task.check}
        </button>
      )}
      {checked &&
        (percent >= task.passPercent ? (
          <Feedback kind="ok" title={fmt(s.score, { n: score, total: phrases.length })} messages={[task.success]} />
        ) : (
          <Feedback
            kind="err"
            title={fmt(s.score, { n: score, total: phrases.length })}
            messages={phrases.flatMap((p, i) => (results[i] ? [] : [`“${p.text}”: ${s.labels[correctOf(i)]}. ${p.why}`]))}
          />
        ))}
      {checked && percent < task.passPercent && <p className="mt-2 text-sm text-muted">{s.fixHint}</p>}
    </div>
  );
}
