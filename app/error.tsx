"use client";
import { useEffect } from "react";
import { useT } from "@/components/I18n";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  useEffect(() => {
    const body = JSON.stringify({ message: error.message, stack: error.stack, url: location.pathname, ua: navigator.userAgent });
    navigator.sendBeacon?.("/api/log", new Blob([body], { type: "application/json" }));
  }, [error]);
  return (
    <main className="mx-auto max-w-xl px-5 py-16 text-center">
      <h1 className="text-2xl font-bold">{t.error.title}</h1>
      <p className="mt-3 text-muted">{t.error.text}</p>
      <button type="button" className="btn btn-primary mt-6 w-full" onClick={reset}>
        {t.error.reload}
      </button>
      <a href="/" className="btn btn-ghost mt-2 w-full">
        {t.error.home}
      </a>
    </main>
  );
}
