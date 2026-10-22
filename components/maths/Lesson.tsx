"use client";
/**
 * A maths lesson: the parts of the lesson rhythm one after the other (resumable), the skills map,
 * and the shared keypad. The step is passed when the final part (the mastery check) is done.
 */
import { useEffect, useMemo, useState } from "react";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import type { MathsLessonTask } from "@/content/types";
import type { ExamGenerator, Generator } from "@/lib/maths/types";
import { savePart, savedPart, skillLevel, skillRecords } from "@/lib/maths/mastery";
import { topics } from "@/content/maths/registry";
import { MathInputProvider } from "./MathInput";
import { HintsContext, Note } from "./Answer";
import {
  DiagnosticPart,
  DivisionPart,
  ExamPart,
  GapsPart,
  GeneratorsContext,
  GridPart,
  MasteryPart,
  NotebookPart,
  PaperPart,
  PracticePart,
  SayItBackPart,
  SeePart,
  SignsPart,
  TablePart,
  TrapsPart,
  WorkedPart,
} from "./Parts";

const LEVEL_DOTS = ["○○○", "●○○", "●●○", "●●●"];

function SkillsMap({ task, onClose }: { task: MathsLessonTask; onClose: () => void }) {
  const s = useT().maths.skills;
  const records = skillRecords();
  const byLesson = new Map<string, { id: string; name: string }[]>();
  for (const sk of task.topicSkills) byLesson.set(sk.lesson, [...(byLesson.get(sk.lesson) ?? []), sk]);
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" role="dialog" aria-modal="true" aria-label={s.title} onClick={onClose}>
      <div className="mx-auto max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-surface p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{s.title}</h2>
          <button type="button" className="btn btn-ghost min-h-11 px-3" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="text-sm text-muted">{s.help}</p>
        {[...byLesson.entries()].map(([lesson, skills]) => (
          <div key={lesson} className="mt-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">{lesson}</p>
            <ul className="mt-1 space-y-1">
              {skills.map((sk) => {
                const level = skillLevel(records[sk.id]);
                return (
                  <li key={sk.id} className="flex items-center justify-between gap-3 rounded-lg bg-bg px-3 py-2">
                    <span className={task.skills.some((x) => x.id === sk.id) ? "font-semibold" : ""}>{sk.name}</span>
                    <span className={`shrink-0 font-mono ${level === 3 ? "text-ok" : level ? "text-[#c98a00]" : "text-muted"}`} aria-label={s.levels[level]}>
                      {LEVEL_DOTS[level]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <p className="mt-4 text-xs text-muted">{s.legend}</p>
      </div>
    </div>
  );
}

export function MathsLesson({ task, passed, onPass }: { task: MathsLessonTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.maths.lesson;
  const [mod, setMod] = useState<{ generators: Generator[]; examGenerators: ExamGenerator[] } | null>(null);
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [showSkills, setShowSkills] = useState(false);
  const [complete, setComplete] = useState(passed);

  useEffect(() => {
    let alive = true;
    const load = topics[task.topic];
    if (!load) return setFailed(true);
    load()
      .then((m) => alive && setMod(m))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [task.topic]);

  // Resume where the learner stopped (this phone), unless the lesson is already complete.
  useEffect(() => {
    if (passed) return setFurthest(task.parts.length);
    const saved = Math.min(savedPart(task.lesson), task.parts.length - 1);
    setIndex(saved);
    setFurthest(saved);
  }, [task.lesson, task.parts.length, passed]);

  const gens = useMemo(
    () => ({
      gen: (id: string) => mod?.generators.find((g) => g.id === id),
      exam: (id: string) => mod?.examGenerators.find((g) => g.id === id),
    }),
    [mod],
  );
  const hints = useMemo(() => Object.fromEntries(task.misconceptions.map((m) => [m.id, m])), [task.misconceptions]);

  if (failed) return <Note kind="err">{t.learn.loadError}</Note>;
  if (!mod) return <p className="py-8 text-center text-muted">{t.common.loading}</p>;

  const part = task.parts[index];
  const skill = task.skills[0]?.id ?? task.lesson;
  function done() {
    const next = index + 1;
    if (next >= task.parts.length) {
      savePart(task.lesson, 0);
      setComplete(true);
      setFurthest(task.parts.length);
      onPass();
      return;
    }
    savePart(task.lesson, next);
    setFurthest((f) => Math.max(f, next));
    setIndex(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const body = (() => {
    const props = { onDone: done, skill };
    switch (part.kind) {
      case "see":
        return <SeePart part={part} {...props} />;
      case "paper":
        return <PaperPart part={part} {...props} />;
      case "worked":
        return <WorkedPart part={part} {...props} />;
      case "gaps":
        return <GapsPart part={part} {...props} />;
      case "division":
        return <DivisionPart part={part} {...props} />;
      case "table":
        return <TablePart part={part} {...props} />;
      case "grid":
        return <GridPart part={part} {...props} />;
      case "signs":
        return <SignsPart part={part} {...props} />;
      case "practice":
        return <PracticePart part={part} {...props} />;
      case "traps":
        return <TrapsPart part={part} {...props} />;
      case "exam":
        return <ExamPart part={part} {...props} />;
      case "sayItBack":
        return <SayItBackPart part={part} {...props} />;
      case "notebook":
        return <NotebookPart part={part} {...props} />;
      case "mastery":
        return <MasteryPart part={part} {...props} />;
      case "diagnostic":
        return <DiagnosticPart part={part} {...props} />;
    }
  })();

  return (
    <GeneratorsContext.Provider value={gens}>
      <HintsContext.Provider value={hints}>
        <MathInputProvider>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-muted">{fmt(s.part, { n: index + 1, total: task.parts.length })}</p>
            <button type="button" className="btn btn-ghost min-h-11 px-2 text-sm" onClick={() => setShowSkills(true)}>
              📊 {t.maths.skills.button}
            </button>
          </div>
          <ol className="mt-1 flex gap-1 overflow-x-auto pb-1" aria-label={s.rhythm}>
            {task.parts.map((p, i) => (
              <li key={i}>
                <button
                  type="button"
                  disabled={i > furthest}
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? "step" : undefined}
                  className={`min-h-9 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold ${i === index ? "bg-primary text-white" : i < furthest || complete ? "bg-ok-soft text-ok" : "bg-bg text-muted"}`}
                >
                  {i < furthest || complete ? "✓ " : ""}
                  {p.title}
                </button>
              </li>
            ))}
          </ol>
          {complete && index === 0 && furthest >= task.parts.length && <Note kind="ok">✓ {s.lessonDone}</Note>}
          <h3 className="mt-3 text-xl font-bold">{part.title}</h3>
          <div className="mt-2" key={`${task.lesson}-${index}`}>
            {body}
          </div>
          {showSkills && <SkillsMap task={task} onClose={() => setShowSkills(false)} />}
        </MathInputProvider>
      </HintsContext.Provider>
    </GeneratorsContext.Provider>
  );
}
