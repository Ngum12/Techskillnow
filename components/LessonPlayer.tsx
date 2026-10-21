"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CvSection, Step } from "@/content/types";
import { useLocale, useT } from "./I18n";
import { fmt } from "@/lib/i18n";
import { Illustration } from "./Illustration";
import { LanguageSwitch } from "./LanguageSwitch";
import { LessonProvider } from "./LessonContext";
import { ReviewCard } from "./ReviewCard";
import { TaskView } from "./tasks/TaskView";
import { CvProvider } from "./cv/CvContext";
import { MyCvPanel } from "./cv/MyCvPanel";

type Props = {
  courseId: string;
  total: number;
  freeSteps: number;
  paid: boolean;
  initialStep: number;
  buyHref: string;
  buyLabel: string;
  tutorEnabled: boolean;
  /** Courses that build the learner's CV: "My CV" in the header, autosaved draft. */
  usesCv?: boolean;
  /** Which step fills each part of the CV, so "My CV" can jump back to it. */
  sectionSteps?: Partial<Record<CvSection, number>>;
};

type Status = "loading" | "ready" | "error" | "locked";

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function LessonPlayer(props: Props) {
  if (props.usesCv && props.paid) {
    return (
      <CvProvider courseId={props.courseId}>
        <Player {...props} cvEnabled />
      </CvProvider>
    );
  }
  return <Player {...props} cvEnabled={false} />;
}

