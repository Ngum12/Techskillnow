"use client";
/**
 * Lesson parts for the Functions topic: the function machine, the transformation playground and
 * sketch-and-compare.
 */
import { useContext, useMemo, useState } from "react";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { newSeed } from "@/lib/maths/rng";
import { runGenerator } from "@/lib/maths/run";
import { recordSkill } from "@/lib/maths/mastery";
import { describeSingle } from "@/lib/maths/functions";
import type { LessonPart } from "@/lib/maths/types";
import { MathText } from "./Tex";
import { Graph } from "./Graph";
import { FunctionMachine } from "./FunctionVisuals";
import { AnswerSet, Note } from "./Answer";
import { GeneratorsContext } from "./Parts";

type Part<K extends LessonPart["kind"]> = Extract<LessonPart, { kind: K }>;
type PartProps<K extends LessonPart["kind"]> = { part: Part<K>; onDone: () => void; skill: string };

function Questions({ questions, onDone }: { questions: { prompt: string; options: string[]; answer: number; explain: string }[]; onDone: () => void }) {
  const t = useT();
  const [q, setQ] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const cur = questions[q];
  if (!cur)
    return (
      <button type="button" className="btn btn-primary mt-4 w-full" onClick={onDone}>
        {t.maths.lesson.continue}
      </button>
    );
  const ok = picked === cur.answer;
  return (
    <div className="mt-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">{fmt(t.maths.lesson.question, { n: q + 1, total: questions.length })}</p>
      <p className="mt-1 font-semibold">
        <MathText text={cur.prompt} />
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {cur.options.map((o, i) => (
          <button key={i} type="button" disabled={ok} onClick={() => setPicked(i)} className={`min-h-12 rounded-xl border-2 px-3 py-2 text-left ${picked === i ? (i === cur.answer ? "border-ok bg-ok-soft" : "border-[#c98a00] bg-warn-soft") : "border-line bg-surface"}`}>
            <MathText text={o} />
          </button>
        ))}
      </div>
      {picked !== null && !ok && <p className="mt-2 text-sm">{t.maths.answer.tryOther}</p>}
      {ok && (
        <>
          <Note kind="ok">
            <MathText text={cur.explain} />
          </Note>
          <button type="button" className="btn btn-primary mt-3 w-full" onClick={() => (q + 1 < questions.length ? (setQ(q + 1), setPicked(null)) : onDone())}>
            {q + 1 < questions.length ? t.maths.lesson.nextQuestion : t.maths.lesson.continue}
          </button>
        </>
      )}
    </div>
  );
}

/* ---------- Function machine ---------- */

export function MachinePart({ part, onDone }: PartProps<"machine">) {
  return (
    <div>
      <p>
        <MathText text={part.text} />
      </p>
      <div className="mt-3">
        <FunctionMachine machines={part.machines} order={part.order} backwards={part.backwards} />
      </div>
      <Questions questions={part.questions} onDone={onDone} />
    </div>
  );
}

/* ---------- Transformation playground ---------- */

const SLIDERS = {
  shiftY: { param: "D", min: -4, max: 4, step: 1, value: 0 },
  shiftX: { param: "C", min: -4, max: 4, step: 1, value: 0 },
  stretchY: { param: "A", min: 0.5, max: 3, step: 0.5, value: 1 },
  stretchX: { param: "B", min: 0.5, max: 3, step: 0.5, value: 1 },
} as const;

