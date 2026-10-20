"use client";
import { useState } from "react";
import type { InboxAction, InboxTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { Feedback } from "./Feedback";
import { useLesson } from "@/components/LessonContext";

function Avatar({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function MockInbox({ task, passed, onPass }: { task: InboxTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const { reportAttempt } = useLesson();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Record<string, "archive" | "spam">>({});
  const [done, setDone] = useState<boolean[]>(() => task.goals.map(() => passed));
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const allDone = done.every(Boolean);
  const current = task.goals.findIndex((_, i) => !done[i]);

  function act(action: InboxAction, emailId: string) {
    if (allDone) {
      if (action !== "open") setRemoved({ ...removed, [emailId]: action });
      return;
    }
    // Any unfinished goal with this action and target counts, so order doesn't matter for same-action goals.
    const hit = task.goals.findIndex((g, i) => !done[i] && g.action === action && g.target === emailId);
    if (hit >= 0) {
      const next = done.map((d, i) => d || i === hit);
      setDone(next);
      setMessage({ kind: "ok", text: task.goals[hit].done });
      if (action !== "open") {
        setRemoved({ ...removed, [emailId]: action });
        setOpenId(null);
      }
      if (next.every(Boolean)) {
        reportAttempt(true, []);
        onPass();
      }
      return;
    }
    const goal = task.goals[current];
    // Opening an email is always fine; it is only wrong when the current goal is "open" this one.
    if (action === "open" && goal.action !== "open") return;
    setMessage({ kind: "err", text: goal.wrong });
    reportAttempt(false, [goal.wrong]);
  }

  const q = query.trim().toLowerCase();
  const visible = task.emails.filter(
    (e) => !removed[e.id] && (!q || `${e.from} ${e.fromEmail} ${e.subject} ${e.body}`.toLowerCase().includes(q)),
  );
  const open = task.emails.find((e) => e.id === openId);

  return (
    <div>
      <div className="rounded-xl bg-primary-soft p-4" aria-live="polite">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t.inbox.goal}</p>
        <p className="mt-1 font-semibold">{allDone ? task.success : task.goals[current].instruction}</p>
      </div>
      {message && !allDone && <Feedback kind={message.kind} title={message.kind === "ok" ? t.task.correct : t.task.wrong} messages={[message.text]} />}

      <div className="card mt-4 overflow-hidden">
        {open ? (
          <div>
            <div className="flex flex-wrap items-center gap-2 border-b border-line p-2">
              <button type="button" className="btn btn-ghost px-3" onClick={() => setOpenId(null)}>
                ← {t.inbox.backToInbox}
              </button>
              <span className="flex-1" />
              <button type="button" className="btn btn-secondary px-3" onClick={() => act("archive", open.id)}>
                {t.inbox.archive}
              </button>
              <button type="button" className="btn btn-danger px-3" onClick={() => act("spam", open.id)}>
                {t.inbox.spam}
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold">{open.subject}</h3>
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={open.from} />
                <div className="min-w-0">
                  <p className="font-semibold">{open.from}</p>
                  <p className="break-all text-sm text-muted">{open.fromEmail}</p>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line">{open.body}</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="border-b border-line p-3">
              <input
                type="search"
                className="input rounded-full bg-[#eef2f6]"
                placeholder={t.inbox.search}
                aria-label={t.inbox.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <p className="px-4 pt-3 text-sm font-semibold text-muted">{t.inbox.title}</p>
            {visible.length === 0 ? (
              <p className="p-4 text-muted">{t.inbox.empty}</p>
            ) : (
              <ul>
                {visible.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left last:border-b-0"
                      onClick={() => {
                        setOpenId(e.id);
                        act("open", e.id);
                      }}
                    >
                      <Avatar name={e.from} />
                      <span className="min-w-0 flex-1">
                        <span className="flex justify-between gap-2">
                          <span className="truncate font-semibold">{e.from}</span>
                          <span className="shrink-0 text-sm text-muted">{e.time}</span>
                        </span>
                        <span className="block truncate">{e.subject}</span>
                        <span className="block truncate text-sm text-muted">{e.preview}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {allDone && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
