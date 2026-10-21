"use client";
import { useState } from "react";
import type { ChemTourTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";
import { Beaker, Burette, Flask, Funnel, IndicatorBottle, Pipette, Stand, Tile, WashBottle } from "./Apparatus";

/** Where each piece sits on the bench, and the box that responds to a tap. */
const LAYOUT: Record<string, { at: [number, number]; scale?: number; box: [number, number, number, number] }> = {
  burette: { at: [62, 12], scale: 0.86, box: [44, 0, 40, 262] },
  flask: { at: [36, 254], box: [32, 248, 72, 76] },
  tile: { at: [24, 326], box: [18, 318, 96, 16] },
  pipette: { at: [150, 30], scale: 1, box: [138, 20, 40, 156] },
  funnel: { at: [214, 40], box: [204, 30, 56, 56] },
  indicator: { at: [292, 36], box: [282, 26, 50, 60] },
  washBottle: { at: [148, 252], box: [140, 238, 72, 96] },
  acidBeaker: { at: [228, 276], box: [218, 266, 62, 68] },
  alkaliBeaker: { at: [290, 276], box: [282, 266, 62, 68] },
};

export function BenchScene({ selected, onPick, labels }: { selected?: string | null; onPick: (id: string) => void; labels: { acid: string; alkali: string; names: Record<string, string> } }) {
  const hl = (id: string) => selected === id;
  const place = (id: string, child: React.ReactNode) => {
    const l = LAYOUT[id];
    return (
      <g
        key={id}
        role="button"
        tabIndex={0}
        aria-label={labels.names[id]}
        aria-pressed={hl(id)}
        onClick={() => onPick(id)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPick(id)}
        style={{ cursor: "pointer", outline: "none" }}
      >
        <rect x={l.box[0]} y={l.box[1]} width={l.box[2]} height={l.box[3]} rx={8} fill={hl(id) ? "rgba(29,84,64,0.08)" : "transparent"} />
        <g transform={`translate(${l.at[0]} ${l.at[1]}) scale(${l.scale ?? 1})`}>{child}</g>
      </g>
    );
  };
  return (
    <svg viewBox="0 0 360 340" className="block w-full select-none rounded-xl border border-line bg-[#fbfcfd]" style={{ touchAction: "manipulation" }}>
      <rect x={0} y={332} width={360} height={8} fill="#d9cbb5" />
      <g transform="translate(62 12) scale(0.86)">
        <Stand height={372} />
      </g>
      {place("burette", <Burette level={2} highlight={hl("burette")} />)}
      {place("tile", <Tile width={92} />)}
      {place("flask", <Flask fill={0.4} colour="#e0368a" highlight={hl("flask")} />)}
      {place("pipette", <Pipette highlight={hl("pipette")} />)}
      {place("funnel", <Funnel highlight={hl("funnel")} />)}
      {place("indicator", <IndicatorBottle highlight={hl("indicator")} />)}
      {place("washBottle", <WashBottle highlight={hl("washBottle")} />)}
      {place("acidBeaker", <Beaker label={labels.acid} colour="#dbeaf5" highlight={hl("acidBeaker")} />)}
      {place("alkaliBeaker", <Beaker label={labels.alkali} colour="#eef0d9" highlight={hl("alkaliBeaker")} />)}
    </svg>
  );
}

/** Step 1: tap each piece to learn it, then choose the right apparatus for each task by tapping it. */
export function ChemTour({ task, passed, onPass }: { task: ChemTourTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.chem.tour;
  const { reportAttempt } = useLesson();
  const [seen, setSeen] = useState<string[]>(passed ? task.items.map((i) => i.id) : []);
  const [selected, setSelected] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<number | null>(passed ? task.tasks.length : null);
  const [wrong, setWrong] = useState<string | null>(null);
  const names = Object.fromEntries(task.items.map((i) => [i.id, i.name]));
  const item = task.items.find((i) => i.id === selected);
  const allSeen = seen.length >= task.items.length;
  const current = quiz !== null && quiz < task.tasks.length ? task.tasks[quiz] : null;

  function pick(id: string) {
    setSelected(id);
    if (quiz === null) {
      if (!seen.includes(id)) setSeen([...seen, id]);
      return;
    }
    if (!current) return;
    const ok = id === current.answer;
    reportAttempt(ok, ok ? [] : [`${current.task} → ${id}`]);
    if (!ok) return setWrong(id);
    setWrong(null);
    const next = quiz + 1;
    setQuiz(next);
    setSelected(null);
    if (next >= task.tasks.length) onPass();
  }

  return (
    <div>
      <p className="font-semibold">{quiz === null ? task.instruction : s.quizIntro}</p>
      {current && (
        <p className="mt-3 rounded-xl bg-primary-soft p-3 text-lg font-bold" aria-live="polite">
          {fmt(s.question, { n: quiz! + 1, total: task.tasks.length })} {current.task}
        </p>
      )}
      <div className="mt-3">
        <BenchScene selected={selected} onPick={pick} labels={{ acid: s.acid, alkali: s.alkali, names }} />
      </div>
      {quiz === null && (
        <>
          <p className="mt-2 text-center text-sm text-muted">{fmt(s.progress, { n: seen.length, total: task.items.length })}</p>
          {item ? (
            <div className="card mt-3 p-4" aria-live="polite">
              <p className="text-lg font-bold">{item.name}</p>
              <p className="mt-1">{item.use}</p>
            </div>
          ) : (
            <p className="mt-3 rounded-xl bg-bg p-3 text-center">{s.tapHint}</p>
          )}
          <button type="button" className="btn btn-primary mt-4 w-full" disabled={!allSeen} onClick={() => (setQuiz(0), setSelected(null))}>
            {allSeen ? s.startQuiz : fmt(s.seeAll, { n: task.items.length - seen.length })}
          </button>
        </>
      )}
      {current && wrong && <Feedback kind="err" title={t.task.tryAgain} messages={[fmt(s.notThat, { name: names[wrong] ?? wrong })]} />}
      {quiz !== null && quiz > 0 && quiz <= task.tasks.length && <p className="mt-3 text-sm text-ok">✓ {task.tasks[quiz - 1].why}</p>}
      {quiz !== null && quiz >= task.tasks.length && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
