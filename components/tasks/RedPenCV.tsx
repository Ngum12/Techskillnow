"use client";
import { useState } from "react";
import type { RedPenTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "./Feedback";

const LINE_STYLE: Record<string, string> = {
  title: "text-center font-serif text-xl italic underline",
  heading: "mt-3 font-bold uppercase underline",
  fancy: "font-serif text-lg italic tracking-wide",
  small: "text-[0.7rem]",
};

/** Tap every mistake on a bad CV. Found/total is shown; missed ones are revealed with explanations. */
export function RedPenCV({ task, passed, onPass }: { task: RedPenTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.redPen;
  const { reportAttempt } = useLesson();
  const [found, setFound] = useState<Set<string>>(() => new Set(passed ? task.errors.map((e) => e.id) : []));
  const [wrongTap, setWrongTap] = useState(0);
  const [checked, setChecked] = useState(passed);
  const [revealed, setRevealed] = useState(passed);
  const total = task.errors.length;
  const percent = Math.round((found.size / total) * 100);
  const ok = percent >= task.passPercent;

  function tap(errorId: string | null) {
    if (revealed) return;
    if (!errorId) {
      setWrongTap((n) => n + 1);
      return;
    }
    setFound((f) => new Set(f).add(errorId));
    setChecked(false);
  }

  function check() {
    setChecked(true);
    const missed = task.errors.filter((e) => !found.has(e.id)).map((e) => e.label);
    reportAttempt(ok, missed);
    if (ok) onPass();
  }

  function reveal() {
    setRevealed(true);
    reportAttempt(false, task.errors.filter((e) => !found.has(e.id)).map((e) => e.label));
    onPass();
  }

  const label = (id: string) => task.errors.find((e) => e.id === id);

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <p className="mt-2 font-semibold text-primary" aria-live="polite">
        {fmt(s.count, { n: found.size, total })}
      </p>
      {wrongTap > 0 && !revealed && <p className="text-sm text-muted">{s.notError}</p>}

      <article className="mt-3 rounded-lg border border-line bg-white p-4 text-[0.85rem] leading-relaxed text-ink">
        {task.lines.map((line, li) => (
          <p key={li} className={LINE_STYLE[line.style ?? ""] ?? ""} onClick={(e) => e.target === e.currentTarget && tap(null)}>
            {line.parts.map((part, pi) => {
              if (typeof part === "string") return <span key={pi}>{part}</span>;
              const isFound = found.has(part.error);
              const missed = revealed && !isFound;
              return (
                <button
                  key={pi}
                  type="button"
                  onClick={() => tap(part.error)}
                  className={`rounded px-0.5 text-left ${isFound ? "bg-err-soft text-err line-through decoration-2" : ""} ${
                    missed ? "bg-warn-soft outline outline-2 outline-warn" : ""
                  }`}
                  aria-pressed={isFound}
                >
                  {part.text}
                </button>
              );
            })}
          </p>
        ))}
      </article>

      {!revealed && (
        <button type="button" className="btn btn-secondary mt-4 w-full" onClick={check}>
          {t.task.check}
        </button>
      )}

      {checked && !revealed && !ok && (
        <>
          <Feedback kind="err" title={fmt(s.notYet, { n: found.size, total })} messages={[s.keepLooking]} />
          <button type="button" className="btn btn-ghost mt-2 w-full" onClick={reveal}>
            {s.reveal}
          </button>
        </>
      )}

      {(revealed || (checked && ok)) && (
        <section className="mt-4">
          <Feedback kind="ok" title={fmt(s.result, { n: found.size, total })} messages={[task.success]} />
          <ul className="mt-3 space-y-2">
            {task.errors.map((e) => (
              <li key={e.id} className={`rounded-lg border-l-4 p-3 ${found.has(e.id) ? "border-ok bg-ok-soft" : "border-warn bg-warn-soft"}`}>
                <p className="font-semibold">
                  {found.has(e.id) ? "✓ " : `${s.missed}: `}
                  {label(e.id)?.label}
                </p>
                <p className="text-[0.95rem]">{e.why}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