export function TransformPart({ part, onDone }: PartProps<"transform">) {
  const t = useT();
  const s = t.maths.transform;
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [vals, setVals] = useState<Record<string, number>>({ A: 1, B: 1, C: 0, D: 0 });
  const A = (flipX ? -1 : 1) * vals.A;
  const B = (flipY ? -1 : 1) * vals.B;
  // The graph reads A, B, C, D as parameters; the key changes each time so it redraws with the new values.
  const spec = useMemo(
    () => ({
      x: part.x,
      y: part.y,
      curves: [{ expr: part.base }],
      params: [
        { name: "A", label: "A", min: -3, max: 3, step: 0.5, value: A },
        { name: "B", label: "B", min: -3, max: 3, step: 0.5, value: B },
        { name: "C", label: "C", min: -4, max: 4, step: 1, value: vals.C },
        { name: "D", label: "D", min: -4, max: 4, step: 1, value: vals.D },
      ],
      transform: { points: part.points },
      hideSliders: true,
    }),
    [part, A, B, vals.C, vals.D],
  );
  const descriptions = [
    vals.D !== 0 && describeSingle("up", vals.D),
    vals.C !== 0 && describeSingle("inside", vals.C),
    vals.A !== 1 && describeSingle("stretchY", vals.A),
    vals.B !== 1 && describeSingle("stretchX", vals.B),
    flipX && describeSingle("reflectX"),
    flipY && describeSingle("reflectY"),
  ].filter(Boolean) as string[];

  return (
    <div>
      <p>
        <MathText text={part.text} />
      </p>
      <div className="mt-3">
        <Graph key={`${A}|${B}|${vals.C}|${vals.D}`} spec={spec} />
      </div>
      <div className="mt-3 space-y-1 rounded-xl bg-bg p-3">
        {part.sliders.map((k) =>
          k === "reflectX" || k === "reflectY" ? (
            <label key={k} className="flex min-h-11 items-center gap-3">
              <input type="checkbox" className="h-6 w-6 accent-primary" checked={k === "reflectX" ? flipX : flipY} onChange={(e) => (k === "reflectX" ? setFlipX : setFlipY)(e.target.checked)} />
              <span className="font-semibold">
                <MathText text={s.labels[k]} />
              </span>
            </label>
          ) : (
            <label key={k} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-sm font-semibold">
                <MathText text={fmt(s.labels[k], { v: vals[SLIDERS[k].param] })} />
              </span>
              <input type="range" className="h-11 flex-1 accent-primary" min={SLIDERS[k].min} max={SLIDERS[k].max} step={SLIDERS[k].step} value={vals[SLIDERS[k].param]} onChange={(e) => setVals((v) => ({ ...v, [SLIDERS[k].param]: Number(e.target.value) }))} />
            </label>
          ),
        )}
      </div>
      <div className="mt-3 rounded-xl border border-line bg-surface p-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{s.describe}</p>
        {descriptions.length ? (
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {descriptions.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-muted">{s.none}</p>
        )}
      </div>
      <Questions questions={part.questions} onDone={onDone} />
    </div>
  );
}

/* ---------- Sketch on paper, then compare ---------- */

export function SketchPart({ part, onDone, skill }: PartProps<"sketch">) {
  const t = useT();
  const s = t.maths.sketch;
  const { gen } = useContext(GeneratorsContext);
  const [seed, setSeed] = useState(newSeed);
  const g = gen(part.generator);
  const q = useMemo(() => (g ? runGenerator(g, seed) : null), [g, seed]);
  const [revealed, setRevealed] = useState(false);
  const [ticks, setTicks] = useState<boolean[]>([]);
  const [answered, setAnswered] = useState(false);
  if (!q?.sketch) return null;
  const features = q.sketch.features;

  return (
    <div>
      <div className="rounded-2xl border-2 border-[#b9a77a] bg-[#fffdf5] p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8a6d1f]">✏️ {s.title}</p>
        <p className="mt-1 font-semibold">
          <MathText text={q.prompt} />
        </p>
        <p className="mt-1 text-sm">{s.instruction}</p>
        {!revealed && (
          <button type="button" className="btn btn-primary mt-3 w-full" onClick={() => setRevealed(true)}>
            {s.reveal}
          </button>
        )}
      </div>
      {revealed && (
        <div className="mt-3">
          <Graph spec={q.sketch.graph} />
          <p className="mt-3 font-semibold">{s.checklist}</p>
          <ul className="mt-1 space-y-1">
            {features.map((f, i) => (
              <li key={f}>
                <label className="flex min-h-11 items-start gap-3">
                  <input type="checkbox" className="mt-1 h-6 w-6 accent-primary" checked={!!ticks[i]} onChange={(e) => setTicks((tk) => features.map((_, j) => (j === i ? e.target.checked : !!tk[j])))} />
                  <span>
                    <MathText text={f} />
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {q.answers.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold">{s.check}</p>
              <div className="mt-2">
                <AnswerSet key={seed} q={q} onResult={(ok) => ok && setAnswered(true)} />
              </div>
            </div>
          )}
          {(answered || q.answers.length === 0) && (
            <>
              <Note kind={ticks.filter(Boolean).length === features.length ? "ok" : "info"}>{fmt(s.score, { n: ticks.filter(Boolean).length, total: features.length })}</Note>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSeed(newSeed());
                    setRevealed(false);
                    setTicks([]);
                    setAnswered(false);
                  }}
                >
                  {s.another}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    for (let i = 0; i < ticks.filter(Boolean).length; i++) recordSkill(skill, "self");
                    onDone();
                  }}
                >
                  {t.maths.lesson.continue}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
