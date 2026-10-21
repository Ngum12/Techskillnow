"use client";
import { useEffect, useState } from "react";
import { useT } from "./I18n";
import { fmt, money } from "@/lib/i18n";
import { getDeviceId } from "@/lib/device";
import { waLink } from "@/lib/whatsapp";

type Summary = {
  enabled: boolean;
  link: string;
  friends: number;
  available: number;
  towardsNext: number;
  perCourse: number;
  discount: number;
  claimable: { id: string; title: string }[];
  claimed: { courseId: string; title: string; code: string | null }[];
};

/** "Invite friends": personal link, progress towards a free course, and claiming it. */
export function ReferralCard({ courseId }: { courseId: string }) {
  const t = useT();
  const s = t.referral;
  const [data, setData] = useState<Summary | null>(null);
  const [copied, setCopied] = useState(false);
  const [choice, setChoice] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState<{ code: string; courseId: string; title: string } | null>(null);

  function load() {
    fetch(`/api/referral?course=${courseId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Summary | null) => {
        setData(d);
        if (d?.claimable[0]) setChoice((c) => c || d.claimable[0].id);
      })
      .catch(() => setData(null));
  }
  useEffect(load, [courseId]);

  if (!data?.enabled) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(data!.link);
      setCopied(true);
    } catch {}
  }

  async function claim() {
    setClaiming(true);
    setClaimError(null);
    const res = await fetch("/api/referral/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, rewardCourseId: choice }),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && body.code) {
      // Unlock it on this phone straight away.
      await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: body.code, deviceId: getDeviceId() }),
      }).catch(() => null);
      setNewCourse({ code: body.code, courseId: body.courseId, title: data!.claimable.find((c) => c.id === body.courseId)?.title ?? "" });
      load();
    } else {
      setClaimError(s.claimErrors[(body.error as keyof typeof s.claimErrors) ?? "server"] ?? s.claimErrors.server);
    }
    setClaiming(false);
  }

  const message = fmt(s.shareMessage, { n: money(data.discount), url: data.link });
  return (
    <section className="card mt-6 p-4">
      <h2 className="text-lg font-bold">{s.title}</h2>
      <p className="mt-1">{fmt(s.how, { n: money(data.discount), per: data.perCourse })}</p>

      <div className="mt-4" aria-label={fmt(s.progress, { n: data.towardsNext, per: data.perCourse })}>
        <div className="flex gap-2" aria-hidden="true">
          {Array.from({ length: data.perCourse }, (_, i) => (
            <span key={i} className={`h-3 flex-1 rounded-full ${i < data.towardsNext ? "bg-primary" : "bg-line"}`} />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">
          {fmt(s.progress, { n: data.towardsNext, per: data.perCourse })} · {fmt(s.total, { n: data.friends })}
        </p>
      </div>

      <p className="mt-4 break-all rounded-lg bg-bg p-2 font-mono text-sm">{data.link}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" className="btn btn-secondary min-h-11 py-2 text-sm" onClick={copy}>
          {copied ? t.common.copied : t.common.copy}
        </button>
        <a href={waLink("", message)} target="_blank" rel="noopener noreferrer" className="btn btn-primary min-h-11 py-2 text-sm">
          {s.shareWhatsApp}
        </a>
      </div>

      {data.available > 0 && !newCourse && (
        <div className="mt-5 rounded-xl border-2 border-ok bg-ok-soft p-4">
          <p className="font-bold text-ok">{fmt(s.earned, { n: data.available })}</p>
          {data.claimable.length ? (
            <>
              <label className="mt-2 block">
                <span className="label">{s.pick}</span>
                <select className="input" value={choice} onChange={(e) => setChoice(e.target.value)}>
                  {data.claimable.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn btn-primary mt-3 w-full" disabled={claiming || !choice} onClick={claim}>
                {claiming ? s.claiming : s.claim}
              </button>
            </>
          ) : (
            <p className="mt-1">{s.allOwned}</p>
          )}
          {claimError && (
            <p role="alert" className="mt-2 text-err">
              {claimError}
            </p>
          )}
        </div>
      )}

      {newCourse && (
        <div className="mt-5 rounded-xl border-2 border-ok bg-ok-soft p-4" role="status">
          <p className="font-bold text-ok">{fmt(s.unlocked, { course: newCourse.title })}</p>
          <p className="mt-1">
            {s.yourCode} <span className="font-mono font-bold tracking-wider">{newCourse.code}</span>
          </p>
          <a href={`/learn/${newCourse.courseId}`} className="btn btn-primary mt-3 w-full">
            {s.open}
          </a>
        </div>
      )}

      {data.claimed.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-muted">
          {data.claimed.map((c, i) => (
            <li key={i}>
              ✓ {s.freeCourse}: {c.title} {c.code ? `· ${c.code}` : ""}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
