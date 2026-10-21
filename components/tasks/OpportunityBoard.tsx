"use client";
import { useMemo, useState } from "react";
import type { Listing, OpportunityBoardTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "./Feedback";

type Decision = "shortlist" | "reject";
const shouldShortlist = (l: Listing) => l.eligible && !l.expired && !l.fake;

/** A listings board mixing real, expired, fake and out-of-reach offers: shortlist only the right ones. */
export function OpportunityBoard({ task, passed, onPass }: { task: OpportunityBoardTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim3.board;
  const { reportAttempt } = useLesson();
  const [decisions, setDecisions] = useState<Record<string, Decision>>(() =>
    passed ? Object.fromEntries(task.listings.map((l) => [l.id, shouldShortlist(l) ? "shortlist" : "reject"])) : {},
  );
  const [location, setLocation] = useState("");
  const [field, setField] = useState("");
  const [checked, setChecked] = useState(passed);

  const locations = useMemo(() => [...new Set(task.listings.map((l) => l.location))], [task]);
  const fields = useMemo(() => [...new Set(task.listings.map((l) => l.field))], [task]);
  const visible = task.listings.filter((l) => (!location || l.location === location) && (!field || l.field === field));
  const wrong = task.listings.filter((l) => decisions[l.id] && (decisions[l.id] === "shortlist") !== shouldShortlist(l));
  const decided = Object.keys(decisions).length;
  const shortlisted = Object.values(decisions).filter((d) => d === "shortlist").length;
  const target = task.listings.filter(shouldShortlist).length;

  function decide(id: string, d: Decision) {
    setDecisions({ ...decisions, [id]: d });
    setChecked(false);
  }

  function check() {
    setChecked(true);
    const ok = wrong.length === 0 && decided === task.listings.length;
    reportAttempt(ok, wrong.map((l) => l.title));
    if (ok) onPass();
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <p className="mt-2 rounded-lg bg-primary-soft p-3 text-[0.95rem]">
        <span className="font-semibold">{s.you}: </span>
        {task.persona}
      </p>
      <p className="mt-2 text-sm font-semibold text-muted">{fmt(s.today, { date: task.today })}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label>
          <span className="text-sm text-muted">{s.location}</span>
          <select className="input" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">{s.all}</option>
            {locations.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm text-muted">{s.field}</span>
          <select className="input" value={field} onChange={(e) => setField(e.target.value)}>
            <option value="">{s.all}</option>
            {fields.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {visible.map((l) => {
          const d = decisions[l.id];
          const isWrong = checked && wrong.includes(l);
          return (
            <li key={l.id} className={`card p-4 ${isWrong ? "border-2 border-err" : d === "shortlist" ? "border-2 border-ok" : ""}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <h3 className="font-bold">{l.title}</h3>
                <span className="text-sm text-muted">{l.field}</span>
              </div>
              <p className="text-sm">
                {l.org} · {l.location}
              </p>
              <p className="mt-1 text-sm">
                <span className="text-muted">{s.deadline}: </span>
                <span className="font-semibold">{l.deadline}</span>
              </p>
              <p className="mt-2 text-[0.95rem]">{l.details}</p>
              <p className="mt-1 text-sm text-muted">
                {s.contact}: {l.contact}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={d === "shortlist"}
                  onClick={() => decide(l.id, "shortlist")}
                  className={`btn min-h-11 py-2 text-sm ${d === "shortlist" ? "btn-primary" : "btn-secondary"}`}
                >
                  ★ {s.shortlist}
                </button>
                <button
                  type="button"
                  aria-pressed={d === "reject"}
                  onClick={() => decide(l.id, "reject")}
                  className={`btn min-h-11 py-2 text-sm ${d === "reject" ? "bg-ink text-white" : "btn-secondary"}`}
                >
                  ✕ {s.reject}
                </button>
              </div>
              {isWrong && <p className="mt-2 rounded-lg bg-err-soft p-2 text-[0.95rem] text-err">{l.why}</p>}
              {checked && !isWrong && d && <p className="mt-2 text-sm text-ok">✓ {l.why}</p>}
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-sm text-muted" aria-live="polite">
        {fmt(s.progress, { n: decided, total: task.listings.length, s: shortlisted, target })}
      </p>
      <button type="button" className="btn btn-secondary mt-2 w-full" disabled={decided < task.listings.length} onClick={check}>
        {t.task.check}
      </button>
      {checked &&
        (wrong.length === 0 ? (
          <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />
        ) : (
          <Feedback kind="err" title={fmt(s.wrongCount, { n: wrong.length })} messages={[s.fixHint]} />
        ))}
    </div>
  );
}
