"use client";
import { useState } from "react";
import type { SectionOrderTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { ReorderList } from "@/components/cv/ReorderList";
import { Feedback } from "./Feedback";

export function SectionOrder({ task, passed, onPass }: { task: SectionOrderTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.order;
  const { reportAttempt } = useLesson();
  const [round, setRound] = useState(passed ? task.rounds.length - 1 : 0);
  const [order, setOrder] = useState<string[]>(() => task.rounds[passed ? task.rounds.length - 1 : 0].sections.map((x) => x.id));
  const [marks, setMarks] = useState<Record<string, "ok" | "err"> | null>(null);
  const [done, setDone] = useState(passed);
  const r = task.rounds[round];
  const byId = Object.fromEntries(r.sections.map((x) => [x.id, x]));

  function check() {
    const m: Record<string, "ok" | "err"> = {};
    order.forEach((id, i) => (m[id] = r.answer[i] === id ? "ok" : "err"));
    setMarks(m);
    const wrong = order.filter((id) => m[id] === "err");
    reportAttempt(wrong.length === 0, wrong.map((id) => `${r.persona}: ${byId[id].label}`));
    if (wrong.length === 0 && round === task.rounds.length - 1) {
      setDone(true);
      onPass();
    }
  }

  function next() {
    const nr = round + 1;
    setRound(nr);
    setOrder(task.rounds[nr].sections.map((x) => x.id));
    setMarks(null);
  }

  const allOk = marks && Object.values(marks).every((m) => m === "ok");
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">{fmt(s.round, { n: round + 1, total: task.rounds.length })}</p>
      <p className="mt-1 rounded-lg bg-primary-soft p-3 font-semibold">{r.persona}</p>
      <p className="mt-3 font-semibold">{r.instruction}</p>
      <p className="mb-3 text-sm text-muted">{s.how}</p>
      <ReorderList
        items={order.map((id) => ({ id, label: byId[id].label }))}
        onChange={(ids) => {
          setOrder(ids);
          setMarks(null);
        }}
        marks={marks ?? undefined}
        disabled={done}
      />
      {!done && !allOk && (
        <button type="button" className="btn btn-secondary mt-4 w-full" onClick={check}>
          {t.task.check}
        </button>
      )}
      {marks && !allOk && (
        <Feedback kind="err" title={t.task.tryAgain} messages={order.filter((id) => marks[id] === "err").map((id) => `${byId[id].label}: ${byId[id].why}`)} />
      )}
      {allOk && !done && (
        <>
          <Feedback kind="ok" title={t.task.correct} messages={[s.roundDone]} />
          <button type="button" className="btn btn-primary mt-3 w-full" onClick={next}>
            {s.next}
          </button>
        </>
      )}
      {done && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
