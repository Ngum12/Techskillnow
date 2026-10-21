"use client";
import { useEffect, useMemo, useState } from "react";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";
import { ReorderList } from "@/components/cv/ReorderList";
import { clozeGapOk, markCheckpoint, parseCloze, scaffoldFor, shuffledOrder, wordCount, type Checkpoint, type MethodSection, type NotebookMark } from "@/lib/chem/marking";
import { labStore } from "@/lib/chem/lab-store";

/** Which marking points were met (✓) or missed (○). */
export function PointList({ points }: { points: { id: string; text: string; met: boolean }[] }) {
  return (
    <ul className="mt-2 space-y-1">
      {points.map((p) => (
        <li key={p.id} className={`flex gap-2 ${p.met ? "text-ok" : "text-err"}`}>
          <span aria-hidden="true">{p.met ? "✓" : "○"}</span>
          <span className={p.met ? "" : "font-semibold"}>{p.text}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * One notebook checkpoint after a lab stage. Attempt 1: put the sentences in order. Attempt 2: fill
 * in the missing words. From attempt 3: write it freely, checked against the marking points.
 */
export function NotebookCheckpoint({ checkpoint, paperLabel, onDone }: { checkpoint: Checkpoint; paperLabel: string; onDone: () => void }) {
  const t = useT();
  const s = t.chem.notebook;
  const { reportAttempt } = useLesson();
  const [attempt, setAttempt] = useState(1);
  useEffect(() => setAttempt((labStore.notebook()[checkpoint.id]?.attempts ?? 0) + 1), [checkpoint.id]);
  const mode = scaffoldFor(attempt);
  const [done, setDone] = useState(false);

  function complete(text: string, mark: NotebookMark) {
    labStore.saveEntry(checkpoint.id, text);
    reportAttempt(mark.missed.length === 0, mark.missed);
    setDone(true);
  }

  return (
    <section className="mt-6 rounded-2xl border-2 border-dashed border-[#b9a77a] bg-[#fffdf5] p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#8a6d1f]">📓 {s.title}</p>
      <h3 className="mt-1 text-lg font-bold">{checkpoint.title}</h3>
      <p className="mt-1">{checkpoint.prompt}</p>
      <p className="mt-1 text-sm text-muted">{fmt(s.examStyle, { paper: paperLabel })}</p>
      {mode === "order" && <OrderMode key={attempt} cp={checkpoint} seed={attempt + checkpoint.id.length} onComplete={complete} />}
      {mode === "cloze" && <ClozeMode key={attempt} cp={checkpoint} onComplete={complete} />}
      {mode === "free" && <FreeMode key={attempt} cp={checkpoint} onComplete={complete} />}
      {done && (
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={onDone}>
          {s.continue}
        </button>
      )}
    </section>
  );
}

function OrderMode({ cp, seed, onComplete }: { cp: Checkpoint; seed: number; onComplete: (text: string, mark: NotebookMark) => void }) {
  const t = useT();
  const s = t.chem.notebook;
  const start = useMemo(() => shuffledOrder(cp.sentences.length, seed).map(String), [cp, seed]);
  const [order, setOrder] = useState(start);
  const [marks, setMarks] = useState<Record<string, "ok" | "err"> | null>(null);
  const ok = marks && Object.values(marks).every((m) => m === "ok");

  function check() {
    const m: Record<string, "ok" | "err"> = {};
    order.forEach((id, i) => (m[id] = Number(id) === i ? "ok" : "err"));
    setMarks(m);
    if (Object.values(m).every((x) => x === "ok")) {
      const text = cp.sentences.join(" ");
      onComplete(text, markCheckpoint(cp, text));
    }
  }

  return (
    <div className="mt-3">
      <p className="text-sm font-semibold">{s.orderHelp}</p>
      <div className="mt-2">
        <ReorderList items={order.map((id) => ({ id, label: cp.sentences[Number(id)] }))} onChange={(ids) => (setOrder(ids), setMarks(null))} marks={marks ?? undefined} disabled={!!ok} />
      </div>
      {!ok && (
        <button type="button" className="btn btn-secondary mt-3 w-full" onClick={check}>
          {t.task.check}
        </button>
      )}
      {marks && !ok && <Feedback kind="err" title={t.task.tryAgain} messages={[s.orderWrong]} />}
      {ok && <Feedback kind="ok" title={t.task.correct} messages={[s.orderDone]} />}
    </div>
  );
}

function ClozeMode({ cp, onComplete }: { cp: Checkpoint; onComplete: (text: string, mark: NotebookMark) => void }) {
  const t = useT();
  const s = t.chem.notebook;
  const lines = useMemo(() => cp.cloze.map(parseCloze), [cp]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const gaps = lines.flatMap((parts, li) => parts.map((p, pi) => (typeof p === "string" ? null : { key: `${li}:${pi}`, gap: p })).filter((g): g is NonNullable<typeof g> => !!g));
  const allOk = gaps.every((g) => clozeGapOk(g.gap, values[g.key] ?? ""));
  const [finished, setFinished] = useState(false);

  function check() {
    setChecked(true);
    if (allOk) {
      const text = lines.map((parts, li) => parts.map((p, pi) => (typeof p === "string" ? p : values[`${li}:${pi}`])).join("")).join(" ");
      setFinished(true);
      onComplete(text, markCheckpoint(cp, text));
    }
  }

  return (
    <div className="mt-3">
      <p className="text-sm font-semibold">{s.clozeHelp}</p>
      <div className="mt-2 space-y-3 leading-loose">
        {lines.map((parts, li) => (
          <p key={li}>
            {parts.map((p, pi) => {
              if (typeof p === "string") return <span key={pi}>{p}</span>;
              const key = `${li}:${pi}`;
              const bad = checked && !clozeGapOk(p, values[key] ?? "");
              return (
                <input
                  key={pi}
                  aria-label={s.gap}
                  disabled={finished}
                  className={`mx-1 inline-block w-32 rounded-md border-2 bg-white px-2 py-1 align-baseline ${bad ? "border-err" : checked ? "border-ok" : "border-line"}`}
                  value={values[key] ?? ""}
                  onChange={(e) => (setValues({ ...values, [key]: e.target.value }), setChecked(false))}
                />
              );
            })}
          </p>
        ))}
      </div>
      {!finished && (
        <button type="button" className="btn btn-secondary mt-3 w-full" onClick={check}>
          {t.task.check}
        </button>
      )}
      {checked && !allOk && <Feedback kind="err" title={t.task.tryAgain} messages={[s.clozeWrong]} />}
      {finished && <Feedback kind="ok" title={t.task.correct} messages={[s.clozeDone]} />}
    </div>
  );
}

function FreeMode({ cp, onComplete }: { cp: Checkpoint; onComplete: (text: string, mark: NotebookMark) => void }) {
  const t = useT();
  const s = t.chem.notebook;
  const [text, setText] = useState(() => labStore.notebook()[cp.id]?.text ?? "");
  const [mark, setMark] = useState<NotebookMark | null>(null);
  const words = wordCount(text);

  function check() {
    const m = markCheckpoint(cp, text);
    setMark(m);
    onComplete(text, m);
  }

  return (
    <div className="mt-3">
      <p className="text-sm font-semibold">{s.freeHelp}</p>
      <textarea className="input mt-2 min-h-40 leading-relaxed" value={text} onChange={(e) => (setText(e.target.value), setMark(null))} placeholder={s.freePlaceholder} />
      <p className={`mt-1 text-right text-sm ${words > cp.maxWords ? "font-semibold text-err" : "text-muted"}`}>{fmt(s.words, { n: words, max: cp.maxWords })}</p>
      <button type="button" className="btn btn-secondary mt-2 w-full" disabled={wordCount(text) < 5} onClick={check}>
        {s.markIt}
      </button>
      {mark && (
        <div className="mt-3 rounded-xl bg-surface p-3">
          {mark.tooLong ? (
            <p className="font-semibold text-err">{fmt(s.tooLong, { max: cp.maxWords })}</p>
          ) : (
            <p className="font-semibold">{fmt(s.pointsMet, { n: mark.met.length, total: cp.points.length })}</p>
          )}
          <PointList points={cp.points.map((p) => ({ id: p.id, text: p.text, met: mark.met.includes(p.id) }))} />
          {mark.missed.length > 0 && <p className="mt-2 text-sm text-muted">{s.improve}</p>}
        </div>
      )}
    </div>
  );
}

/** The full written method beside the model answer, every point ticked or missing; exportable as PDF. */
export function MethodReview({ sections }: { sections: MethodSection[] }) {
  const t = useT();
  const s = t.chem.notebook;
  const [busy, setBusy] = useState(false);
  const met = sections.reduce((n, sec) => n + sec.points.filter((p) => p.met).length, 0);
  const total = sections.reduce((n, sec) => n + sec.points.length, 0);

  async function exportPdf() {
    setBusy(true);
    try {
      const { makeNotesPdf } = await import("./notes-pdf");
      await makeNotesPdf(sections, { title: s.pdfTitle, mine: s.yourMethod, model: s.modelAnswer, points: s.markingPoints, empty: s.notWritten });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6">
      <h3 className="text-lg font-bold">{s.methodTitle}</h3>
      <p className="text-muted">{fmt(s.pointsMet, { n: met, total })}</p>
      <div className="mt-3 space-y-4">
        {sections.map((sec) => (
          <article key={sec.id} className="card p-4">
            <h4 className="font-bold">{sec.title}</h4>
            <p className="mt-2 text-sm font-semibold text-muted">{s.yourMethod}</p>
            <p className="whitespace-pre-line">{sec.text || <span className="text-muted">{s.notWritten}</span>}</p>
            <p className="mt-3 text-sm font-semibold text-muted">{s.modelAnswer}</p>
            <p className="rounded-lg bg-ok-soft p-2">{sec.model}</p>
            <PointList points={sec.points} />
          </article>
        ))}
      </div>
      <button type="button" className="btn btn-primary mt-4 w-full" disabled={busy} onClick={exportPdf}>
        {busy ? t.cv.downloading : s.savePdf}
      </button>
    </section>
  );
}
