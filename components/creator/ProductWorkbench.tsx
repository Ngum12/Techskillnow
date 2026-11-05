"use client";
import { useState } from "react";
import type { CreatorProject } from "@/lib/creator/types";
import { sample } from "@/lib/creator/workshop";
import {
  BrowserFrame,
  Coach,
  Notice,
  control,
  input,
  primary,
} from "./WorkshopShared";
export function ProductWorkbench({
  phase,
  project,
  save,
  complete,
}: {
  phase?: string;
  project: CreatorProject;
  save: (p: Partial<CreatorProject>) => void;
  complete: () => void;
}) {
  const [page, setPage] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const [subject, setSubject] = useState("cake photos");
  const [reader, setReader] = useState(project.audience || sample.audience);
  const [outcome, setOutcome] = useState(project.outcome || sample.outcome);
  const [title, setTitle] = useState(project.title || sample.title);
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  const [draft, setDraft] = useState(project.draft || sample.draft);
  const [action, setAction] = useState("");
  const [check, setCheck] = useState("");
  const [fix, setFix] = useState("");
  const pages = [
    {
      title: sample.title,
      body: sample.outcome,
      note: "The cover tells a specific reader what they will do. It does not promise income.",
    },
    {
      title: "Before you begin",
      body: sample.experience,
      note: "Equipment and limits appear before the actions so readers can prepare.",
    },
    {
      title: "Step 1 · Find the light",
      body: "Place your subject near indirect daylight. Look for harsh shadows or glare. Move it and take another photo if details disappear.",
      note: "One action is paired with an observable checkpoint and a corrective action.",
    },
    {
      title: "Troubleshooting",
      body: "Blurry photo? Stabilise the phone and retake. Cropped cake? Step back and inspect every edge. Keep original files before editing.",
      note: "Troubleshooting answers the questions a beginner is likely to ask.",
    },
  ];
  if (phase === "tour")
    return (
      <>
        <Coach>
          Turn through all four sample pages. Notice how each page helps the
          reader do something.
        </Coach>
        <div className="rounded-2xl bg-[#eee8dc] p-4">
          <article className="mx-auto min-h-80 max-w-sm rounded border bg-white p-6 shadow-xl">
            <p className="text-xs uppercase tracking-widest text-violet-700">
              Sample guide · {page + 1}/4
            </p>
            <h4 className="mt-5 text-2xl font-bold text-violet-950">
              {pages[page].title}
            </h4>
            <p className="mt-5 leading-relaxed">{pages[page].body}</p>
            <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm">
              <strong>Why this works: </strong>
              {pages[page].note}
            </p>
          </article>
          <div className="mt-4 flex justify-between gap-3">
            <button
              type="button"
              className={control}
              disabled={!page}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Previous
            </button>
            <button
              type="button"
              className={primary}
              onClick={() => {
                if (page === 3) {
                  if (visited.length === 4) complete();
                  return;
                }
                setPage((p) => p + 1);
                setVisited((v) => Array.from(new Set([...v, page + 1])));
              }}
            >
              {page === 3 ? "I explored the finished result" : "Next page →"}
            </button>
          </div>
        </div>
      </>
    );
  if (phase === "offer")
    return (
      <>
        <Coach>
          Choose a practice topic, inspect the model, then edit one short title
          and two short sentences.
        </Coach>
        <div className="space-y-4 rounded-2xl border bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {["cake photos", "gift wrapping", "weekly meal planning"].map(
              (t) => (
                <button
                  type="button"
                  className={`${control} ${subject === t ? "ring-2 ring-violet-500" : ""}`}
                  key={t}
                  onClick={() => {
                    setSubject(t);
                    setTitle(
                      t === "cake photos"
                        ? sample.title
                        : t === "gift wrapping"
                          ? "Wrap Your First Gift with Simple Materials"
                          : "Plan Five Meals Before You Shop",
                    );
                    setReader(
                      t === "cake photos"
                        ? sample.audience
                        : t === "gift wrapping"
                          ? "Beginners using paper, tape and ribbon"
                          : "Busy households planning a weekly food shop",
                    );
                    setOutcome(
                      t === "cake photos"
                        ? sample.outcome
                        : t === "gift wrapping"
                          ? "Wrap one neat gift using basic materials"
                          : "Prepare a five-meal plan and a matching shopping list",
                    );
                  }}
                >
                  {t}
                </button>
              ),
            )}
          </div>
          <p className="rounded-xl bg-violet-50 p-4 text-sm">
            <strong>Formula:</strong> Help [specific reader] complete
            [observable result] with [available resources]. The choices are
            practice examples; you can write your own topic.
          </p>
          {[
            { label: "Title", v: title, set: setTitle },
            { label: "Reader and available tools", v: reader, set: setReader },
            {
              label: "One result they can observe",
              v: outcome,
              set: setOutcome,
            },
          ].map((f) => (
            <label key={f.label} className="block text-sm font-semibold">
              {f.label}
              <input
                className={`${input} mt-2`}
                value={f.v}
                onChange={(e) => f.set(e.target.value)}
                maxLength={200}
              />
            </label>
          ))}
          <button
            type="button"
            className={primary}
            onClick={() => {
              if ([title, reader, outcome].some((v) => v.trim().length < 8)) {
                setMessage(
                  "Use the example formula to make the reader, title and result specific.",
                );
                return;
              }
              save({ title, audience: reader, outcome });
              complete();
              setMessage(
                "Your product card is saved. These details carry into your prompts and listing.",
              );
            }}
          >
            Build my product card
          </button>
          <div className="rounded-xl bg-violet-950 p-5 text-white">
            <p className="text-xs uppercase text-amber-300">
              Your product card
            </p>
            <h4 className="mt-3 text-xl font-bold">{title}</h4>
            <p className="mt-3 text-sm">For {reader}</p>
            <p className="mt-2 text-sm text-violet-100">
              Finish with: {outcome}
            </p>
          </div>
          {message && <Notice>{message}</Notice>}
        </div>
      </>
    );
  return (
    <>
      <Coach>
        Work on one instruction at a time. Write the action, what the reader
        should observe, and a fix. Add it to the guide and see it appear
        immediately.
      </Coach>
      <BrowserFrame
        title="My guide · step editor"
        host="TechSkillNow creator studio"
      >
        <div className="space-y-4 p-4">
          <div className="rounded-xl bg-violet-50 p-4 text-sm leading-relaxed">
            <strong>Worked example</strong>
            <p>Action: Hold the phone steadily and include the whole cake.</p>
            <p>
              Checkpoint: The top and base are visible and the image is sharp.
            </p>
            <p>
              Fix: Step back if an edge is cut off; stabilise and retake if
              blurry.
            </p>
          </div>
          {[
            {
              label: "1. What should the reader do?",
              value: action,
              set: setAction,
              placeholder:
                "Hold the phone steadily and include the whole subject.",
            },
            {
              label: "2. What should they see or check?",
              value: check,
              set: setCheck,
              placeholder: "The whole subject is visible and sharp.",
            },
            {
              label: "3. What if it goes wrong?",
              value: fix,
              set: setFix,
              placeholder: "Step back or stabilise the phone and retake.",
            },
          ].map((f) => (
            <label key={f.label} className="block text-sm font-semibold">
              {f.label}
              <input
                className={`${input} mt-2`}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.placeholder}
                maxLength={500}
              />
            </label>
          ))}
          <button
            type="button"
            className={control}
            onClick={() => {
              if (
                [action, check, fix].some(
                  (v) => v.trim().split(/\s+/).length < 4,
                )
              ) {
                setMessage(
                  "Use a clear short sentence for each part. The worked example shows the level of detail.",
                );
                return;
              }
              const instruction = `\n\nADDITIONAL STEP\n${action.trim()}\nCheck: ${check.trim()}\nIf needed: ${fix.trim()}`;
              const boundary = draft.search(
                /\n\n(?:TROUBLESHOOTING|FINAL CHECKLIST)/,
              );
              const updated =
                boundary >= 0
                  ? draft.slice(0, boundary) +
                    instruction +
                    draft.slice(boundary)
                  : draft + instruction;
              setDraft(updated);
              setAdded(true);
              save({ draft: updated });
              setMessage(
                "Your step has been added below. You can edit the whole draft before saving.",
              );
              setAction("");
              setCheck("");
              setFix("");
            }}
          >
            ＋ Add this instruction to my guide
          </button>
          <label className="block text-sm font-semibold">
            Your assembled guide · editable preview
            <textarea
              className={`${input} mt-2`}
              rows={12}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={60000}
            />
          </label>
          <p className="text-xs text-slate-600">
            The starter is a worked photography example. Replace it with your
            own tested content before selling. Baking recipes or other technical
            instructions need appropriate verification.
          </p>
          <button
            type="button"
            className={primary}
            onClick={() => {
              if (!added) {
                setMessage(
                  "Build at least one action/checkpoint/fix instruction with the editor first.",
                );
                return;
              }
              save({ draft });
              complete();
              setMessage("Your assembled draft is saved, ready to design.");
            }}
          >
            Save my assembled guide
          </button>
          {message && <Notice>{message}</Notice>}
        </div>
      </BrowserFrame>
    </>
  );
}
