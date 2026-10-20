"use client";
import { useState } from "react";
import { useT } from "@/components/I18n";
import { useLesson } from "@/components/LessonContext";

/** "Get tips from your tutor": sends the learner's writing to the server, which asks Claude for 2-3 tips. */
export function TutorTips({ payload }: { payload: () => { text?: string; email?: Record<string, unknown> } }) {
  const t = useT();
  const { courseId, step, paid, tutorEnabled } = useLesson();
  const [state, setState] = useState<"idle" | "busy" | "done" | "limit" | "error">("idle");
  const [tips, setTips] = useState<string[]>([]);

  if (!paid || !tutorEnabled) return null;

  async function ask() {
    setState("busy");
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, step, ...payload() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.tips)) {
        setTips(data.tips);
        setState("done");
      } else {
        setState(res.status === 429 ? "limit" : "error");
      }
    } catch {
      setState("error");
    }
  }

  return (
    <div className="mt-4">
      {state !== "done" && (
        <button type="button" className="btn btn-ghost w-full" onClick={ask} disabled={state === "busy" || state === "limit"}>
          {state === "busy" ? t.tutor.thinking : t.tutor.ask}
        </button>
      )}
      {state === "limit" && <p className="mt-1 text-center text-sm text-muted">{t.tutor.limit}</p>}
      {state === "error" && <p className="mt-1 text-center text-sm text-err">{t.tutor.error}</p>}
      {state === "done" && (
        <div className="rounded-xl border-2 border-primary bg-primary-soft p-4" role="status">
          <p className="font-bold text-primary">{t.tutor.title}</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <button type="button" className="mt-3 text-sm text-primary underline" onClick={ask}>
            {t.tutor.ask}
          </button>
        </div>
      )}
    </div>
  );
}
