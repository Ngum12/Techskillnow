"use client";
import { useEffect, useRef, useState } from "react";
import type { ExperienceMinerTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import type { CvRawExperience } from "@/lib/cv/model";
import { Feedback } from "./Feedback";

type Message = { from: "bot" | "me"; text: string };
type Answer = { what: string; where: string; when: string; result: string };

/** Scripted interview (no AI) that proves "I have no experience" wrong and saves what it finds to the CV. */
export function ExperienceMiner({ task, passed, onPass }: { task: ExperienceMinerTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.miner;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const [q, setQ] = useState(0);
  const [follow, setFollow] = useState(-1); // -1 = the yes/no question
  const [answer, setAnswer] = useState<Answer>({ what: "", where: "", when: "", result: "" });
  const [input, setInput] = useState("");
  const [log, setLog] = useState<Message[]>(() => [
    { from: "bot", text: task.intro },
    { from: "bot", text: `${task.questions[0].ask} ${task.questions[0].examples}` },
  ]);
  const [found, setFound] = useState<CvRawExperience[]>([]);
  const [done, setDone] = useState(passed);
  const end = useRef<HTMLDivElement>(null);
  const question = task.questions[q];

  useEffect(() => end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), [log]);

  function say(...messages: Message[]) {
    setLog((l) => [...l, ...messages]);
  }

  function nextQuestion(saved: CvRawExperience[]) {
    if (q + 1 < task.questions.length) {
      const nq = task.questions[q + 1];
      setQ(q + 1);
      setFollow(-1);
      setAnswer({ what: "", where: "", when: "", result: "" });
      say({ from: "bot", text: `${nq.ask} ${nq.examples}` });
      return;
    }
    // Finished: save everything to the CV.
    store?.update((cv) => {
      const keep = cv.raw.filter((r) => !saved.some((x) => x.question === r.question));
      const experiences = [...cv.experiences];
      for (const r of saved) {
        const qq = task.questions.find((x) => x.id === r.question)!;
        const id = `m${r.question}`.slice(0, 16);
        const bullet = [r.what, r.result].filter(Boolean).join(", ");
        const entry = { id, title: qq.titleHint, org: r.where, place: "", start: r.when, end: "", bullets: bullet ? [bullet] : [] };
        const at = experiences.findIndex((e) => e.id === id);
        if (at >= 0) experiences[at] = { ...experiences[at], ...entry, bullets: experiences[at].bullets.length ? experiences[at].bullets : entry.bullets };
        else experiences.push(entry);
      }
      return { ...cv, raw: [...keep, ...saved], experiences };
    });
    say({ from: "bot", text: saved.length ? fmt(s.summary, { n: saved.length }) : s.summaryNone });
    setDone(true);
    reportAttempt(true, []);
    onPass();
  }

  function yes() {
    say({ from: "me", text: s.yes }, { from: "bot", text: question.followUps[0].ask });
    setFollow(0);
  }

  function no() {
    say({ from: "me", text: s.no });
    nextQuestion(found);
  }

  function send(skip = false) {
    const f = question.followUps[follow];
    const value = skip ? "" : input.trim();
    if (!skip && !value) return;
    const nextAnswer = { ...answer, [f.key]: value };
    setAnswer(nextAnswer);
    setInput("");
    say({ from: "me", text: skip ? s.skipped : value });
    if (follow + 1 < question.followUps.length) {
      setFollow(follow + 1);
      say({ from: "bot", text: question.followUps[follow + 1].ask });
    } else {
      const item: CvRawExperience = { id: question.id, question: question.id, ...nextAnswer };
      const nextFound = item.what ? [...found, item] : found;
      setFound(nextFound);
      if (item.what) say({ from: "bot", text: s.saved });
      nextQuestion(nextFound);
    }
  }

  if (done && passed && found.length === 0) {
    const raw = store?.cv.raw ?? [];
    return (
      <div>
        <Feedback kind="ok" title={t.task.correct} messages={[raw.length ? fmt(s.summary, { n: raw.length }) : task.success]} />
        <ul className="mt-3 space-y-2">
          {raw.map((r) => (
            <li key={r.id} className="card p-3">
              <p className="font-semibold">{task.questions.find((x) => x.id === r.question)?.titleHint ?? r.question}</p>
              <p className="text-muted">{[r.what, r.where, r.when, r.result].filter(Boolean).join(" · ")}</p>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn-ghost mt-2 w-full"
          onClick={() => {
            setQ(0);
            setFollow(-1);
            setFound([]);
            setAnswer({ what: "", where: "", when: "", result: "" });
            setLog([{ from: "bot", text: `${task.questions[0].ask} ${task.questions[0].examples}` }]);
            setDone(false);
          }}
        >
          {s.again}
        </button>
      </div>
    );
  }

  const f = follow >= 0 ? question.followUps[follow] : null;
  return (
    <div>
      <div className="card flex max-h-[26rem] flex-col gap-2 overflow-y-auto bg-[#f4f1ea] p-3" aria-live="polite">
        {log.map((m, i) => (
          <p
            key={i}
            className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 ${m.from === "bot" ? "self-start rounded-tl-sm bg-surface" : "self-end rounded-tr-sm bg-primary text-white"}`}
          >
            {m.text}
          </p>
        ))}
        <div ref={end} />
      </div>

      {!done && f === null && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button type="button" className="btn btn-primary" onClick={yes}>
            {s.yes}
          </button>
          <button type="button" className="btn btn-secondary" onClick={no}>
            {s.no}
          </button>
        </div>
      )}
      {!done && f && (
        <form
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <textarea className="input min-h-20" placeholder={f.placeholder} value={input} onChange={(e) => setInput(e.target.value)} aria-label={f.ask} />
          <div className="mt-2 flex gap-3">
            {f.key !== "what" && (
              <button type="button" className="btn btn-ghost flex-1" onClick={() => send(true)}>
                {s.skip}
              </button>
            )}
            <button type="submit" className="btn btn-primary flex-[2]" disabled={!input.trim()}>
              {s.send}
            </button>
          </div>
        </form>
      )}
      {done && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
      <p className="mt-2 text-center text-sm text-muted">{fmt(s.progress, { n: Math.min(q + 1, task.questions.length), total: task.questions.length })}</p>
    </div>
  );
}
