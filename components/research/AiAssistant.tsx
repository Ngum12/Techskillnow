"use client";
/**
 * Using AI honestly: a practice AI chat. Honest prompts (brainstorm, narrow, keywords, explain) move the learner
 * on; misconduct prompts get the realistic answer an AI would give, plus a coach card on why it is not allowed.
 * Then the learner checks the references the AI suggests in a practice Scholar (one does not exist), and chooses
 * an honest statement of AI use.
 */
import { useEffect, useRef, useState } from "react";
import type { AiAssistantTask, AiPrompt } from "@/lib/research/types";
import { classifyPrompt } from "@/lib/research/reading";
import { search, type Source } from "@/lib/research/search";
import { loadTopic } from "@/lib/research/store";
import sourcesJson from "@/content/research/sources.json" with { type: "json" };
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";

const SOURCES = sourcesJson as Source[];
type Msg = { from: "ai" | "me"; text: string };
type Coach = { ok: boolean; text: string };

function Spark() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#14b8a6] text-[0.8rem] text-white" aria-hidden="true">
      ✦
    </span>
  );
}

function Bubble({ m }: { m: Msg }) {
  if (m.from === "me") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-[#f1f3f6] px-3.5 py-2 text-[0.88rem] text-[#111827]">{m.text}</p>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <Spark />
      <p className="min-w-0 flex-1 whitespace-pre-line pt-0.5 text-[0.88rem] leading-relaxed text-[#111827]">{m.text}</p>
    </div>
  );
}

