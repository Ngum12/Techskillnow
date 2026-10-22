"use client";
/** Answering: answer boxes, line-by-line working (StepChecker), and PaperMoment (exercise-book work). */
import { createContext, useContext, useState } from "react";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { checkAnswer, type AnswerResult } from "@/lib/maths/answer";
import { checkLine, type LineResult } from "@/lib/maths/stepcheck";
import { detectMisconception } from "@/lib/maths/misconceptions";
import { previewLatex } from "@/lib/maths/expr";
import type { AnswerSpec, MisconceptionRule, Question, SolutionLine } from "@/lib/maths/types";
import { MathField } from "./MathInput";
import { MathText, Tex } from "./Tex";

/* ---------- Misconception hints (from the topic's misconceptions.json) ---------- */

export const HintsContext = createContext<Record<string, MisconceptionRule>>({});
export const useHint = () => {
  const rules = useContext(HintsContext);
  return (id: string | null | undefined) => (id ? rules[id] : undefined);
};

/** Encouraging feedback box. */
export function Note({ kind, children }: { kind: "ok" | "err" | "info"; children: React.ReactNode }) {
  const cls = kind === "ok" ? "border-ok bg-ok-soft" : kind === "err" ? "border-[#c98a00] bg-warn-soft" : "border-primary bg-primary-soft";
  return <div className={`mt-3 rounded-xl border-l-4 p-3 ${cls}`}>{children}</div>;
}

/** A model working line: maths, a short note, and the mark it earns. */
export function ModelLine({ line, n }: { line: SolutionLine; n?: number }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-2">
      <div className="flex items-start gap-2">
        {n !== undefined && <span className="mt-1 text-sm font-semibold text-muted">{n}.</span>}
        <div className="min-w-0 flex-1 overflow-x-auto">
          <Tex latex={line.latex} display />
        </div>
        {line.mark && <span className="mt-1 shrink-0 rounded bg-[#1f2a30] px-1.5 text-xs font-bold text-white">{line.mark}</span>}
      </div>
      {line.note && (
        <p className="text-sm text-muted">
          <MathText text={line.note} />
        </p>
      )}
    </div>
  );
}

/* ---------- Answer boxes ---------- */

function reasonText(t: ReturnType<typeof useT>, r: AnswerResult, spec: AnswerSpec): string {
  const s = t.maths.answer;
  if (r.reason === "unreadable") return s.unreadable;
  if (r.reason === "form") {
    if (spec.kind === "factorOf") return s.formFactor;
    if (spec.kind === "expr" && spec.form === "factorised") return s.formFactorised;
    if (spec.kind === "expr" && spec.form === "monomial") return s.formMonomial;
    if (spec.kind === "expr" && spec.form === "partial") return s.formPartial;
    return s.formExpanded;
  }
  if (r.reason === "notSolved") return s.notSolved;
  return s.wrong;
}

/**
 * All the answer boxes of a question, checked together. Calls onResult(allCorrect) after each check.
 * After a wrong try the learner can open the model working.
 */
