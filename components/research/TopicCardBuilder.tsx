"use client";
/**
 * The final step: the learner's own topic card (title, problem, questions, objectives, keywords), checked like a
 * supervisor would, then copied or sent on WhatsApp. It starts from the topic saved in the funnel.
 */
import { useState } from "react";
import type { TopicCardTask } from "@/lib/research/types";
import { checkTopicCard, topicCardText, type TopicCard } from "@/lib/research/topic";
import { loadTopic, saveTopic } from "@/lib/research/store";
import { useT } from "@/components/I18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";

export function TopicCardBuilder({ task, passed, onPass }: { task: TopicCardTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.research.card;
  const { reportAttempt } = useLesson();
  const [card, setCard] = useState<TopicCard>(() => {
    const saved = typeof window === "undefined" ? null : loadTopic();
    return {
      title: saved?.title ?? "",
      problem: saved?.problem ?? "",
      questions: saved?.questions?.length ? saved.questions : ["", ""],
      objectives: saved?.objectives?.length ? saved.objectives : ["", ""],
      keywords: saved?.keywords ?? "",
    };
  });
  const [issues, setIssues] = useState<string[] | null>(passed ? [] : null);
  const [copied, setCopied] = useState(false);
  const ready = issues !== null && issues.length === 0;
  const text = topicCardText(card, s.labels);

  const set = (patch: Partial<TopicCard>) => {
    setCard((c) => ({ ...c, ...patch }));
    setIssues(null);
  };
  const setItem = (key: "questions" | "objectives", i: number, v: string) => set({ [key]: card[key].map((x, k) => (k === i ? v : x)) });

  function check() {
    const found = checkTopicCard(card);
    setIssues(found);
    saveTopic({ title: card.title, problem: card.problem, questions: card.questions, objectives: card.objectives, keywords: card.keywords });
    reportAttempt(found.length === 0, found);
    if (!found.length) onPass();
  }

  const field = "mt-1.5 w-full rounded-xl border-2 border-line bg-surface p-3 text-[0.92rem]";
  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <div className="mt-4 space-y-5">
        <label className="block">
          <span className="font-semibold">{s.labels.title}</span>
          <span className="block text-sm text-muted">{s.help.title}</span>
          <textarea rows={2} value={card.title} onChange={(e) => set({ title: e.target.value })} className={field} />
        </label>
        <label className="block">
          <span className="font-semibold">{s.labels.problem}</span>
          <span className="block text-sm text-muted">{s.help.problem}</span>
          <textarea rows={4} value={card.problem} onChange={(e) => set({ problem: e.target.value })} className={field} />
        </label>
        {(["questions", "objectives"] as const).map((key) => (
          <div key={key}>
            <p className="font-semibold">{s.labels[key]}</p>
            <p className="text-sm text-muted">{s.help[key]}</p>
            {card[key].map((v, i) => (
              <div key={i} className="mt-2 flex items-start gap-2">
                <span className="mt-3 w-9 shrink-0 text-sm font-bold text-muted">{key === "questions" ? `RQ${i + 1}` : `O${i + 1}`}</span>
                <textarea rows={2} value={v} onChange={(e) => setItem(key, i, e.target.value)} placeholder={key === "questions" ? s.questionPlaceholder : s.objectivePlaceholder} className={`${field} mt-0`} />
              </div>
            ))}
            {card[key].length < 4 && (
              <button type="button" className="mt-2 text-sm font-semibold text-primary" onClick={() => set({ [key]: [...card[key], ""] })}>
                + {key === "questions" ? s.addQuestion : s.addObjective}
              </button>
            )}
          </div>
        ))}
        <label className="block">
          <span className="font-semibold">{s.labels.keywords}</span>
          <span className="block text-sm text-muted">{s.help.keywords}</span>
          <input value={card.keywords} onChange={(e) => set({ keywords: e.target.value })} className={field} />
        </label>
      </div>

      {!ready && (
        <button type="button" className="btn btn-primary mt-5 w-full" onClick={check}>
          {s.check}
        </button>
      )}
      {issues && issues.length > 0 && <Feedback kind="err" title={t.task.tryAgain} messages={issues.map((i) => s.issues[i as keyof typeof s.issues])} />}

      {ready && (
        <div className="mt-5">
          <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-[#e6d9a8] bg-[#fffdf3] p-4 text-[0.85rem] leading-relaxed" style={{ fontFamily: "inherit" }}>
            {text}
          </pre>
          <div className="mt-3 grid gap-2 min-[420px]:grid-cols-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                navigator.clipboard?.writeText(text).then(() => setCopied(true), () => setCopied(false));
              }}
            >
              {copied ? s.copied : s.copy}
            </button>
            <a className="btn btn-primary" href={`https://wa.me/?text=${encodeURIComponent(`${s.whatsappIntro}\n\n${text}`)}`} target="_blank" rel="noopener noreferrer">
              {s.whatsapp}
            </a>
          </div>
          <button type="button" className="mt-3 w-full text-sm font-semibold text-primary" onClick={() => setIssues(null)}>
            {s.edit}
          </button>
        </div>
      )}
    </div>
  );
}