export function AiAssistant({ task, passed, onPass }: { task: AiAssistantTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.research.ai;
  const { reportAttempt } = useLesson();
  const [topic] = useState(() => (typeof window === "undefined" ? null : loadTopic())?.title ?? s.defaultTopic);
  const fill = (x: string) => x.replace(/\{topic\}/g, topic);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "ai", text: fill(task.greeting) }]);
  const [stage, setStage] = useState(passed ? task.stages.length + 2 : 0);
  const [typing, setTyping] = useState(false);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<Record<number, string>>({});
  const [verdict, setVerdict] = useState<Record<number, boolean>>({});
  const [verifyWrong, setVerifyWrong] = useState<number | null>(null);
  const [pick, setPick] = useState<number | null>(passed ? task.disclosure.answer : null);
  const end = useRef<HTMLDivElement>(null);
  const inVerify = stage === task.stages.length;
  const inDisclosure = stage === task.stages.length + 1;
  const finished = stage >= task.stages.length + 2;
  const cur = task.stages[stage];

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [msgs, typing]);

  /** Send a message, show the AI "typing", then its reply and the coach's verdict. */
  function send(text: string, reply: string, verdict: Coach, advance: boolean) {
    if (typing) return;
    setMsgs((m) => [...m, { from: "me", text }]);
    setCoach(null);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "ai", text: reply }]);
      setCoach(verdict);
      reportAttempt(verdict.ok, verdict.ok ? [] : [text]);
      if (advance) {
        const n = stage + 1;
        setStage(n);
        if (n === task.stages.length) {
          // The learner asks for sources: the AI answers with references to check.
          setTimeout(() => setMsgs((m) => [...m, { from: "me", text: fill(task.verify.prompt) }, { from: "ai", text: `${fill(task.verify.reply)}\n\n${task.verify.refs.map((r, i) => `${i + 1}. ${r.text}`).join("\n")}` }]), 700);
        }
      }
    }, 900);
  }

  function choose(p: AiPrompt) {
    send(fill(p.text), fill(p.reply), { ok: p.ok, text: p.coach }, p.ok);
  }

  function typed() {
    const text = input.trim();
    if (!text || !cur) return;
    setInput("");
    const kind = classifyPrompt(text);
    send(text, fmt(s.typed[kind], { topic }), { ok: kind === "honest", text: s.typedCoach[kind] }, kind === "honest");
  }

  function check(i: number) {
    const hits = search(SOURCES, task.verify.refs[i].query, { scholar: true });
    setChecked((c) => ({ ...c, [i]: hits[0] ? hits[0].source.title : "" }));
  }

  function judge(i: number, real: boolean) {
    const ok = real === task.verify.refs[i].real;
    if (!ok) {
      setVerifyWrong(i);
      reportAttempt(false, [task.verify.refs[i].text]);
      return;
    }
    setVerifyWrong(null);
    const next = { ...verdict, [i]: real };
    setVerdict(next);
    if (task.verify.refs.every((_, k) => k in next)) setStage(task.stages.length + 1);
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <div className="mt-3 rounded-xl bg-primary-soft p-4" aria-live="polite">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {finished ? s.allDone : inVerify ? s.verifyTitle : inDisclosure ? s.disclosureTitle : fmt(s.stageOf, { n: stage + 1, total: task.stages.length })}
        </p>
        <p className="mt-1 font-semibold">{finished ? task.success : inVerify ? task.verify.instruction : inDisclosure ? task.disclosure.question : cur.instruction}</p>
      </div>

      {/* The chat */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_24px_-14px_rgba(17,24,39,0.35)]">
        <div className="flex items-center justify-between border-b border-[#f0f1f3] px-3.5 py-2.5">
          <span className="flex items-center gap-2 text-[0.88rem] font-semibold text-[#111827]">
            <Spark />
            {s.name}
            <span className="rounded bg-[#eef2ff] px-1.5 py-0.5 text-[0.62rem] font-bold text-[#4338ca]">AI</span>
          </span>
          <span className="text-[0.7rem] text-[#6b7280]">{s.newChat}</span>
        </div>
        <div className="max-h-[26rem] space-y-4 overflow-y-auto px-3.5 py-4">
          {msgs.map((m, i) => (
            <Bubble key={i} m={m} />
          ))}
          {typing && (
            <div className="flex gap-2.5">
              <Spark />
              <span className="flex items-center gap-1 pt-2" aria-label={s.typing}>
                {[0, 1, 2].map((k) => (
                  <span key={k} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9ca3af]" style={{ animationDelay: `${k * 150}ms` }} />
                ))}
              </span>
            </div>
          )}
          <div ref={end} />
        </div>
        {cur && (
          <div className="border-t border-[#f0f1f3] px-3 pb-3 pt-2.5">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]">
              {cur.prompts.map((p) => (
                <button key={p.text} type="button" disabled={typing} onClick={() => choose(p)} className="max-w-[16rem] shrink-0 rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-3 py-2 text-left text-[0.78rem] leading-snug text-[#374151] hover:border-[#a5b4fc] disabled:opacity-50">
                  {fill(p.text)}
                </button>
              ))}
            </div>
            <form
              className="flex items-end gap-2 rounded-2xl border border-[#e5e7eb] bg-white px-3 py-2"
              onSubmit={(e) => {
                e.preventDefault();
                typed();
              }}
            >
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={1} placeholder={fmt(s.placeholder, { name: s.name })} aria-label={s.placeholderLabel} className="max-h-24 min-h-7 flex-1 resize-none bg-transparent text-[0.88rem] outline-none" />
              <button type="submit" disabled={!input.trim() || typing} aria-label={s.send} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111827] text-white disabled:bg-[#d1d5db]">
                ↑
              </button>
            </form>
            <p className="mt-1.5 text-center text-[0.66rem] text-[#6b7280]">{s.mistakes}</p>
          </div>
        )}
      </div>

      {coach && !inDisclosure && !finished && <Feedback kind={coach.ok ? "ok" : "err"} title={coach.ok ? s.honest : s.misconduct} messages={[coach.text]} />}

      {/* Checking the AI's references */}
      {(inVerify || inDisclosure || finished) && (
        <div className="mt-5 space-y-3">
          {task.verify.refs.map((r, i) => {
            const done = i in verdict;
            return (
              <div key={i} className={`rounded-xl border-2 p-3 ${done ? (r.real ? "border-ok bg-ok-soft" : "border-[#d97706] bg-[#fffbeb]") : verifyWrong === i ? "border-err bg-err-soft" : "border-line bg-surface"}`}>
                <p className="text-[0.85rem]" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
                  {i + 1}. {r.text}
                </p>
                {!(i in checked) && !done && (
                  <button type="button" className="btn btn-secondary mt-2 min-h-10 w-full py-1.5 text-[0.85rem]" onClick={() => check(i)}>
                    🔎 {s.checkScholar}
                  </button>
                )}
                {i in checked && (
                  <p className="mt-2 rounded-lg bg-white px-2.5 py-1.5 text-[0.78rem]">
                    <span className="font-semibold">Google Scholar: </span>
                    {checked[i] ? <span className="text-[#1a0dab]">{checked[i]}</span> : <span className="text-err">{s.noResults}</span>}
                  </p>
                )}
                {i in checked && !done && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button type="button" className="btn btn-secondary min-h-10 py-1.5 text-[0.85rem]" onClick={() => judge(i, true)}>
                      {s.real}
                    </button>
                    <button type="button" className="btn btn-secondary min-h-10 py-1.5 text-[0.85rem]" onClick={() => judge(i, false)}>
                      {s.fake}
                    </button>
                  </div>
                )}
                {(done || verifyWrong === i) && <p className="mt-2 text-[0.8rem]">{done ? r.why : s.lookAgain}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* An honest statement of AI use */}
      {(inDisclosure || finished) && (
        <div className="mt-6">
          <p className="font-semibold">{task.disclosure.question}</p>
          <div className="mt-2 grid gap-2">
            {task.disclosure.options.map((o, i) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  if (finished) return;
                  setPick(i);
                  const ok = i === task.disclosure.answer;
                  reportAttempt(ok, ok ? [] : [o]);
                  if (ok) {
                    setStage(task.stages.length + 2);
                    onPass();
                  }
                }}
                className={`min-h-12 rounded-xl border-2 px-4 py-2.5 text-left text-[0.88rem] ${pick === i ? (i === task.disclosure.answer ? "border-ok bg-ok-soft" : "border-err bg-err-soft") : "border-line bg-surface"}`}
              >
                {o}
              </button>
            ))}
          </div>
          {pick !== null && (pick === task.disclosure.answer ? <Feedback kind="ok" title={t.task.correct} messages={[task.disclosure.why, task.success]} /> : <Feedback kind="err" title={t.task.wrong} messages={[s.disclosureHint]} />)}
        </div>
      )}
    </div>
  );
}
