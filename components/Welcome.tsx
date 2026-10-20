"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "./I18n";
import { fmt } from "@/lib/i18n";
import { Illustration } from "./Illustration";
import { LanguageSwitch } from "./LanguageSwitch";

/** First screen after unlocking a course: a warm welcome, one main action, and an optional warm-up. */
export function Welcome({ courseId, courseTitle, name, totalSteps }: { courseId: string; courseTitle: string; name: string; totalSteps: number }) {
  const t = useT();
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const firstName = name.trim().split(/\s+/)[0] ?? name;

  function start() {
    setStarting(true);
    document.cookie = `tsn_welcomed_${courseId}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-xl px-5 pb-10 pt-6">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-primary">{t.appName}</p>
        <LanguageSwitch />
      </div>
      <h1 className="mt-5 text-[1.75rem] font-bold leading-tight">{fmt(t.welcome.title, { name: firstName })}</h1>
      <p className="mt-2 text-lg">{fmt(t.welcome.intro, { course: courseTitle })}</p>

      <div className="mt-5">
        <Illustration name="hero" priority />
      </div>

      <ul className="mt-5 space-y-3">
        {t.welcome.points.map((point) => (
          <li key={point} className="flex gap-3">
            <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ok text-sm font-bold text-white">
              ✓
            </span>
            <span>{fmt(point, { n: totalSteps })}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-muted">{t.welcome.time}</p>

      <button type="button" className="btn btn-primary mt-6 w-full" onClick={start} disabled={starting}>
        {t.welcome.start}
      </button>

      <section className="card mt-6 p-4">
        <p className="font-semibold">{t.welcome.warmupTitle}</p>
        <p className="mt-1 text-muted">{t.welcome.warmupText}</p>
        <Link href={`/learn/${courseId}/check?kind=pre`} className="btn btn-ghost mt-1 px-0">
          {t.welcome.warmupButton}
        </Link>
      </section>
    </main>
  );
}
