"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "./I18n";
import { fmt } from "@/lib/i18n";
import { Feedback } from "./tasks/Feedback";

type Reply = { from: string; subject: string; body: string; instruction: string };
type MissionState = { gmail: string; status: "waiting" | "passed" | "failed"; feedback: string[]; stage?: "application" | "reply"; reply?: Reply | null } | null;

export function MissionPanel({
  courseId,
  missionEmail,
  subjectExample,
  initial,
  advert,
}: {
  courseId: string;
  missionEmail: string;
  subjectExample: string;
  initial: MissionState;
  advert?: { org: string; title: string; text: string };
}) {
  const t = useT();
  const [mission, setMission] = useState<MissionState>(initial);
  const [editing, setEditing] = useState(!initial);
  const [gmail, setGmail] = useState(initial?.gmail ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // Poll for the result while waiting (every 15 s, only while the page is visible).
  useEffect(() => {
    if (editing || !mission || mission.status === "passed") return;
    const timer = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      const res = await fetch(`/api/mission?course=${courseId}`).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        if (data.status) setMission({ gmail: data.gmail, status: data.status, feedback: data.feedback ?? [], stage: data.stage, reply: data.reply });
      }
    }, 15_000);
    return () => clearInterval(timer);
  }, [courseId, editing, mission]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const value = gmail.trim().toLowerCase();
    if (!/^[a-z0-9.+_-]{3,64}@gmail\.com$/.test(value)) return setError(t.mission.invalidGmail);
    setBusy(true);
    setError(null);
    const res = await fetch("/api/mission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, gmail: value }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setError(res?.status === 400 ? t.mission.invalidGmail : t.common.errorGeneric);
    setMission({ gmail: value, status: "waiting", feedback: [] });
    setEditing(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(missionEmail);
      setCopied(true);
    } catch {}
  }

  if (editing) {
    return (
      <form onSubmit={save} className="mt-6" noValidate>
        <label htmlFor="gmail" className="label">
          {t.mission.gmailLabel}
        </label>
        <input
          id="gmail"
          type="email"
          inputMode="email"
          autoCapitalize="none"
          autoComplete="email"
          className="input"
          placeholder="firstname.lastname@gmail.com"
          value={gmail}
          onChange={(e) => setGmail(e.target.value)}
        />
        {error && (
          <p role="alert" className="mt-2 text-err">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary mt-4 w-full" disabled={busy}>
          {t.mission.save}
        </button>
      </form>
    );
  }

  if (mission?.status === "passed") {
    return (
      <div className="mt-6">
        <Feedback kind="ok" title={t.mission.passed} />
        <Link href={`/learn/${courseId}/finish`} className="btn btn-primary mt-6 w-full">
          {t.common.continue}
        </Link>
      </div>
    );
  }

  const reply = mission?.stage === "reply" ? mission.reply : null;
  const gmailHref = `mailto:${missionEmail}?subject=${encodeURIComponent(reply ? `Re: ${reply.subject}` : subjectExample)}`;
  return (
    <div className="mt-6">
      {reply && (
        <section className="mb-4" aria-live="polite">
          <Feedback kind="ok" title={t.mission.appPassed} />
          <h2 className="mt-4 text-lg font-bold">{t.mission.replyTitle}</h2>
          <article className="card mt-2 overflow-hidden">
            <div className="border-b border-line bg-[#f2f6fc] px-4 py-2 text-sm">
              <p className="font-semibold">{reply.from}</p>
              <p>{reply.subject}</p>
            </div>
            <p className="whitespace-pre-line px-4 py-3 text-[0.95rem] leading-relaxed">{reply.body}</p>
          </article>
          <p className="mt-3 rounded-xl bg-warn-soft p-3 font-semibold">{reply.instruction}</p>
          <p className="mt-2 text-sm text-muted">{t.mission.replyHelp}</p>
        </section>
      )}
      {advert && !reply && (
        <details className="card mb-4 p-4" open>
          <summary className="cursor-pointer font-bold text-primary">
            {advert.title} · {advert.org}
          </summary>
          <p className="mt-2 whitespace-pre-line">{advert.text}</p>
        </details>
      )}
      <div className="card p-4">
        <p className="text-sm text-muted">{t.mission.sendTo}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <span className="break-all text-lg font-bold">{missionEmail}</span>
          <button type="button" className="btn btn-secondary min-h-11 py-2 text-sm" onClick={copy}>
            {copied ? t.common.copied : t.common.copy}
          </button>
        </div>
        <p className="mt-3 text-sm text-muted">{fmt(t.mission.subjectHint, { subject: subjectExample })}</p>
        <p className="mt-1 text-sm text-muted">{mission?.gmail}</p>
      </div>
      <a href={gmailHref} className="btn btn-primary mt-4 w-full">
        {reply ? t.mission.replyInGmail : t.mission.openGmail}
      </a>

      {mission?.status === "failed" && <Feedback kind="err" title={t.mission.failed} messages={mission.feedback} />}
      {mission?.status === "waiting" && (
        <div className="mt-4 rounded-xl bg-primary-soft p-4" aria-live="polite">
          <p className="font-semibold">{t.mission.waiting}</p>
          <p className="mt-1 text-sm">{t.mission.manual}</p>
        </div>
      )}
      <button type="button" className="btn btn-ghost mt-2 w-full" onClick={() => setEditing(true)}>
        {t.mission.changeAddress}
      </button>
    </div>
  );
}
