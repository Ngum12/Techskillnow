"use client";
/** The parts of a maths lesson, in the order of the lesson rhythm. Each calls onDone() when complete. */
import { createContext, useContext, useMemo, useRef, useState } from "react";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { newSeed } from "@/lib/maths/rng";
import { runExam, runGenerator } from "@/lib/maths/run";
import { checkAnswer } from "@/lib/maths/answer";
import { latexToLinear, sameLine } from "@/lib/maths/equiv";
import { tryParse } from "@/lib/maths/expr";
import { markExam, type ExamResult } from "@/lib/maths/exam";
import { recordSkill } from "@/lib/maths/mastery";
import { pointMet } from "@/lib/chem/marking";
import type { ExamGenerator, Generator, LessonPart, NotebookModel, Question } from "@/lib/maths/types";
import { MathField } from "./MathInput";
import { MathText, Tex } from "./Tex";
import { AnswerSet, ModelLine, Note, PaperMoment, StepWork } from "./Answer";
import { Graph } from "./Graph";
import { AreaModel, DivisionView, SignTable } from "./Visuals";
import { QuestionVisual } from "./FunctionVisuals";
import type { Sign } from "@/lib/maths/types";

type Gens = { gen: (id: string) => Generator | undefined; exam: (id: string) => ExamGenerator | undefined };
export const GeneratorsContext = createContext<Gens>({ gen: () => undefined, exam: () => undefined });

type Part<K extends LessonPart["kind"]> = Extract<LessonPart, { kind: K }>;
type PartProps<K extends LessonPart["kind"]> = { part: Part<K>; onDone: () => void; skill: string };

function useQuestion(id: string): [Question | null, () => void] {
  const { gen } = useContext(GeneratorsContext);
  const [seed, setSeed] = useState(newSeed);
  const g = gen(id);
  const q = useMemo(() => (g ? runGenerator(g, seed) : null), [g, seed]);
  return [q, () => setSeed(newSeed())];
}

function Choices({ options, answer, onCorrect, explain }: { options: string[]; answer: number; onCorrect: () => void; explain: string }) {
  const t = useT();
  const [picked, setPicked] = useState<number | null>(null);
  const ok = picked === answer;
  return (
    <div>
      <div className="flex flex-col gap-2">
        {options.map((o, i) => (
          <button
            key={i}
            type="button"
            disabled={ok}
            onClick={() => {
              setPicked(i);
              if (i === answer) onCorrect();
            }}
            className={`min-h-12 rounded-xl border-2 px-3 py-2 text-left ${picked === i ? (i === answer ? "border-ok bg-ok-soft" : "border-[#c98a00] bg-warn-soft") : "border-line bg-surface"}`}
          >
            <MathText text={o} />
          </button>
        ))}
      </div>
      {picked !== null && !ok && <p className="mt-2 text-sm">{t.maths.answer.tryOther}</p>}
      {ok && (
        <Note kind="ok">
          <MathText text={explain} />
        </Note>
      )}
    </div>
  );
}

/* ---------- 1–2. See it, understand why ---------- */

export function SeePart({ part, onDone }: PartProps<"see">) {
  const t = useT();
  const [q, setQ] = useState(0);
  const [answered, setAnswered] = useState(false);
  const cur = part.questions[q];
  return (
    <div>
      <p>
        <MathText text={part.text} />
      </p>
      <div className="mt-3">{part.graph ? <Graph spec={part.graph} /> : part.visual === "area" ? <AreaModel /> : null}</div>
      {cur && (
        <div className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">{fmt(t.maths.lesson.question, { n: q + 1, total: part.questions.length })}</p>
          <p className="mt-1 font-semibold">
            <MathText text={cur.prompt} />
          </p>
          <div className="mt-2">
            <Choices key={q} options={cur.options} answer={cur.answer} explain={cur.explain} onCorrect={() => setAnswered(true)} />
          </div>
          {answered && (
            <button type="button" className="btn btn-primary mt-3 w-full" onClick={() => (q + 1 < part.questions.length ? (setQ(q + 1), setAnswered(false)) : onDone())}>
              {q + 1 < part.questions.length ? t.maths.lesson.nextQuestion : t.maths.lesson.continue}
            </button>
          )}
        </div>
      )}
      {!cur && (
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={onDone}>
          {t.maths.lesson.continue}
        </button>
      )}
    </div>
  );
}

/* ---------- PaperMoment on its own (copy a definition, sketch a graph) ---------- */

export function PaperPart({ part, onDone, skill }: PartProps<"paper">) {
  return (
    <PaperMoment
      instruction={part.instruction}
      lines={part.lines}
      onDone={(ticked) => {
        for (let i = 0; i < ticked; i++) recordSkill(skill, "self");
        onDone();
      }}
    />
  );
}

