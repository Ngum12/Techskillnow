"use client";
/**
 * APA references, built by tapping the pieces in the right order (author, year, title, source…), then the
 * matching in-text citation. Pieces written between *stars* are shown in italics, as APA requires.
 */
import { useMemo, useState } from "react";
import type { ReferenceBuilderTask } from "@/lib/research/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";

function Piece({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((p, i) =>
        p.startsWith("*") ? (
          <i key={i}>{p.slice(1, -1)}</i>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/** A fixed shuffle (the same for everyone), never in the right order. */
function shuffled(n: number, seed: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  let x = seed + 7;
  for (let i = n - 1; i > 0; i--) {
    x = (x * 1103515245 + 12345) % 2147483648;
    const j = x % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.every((v, i) => v === i) ? [...a.slice(1), a[0]] : a;
}

export function ReferenceBuilder({ task, passed, onPass }: { task: ReferenceBuilderTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.research.refs;
  const { reportAttempt } = useLesson();
  const [round, setRound] = useState(passed ? task.rounds.length : 0);
  const [built, setBuilt] = useState<number[]>([]);
  const [wrongTap, setWrongTap] = useState<number | null>(null);
  const [cite, setCite] = useState<number | null>(null);
  const r = task.rounds[round];
  const order = useMemo(() => (r ? shuffled(r.pieces.length, round) : []), [r, round]);

  if (!r) return <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />;
  const complete = built.length === r.pieces.length;
  const citeOk = cite === r.intext.answer;

  function tap(i: number) {
    if (built.includes(i) || complete) return;
    if (i === built.length) {
      setBuilt([...built, i]);
      setWrongTap(null);
    } else {
      setWrongTap(i);
      reportAttempt(false, [`${r.label}: ${r.pieces[i]}`]);
    }
  }

  function next() {
    const n = round + 1;
    setRound(n);
    setBuilt([]);
    setCite(null);
    setWrongTap(null);
    if (n >= task.rounds.length) {
      reportAttempt(true, []);
      onPass();
    }
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted">{fmt(s.round, { n: round + 1, total: task.rounds.length, label: r.label })}</p>

      {/* The reference list page. */}
      <div className="mt-2 min-h-24 rounded-md border border-[#e0dccf] bg-white p-4 shadow-[0_8px_20px_-16px_rgba(20,28,51,0.5)]" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
        <p className="text-center text-[0.9rem] font-bold">{s.references}</p>
        <p className="mt-2 pl-6 -indent-6 text-[0.95rem] leading-relaxed">
          {built.map((i) => (
            <span key={i}>
              <Piece text={r.pieces[i]} />{" "}
            </span>
          ))}
          {!complete && <span className="inline-block h-4 w-px animate-pulse bg-ink align-middle" />}
        </p>
      </div>

      {!complete && (
        <>
          <p className="mt-4 text-sm text-muted">{s.tapNext}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {order.map((i) =>
              built.includes(i) ? null : (
                <button key={i} type="button" onClick={() => tap(i)} className={`min-h-11 rounded-lg border-2 px-3 py-2 text-left text-[0.88rem] ${wrongTap === i ? "border-err bg-err-soft" : "border-line bg-surface hover:border-primary"}`} style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
                  <Piece text={r.pieces[i]} />
                </button>
              ),
            )}
          </div>
          {wrongTap !== null && <Feedback kind="err" title={t.task.wrong} messages={[s.order]} />}
        </>
      )}

      {complete && (
        <div className="mt-5">
          <p className="font-semibold">{s.intext}</p>
          <div className="mt-2 grid gap-2">
            {r.intext.options.map((o, i) => (
              <button
                key={o}
                type="button"
                onClick={() => !citeOk && (setCite(i), i !== r.intext.answer && reportAttempt(false, [o]))}
                className={`min-h-11 rounded-xl border-2 px-4 py-2 text-left ${cite === i ? (i === r.intext.answer ? "border-ok bg-ok-soft" : "border-err bg-err-soft") : "border-line bg-surface"}`}
              >
                {o}
              </button>
            ))}
          </div>
          {cite !== null && (citeOk ? <Feedback kind="ok" title={t.task.correct} messages={[r.intext.why]} /> : <Feedback kind="err" title={t.task.wrong} messages={[s.citeHint]} />)}
          {citeOk && (
            <button type="button" className="btn btn-primary mt-4 w-full" onClick={next}>
              {round + 1 < task.rounds.length ? s.next : s.finish}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
