"use client";
/**
 * Read a paper the smart way: a full article in a PDF viewer, every section folded to its first line. For each
 * question the learner taps the section where they would look; the right one opens with its key sentence
 * highlighted. A meter compares the minutes spent with reading everything.
 */
import { useState } from "react";
import type { PaperSkimTask } from "@/lib/research/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";

const paper = { fontFamily: "'Times New Roman', Georgia, serif" } as const;

function Paragraph({ text, keyLine }: { text: string; keyLine?: string }) {
  if (!keyLine || !text.includes(keyLine)) return <p className="mt-1.5 text-justify text-[0.8rem] leading-relaxed">{text}</p>;
  const [before, after] = text.split(keyLine);
  return (
    <p className="mt-1.5 text-justify text-[0.8rem] leading-relaxed">
      {before}
      <mark className="rounded-sm bg-[#fde68a] px-0.5">{keyLine}</mark>
      {after}
    </p>
  );
}

export function PaperSkim({ task, passed, onPass }: { task: PaperSkimTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.research.skim;
  const { reportAttempt } = useLesson();
  const [q, setQ] = useState(passed ? task.questions.length : 0);
  const [opened, setOpened] = useState<string[]>(passed ? task.questions.map((x) => x.answer) : []);
  const [wrong, setWrong] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const cur = task.questions[q];
  const done = q >= task.questions.length;

  // Reading time: the full 14-page article takes about 2.5 minutes a page; reading smart is the title and
  // abstract (1 minute) plus about a minute for each part you actually need.
  const minutesAll = 35;
  const minutesRead = 1 + opened.length;

  function tap(id: string) {
    if (done || answered) return;
    if (id === cur.answer) {
      setOpened((o) => (o.includes(id) ? o : [...o, id]));
      setWrong(null);
      setAnswered(true);
      reportAttempt(true, []);
    } else {
      setWrong(id);
      reportAttempt(false, [cur.question]);
    }
  }

  function next() {
    const n = q + 1;
    setQ(n);
    setAnswered(false);
    if (n >= task.questions.length) onPass();
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>

      {/* The question, pinned above the viewer. */}
      <div className="mt-3 rounded-xl bg-primary-soft p-4" aria-live="polite">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{done ? s.done : fmt(s.question, { n: q + 1, total: task.questions.length })}</p>
        <p className="mt-1 font-semibold">{done ? task.success : cur.question}</p>
        {!done && !answered && <p className="mt-1 text-sm text-muted">{s.tapSection}</p>}
      </div>
      {wrong && !answered && <Feedback kind="err" title={t.task.wrong} messages={[s.notThere]} />}
      {answered && cur && (
        <>
          <Feedback kind="ok" title={t.task.correct} messages={[cur.why]} />
          <button type="button" className="btn btn-primary mt-3 w-full" onClick={next}>
            {q + 1 < task.questions.length ? s.next : s.finish}
          </button>
        </>
      )}

      {/* PDF viewer */}
      <div className="mt-4 overflow-hidden rounded-xl bg-[#525659] shadow-[0_10px_30px_-14px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-2 bg-[#323639] px-3 py-2 text-[0.72rem] text-[#e8eaed]">
          <span className="truncate">📄 {task.paper.file}</span>
          <span className="shrink-0 tabular-nums">1 / 14 · 100%</span>
        </div>
        <div className="max-h-[34rem] overflow-y-auto p-3">
          <div className="mx-auto max-w-[34rem] rounded-sm bg-white px-4 py-5 text-[#202124] shadow" style={paper}>
            <p className="text-center text-[0.62rem] italic text-[#5f6368]">{task.paper.venue}</p>
            <h1 className="mt-2 text-center text-[1rem] font-bold leading-snug">{task.paper.title}</h1>
            <p className="mt-1 text-center text-[0.72rem]">{task.paper.authors}</p>
            <div className="mt-3 space-y-2">
              {task.paper.sections.map((sec) => {
                const isOpen = opened.includes(sec.id);
                const isWrong = wrong === sec.id;
                return (
                  <section key={sec.id} className={`rounded-md border-2 transition-colors ${isOpen ? "border-ok bg-[#f6fdf8]" : isWrong ? "border-err bg-err-soft" : "border-transparent hover:border-[#c7d2fe]"}`}>
                    <button type="button" onClick={() => tap(sec.id)} disabled={done || answered} className="block w-full px-2 py-1.5 text-left">
                      <span className="text-[0.8rem] font-bold uppercase tracking-wide">{sec.heading}</span>
                      {!isOpen && <span className="mt-0.5 block truncate text-[0.72rem] text-[#9aa0a6]">{sec.paragraphs[0]}</span>}
                    </button>
                    {isOpen && (
                      <div className="px-2 pb-2">
                        {sec.paragraphs.map((p, k) => (
                          <Paragraph key={k} text={p} keyLine={sec.key} />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Time meter */}
      <div className="mt-4 rounded-xl border border-line bg-surface p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-muted">⏱ {s.timeTitle}</p>
        <div className="mt-2 space-y-2 text-[0.85rem]">
          <div>
            <p className="flex justify-between">
              <span>{s.readingAll}</span>
              <span className="font-semibold tabular-nums">{fmt(s.minutes, { n: minutesAll })}</span>
            </p>
            <div className="mt-1 h-2 rounded-full bg-[#e5e7eb]">
              <div className="h-2 w-full rounded-full bg-[#9ca3af]" />
            </div>
          </div>
          <div>
            <p className="flex justify-between">
              <span>{s.readingSmart}</span>
              <span className="font-semibold tabular-nums text-ok">{fmt(s.minutes, { n: minutesRead })}</span>
            </p>
            <div className="mt-1 h-2 rounded-full bg-[#e5e7eb]">
              <div className="h-2 rounded-full bg-ok transition-all duration-500" style={{ width: `${Math.min(100, (minutesRead / minutesAll) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
