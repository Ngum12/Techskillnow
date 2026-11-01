"use client";
/** Leaf through a complete sample project, page by page, with a note on each; then say where things belong. */
import { useState } from "react";
import type { ProjectAnatomyTask } from "@/lib/research/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";

const paper = { fontFamily: "'Times New Roman', Georgia, serif" } as const;
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

function pageNumber(task: ProjectAnatomyTask, i: number): string {
  const first = task.pages.findIndex((p) => p.id.startsWith("ch"));
  return first >= 0 && i >= first ? String(i - first + 1) : (ROMAN[i - 1] ?? "");
}

function Page({ task, i }: { task: ProjectAnatomyTask; i: number }) {
  const pg = task.pages[i];
  const pj = task.project;
  if (pg.id === "cover") {
    return (
      <div className="flex h-full flex-col items-center text-center" style={paper}>
        <p className="text-[0.62rem] font-bold uppercase leading-tight">{pj.university}</p>
        <p className="text-[0.58rem] uppercase">{pj.department}</p>
        <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#7a1f2b] text-[0.7rem] font-bold text-[#7a1f2b]">{pj.university.charAt(0)}</div>
        <p className="mt-4 text-[0.82rem] font-bold uppercase leading-snug">{pj.title}</p>
        <p className="mt-4 text-[0.6rem] italic leading-snug">{fmt(task.pages[0].body[0] ?? "", { degree: pj.degree })}</p>
        <p className="mt-4 text-[0.6rem]">{task.pages[0].body[1]}</p>
        <p className="text-[0.72rem] font-bold">{pj.student}</p>
        <p className="text-[0.6rem]">{pj.matricule}</p>
        <p className="mt-3 text-[0.6rem]">{task.pages[0].body[2]}</p>
        <p className="text-[0.66rem] font-bold">{pj.supervisor}</p>
        <p className="mt-auto text-[0.62rem] font-bold">{pj.date}</p>
      </div>
    );
  }
  return (
    <div className="h-full" style={paper}>
      <p className={`text-center font-bold uppercase ${pg.id.startsWith("ch") ? "text-[0.7rem]" : "text-[0.8rem]"}`}>{pg.label}</p>
      <div className="mt-3 space-y-1.5">
        {pg.body.map((line, k) =>
          line.startsWith("#") ? (
            <p key={k} className="pt-1 text-[0.66rem] font-bold">
              {line.slice(1).trim()}
            </p>
          ) : line === "~" ? (
            <div key={k} className="space-y-1" aria-hidden="true">
              {[92, 100, 96, 70].map((w, j) => (
                <div key={j} className="h-[3px] rounded bg-[#d9d4c7]" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <p key={k} className="text-[0.62rem] leading-snug">
              {line}
            </p>
          ),
        )}
      </div>
      {/* Preliminary pages are numbered i, ii, iii…; numbering starts again at 1 with chapter one. */}
      <p className="absolute bottom-2 left-0 right-0 text-center text-[0.55rem] text-muted">{pageNumber(task, i)}</p>
    </div>
  );
}

export function ProjectAnatomy({ task, passed, onPass }: { task: ProjectAnatomyTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.research.anatomy;
  const { reportAttempt } = useLesson();
  const [i, setI] = useState(0);
  const [seen, setSeen] = useState(passed ? task.pages.length - 1 : 0);
  const [q, setQ] = useState(passed ? task.quiz.length : 0);
  const [picked, setPicked] = useState<string | null>(null);
  const pg = task.pages[i];
  const readAll = seen >= task.pages.length - 1;
  const cur = task.quiz[q];
  const right = picked !== null && cur && picked === cur.answer;

  const go = (n: number) => {
    const v = Math.max(0, Math.min(task.pages.length - 1, n));
    setI(v);
    setSeen((x) => Math.max(x, v));
  };

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>

      {/* The bound project, one page at a time. */}
      <div className="mt-4 rounded-2xl bg-[#e9e5dc] p-4">
        <div className="relative mx-auto aspect-[1/1.414] w-full max-w-[17rem] rounded-sm bg-white p-5 shadow-[0_18px_30px_-18px_rgba(20,28,51,0.6)]">
          <Page task={task} i={i} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" className="btn btn-secondary min-h-11 bg-white px-4 py-2" disabled={i === 0} onClick={() => go(i - 1)} aria-label={s.prev}>
            ←
          </button>
          <p className="text-center text-sm font-semibold">{fmt(s.pageOf, { n: i + 1, total: task.pages.length, label: pg.label })}</p>
          <button type="button" className="btn btn-primary min-h-11 px-4 py-2" disabled={i === task.pages.length - 1} onClick={() => go(i + 1)} aria-label={s.next}>
            →
          </button>
        </div>
        <div className="-mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {task.pages.map((p, k) => (
            <button key={p.id} type="button" onClick={() => go(k)} className={`shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${k === i ? "bg-[#141c33] text-white" : k <= seen ? "bg-white text-ink" : "bg-white/50 text-muted"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-primary bg-primary-soft p-3 text-[0.92rem]">{pg.note}</div>

      {readAll && cur && (
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">{fmt(s.quiz, { n: q + 1, total: task.quiz.length })}</p>
          <p className="mt-1 font-semibold">{cur.question}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {task.pages
              .filter((p) => p.id !== "cover")
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (right) return;
                    setPicked(p.id);
                    reportAttempt(p.id === cur.answer, p.id === cur.answer ? [] : [cur.question]);
                  }}
                  className={`min-h-10 rounded-full border-2 px-3 text-sm font-semibold ${picked === p.id ? (p.id === cur.answer ? "border-ok bg-ok-soft" : "border-err bg-err-soft") : "border-line bg-surface"}`}
                >
                  {p.label}
                </button>
              ))}
          </div>
          {picked !== null && (right ? <Feedback kind="ok" title={t.task.correct} messages={[cur.why]} /> : <Feedback kind="err" title={t.task.wrong} messages={[s.look]} />)}
          {right && (
            <button
              type="button"
              className="btn btn-primary mt-4 w-full"
              onClick={() => {
                setQ(q + 1);
                setPicked(null);
                if (q + 1 >= task.quiz.length) onPass();
              }}
            >
              {q + 1 < task.quiz.length ? s.nextQuestion : s.finish}
            </button>
          )}
        </div>
      )}
      {!readAll && <p className="mt-4 text-center text-sm text-muted">{s.readAll}</p>}
      {(passed || q >= task.quiz.length) && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
