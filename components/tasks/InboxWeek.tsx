"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { InboxWeekTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { scoreWeek, type WeekAction } from "@/lib/cv/inbox-week";
import { TRACKER_STATUSES } from "./ApplicationTracker";
import { Feedback } from "./Feedback";

/** Simulated hours per real second: the week (168 h) takes about 3.5 minutes, or less with "skip". */
const SPEED = 0.8;
const WEEK = 168;
const START_HOUR = 8; // Monday 08:00

type Score = ReturnType<typeof scoreWeek>;

/** The week after applying, compressed: messages arrive, deadlines run, every reply counts. */
export function InboxWeek({ task, passed, onPass }: { task: InboxWeekTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim3.week;
  const statuses = t.sim3.tracker.statuses as Record<string, string>;
  const { reportAttempt } = useLesson();
  const [started, setStarted] = useState(false);
  const [hour, setHour] = useState(0);
  const [actions, setActions] = useState<WeekAction[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ text: string; attachments: string[] } | null>(null);
  const [tracker, setTracker] = useState<Record<string, string>>({ A: "applied", B: "applied" });
  const [score, setScore] = useState<Score | null>(null);
  const [done, setDone] = useState(passed);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const events = useMemo(() => [...task.events].sort((a, b) => a.at - b.at), [task]);
  const arrived = events.filter((e) => e.at <= hour);
  const actionFor = (id: string) => actions.find((a) => a.eventId === id);
  const running = started && !score && !draft && hour < WEEK;

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => setHour((h) => Math.min(WEEK, h + SPEED / 4)), 250);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  const clock = (h: number) => {
    const total = START_HOUR + h;
    const day = Math.floor(total / 24);
    const hh = Math.floor(total % 24);
    const mm = Math.floor(((total % 1) * 60) / 15) * 15;
    return `${s.days[Math.min(day, 6)]} ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  function act(type: WeekAction["type"], reply?: WeekAction["reply"]) {
    if (!openId) return;
    setActions((a) => [...a.filter((x) => x.eventId !== openId), { eventId: openId, type, at: hour, reply }]);
    setDraft(null);
    setOpenId(null);
  }

  const nextEvent = events.find((e) => e.at > hour);
  function skip() {
    if (nextEvent) setHour(nextEvent.at);
  }

  function finish() {
    const result = scoreWeek(events, actions, tracker, task.requiredFile);
    setScore(result);
    const ok = result.percent >= task.passPercent;
    reportAttempt(ok, result.items.filter((i) => !i.ok).map((i) => `${i.eventId}: ${i.issue}`));
    if (ok) {
      setDone(true);
      onPass();
    }
  }

  function restart() {
    setStarted(false);
    setHour(0);
    setActions([]);
    setOpenId(null);
    setDraft(null);
    setTracker({ A: "applied", B: "applied" });
    setScore(null);
  }

  if (done && !score) {
    return <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />;
  }

  if (!started) {
    return (
      <div>
        <p className="font-semibold">{task.instruction}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.95rem]">
          {s.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => setStarted(true)}>
          ▶ {s.start}
        </button>
      </div>
    );
  }

  if (score) {
    const ok = score.percent >= task.passPercent;
    return (
      <div>
        <p className="text-3xl font-bold">{fmt(s.score, { n: score.percent })}</p>
        <ul className="mt-3 space-y-2">
          {score.items.map((i) => {
            const e = events.find((x) => x.id === i.eventId)!;
            return (
              <li key={i.eventId} className={`rounded-lg border-l-4 p-3 ${i.ok ? "border-ok bg-ok-soft" : "border-err bg-err-soft"}`}>
                <p className="font-semibold">
                  {i.ok ? "✓" : "✕"} {e.email.subject}
                </p>
                <p className="text-[0.95rem]">{i.ok ? s.expect[e.kind] : `${s.issues[i.issue!]} ${s.expect[e.kind]}`}</p>
              </li>
            );
          })}
          {score.tracker.map((tr) => (
            <li key={tr.app} className={`rounded-lg border-l-4 p-3 ${tr.ok ? "border-ok bg-ok-soft" : "border-err bg-err-soft"}`}>
              <p className="font-semibold">
                {tr.ok ? "✓" : "✕"} {fmt(s.trackerRow, { org: task.applications.find((a) => a.id === tr.app)?.org ?? tr.app })}
              </p>
              <p className="text-[0.95rem]">{fmt(s.trackerExpected, { status: statuses[tr.expected] ?? tr.expected })}</p>
            </li>
          ))}
        </ul>
        {ok ? (
          <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />
        ) : (
          <>
            <Feedback kind="err" title={fmt(s.needed, { n: task.passPercent })} messages={[s.tryAgainHint]} />
            <button type="button" className="btn btn-primary mt-3 w-full" onClick={restart}>
              {s.again}
            </button>
          </>
        )}
      </div>
    );
  }

  const open = events.find((e) => e.id === openId);
  return (
    <div>
      <div className="sticky top-[5.5rem] z-[5] flex items-center justify-between gap-2 rounded-xl bg-ink px-3 py-2 text-white">
        <span className="font-mono text-lg font-bold" aria-live="off">
          🕒 {clock(hour)}
        </span>
        <span className="text-sm">{draft ? s.paused : fmt(s.dayOf, { n: Math.min(7, Math.floor((START_HOUR + hour) / 24) + 1) })}</span>
      </div>

      <section className="card mt-3 p-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{s.trackerTitle}</p>
        {task.applications.map((a) => (
          <label key={a.id} className="mt-2 grid grid-cols-[1fr_auto] items-center gap-2">
            <span className="min-w-0 text-[0.95rem]">
              <span className="font-semibold">{a.org}</span> · {a.role}
            </span>
            <select className="input min-h-11 w-40 py-1 text-sm" value={tracker[a.id]} onChange={(e) => {
                const v = e.target.value;
                setTracker((cur) => ({ ...cur, [a.id]: v }));
              }}>
              {TRACKER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {statuses[st]}
                </option>
              ))}
            </select>
          </label>
        ))}
      </section>

      {open ? (
        <section className="card mt-3 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-2">
            <button type="button" className="btn btn-ghost px-3" onClick={() => (setOpenId(null), setDraft(null))}>
              ← {s.back}
            </button>
            <span className="flex-1" />
            {!draft && (
              <>
                <button type="button" className="btn btn-primary min-h-11 px-3 py-2 text-sm" onClick={() => setDraft({ text: "", attachments: [] })}>
                  {s.reply}
                </button>
                <button type="button" className="btn btn-secondary min-h-11 px-3 py-2 text-sm" onClick={() => act("archive")}>
                  {s.archive}
                </button>
                <button type="button" className="btn btn-danger min-h-11 px-3 py-2 text-sm" onClick={() => act("report")}>
                  {s.report}
                </button>
              </>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold">{open.email.subject}</h3>
            <p className="text-sm text-muted">
              {open.email.from} · {open.email.fromEmail}
            </p>
            <p className="mt-3 whitespace-pre-line">{open.email.body}</p>
          </div>
          {draft && (
            <div className="border-t border-line bg-[#fafaf7] p-3">
              <p className="text-sm font-semibold">{fmt(s.replyTo, { to: open.email.fromEmail })}</p>
              <textarea
                className="input mt-2 min-h-36"
                placeholder={s.replyPlaceholder}
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                aria-label={s.reply}
              />
              <p className="mt-2 text-sm font-semibold">{s.attach}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {task.files.map((f) => {
                  const on = draft.attachments.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setDraft({ ...draft, attachments: on ? draft.attachments.filter((x) => x !== f) : [...draft.attachments, f] })}
                      className={`min-h-11 rounded-full border-2 px-3 text-sm ${on ? "border-primary bg-primary text-white" : "border-line bg-surface"}`}
                    >
                      📎 {f}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setDraft(null)}>
                  {s.cancel}
                </button>
                <button type="button" className="btn btn-primary" disabled={!draft.text.trim()} onClick={() => act("reply", draft)}>
                  {s.send}
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="card mt-3 overflow-hidden">
          <p className="border-b border-line px-4 py-2 text-sm font-semibold text-muted">{s.inbox}</p>
          {arrived.length === 0 && <p className="p-4 text-muted">{s.waiting}</p>}
          <ul>
            {[...arrived].reverse().map((e) => {
              const a = actionFor(e.id);
              const left = e.deadlineHours !== undefined ? e.at + e.deadlineHours - hour : null;
              return (
                <li key={e.id}>
                  <button type="button" className="flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left last:border-b-0" onClick={() => setOpenId(e.id)}>
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${a ? "bg-line" : "bg-primary"}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between gap-2">
                        <span className={`truncate ${a ? "" : "font-bold"}`}>{e.email.from}</span>
                        <span className="shrink-0 text-sm text-muted">{clock(e.at).split(" ")[0]}</span>
                      </span>
                      <span className="block truncate">{e.email.subject}</span>
                      {a ? (
                        <span className="text-sm text-ok">✓ {s.done[a.type]}</span>
                      ) : left !== null ? (
                        <span className={`text-sm font-semibold ${left < 0 ? "text-err" : "text-warn"}`}>
                          {left < 0 ? s.overdue : fmt(s.within, { h: Math.ceil(left) })}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {hour >= WEEK && <p className="mt-3 rounded-lg bg-primary-soft p-3 font-semibold">{s.weekOver}</p>}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" className="btn btn-secondary" onClick={skip} disabled={!!draft || !nextEvent}>
          ⏭ {s.skip}
        </button>
        <button type="button" className="btn btn-primary" onClick={finish} disabled={!!draft || arrived.length < events.length}>
          {s.finish}
        </button>
      </div>
    </div>
  );
}
