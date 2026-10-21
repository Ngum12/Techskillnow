"use client";
import { useState } from "react";
import type { Effect3, ErrorCardsTask, MethodChallengeTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";

const EFFECTS: Effect3[] = ["higher", "lower", "none"];

/** Higher / lower / no change, then the reason. Shared by the scenario cards and the method challenge. */
function EffectAndReason({ effect, reasons, answer, onDone }: { effect: Effect3; reasons: string[]; answer: number; onDone: (firstTry: boolean) => void }) {
  const t = useT();
  const s = t.chem.errors;
  const { reportAttempt } = useLesson();
  const [picked, setPicked] = useState<Effect3 | null>(null);
  const [reason, setReason] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);
  const effectOk = picked === effect;

  return (
    <div className="mt-3">
      <p className="font-semibold">{s.effectQuestion}</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {EFFECTS.map((e) => (
          <button
            key={e}
            type="button"
            disabled={effectOk}
            onClick={() => {
              setPicked(e);
              if (e !== effect) setMisses((m) => m + 1);
              reportAttempt(e === effect, e === effect ? [] : [`effect ${e}`]);
            }}
            className={`min-h-12 rounded-xl border-2 text-sm font-semibold ${picked === e ? (e === effect ? "border-ok bg-ok-soft" : "border-err bg-err-soft") : "border-line bg-surface"}`}
          >
            {s.effects[e]}
          </button>
        ))}
      </div>
      {picked && !effectOk && <p className="mt-2 text-sm font-semibold text-err">{s.thinkAgain}</p>}
      {effectOk && (
        <fieldset className="mt-4">
          <legend className="font-semibold">{s.reasonQuestion}</legend>
          <div className="mt-2 flex flex-col gap-2">
            {reasons.map((r, i) => (
              <button
                key={r}
                type="button"
                disabled={reason === answer}
                onClick={() => {
                  setReason(i);
                  reportAttempt(i === answer, i === answer ? [] : [r]);
                  if (i === answer) onDone(misses === 0);
                  else setMisses((m) => m + 1);
                }}
                className={`min-h-11 rounded-xl border-2 px-3 py-2 text-left ${reason === i ? (i === answer ? "border-ok bg-ok-soft" : "border-err bg-err-soft") : "border-line bg-surface"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}

/** Step 8, part 1: what each mistake does to the titre. */
export function ErrorCards({ task, passed, onPass }: { task: ErrorCardsTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.chem.errors;
  const [i, setI] = useState(passed ? task.scenarios.length : 0);
  const [done, setDone] = useState(false);
  const [first, setFirst] = useState(0);
  if (i >= task.scenarios.length) {
    return <Feedback kind="ok" title={t.task.correct} messages={passed ? [task.success] : [fmt(s.score, { n: first, total: task.scenarios.length }), task.success]} />;
  }
  const sc = task.scenarios[i];
  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-muted">{fmt(s.card, { n: i + 1, total: task.scenarios.length })}</p>
      <article className="card mt-2 p-4 text-lg">{sc.situation}</article>
      <EffectAndReason
        key={sc.id}
        effect={sc.effect}
        reasons={sc.reasons}
        answer={sc.answer}
        onDone={(firstTry) => {
          if (firstTry) setFirst((n) => n + 1);
          setDone(true);
        }}
      />
      {done && (
        <button
          type="button"
          className="btn btn-primary mt-4 w-full"
          onClick={() => {
            setDone(false);
            const next = i + 1;
            setI(next);
            if (next >= task.scenarios.length) onPass();
          }}
        >
          {i + 1 < task.scenarios.length ? s.nextCard : s.finish}
        </button>
      )}
    </div>
  );
}

/** Step 8, part 2: a written method with one wrong step. Find it, then predict its effect. */
export function MethodChallenge({ task, passed, onPass }: { task: MethodChallengeTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.chem.errors;
  const { reportAttempt } = useLesson();
  const [i, setI] = useState(passed ? task.challenges.length : 0);
  const [tapped, setTapped] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  if (i >= task.challenges.length) return <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />;
  const c = task.challenges[i];
  const found = tapped === c.faulty;

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-muted">{fmt(s.card, { n: i + 1, total: task.challenges.length })}</p>
      <ol className="mt-2 space-y-2">
        {c.lines.map((line, li) => (
          <li key={li}>
            <button
              type="button"
              disabled={found}
              onClick={() => {
                setTapped(li);
                reportAttempt(li === c.faulty, li === c.faulty ? [] : [line]);
              }}
              className={`flex min-h-11 w-full gap-2 rounded-xl border-2 px-3 py-2 text-left ${tapped === li ? (li === c.faulty ? "border-err bg-err-soft" : "border-line bg-bg") : "border-line bg-surface"}`}
            >
              <span className="font-bold">{li + 1}.</span>
              <span>{line}</span>
            </button>
          </li>
        ))}
      </ol>
      {tapped !== null && !found && <p className="mt-2 text-sm font-semibold text-err">{s.notThisLine}</p>}
      {found && (
        <>
          <p className="mt-3 rounded-lg bg-ok-soft p-3">✓ {c.fix}</p>
          <EffectAndReason key={c.id} effect={c.effect} reasons={c.reasons} answer={c.answer} onDone={() => setDone(true)} />
        </>
      )}
      {done && (
        <button
          type="button"
          className="btn btn-primary mt-4 w-full"
          onClick={() => {
            setDone(false);
            setTapped(null);
            const next = i + 1;
            setI(next);
            if (next >= task.challenges.length) onPass();
          }}
        >
          {i + 1 < task.challenges.length ? s.nextCard : s.finish}
        </button>
      )}
    </div>
  );
}
