"use client";
import { useEffect, useRef, useState } from "react";
import type { CreatorProject } from "@/lib/creator/types";
import type { CreatorWorkshopTask } from "@/lib/creator/workshop";
import {
  BrowserFrame,
  Coach,
  Notice,
  control,
  input,
  primary,
} from "./WorkshopShared";
export function ChatWalkthrough({
  task,
  project,
  save,
  complete,
}: {
  task: CreatorWorkshopTask;
  project: CreatorProject;
  save: (patch: Partial<CreatorProject>) => void;
  complete: () => void;
}) {
  const p = task.prompt!;
  const responseRef = useRef<HTMLDivElement>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [started, setStarted] = useState(false);
  const [text, setText] = useState(p.starter);
  const [sent, setSent] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [showModel, setShowModel] = useState(task.phase !== "repair");
  const output = p.response
    .replaceAll(
      "{title}",
      project.title || "Photograph Your First Cake with an Android Phone",
    )
    .replaceAll(
      "{reader}",
      project.audience || "home bakers using an Android phone",
    )
    .replaceAll(
      "{outcome}",
      project.outcome || "take three clear product photos",
    );
  useEffect(() => {
    if (sent) responseRef.current?.scrollIntoView({ block: "start" });
  }, [sent]);
  function send() {
    const value = text.toLowerCase();
    const gaps = p.requirements
      .filter((r) => !r.words.some((w) => value.includes(w.toLowerCase())))
      .map((r) => r.label);
    setMissing(gaps);
    if (!gaps.length) {
      setSent(text);
      setSaved(false);
    }
  }
  return (
    <>
      <Coach>
        {!started
          ? "Tap New chat to start a fresh conversation."
          : sent
            ? "Read the response. Compare it with the expected result, then save the useful work."
            : task.instruction}
      </Coach>
      <BrowserFrame
        title="ChatGPT · practice conversation"
        host="chatgpt.com"
        dark
      >
        <div className="flex items-center justify-between gap-3 border-b bg-slate-50 p-3">
          <button
            type="button"
            className={control}
            onClick={() => {
              setStarted(true);
              setSent("");
              setMissing([]);
            }}
          >
            ＋ New chat
          </button>
          <span className="text-xs text-slate-500">
            Training responses · no AI connection
          </span>
        </div>
        {!started ? (
          <div className="p-8 text-center">
            <p className="text-2xl font-semibold">
              What can I help you create?
            </p>
            <p className="mt-3 text-sm text-slate-600">
              First find the New chat control above. A prompt is the instruction
              you send, not a search keyword.
            </p>
          </div>
        ) : (
          <div className="space-y-5 p-4">
            <details
              open={!sent}
              className="rounded-xl border border-amber-200 bg-amber-50 p-4"
            >
              <summary className="min-h-10 cursor-pointer text-sm font-bold">
                Your prompt checklist
              </summary>
              <ul className="mt-2 space-y-2 text-sm">
                {p.requirements.map((r) => (
                  <li key={r.label} className="flex gap-2">
                    <span className="text-violet-700">●</span>
                    {r.label}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-3 min-h-10 text-sm font-semibold underline"
                onClick={() => setShowModel((v) => !v)}
              >
                {showModel ? "Hide" : "Show"} the worked prompt
              </button>
              {showModel && (
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-3 text-sm leading-relaxed">
                  {p.model}
                </p>
              )}
            </details>
            {task.phase === "repair" && !sent && (
              <div className="rounded-xl border bg-slate-50 p-4 text-sm">
                <strong>What the weak prompt could produce</strong>
                <p className="mt-2">
                  “Creating a guide is important. Make it engaging and
                  professional. Provide useful information.”
                </p>
                <p className="mt-2 text-slate-600">
                  It sounds positive but gives no reader, materials, actions or
                  checks. Repair the instruction below so the next response has
                  a useful structure.
                </p>
              </div>
            )}
            {sent && (
              <>
                <div className="ml-6 rounded-2xl rounded-tr-sm bg-slate-200 p-4">
                  <p className="mb-1 text-xs font-bold">You</p>
                  <p className="whitespace-pre-wrap text-sm">{sent}</p>
                </div>
                <div
                  ref={responseRef}
                  className="mr-2 scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <p className="mb-3 text-xs font-bold text-emerald-800">
                    ◉ Assistant · authored training response
                  </p>
                  <div className="whitespace-pre-wrap text-sm leading-7">
                    {output}
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                  <strong>What to notice</strong>
                  <p className="mt-2">{task.hint}</p>
                </div>
                <button
                  type="button"
                  className={`${primary} w-full`}
                  onClick={() => {
                    if (
                      p.save &&
                      project[p.save].trim() &&
                      project[p.save] !== output &&
                      !window.confirm(
                        "Replace this saved project section with the worked example? Cancel keeps your existing work and completes the practice without replacing it.",
                      )
                    ) {
                      setSaveMessage(
                        "Your existing work was kept. The practice is complete without replacing it.",
                      );
                      setSaved(true);
                      complete();
                      return;
                    }
                    if (p.save) save({ [p.save]: output });
                    setSaveMessage(
                      p.save
                        ? "Saved. You can edit this worked draft in the guided editor. Verify and personalise it before publishing."
                        : "Practice completed. You can recognise what a useful response should contain.",
                    );
                    setSaved(true);
                    complete();
                  }}
                >
                  {p.save
                    ? "Keep this worked result in my project"
                    : "I compared the prompt and result"}
                </button>
                {saved && <Notice>{saveMessage}</Notice>}
              </>
            )}
            <label className="block text-sm font-semibold">
              {task.phase === "repair"
                ? "Correct the weak prompt"
                : "Message ChatGPT"}
              <textarea
                rows={6}
                className={`${input} mt-2 resize-y`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type the guided prompt here…"
              />
            </label>
            {missing.length > 0 && (
              <div role="alert" className="rounded-xl bg-amber-100 p-4 text-sm">
                <strong>Your instruction is missing:</strong>
                <ul className="mt-2 list-disc pl-5">
                  {missing.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <p className="mt-2">
                  Use the checklist and worked prompt. The check looks for the
                  taught ingredients, not perfect wording.
                </p>
              </div>
            )}
            <button
              type="button"
              className={`${primary} w-full`}
              onClick={send}
            >
              Send prompt ↑
            </button>
            <p className="text-xs text-slate-500">
              The response is a course example, not live ChatGPT output. Real AI
              responses will vary and still need checking.
            </p>
          </div>
        )}
      </BrowserFrame>
    </>
  );
}
