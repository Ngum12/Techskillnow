"use client";
/** Read an article, then fill a reading note: who, when, aim, method, finding, and how it helps your own project. */
import { useState } from "react";
import type { NoteCardTask } from "@/lib/research/types";
import type { Source } from "@/lib/research/search";
import sourcesJson from "@/content/research/sources.json" with { type: "json" };
import { useT } from "@/components/I18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";
import { ArticleView } from "./ArticleView";

const SOURCES = sourcesJson as Source[];
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function NoteCard({ task, passed, onPass }: { task: NoteCardTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.research.note;
  const { reportAttempt } = useLesson();
  const source = SOURCES.find((x) => x.id === task.sourceId)!;
  const [picks, setPicks] = useState<(number | null)[]>(() => task.fields.map((f) => (passed ? f.answer : null)));
  const [use, setUse] = useState("");
  const [checked, setChecked] = useState(passed);
  const wrong = task.fields.map((f, i) => picks[i] !== f.answer);
  const useOk = passed || words(use) >= 8;
  const allOk = checked && !wrong.some(Boolean) && useOk;

  function check() {
    setChecked(true);
    const bad = task.fields.filter((f, i) => picks[i] !== f.answer).map((f) => f.label);
    if (!useOk) bad.push("use");
    reportAttempt(bad.length === 0, bad);
    if (!bad.length) onPass();
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-[#dadce0] shadow-[0_8px_24px_-14px_rgba(32,33,36,0.35)]">
        <div className="flex items-center gap-1.5 bg-[#f1f3f4] px-3 py-2 text-[0.75rem]">
          <span aria-hidden="true">🔒</span>
          <span className="truncate">{source.url.replace(/ › /g, "/")}</span>
        </div>
        <div className="max-h-[26rem] overflow-y-auto">
          <ArticleView s={source} />
        </div>
      </div>

      {/* The note card, like an index card in a notebook. */}
      <div className="mt-5 rounded-2xl border border-[#e6d9a8] bg-[#fffdf3] p-4 shadow-[0_10px_24px_-18px_rgba(20,28,51,0.5)]">
        <p className="text-sm font-bold uppercase tracking-wide text-[#8a6d1f]">📇 {s.title}</p>
        <div className="mt-3 space-y-4">
          {task.fields.map((f, i) => (
            <div key={f.label}>
              <p className="text-[0.9rem] font-semibold">{f.label}</p>
              <div className="mt-1.5 grid gap-1.5">
                {f.options.map((o, k) => {
                  const state = checked && picks[i] === k ? (k === f.answer ? "ok" : "err") : null;
                  return (
                    <button
                      key={o}
                      type="button"
                      disabled={allOk}
                      onClick={() => (setPicks(picks.map((p, j) => (j === i ? k : p))), setChecked(false))}
                      className={`min-h-11 rounded-lg border-2 px-3 py-2 text-left text-[0.88rem] ${state === "ok" ? "border-ok bg-ok-soft" : state === "err" ? "border-err bg-err-soft" : picks[i] === k ? "border-primary bg-primary-soft" : "border-[#eadfb8] bg-white"}`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
              {checked && wrong[i] && picks[i] !== null && <p className="mt-1.5 text-sm text-err">{f.why}</p>}
            </div>
          ))}
          <div>
            <p className="text-[0.9rem] font-semibold">{s.use}</p>
            <textarea value={use} onChange={(e) => (setUse(e.target.value), setChecked(false))} rows={3} placeholder={s.usePlaceholder} className="mt-1.5 w-full rounded-lg border-2 border-[#eadfb8] bg-white p-3 text-[0.9rem]" disabled={allOk} />
            {checked && !useOk && <p className="mt-1 text-sm text-err">{s.useShort}</p>}
          </div>
        </div>
      </div>
      {!allOk && (
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={check} disabled={picks.some((p) => p === null)}>
          {t.task.check}
        </button>
      )}
      {allOk && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
