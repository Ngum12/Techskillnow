"use client";
import { useEffect } from "react";

/** Sends uncaught browser errors to the server log (visible in Vercel logs). At most 5 per page. */
export function ErrorReporter() {
  useEffect(() => {
    let sent = 0;
    const report = (message: string, stack?: string) => {
      if (sent++ >= 5) return;
      const body = JSON.stringify({ message: message.slice(0, 500), stack: stack?.slice(0, 2000), url: location.pathname, ua: navigator.userAgent });
      navigator.sendBeacon?.("/api/log", new Blob([body], { type: "application/json" }));
    };
    const onError = (e: ErrorEvent) => report(e.message, e.error?.stack);
    const onRejection = (e: PromiseRejectionEvent) => report(String(e.reason?.message ?? e.reason), e.reason?.stack);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