/* ---------- 3. Do it with me ---------- */

export function WorkedPart({ part, onDone }: PartProps<"worked">) {
  const t = useT();
  const s = t.maths.lesson;
  const { gen } = useContext(GeneratorsContext);
  const q = useMemo(() => {
    const g = part.generator ? gen(part.generator) : undefined;
    return g ? runGenerator(g, part.seed ?? newSeed()) : null;
  }, [gen, part]);
  const prompt = part.prompt ?? q?.prompt ?? "";
  const lines = part.lines ?? q?.solution ?? [];
  const [shown, setShown] = useState(1);
  return (
    <div>
      <div className="rounded-2xl border-2 border-[#b9a77a] bg-[#fffdf5] p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8a6d1f]">✏️ {s.copyThis}</p>
        <p className="mt-1 font-semibold">
          <MathText text={prompt} />
        </p>
      </div>
      {q?.division && (
        <div className="mt-3">
          <DivisionView layout={q.division} upto={Math.min(shown - 1, q.division.stages.length - 1)} />
        </div>
      )}
      {q && <QuestionVisual q={q} />}
      <div className="mt-3 space-y-2">
        {lines.slice(0, shown).map((l, i) => (
          <ModelLine key={i} line={l} n={i + 1} />
        ))}
      </div>
      {shown < lines.length ? (
        <button type="button" className="btn btn-secondary mt-3 w-full" onClick={() => setShown(shown + 1)}>
          {s.nextStep}
        </button>
      ) : (
        <button type="button" className="btn btn-primary mt-3 w-full" onClick={onDone}>
          {s.copied}
        </button>
      )}
    </div>
  );
}

/* ---------- 4. Fill the gaps ---------- */

export function GapsPart({ part, onDone, skill }: PartProps<"gaps">) {
  const t = useT();
  const s = t.maths.lesson;
  const [q] = useQuestion(part.generator);
  const [values, setValues] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean> | null>(null);
  if (!q) return null;
  // Negative indexes count from the end (−1 = the last line).
  const hidden = part.hide.map((i) => (i < 0 ? q.solution.length + i : i)).filter((i) => q.solution[i]?.value);
  const allOk = !!checked && hidden.every((i) => checked[i]);

  function check() {
    const res = Object.fromEntries(hidden.map((i) => [i, sameLine(q!.solution[i].value!, values[i] ?? "")]));
    setChecked(res);
    const ok = hidden.every((i) => res[i]);
    recordSkill(skill, ok ? "right" : "wrong");
    if (ok) onDone();
  }

  return (
    <div>
      <p className="font-semibold">
        <MathText text={q.prompt} />
      </p>
      <QuestionVisual q={q} />
      <p className="mt-1 text-sm text-muted">{s.fillHelp}</p>
      <div className="mt-3 space-y-2">
        {q.solution.map((l, i) =>
          hidden.includes(i) ? (
            <div key={i} className="rounded-lg border-2 border-dashed border-primary p-2">
              {l.note && (
                <p className="mb-1 text-sm text-muted">
                  <MathText text={l.note} />
                </p>
              )}
              <MathField value={values[i] ?? ""} onChange={(v) => (setValues((cur) => ({ ...cur, [i]: v })), setChecked(null))} label={fmt(s.gapLabel, { n: i + 1 })} placeholder={s.gapPlaceholder} invalid={!!checked && !checked[i]} disabled={allOk} />
              {checked && !checked[i] && <p className="mt-1 text-sm">{s.gapWrong}</p>}
            </div>
          ) : (
            <ModelLine key={i} line={l} n={i + 1} />
          ),
        )}
      </div>
      {!allOk && (
        <button type="button" className="btn btn-primary mt-3 w-full" onClick={check}>
          {t.task.check}
        </button>
      )}
    </div>
  );
}

/* ---------- Long division: watch it, then fill it in stage by stage ---------- */

