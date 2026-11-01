"use client";
/**
 * The topic funnel: field → broad idea → who → where → angle → when. Each choice narrows the funnel and the
 * live result count drops, until the learner has a topic a supervisor can accept. The topic is saved for later steps.
 */
import { useState } from "react";
import type { TopicFunnelTask } from "@/lib/research/types";
import { estimateResults, groupDigits, readQuery } from "@/lib/research/search";
import { loadTopic, saveTopic } from "@/lib/research/store";
import { composeTopic, type Stage } from "@/lib/research/topic";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";

const STAGES: Stage[] = ["idea", "population", "place", "angle", "period"];

export function TopicFunnel({ task, passed, onPass }: { task: TopicFunnelTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.research.funnel;
  const { reportAttempt } = useLesson();
  const [field, setField] = useState<string | null>(null);
  const [parts, setParts] = useState<Partial<Record<Stage, string>>>({});
  const [own, setOwn] = useState("");
  const [title, setTitle] = useState<string | null>(null);
  const [saved, setSaved] = useState(passed);
  const [error, setError] = useState<string | null>(null);
  const f = task.fields.find((x) => x.id === field);
  const stage = STAGES.find((x) => !parts[x]);
  const draft = composeTopic(parts);
  const options: Record<Stage, string[]> = f ? { idea: f.ideas, population: f.populations, place: f.places, angle: f.angles, period: f.periods } : { idea: [], population: [], place: [], angle: [], period: [] };

  function choose(v: string) {
    if (!stage || !v.trim()) return;
    const next = { ...parts, [stage]: v.trim() };
    setParts(next);
    setOwn("");
    if (STAGES.every((x) => next[x])) setTitle(composeTopic(next));
  }

  function save() {
    const final = (title ?? draft).trim();
    const r = readQuery(final);
    const n = Object.values(r.facets).filter(Boolean).length;
    if (n < 3) {
      setError(fmt(s.needMore, { n }));
      reportAttempt(false, [final]);
      return;
    }
    setError(null);
    saveTopic({ field: f?.label, title: final });
    setSaved(true);
    reportAttempt(true, []);
    onPass();
  }

  if (saved) {
    const topic = typeof window === "undefined" ? null : loadTopic();
    return <Feedback kind="ok" title={t.task.correct} messages={[task.success, topic?.title ? fmt(s.yourTopic, { topic: topic.title }) : ""].filter(Boolean)} />;
  }

  // The funnel: one band per stage, narrowing as choices are made.
  const bands = [
    { label: s.field, value: f?.label },
    ...STAGES.map((x) => ({ label: s.stages[x], value: parts[x] })),
  ];
  const results = draft ? estimateResults(readQuery(draft)) : 0;

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>

      <div className="mt-4 rounded-2xl bg-[#141c33] p-4 text-white">
        <div className="flex flex-col items-center gap-1.5">
          {bands.map((b, i) => (
            <div
              key={b.label}
              className={`flex min-h-9 items-center justify-between gap-2 rounded-md px-3 py-1.5 text-[0.75rem] transition-all duration-500 ${b.value ? "bg-[#4338ca]" : "bg-white/10"}`}
              style={{ width: `${100 - i * 11}%` }}
            >
              <span className="shrink-0 font-semibold uppercase tracking-wide opacity-75">{b.label}</span>
              <span className="truncate text-right font-semibold">{b.value ?? "…"}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[0.75rem] uppercase tracking-wide opacity-70">{s.results}</p>
        <p className="text-center text-[1.6rem] font-semibold tabular-nums">{draft ? groupDigits(results) : "—"}</p>
        {draft && <p className="mt-2 text-center text-[0.9rem] italic opacity-90">“{draft}”</p>}
      </div>

      {!f ? (
        <div className="mt-4">
          <p className="font-semibold">{s.pickField}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {task.fields.map((x) => (
              <button key={x.id} type="button" onClick={() => setField(x.id)} className="min-h-11 rounded-full border-2 border-line bg-surface px-4 font-semibold hover:border-primary">
                {x.label}
              </button>
            ))}
          </div>
        </div>
      ) : stage ? (
        <div className="mt-4">
          <p className="font-semibold">{s.ask[stage]}</p>
          <p className="mt-1 text-sm text-muted">{s.why[stage]}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {options[stage].map((o) => (
              <button key={o} type="button" onClick={() => choose(o)} className="min-h-11 rounded-full border-2 border-line bg-surface px-4 text-left hover:border-primary">
                {o}
              </button>
            ))}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              choose(own);
            }}
          >
            <input value={own} onChange={(e) => setOwn(e.target.value)} placeholder={s.own} className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-line bg-surface px-3" />
            <button type="submit" className="btn btn-primary min-h-12 px-4" disabled={!own.trim()}>
              {s.add}
            </button>
          </form>
          <div className="mt-3 flex gap-4 text-sm">
            <button type="button" className="font-semibold text-primary" onClick={() => (Object.keys(parts).length ? setParts(Object.fromEntries(Object.entries(parts).slice(0, -1))) : setField(null))}>
              ← {s.undo}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p className="font-semibold">{s.polish}</p>
          <p className="mt-1 text-sm text-muted">{s.polishHelp}</p>
          <textarea value={title ?? draft} onChange={(e) => setTitle(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border-2 border-line bg-surface p-3" />
          {error && <Feedback kind="err" title={t.task.wrong} messages={[error]} />}
          <div className="mt-3 grid gap-2 min-[420px]:grid-cols-2">
            <button type="button" className="btn btn-secondary" onClick={() => (setParts({}), setTitle(null), setField(null))}>
              {s.restart}
            </button>
            <button type="button" className="btn btn-primary" onClick={save}>
              {s.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