function Player({ courseId, total, freeSteps, paid, initialStep, buyHref, buyLabel, tutorEnabled, sectionSteps = {}, cvEnabled }: Props & { cvEnabled: boolean }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [n, setN] = useState(initialStep);
  const [steps, setSteps] = useState<Record<string, Step>>({});
  const [status, setStatus] = useState<Status>("loading");
  const [reload, setReload] = useState(0);
  const [passed, setPassed] = useState<number[]>([]);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showCv, setShowCv] = useState(false);

  const passedKey = `tsn_passed_${courseId}`;
  const pendingKey = `tsn_pending_${courseId}`;
  const stepKey = `${locale}:${n}`;

  useEffect(() => {
    setPassed(readLocal<number[]>(passedKey, []));
  }, [passedKey]);

  // Spaced review: two questions about earlier steps, once per session, after a few steps.
  useEffect(() => {
    if (!paid || initialStep < 4) return;
    try {
      if (sessionStorage.getItem("tsn_reviewed")) return;
      sessionStorage.setItem("tsn_reviewed", "1");
    } catch {}
    setShowReview(true);
  }, [paid, initialStep]);

  const saveProgress = useCallback(
    async (step: number, completed = false): Promise<boolean> => {
      if (!paid) return true;
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, step, completed }),
        });
        if (!res.ok) throw new Error(String(res.status));
        localStorage.removeItem(pendingKey);
        return true;
      } catch {
        // Offline: remember the furthest step and send it when the connection is back.
        const pending = readLocal<{ step: number; completed: boolean } | null>(pendingKey, null);
        writeLocal(pendingKey, { step: Math.max(step, pending?.step ?? 0), completed: completed || !!pending?.completed });
        return false;
      }
    },
    [courseId, paid, pendingKey],
  );

  // Flush progress saved while offline.
  useEffect(() => {
    if (!paid) return;
    const flush = () => {
      const pending = readLocal<{ step: number; completed: boolean } | null>(pendingKey, null);
      if (pending) saveProgress(pending.step, pending.completed);
    };
    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [paid, pendingKey, saveProgress]);

  // Load the current step from the server (or the offline cache via the service worker).
  useEffect(() => {
    if (!paid && n > freeSteps) {
      setStatus("locked");
      return;
    }
    if (steps[stepKey]) {
      setStatus("ready");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetch(`/api/learn/${courseId}/${n}?lang=${locale}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) return setStatus("locked");
        if (!res.ok) return setStatus("error");
        const data = (await res.json()) as { step: Step };
        if (cancelled) return;
        setSteps((s) => ({ ...s, [stepKey]: data.step }));
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey, reload, courseId, paid, freeSteps]);

  // Remember position: server for paid learners, URL for refreshes.
  useEffect(() => {
    window.scrollTo(0, 0);
    window.history.replaceState(null, "", `?step=${n}`);
    if (paid) saveProgress(n);
  }, [n, paid, saveProgress]);

  function markPassed() {
    setPassed((p) => {
      if (p.includes(n)) return p;
      const next = [...p, n];
      writeLocal(passedKey, next);
      return next;
    });
  }

  async function finish() {
    setFinishing(true);
    setFinishError(false);
    const ok = await saveProgress(total, true);
    if (ok) {
      router.push(`/learn/${courseId}/finish`);
    } else {
      setFinishError(true);
      setFinishing(false);
    }
  }

  const lesson = useMemo(
    () => ({
      courseId,
      step: n,
      paid,
      tutorEnabled,
      reportAttempt: (ok: boolean, failed: string[]) => {
        if (!paid) return;
        fetch("/api/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, step: n, passed: ok, failed }),
          keepalive: true,
        }).catch(() => {});
      },
    }),
    [courseId, n, paid, tutorEnabled],
  );

  const step = steps[stepKey];
  const needsTask = status === "ready" && !!step?.task && !passed.includes(n);
  const isLast = n === total;

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-bg px-5 pb-3 pt-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="font-bold text-primary">
            {t.appName}
          </Link>
          <div className="flex items-center gap-2">
            {cvEnabled && (
              <button type="button" className="btn btn-secondary min-h-11 px-3 py-1.5 text-sm" onClick={() => setShowCv(true)}>
                📄 {t.cv.myCv}
              </button>
            )}
            <LanguageSwitch />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={n}>
            <div className="h-full rounded-full bg-primary" style={{ width: `${(n / total) * 100}%` }} />
          </div>
          <span className="shrink-0 text-sm font-semibold text-muted" aria-live="polite">
            {fmt(t.learn.progress, { n, total })}
          </span>
        </div>
      </header>

      <main className="flex-1 px-5 pb-6 pt-5">
        {showReview ? (
          <ReviewCard courseId={courseId} upto={n} onDone={() => setShowReview(false)} />
        ) : (
          <>
            {status === "loading" && <p className="py-16 text-center text-muted">{t.common.loading}</p>}

            {status === "error" && (
              <div className="py-12 text-center">
                <p>{typeof navigator !== "undefined" && !navigator.onLine ? t.common.offline : t.learn.loadError}</p>
                <button type="button" className="btn btn-secondary mt-4" onClick={() => setReload((r) => r + 1)}>
                  {t.common.retry}
                </button>
              </div>
            )}

            {status === "locked" && (
              <div className="py-6">
                <h1 className="text-2xl font-bold">{t.learn.locked}</h1>
                <p className="mt-3">{fmt(t.learn.lockedText, { n: total - freeSteps })}</p>
                <div className="mt-6 flex flex-col gap-3">
                  <a href={buyHref} className="btn btn-primary w-full" {...(buyHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {buyLabel}
                  </a>
                  <Link href="/redeem" className="btn btn-secondary w-full">
                    {t.learn.haveCode}
                  </Link>
                </div>
              </div>
            )}

            {status === "ready" && step && (
              <article>
                {n <= freeSteps && !paid && <p className="mb-2 inline-block rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">{t.learn.freeBadge}</p>}
                <h1 className="text-[1.6rem] font-bold leading-tight">{step.title}</h1>
                {step.illustration && (
                  <div className="mt-4">
                    <Illustration name={step.illustration} priority />
                  </div>
                )}
                <div className="mt-4 space-y-3">
                  {step.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                {step.mistake && (
                  <aside className="mt-5 rounded-xl border-l-4 border-warn bg-warn-soft p-4">
                    <p className="font-bold text-warn">{t.learn.mistake}</p>
                    <p className="mt-1">{step.mistake}</p>
                  </aside>
                )}
                {step.task && (
                  <section className="mt-6 border-t border-line pt-5">
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">{t.learn.practice}</h2>
                    <LessonProvider value={lesson}>
                      <TaskView key={stepKey} task={step.task} passed={passed.includes(n)} onPass={markPassed} />
                    </LessonProvider>
                  </section>
                )}
              </article>
            )}
          </>
        )}
      </main>

      {!showReview && (
        <nav className="sticky bottom-0 border-t border-line bg-bg px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          {needsTask && <p className="mb-2 text-center text-sm text-muted">{t.learn.completeTask}</p>}
          {finishError && (
            <p role="alert" className="mb-2 text-center text-sm text-err">
              {t.common.offline}
            </p>
          )}
          <div className="flex gap-3">
            <button type="button" className="btn btn-secondary flex-1" disabled={n === 1} onClick={() => setN(n - 1)}>
              {t.common.back}
            </button>
            {isLast && paid ? (
              <button type="button" className="btn btn-primary flex-[2]" disabled={status !== "ready" || needsTask || finishing} onClick={finish}>
                {t.learn.finish}
              </button>
            ) : (
              <button type="button" className="btn btn-primary flex-[2]" disabled={status !== "ready" || needsTask || isLast} onClick={() => setN(n + 1)}>
                {t.common.next}
              </button>
            )}
          </div>
        </nav>
      )}
      {showCv && (
        <MyCvPanel
          onClose={() => setShowCv(false)}
          sectionSteps={sectionSteps}
          goTo={(step) => {
            setShowCv(false);
            setN(step);
          }}
        />
      )}
    </div>
  );
}