export function DivisionPart({ part, onDone, skill }: PartProps<"division">) {
  const t = useT();
  const s = t.maths.division;
  const [q, again] = useQuestion(part.generator);
  const [stage, setStage] = useState(part.mode === "show" ? 0 : 0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [bad, setBad] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  if (!q?.division) return null;
  const d = q.division;
  const last = d.stages.length - 1;

  // Cells the learner fills at this stage: its quotient term and the line left after subtracting.
  const blanksFor = (k: number) => [...d.quotient.map((v, i) => (d.quotientStage[i] === k && v ? `q${i}` : "")), ...d.stages[k].after.map((v, i) => (v ? `a${k}-${i}` : ""))].filter(Boolean);
  const expected = (key: string) => (key.startsWith("q") ? d.quotient[Number(key.slice(1))] : d.stages[Number(key.slice(1).split("-")[0])].after[Number(key.split("-")[1])]);
  const cellOk = (key: string) => {
    const want = latexToLinear(expected(key));
    const got = (values[key] ?? "").trim();
    return d.kind === "number" ? Number(got) === Number(want) : sameLine(want || "0", got.replace(/^\+/, "") || "#");
  };

  function checkStage() {
    const keys = blanksFor(stage);
    const res = Object.fromEntries(keys.map((k) => [k, !cellOk(k)]));
    setBad(res);
    if (keys.every((k) => !res[k])) {
      recordSkill(skill, "right");
      if (stage < last) setStage(stage + 1);
      else setFinished(true);
    } else recordSkill(skill, "wrong");
  }

  if (part.mode === "show") {
    return (
      <div>
        <p className="font-semibold">
          <MathText text={q.prompt} />
        </p>
        <div className="mt-3">
          <DivisionView layout={d} upto={stage} />
        </div>
        <Note kind="info">
          <MathText text={stage <= last ? fmt(d.kind === "number" ? s.numberStage : s.polyStage, { n: stage + 1 }) : ""} />
        </Note>
        {stage < last ? (
          <button type="button" className="btn btn-secondary mt-3 w-full" onClick={() => setStage(stage + 1)}>
            {s.nextStage}
          </button>
        ) : (
          <>
            <div className="mt-3 space-y-2">
              {q.solution.map((l, i) => (
                <ModelLine key={i} line={l} />
              ))}
            </div>
            <button type="button" className="btn btn-primary mt-3 w-full" onClick={onDone}>
              {t.maths.lesson.continue}
            </button>
          </>
        )}
      </div>
    );
  }

  const active = new Set(finished ? [] : blanksFor(stage));
  return (
    <div>
      <p className="font-semibold">
        <MathText text={q.prompt} />
      </p>
      <p className="mt-1 text-sm text-muted">{s.fillHelp}</p>
      <div className="mt-3">
        <DivisionView
          layout={d}
          upto={finished ? last : stage}
          blank={(key) =>
            active.has(key) ? (
              <div className="w-24">
                <MathField compact value={values[key] ?? ""} onChange={(v) => (setValues((c) => ({ ...c, [key]: v })), setBad((b) => ({ ...b, [key]: false })))} label={s.cell} placeholder="?" invalid={!!bad[key]} />
              </div>
            ) : undefined
          }
        />
      </div>
      {!finished && (
        <button type="button" className="btn btn-primary mt-3 w-full" onClick={checkStage}>
          {fmt(s.checkStage, { n: stage + 1 })}
        </button>
      )}
      {Object.values(bad).some(Boolean) && <Note kind="err">{s.stageWrong}</Note>}
      {finished && (
        <>
          <Note kind="ok">✓ {s.allDone}</Note>
          <div className="mt-2">
            <AnswerSet q={q} onResult={(ok) => ok && onDone()} />
          </div>
          <button type="button" className="btn btn-ghost mt-2 w-full" onClick={() => (again(), setStage(0), setValues({}), setBad({}), setFinished(false))}>
            {s.another}
          </button>
        </>
      )}
    </div>
  );
}

/* ---------- Discovery table ---------- */

export function TablePart({ part, onDone, skill }: PartProps<"table">) {
  const t = useT();
  const s = t.maths.lesson;
  const [q] = useQuestion(part.generator);
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean> | null>(null);
  const [tableDone, setTableDone] = useState(false);
  if (!q?.table) return null;
  const tbl = q.table;

  function check() {
    const res: Record<string, boolean> = {};
    tbl.rows.forEach((r, ri) => r.cells.forEach((c, ci) => "answer" in c && (res[`${ri}:${ci}`] = checkAnswer(c.answer, values[`${ri}:${ci}`] ?? "").ok)));
    setChecked(res);
    const ok = Object.values(res).every(Boolean);
    recordSkill(skill, ok ? "right" : "wrong");
    if (ok) setTableDone(true);
  }

  return (
    <div>
      <p className="font-semibold">
        <MathText text={q.prompt} />
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse text-sm">
          <thead>
            <tr>
              {tbl.headers.map((h) => (
                <th key={h} className="border-b border-line px-1 py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tbl.rows.map((r, ri) => (
              <tr key={ri} className="border-b border-line">
                {r.cells.map((c, ci) => (
                  <td key={ci} className="px-1 py-1.5">
                    {"latex" in c ? (
                      <Tex latex={c.latex} />
                    ) : (
                      <div className="w-20">
                        <MathField compact value={values[`${ri}:${ci}`] ?? ""} onChange={(v) => (setValues((cur) => ({ ...cur, [`${ri}:${ci}`]: v })), setChecked(null))} label={`${tbl.headers[ci]} ${ri + 1}`} placeholder="?" invalid={!!checked && checked[`${ri}:${ci}`] === false} disabled={tableDone} />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!tableDone && (
        <button type="button" className="btn btn-primary mt-3 w-full" onClick={check}>
          {t.task.check}
        </button>
      )}
      {checked && !tableDone && <Note kind="err">{s.tableWrong}</Note>}
      {tableDone && (
        <div className="mt-5">
          <p className="font-semibold">
            <MathText text={part.question.prompt} />
          </p>
          <div className="mt-2">
            <Choices options={part.question.options} answer={part.question.answer} explain={part.question.explain} onCorrect={() => {}} />
          </div>
          <button type="button" className="btn btn-primary mt-3 w-full" onClick={onDone}>
            {s.continue}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Grid (area) model for multiplying ---------- */

export function GridPart({ part, onDone, skill }: PartProps<"grid">) {
  const t = useT();
  const s = t.maths.lesson;
  const [q] = useQuestion(part.generator);
  const [values, setValues] = useState<Record<string, string>>({});
  const [bad, setBad] = useState<Record<string, boolean> | null>(null);
  const [gridDone, setGridDone] = useState(false);
  if (!q?.grid) return null;
  const { rows, cols } = q.grid;

  function check() {
    const res: Record<string, boolean> = {};
    rows.forEach((r, i) => cols.forEach((c, j) => (res[`${i}:${j}`] = !sameLine(`(${r})*(${c})`, values[`${i}:${j}`] ?? "#"))));
    setBad(res);
    const ok = Object.values(res).every((x) => !x);
    recordSkill(skill, ok ? "right" : "wrong");
    if (ok) setGridDone(true);
  }

  const tex = (x: string) => tryParse(x) && <MathText text={`$${x.replace(/\^(\d+)/g, "^{$1}")}$`} />;
  return (
    <div>
      <p className="font-semibold">
        <MathText text={q.prompt} />
      </p>
      <p className="mt-1 text-sm text-muted">{s.gridHelp}</p>
      <div className="mt-3 overflow-x-auto">
        <table className="mx-auto border-collapse">
          <thead>
            <tr>
              <th className="h-10 w-12 border border-line bg-bg text-sm">×</th>
              {cols.map((c) => (
                <th key={c} className="border border-line bg-[#fdf1df] px-2 font-semibold">
                  {tex(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r}>
                <th className="border border-line bg-[#e3ecf7] px-2 font-semibold">{tex(r)}</th>
                {cols.map((c, j) => (
                  <td key={c} className="border border-line p-1">
                    <div className="w-24">
                      <MathField compact value={values[`${i}:${j}`] ?? ""} onChange={(v) => (setValues((cur) => ({ ...cur, [`${i}:${j}`]: v })), setBad(null))} label={`${r} × ${c}`} placeholder="?" invalid={!!bad?.[`${i}:${j}`]} disabled={gridDone} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!gridDone && (
        <button type="button" className="btn btn-primary mt-3 w-full" onClick={check}>
          {t.task.check}
        </button>
      )}
      {bad && !gridDone && <Note kind="err">{s.gridWrong}</Note>}
      {gridDone && (
        <div className="mt-4">
          <p className="font-semibold">{s.gridCollect}</p>
          <div className="mt-2">
            <AnswerSet q={q} onResult={(ok) => ok && onDone()} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Sign diagram: fill it, then write the solution ---------- */

export function SignsPart({ part, onDone, skill }: PartProps<"signs">) {
  const t = useT();
  const s = t.maths.lesson;
  const [q, again] = useQuestion(part.generator);
  const [value, setValue] = useState<Record<string, Sign | "">>({});
  const [bad, setBad] = useState<Record<string, boolean> | null>(null);
  const [filled, setFilled] = useState(false);
  if (!q?.signs) return null;
  const d = q.signs;
  const cells = [...d.factors.flatMap((f, r) => f.signs.map((sg, i) => [`f${r}:${i}`, sg] as const)), ...d.result.signs.map((sg, i) => [`res:${i}`, sg] as const)];

  function tap(key: string) {
    setBad(null);
    setValue((v) => ({ ...v, [key]: v[key] === "+" ? "-" : v[key] === "-" ? "" : "+" }));
  }
  function check() {
    const res = Object.fromEntries(cells.map(([k, sg]) => [k, value[k] !== sg]));
    setBad(res);
    const ok = cells.every(([k]) => !res[k]);
    recordSkill(skill, ok ? "right" : "wrong");
    if (ok) setFilled(true);
  }

  return (
    <div>
      <p className="font-semibold">
        <MathText text={q.prompt} />
      </p>
      <p className="mt-1 text-sm text-muted">{s.signsHelp}</p>
      <div className="mt-3">
        <SignTable data={d} value={value} onTap={tap} bad={bad ?? undefined} locked={filled} />
      </div>
      {!filled && (
        <button type="button" className="btn btn-primary mt-3 w-full" disabled={cells.some(([k]) => !value[k])} onClick={check}>
          {t.task.check}
        </button>
      )}
      {bad && !filled && <Note kind="err">{s.signsWrong}</Note>}
      {filled && (
        <div className="mt-4">
          <Note kind="ok">✓ {s.signsDone}</Note>
          <div className="mt-3">
            <AnswerSet q={q} onResult={(ok) => ok && onDone()} />
          </div>
          <button type="button" className="btn btn-ghost mt-2 w-full" onClick={() => (again(), setValue({}), setBad(null), setFilled(false))}>
            {s.anotherDiagram}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- 5. Your turn (on paper, then line by line) ---------- */

export function PracticePart({ part, onDone }: PartProps<"practice">) {
  const t = useT();
  const s = t.maths.lesson;
  const { gen } = useContext(GeneratorsContext);
  const [i, setI] = useState(0);
  const [seed, setSeed] = useState(newSeed);
  const [solved, setSolved] = useState(false);
  const recorded = useRef(false);
  const g = gen(part.generators[i % part.generators.length]);
  const q = useMemo(() => (g ? runGenerator(g, seed) : null), [g, seed]);
  if (!q) return null;

  const record = (ok: boolean) => {
    if (recorded.current) return;
    recorded.current = true;
    recordSkill(q.skill, ok ? "right" : "wrong");
  };

  function next() {
    recorded.current = false;
    setSolved(false);
    setSeed(newSeed());
    if (i + 1 >= part.count) onDone();
    else setI(i + 1);
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">{fmt(s.question, { n: i + 1, total: part.count })}</p>
      <p className="mt-1 text-[1.05rem] font-semibold">
        <MathText text={q.prompt} />
      </p>
      <QuestionVisual q={q} />
      <p className="mt-2 rounded-lg bg-[#fffdf5] p-2 text-sm">✏️ {q.work ? s.paperFirstLines : s.paperFirst}</p>
      {q.division && <p className="mt-1 text-sm text-muted">{s.divisionOnPaper}</p>}
      <div className="mt-3">
        {q.work ? (
          <StepWork
            key={seed}
            q={q}
            onSolved={(helped) => {
              record(!helped);
              setSolved(true);
            }}
          />
        ) : (
          <AnswerSet
            key={seed}
            q={q}
            onResult={(ok) => {
              record(ok);
              if (ok) setSolved(true);
            }}
          />
        )}
      </div>
      {solved && (
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={next}>
          {i + 1 < part.count ? s.nextQuestion : s.continue}
        </button>
      )}
    </div>
  );
}

/* ---------- 6. Traps: spot the error ---------- */

export function TrapsPart({ part, onDone }: PartProps<"traps">) {
  const t = useT();
  const s = t.maths.traps;
  const [i, setI] = useState(0);
  const [tapped, setTapped] = useState<number | null>(null);
  const [whyOk, setWhyOk] = useState(false);
  const card = part.cards[i];
  const found = tapped === card.wrong;
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">{fmt(s.card, { n: i + 1, total: part.cards.length })}</p>
      <p className="mt-1 font-semibold">
        <MathText text={card.prompt} />
      </p>
      <p className="mt-1 text-sm text-muted">{s.tapWrong}</p>
      <ol className="mt-2 space-y-2">
        {card.lines.map((l, li) => (
          <li key={li}>
            <button type="button" disabled={found} onClick={() => setTapped(li)} className={`flex min-h-12 w-full items-center gap-2 rounded-xl border-2 px-3 text-left ${tapped === li ? (found ? "border-err bg-err-soft" : "border-line bg-bg") : "border-line bg-surface"}`}>
              <span className="text-sm font-semibold text-muted">{li + 1}.</span>
              <span className="min-w-0 flex-1 overflow-x-auto">
                <Tex latex={l} />
              </span>
            </button>
          </li>
        ))}
      </ol>
      {tapped !== null && !found && <p className="mt-2 text-sm">{s.notThis}</p>}
      {found && (
        <div className="mt-4">
          <p className="font-semibold">{s.why}</p>
          <div className="mt-2">
            <Choices key={i} options={card.options} answer={card.answer} explain={card.explain} onCorrect={() => setWhyOk(true)} />
          </div>
        </div>
      )}
      {whyOk && (
        <button
          type="button"
          className="btn btn-primary mt-3 w-full"
          onClick={() => {
            setTapped(null);
            setWhyOk(false);
            if (i + 1 < part.cards.length) setI(i + 1);
            else onDone();
          }}
        >
          {i + 1 < part.cards.length ? s.next : t.maths.lesson.continue}
        </button>
      )}
    </div>
  );
}

/* ---------- 7. Exam style (M/A/B marks) ---------- */

export function ExamPart({ part, onDone }: PartProps<"exam">) {
  const t = useT();
  const s = t.maths.exam;
  const { exam } = useContext(GeneratorsContext);
  const [seed, setSeed] = useState(newSeed);
  const g = exam(part.generator);
  const q = useMemo(() => (g ? runExam(g, seed) : null), [g, seed]);
  const [inputs, setInputs] = useState<string[][]>([]);
  const [result, setResult] = useState<ExamResult | null>(null);
  if (!q) return null;
  const value = (p: number, i: number) => inputs[p]?.[i] ?? "";
  const setValue = (p: number, i: number, v: string) =>
    setInputs((cur) => {
      const next = q.parts.map((pp, pi) => pp.inputs.map((_, ii) => cur[pi]?.[ii] ?? ""));
      next[p][i] = v;
      return next;
    });

  function mark() {
    const r = markExam(q!, q!.parts.map((p, pi) => p.inputs.map((_, ii) => value(pi, ii))));
    setResult(r);
    recordSkill(g!.skill, r.total >= r.max * 0.6 ? "right" : "wrong");
  }

  return (
    <div>
      <div className="rounded-xl border-2 border-[#1f2a30] bg-white p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{s.gceStyle}</p>
        <p className="mt-2">
          <MathText text={q.intro} />
        </p>
        {q.parts.map((p, pi) => (
          <div key={pi} className="mt-4">
            <p className="font-semibold">
              {p.label} <MathText text={p.prompt} />
              <span className="ml-1 text-sm text-muted">[{p.marks.length}]</span>
            </p>
            <div className="mt-2 space-y-2">
              {p.inputs.map((inp, ii) => (
                <div key={ii}>
                  <p className="mb-1 text-sm">{inp.label}</p>
                  <MathField value={value(pi, ii)} onChange={(v) => setValue(pi, ii, v)} label={`${p.label} ${inp.label}`} placeholder={s.placeholder} disabled={!!result} />
                </div>
              ))}
            </div>
            {result && (
              <div className="mt-2 rounded-lg bg-bg p-2">
                {result.parts[pi].points.map((pt, k) => (
                  <p key={k} className={`text-sm ${pt.got ? "text-ok" : "text-err"}`}>
                    {pt.got ? "✓" : "✕"} <span className="font-bold">{`${pt.type}${pt.got ? 1 : 0}${pt.ft ? "ft" : ""}`}</span> <MathText text={pt.text} />
                  </p>
                ))}
                <details className="mt-1">
                  <summary className="cursor-pointer text-sm font-semibold text-primary">{s.modelSolution}</summary>
                  <div className="mt-2 space-y-2">
                    {p.solution.map((l, i) => (
                      <ModelLine key={i} line={l} />
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
      {!result ? (
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={mark}>
          {s.markIt}
        </button>
      ) : (
        <>
          <Note kind={result.total === result.max ? "ok" : "info"}>
            <p className="font-bold">{fmt(s.score, { got: result.total, max: result.max })}</p>
            <p className="text-sm">{result.total === result.max ? s.full : s.encourage}</p>
          </Note>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => (setSeed(newSeed()), setInputs([]), setResult(null))}>
              {s.another}
            </button>
            <button type="button" className="btn btn-primary" onClick={onDone}>
              {t.maths.lesson.continue}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- 8a. Say it back ---------- */

export function SayItBackPart({ part, onDone }: PartProps<"sayItBack">) {
  const t = useT();
  const s = t.maths.sayIt;
  const [text, setText] = useState("");
  const [met, setMet] = useState<string[] | null>(null);
  const [tries, setTries] = useState(0);
  const ok = !!met && met.length >= part.need;
  function check() {
    const m = part.ideas.filter((i) => pointMet(i, text)).map((i) => i.id);
    setMet(m);
    setTries((n) => n + 1);
  }
  return (
    <div>
      <p className="font-semibold">
        <MathText text={part.prompt} />
      </p>
      <textarea className="input mt-3 min-h-32 leading-relaxed" value={text} onChange={(e) => (setText(e.target.value), setMet(null))} placeholder={s.placeholder} />
      <button type="button" className="btn btn-secondary mt-2 w-full" disabled={text.trim().split(/\s+/).length < 4} onClick={check}>
        {s.check}
      </button>
      {met && (
        <div className="mt-3 rounded-xl bg-surface p-3">
          <p className="font-semibold">{fmt(s.ideas, { n: met.length, total: part.ideas.length })}</p>
          <ul className="mt-1 space-y-1">
            {part.ideas.map((i) => (
              <li key={i.id} className={met.includes(i.id) ? "text-ok" : "text-muted"}>
                {met.includes(i.id) ? "✓" : "○"} <MathText text={i.text} />
              </li>
            ))}
          </ul>
          {!ok && <p className="mt-2 text-sm">{s.addMore}</p>}
        </div>
      )}
      {(ok || tries >= 2) && (
        <button type="button" className="btn btn-primary mt-3 w-full" onClick={onDone}>
          {ok ? t.maths.lesson.continue : s.continueAnyway}
        </button>
      )}
    </div>
  );
}

/* ---------- 8b. Notebook page check ---------- */

export function NotebookPage({ page }: { page: NotebookModel }) {
  return (
    <div className="space-y-3 bg-[#fffef9] p-4 text-[#17201b]" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 27px, #dce6ee 27px 28px)" }}>
      <h3 className="text-lg font-bold text-[#4338ca] underline">{page.heading}</h3>
      {page.blocks.map((b, i) => (
        <div key={i}>
          <p className="font-bold">{b.title}</p>
          {(b.type === "definition" || b.type === "rule" || b.type === "note") && (
            <p className={b.type === "rule" ? "rounded border border-[#4338ca] p-2" : ""}>
              <MathText text={b.text} />
            </p>
          )}
          {b.type === "example" && (
            <div>
              <p>
                <MathText text={b.prompt} />
              </p>
              {b.lines.map((l, k) => (
                <div key={k} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 overflow-x-auto">
                    <Tex latex={l.latex} display />
                  </div>
                  {l.mark && <span className="text-xs font-bold">{l.mark}</span>}
                </div>
              ))}
            </div>
          )}
          {b.type === "sketch" && (
            <div className="max-w-xs">
              <Graph spec={b.graph} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function NotebookPart({ part, onDone }: PartProps<"notebook">) {
  const t = useT();
  const s = t.maths.notebook;
  const ref = useRef<HTMLDivElement>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  async function download() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(ref.current, { pixelRatio: 2, backgroundColor: "#fffef9", cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${part.page.heading.replace(/[^\w]+/g, "_")}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <p className="font-semibold">{s.compare}</p>
      <div ref={ref} className="mt-3 overflow-hidden rounded-xl border border-line">
        <NotebookPage page={part.page} />
      </div>
      <button type="button" className="btn btn-secondary mt-3 w-full" disabled={busy} onClick={download}>
        {busy ? t.cv.downloading : s.download}
      </button>
      <label className="mt-3 flex min-h-11 items-center gap-3">
        <input type="checkbox" className="h-6 w-6 accent-primary" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <span>{s.matches}</span>
      </label>
      <button type="button" className="btn btn-primary mt-3 w-full" disabled={!checked} onClick={onDone}>
        {t.maths.lesson.continue}
      </button>
    </div>
  );
}

/* ---------- 9. Mastery check ---------- */

export function MasteryPart({ part, onDone }: PartProps<"mastery">) {
  const t = useT();
  const s = t.maths.mastery;
  const { gen } = useContext(GeneratorsContext);
  const [round, setRound] = useState(0);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const seeds = useMemo(() => Array.from({ length: part.count }, () => newSeed()), [round, part.count]); // eslint-disable-line react-hooks/exhaustive-deps
  const order = useMemo(() => Array.from({ length: part.count }, (_, k) => part.generators[(k + round) % part.generators.length]), [round, part]);
  const g = gen(order[i]);
  const q = useMemo(() => (g && i < part.count ? runGenerator(g, seeds[i]) : null), [g, seeds, i, part.count]);
  const finished = i >= part.count;
  const passed = finished && score >= part.need;

  if (finished) {
    return (
      <div>
        <Note kind={passed ? "ok" : "info"}>
          <p className="text-lg font-bold">{fmt(s.score, { n: score, total: part.count })}</p>
          <p>{passed ? s.passed : fmt(s.notYet, { need: part.need })}</p>
        </Note>
        {passed ? (
          <button type="button" className="btn btn-primary mt-3 w-full" onClick={onDone}>
            {s.unlock}
          </button>
        ) : (
          <button type="button" className="btn btn-primary mt-3 w-full" onClick={() => (setRound(round + 1), setI(0), setScore(0), setAnswered(null))}>
            {s.again}
          </button>
        )}
      </div>
    );
  }
  if (!q) return null;
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">{fmt(s.progress, { n: i + 1, total: part.count, need: part.need })}</p>
      <p className="mt-1 text-[1.05rem] font-semibold">
        <MathText text={q.prompt} />
      </p>
      <QuestionVisual q={q} />
      <div className="mt-3">
        <AnswerSet
          key={`${round}-${i}`}
          q={q}
          locked={answered !== null}
          onResult={(ok) => {
            if (answered !== null) return;
            setAnswered(ok);
            recordSkill(q.skill, ok ? "right" : "wrong");
            if (ok) setScore((n) => n + 1);
          }}
        />
      </div>
      {answered !== null && (
        <button type="button" className="btn btn-primary mt-3 w-full" onClick={() => (setI(i + 1), setAnswered(null))}>
          {i + 1 < part.count ? t.maths.lesson.nextQuestion : s.seeResult}
        </button>
      )}
    </div>
  );
}

/* ---------- Lesson 0: diagnostic and foundation repair ---------- */

export function DiagnosticPart({ part, onDone }: PartProps<"diagnostic">) {
  const t = useT();
  const s = t.maths.diagnostic;
  const { gen } = useContext(GeneratorsContext);
  const queue = useMemo(() => part.skills.flatMap((sk) => Array.from({ length: part.perSkill }, () => ({ skill: sk, seed: newSeed() }))), [part]);
  const [i, setI] = useState(0);
  const [right, setRight] = useState<Record<string, number>>({});
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [repairIndex, setRepairIndex] = useState(0);
  const [repairSeed, setRepairSeed] = useState(newSeed);
  const [repairWins, setRepairWins] = useState(0);
  const [repairAnswered, setRepairAnswered] = useState<boolean | null>(null);

  const quizDone = i >= queue.length;
  const weak = part.skills.filter((sk) => (right[sk.id] ?? 0) < part.perSkill);

  if (!quizDone) {
    const item = queue[i];
    const g = gen(item.skill.generator);
    const q = g ? runGenerator(g, item.seed) : null;
    if (!q) return null;
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{fmt(s.progress, { n: i + 1, total: queue.length })}</p>
        <p className="mt-1 text-sm font-semibold text-primary">{item.skill.name}</p>
        <p className="mt-1 text-[1.05rem] font-semibold">
          <MathText text={q.prompt} />
        </p>
        <QuestionVisual q={q} />
        <div className="mt-3">
          <AnswerSet
            key={i}
            q={q}
            locked={answered !== null}
            onResult={(ok) => {
              if (answered !== null) return;
              setAnswered(ok);
              recordSkill(q.skill, ok ? "right" : "wrong");
              if (ok) setRight((r) => ({ ...r, [item.skill.id]: (r[item.skill.id] ?? 0) + 1 }));
            }}
          />
        </div>
        {answered !== null && (
          <button type="button" className="btn btn-primary mt-3 w-full" onClick={() => (setI(i + 1), setAnswered(null))}>
            {i + 1 < queue.length ? t.maths.lesson.nextQuestion : s.seeResults}
          </button>
        )}
      </div>
    );
  }

  if (repairIndex >= weak.length) {
    return (
      <div>
        <Note kind="ok">
          <p className="font-bold">{weak.length ? s.repaired : s.allStrong}</p>
        </Note>
        <ul className="mt-3 space-y-1">
          {part.skills.map((sk) => (
            <li key={sk.id}>
              {weak.includes(sk) ? "🔧" : "✓"} {sk.name}
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={onDone}>
          {t.maths.lesson.continue}
        </button>
      </div>
    );
  }

  // Foundation repair: a short explanation, a worked example, then two questions right in a row.
  const sk = weak[repairIndex];
  const g = gen(sk.generator);
  const rq = g ? runGenerator(g, repairSeed) : null;
  return (
    <div>
      <Note kind="info">
        <p className="font-bold">{fmt(s.repairTitle, { name: sk.name, n: repairIndex + 1, total: weak.length })}</p>
        <p className="text-sm">{s.repairIntro}</p>
      </Note>
      <p className="mt-3">
        <MathText text={sk.explain} />
      </p>
      <div className="mt-2 space-y-2">
        {sk.repair.map((l, k) => (
          <ModelLine key={k} line={l} />
        ))}
      </div>
      {rq && (
        <div className="mt-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">{fmt(s.repairProgress, { n: repairWins })}</p>
          <p className="mt-1 font-semibold">
            <MathText text={rq.prompt} />
          </p>
          <QuestionVisual q={rq} />
          <div className="mt-2">
            <AnswerSet
              key={repairSeed}
              q={rq}
              locked={repairAnswered !== null}
              onResult={(ok) => {
                if (repairAnswered !== null) return;
                setRepairAnswered(ok);
                recordSkill(rq.skill, ok ? "right" : "wrong");
              }}
            />
          </div>
          {repairAnswered !== null && (
            <button
              type="button"
              className="btn btn-primary mt-3 w-full"
              onClick={() => {
                const wins = repairAnswered ? repairWins + 1 : 0;
                setRepairAnswered(null);
                setRepairSeed(newSeed());
                if (wins >= 2) {
                  setRepairWins(0);
                  setRepairIndex(repairIndex + 1);
                } else setRepairWins(wins);
              }}
            >
              {t.maths.lesson.nextQuestion}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