export function AnswerSet({ q, onResult, locked = false }: { q: Question; onResult: (ok: boolean) => void; locked?: boolean }) {
  const t = useT();
  const s = t.maths.answer;
  const hint = useHint();
  const [values, setValues] = useState<string[]>(() => q.answers.map(() => ""));
  const [results, setResults] = useState<(AnswerResult & { mis?: string | null })[] | null>(null);
  const [showWorking, setShowWorking] = useState(false);
  const allOk = !!results && results.every((r) => r.ok);

  function check() {
    const res = q.answers.map((a, i) => {
      const r = checkAnswer(a.spec, values[i]);
      return { ...r, mis: r.ok ? null : detectMisconception(q, values[i], i) };
    });
    setResults(res);
    onResult(res.every((r) => r.ok));
  }

  return (
    <div>
      <div className="space-y-3">
        {q.answers.map((a, i) => (
          <div key={i}>
            {a.label && <p className="mb-1 text-sm font-semibold">{a.label}</p>}
            {a.spec.kind === "choice" ? (
              <div className="flex flex-col gap-2">
                {a.spec.options.map((o, oi) => {
                  const chosen = values[i] === String(oi);
                  const mark = results && chosen ? (results[i].ok ? "border-ok bg-ok-soft" : "border-err bg-err-soft") : chosen ? "border-primary bg-primary-soft" : "border-line bg-surface";
                  return (
                    <button key={oi} type="button" disabled={locked || allOk} onClick={() => (setValues(values.map((v, j) => (j === i ? String(oi) : v))), setResults(null))} className={`min-h-12 rounded-xl border-2 px-3 py-2 text-left ${mark}`}>
                      <MathText text={o} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <MathField value={values[i]} onChange={(v) => (setValues((cur) => cur.map((x, j) => (j === i ? v : x))), setResults(null))} label={a.label ?? s.answer} placeholder={s.placeholder} invalid={!!results && !results[i].ok} disabled={locked || allOk} onEnter={check} />
            )}
            {results && !results[i].ok && (
              <p className="mt-1 text-sm">
                {results[i].mis && hint(results[i].mis) ? <MathText text={`💡 ${hint(results[i].mis)!.hint}`} /> : reasonText(t, results[i], a.spec)}
              </p>
            )}
          </div>
        ))}
      </div>
      {!allOk && !locked && (
        <button type="button" className="btn btn-primary mt-4 w-full" disabled={values.every((v) => !v.trim())} onClick={check}>
          {t.task.check}
        </button>
      )}
      {allOk && <Note kind="ok">✓ {s.correct}</Note>}
      {results && !allOk && !showWorking && (
        <button type="button" className="btn btn-ghost mt-2 w-full" onClick={() => setShowWorking(true)}>
          {s.showWorking}
        </button>
      )}
      {(showWorking || allOk) && q.solution.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-semibold text-muted">{s.modelWorking}</p>
          {q.solution.map((l, i) => (
            <ModelLine key={i} line={l} n={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- StepChecker: working line by line ---------- */

export function StepWork({ q, onSolved }: { q: Question; onSolved: (helped: boolean) => void }) {
  const t = useT();
  const s = t.maths.steps;
  const hint = useHint();
  const [lines, setLines] = useState<{ text: string; status: LineResult["status"] }[]>([]);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<LineResult | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [done, setDone] = useState(false);

  function check() {
    if (!input.trim()) return;
    const r = checkLine(q, input);
    setFeedback(r);
    if (r.status === "valid" || r.status === "final") {
      setLines((l) => [...l, { text: input, status: r.status }]);
      setInput("");
      if (r.status === "final") {
        setDone(true);
        onSolved(revealed > 0);
      }
    }
  }

  const startLatex = q.work ? previewLatex(q.work.start) : null;
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">{s.yourWorking}</p>
      <div className="mt-2 space-y-1.5 rounded-xl border border-dashed border-line bg-[#fffdf7] p-3">
        {startLatex && <Tex latex={startLatex} display />}
        {lines.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="min-w-0 flex-1 overflow-x-auto">
              <Tex latex={`${q.work?.mode === "expr" ? "= " : ""}${previewLatex(l.text) ?? l.text}`} display />
            </div>
            <span className="shrink-0 text-lg text-ok" aria-label={l.status === "final" ? s.final : s.valid}>
              {l.status === "final" ? "✓✓" : "✓"}
            </span>
          </div>
        ))}
        {!done && (
          <div className="pt-1">
            <MathField value={input} onChange={(v) => (setInput(v), setFeedback(null))} label={s.nextLine} placeholder={s.placeholder} invalid={feedback?.status === "wrong"} onEnter={check} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" className="btn btn-primary" disabled={!input.trim()} onClick={check}>
                {s.checkLine}
              </button>
              <button type="button" className="btn btn-secondary" disabled={revealed >= q.solution.length} onClick={() => setRevealed((n) => n + 1)}>
                {s.seeNext}
              </button>
            </div>
          </div>
        )}
      </div>
      {feedback?.status === "unreadable" && <Note kind="err">{s.unreadable}</Note>}
      {feedback?.status === "wrong" && (
        <Note kind="err">
          {feedback.misconception && hint(feedback.misconception) ? <MathText text={`💡 ${hint(feedback.misconception)!.hint}`} /> : s.notEqual}
        </Note>
      )}
      {feedback?.status === "valid" && feedback.reason && <Note kind="info">{feedback.reason === "form" ? s.keepGoingForm : s.keepGoing}</Note>}
      {feedback?.status === "valid" && !feedback.reason && <Note kind="info">{s.keepGoing}</Note>}
      {done && <Note kind="ok">✓ {revealed ? s.solvedHelped : s.solved}</Note>}
      {revealed > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-semibold text-muted">{s.modelSteps}</p>
          {q.solution.slice(0, done ? q.solution.length : revealed).map((l, i) => (
            <ModelLine key={i} line={l} n={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- PaperMoment ---------- */

/**
 * "Write this in your exercise book." The learner presses Done, then the model working appears one line
 * at a time and they tick each line they got right. An optional photo of their page stays on the phone.
 */
export function PaperMoment({ instruction, prompt, lines, onDone, tick = true }: { instruction: string; prompt?: string; lines: SolutionLine[]; onDone: (ticked: number, total: number) => void; tick?: boolean }) {
  const t = useT();
  const s = t.maths.paper;
  const [stage, setStage] = useState<"write" | "check" | "done">("write");
  const [shown, setShown] = useState(1);
  const [ticks, setTicks] = useState<boolean[]>(() => lines.map(() => false));
  const [photo, setPhoto] = useState<string | null>(null);

  return (
    <div>
      <div className="rounded-2xl border-2 border-[#b9a77a] bg-[#fffdf5] p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8a6d1f]">✏️ {s.title}</p>
        <p className="mt-1 font-semibold">
          <MathText text={instruction} />
        </p>
        {prompt && (
          <p className="mt-2">
            <MathText text={prompt} />
          </p>
        )}
        {stage === "write" && (
          <div className="mt-3 flex flex-col gap-2">
            <button type="button" className="btn btn-primary w-full" onClick={() => setStage("check")}>
              {s.done}
            </button>
            <label className="btn btn-ghost w-full cursor-pointer">
              📷 {photo ? s.retake : s.photo}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && setPhoto(URL.createObjectURL(e.target.files[0]))} />
            </label>
            <p className="text-center text-xs text-muted">{s.photoPrivate}</p>
          </div>
        )}
      </div>
      {stage !== "write" && (
        <div className={`mt-3 ${photo ? "grid gap-3 min-[560px]:grid-cols-2" : ""}`}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={s.yourPage} className="w-full rounded-xl border border-line" />
          )}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted">{tick ? s.tickHelp : s.compareHelp}</p>
            {lines.slice(0, shown).map((l, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <ModelLine line={l} n={i + 1} />
                </div>
                {tick && (
                  <label className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center">
                    <input type="checkbox" className="h-6 w-6 accent-primary" aria-label={fmt(s.gotLine, { n: i + 1 })} checked={ticks[i]} disabled={stage === "done"} onChange={(e) => setTicks(ticks.map((x, j) => (j === i ? e.target.checked : x)))} />
                  </label>
                )}
              </div>
            ))}
            {shown < lines.length ? (
              <button type="button" className="btn btn-secondary w-full" onClick={() => setShown(shown + 1)}>
                {s.nextLine}
              </button>
            ) : (
              stage === "check" && (
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={() => {
                    setStage("done");
                    onDone(ticks.filter(Boolean).length, lines.length);
                  }}
                >
                  {tick ? fmt(s.finishTicks, { n: ticks.filter(Boolean).length, total: lines.length }) : s.finish}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
