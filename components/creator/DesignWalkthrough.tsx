"use client";
import { useState } from "react";
import type { CreatorProject } from "@/lib/creator/types";
import { sample } from "@/lib/creator/workshop";
import { exportGuide } from "@/lib/creator/export";
import {
  BrowserFrame,
  Coach,
  Notice,
  control,
  input,
  primary,
} from "./WorkshopShared";
export function DesignWalkthrough({
  project,
  save,
  complete,
}: {
  project: CreatorProject;
  save: (p: Partial<CreatorProject>) => void;
  complete: () => void;
}) {
  const [visited, setVisited] = useState<number[]>([0]);
  const [screen, setScreen] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(11);
  const [color, setColor] = useState("#fef3c7");
  const [photo, setPhoto] = useState<string>();
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(project.title || sample.title);
  const readable = size >= 16 && color === "#ffffff";
  const workingProject = {
    ...project,
    title,
    audience: project.audience || sample.audience,
    outcome: project.outcome || sample.outcome,
    experience: project.experience || sample.experience,
    outline: project.outline || sample.outline,
    draft: project.draft || sample.draft,
  };
  return (
    <>
      <Coach>
        {screen === 0
          ? "Start a document: choose Create a design, then Document."
          : screen === 1
            ? "Fix the page: choose a readable text size and strong contrast. Add your title and optionally upload your own photo."
            : "Open the exported PDF on your phone. Check every page, then return to the lesson."}
      </Coach>
      <BrowserFrame title="Canva · document practice" host="canva.com">
        {screen === 0 ? (
          <div className="p-5">
            <div className="rounded-xl bg-gradient-to-r from-cyan-100 to-violet-100 p-6">
              <h4 className="text-2xl font-semibold">
                What will you design today?
              </h4>
              <p className="mt-2 text-sm">
                A practical guide needs document pages. A social post can
                promote it later.
              </p>
            </div>
            <details className="mt-4 rounded-xl border p-4">
              <summary className="min-h-12 cursor-pointer font-semibold">
                ＋ Create a design
              </summary>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  className={control}
                  onClick={() => setScreen(1)}
                >
                  Document · multiple pages
                </button>
                <button
                  type="button"
                  className={control}
                  onClick={() =>
                    setFeedback(
                      "A square social post is useful for promotion. Choose Document for the guide itself.",
                    )
                  }
                >
                  Social media post
                </button>
              </div>
            </details>
          </div>
        ) : (
          <div className="p-3 sm:p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              <label className="text-xs font-semibold">
                Text size
                <select
                  value={size}
                  className="ml-2 rounded border p-2"
                  onChange={(e) => setSize(Number(e.target.value))}
                >
                  <option value={11}>11 · too small here</option>
                  <option value={16}>16 · readable</option>
                  <option value={20}>20 · larger</option>
                </select>
              </label>
              <label className="text-xs font-semibold">
                Page contrast
                <select
                  value={color}
                  className="ml-2 rounded border p-2"
                  onChange={(e) => setColor(e.target.value)}
                >
                  <option value="#fef3c7">Pale text on gold</option>
                  <option value="#ffffff">Dark text on white</option>
                </select>
              </label>
            </div>
            <div className="flex gap-2 overflow-auto pb-3">
              {["Cover", "Preparation", "Steps"].map((label, i) => (
                <button
                  type="button"
                  key={label}
                  aria-pressed={page === i}
                  onClick={() => {
                    setPage(i);
                    setVisited((v) => Array.from(new Set([...v, i])));
                  }}
                  className={`${control} ${page === i ? "ring-2 ring-violet-600" : ""}`}
                >
                  {i + 1}. {label}
                </button>
              ))}
            </div>
            <div
              className="mx-auto min-h-80 max-w-sm rounded-sm border border-slate-300 p-5 shadow-xl"
              style={{
                background: color,
                color: color === "#ffffff" ? "#172033" : "#c5ac72",
                fontSize: size,
              }}
            >
              {page === 0 ? (
                <>
                  <p className="text-xs uppercase tracking-widest">
                    A practical guide
                  </p>
                  <h4 className="my-5 text-[1.5em] font-bold leading-tight break-words">
                    {title}
                  </h4>
                  <p>{workingProject.outcome}</p>
                  {photo ? (
                    <img
                      src={photo}
                      alt="Your uploaded cover photo"
                      className="mt-5 h-auto max-h-56 w-full object-contain"
                    />
                  ) : (
                    <div className="mt-5 rounded-xl border-2 border-dashed border-current p-8 text-center text-sm">
                      Your own cover photo can go here
                    </div>
                  )}
                </>
              ) : page === 1 ? (
                <>
                  <h4 className="mb-4 font-bold">Before you begin</h4>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {workingProject.experience}
                  </p>
                </>
              ) : (
                <>
                  <h4 className="mb-4 font-bold">Follow the actions</h4>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {workingProject.draft.slice(0, 650)}
                  </p>
                </>
              )}
            </div>
            <p
              aria-live="polite"
              className={`my-4 rounded-xl p-3 text-sm ${readable ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-950"}`}
            >
              {readable
                ? "✓ The text now has readable size and contrast. Inspect all three pages."
                : "The page is difficult to read. Increase text size and choose dark text on white."}
            </p>
            <label className="block text-sm font-semibold">
              Cover title
              <input
                className={`${input} mt-2`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={160}
              />
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Uploads · add your own image (optional)
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="mt-2 block w-full text-xs"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (
                    !["image/png", "image/jpeg"].includes(f.type) ||
                    f.size > 3000000
                  ) {
                    setFeedback("Use your own PNG or JPEG under 3 MB.");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => setPhoto(String(reader.result));
                  reader.readAsDataURL(f);
                }}
              />
            </label>
            <button
              type="button"
              className={`${primary} mt-5 w-full`}
              disabled={
                !readable || !title.trim() || busy || visited.length < 3
              }
              onClick={async () => {
                setBusy(true);
                setFeedback("");
                try {
                  save(workingProject);
                  await exportGuide(workingProject, {
                    fontSize: size,
                    color: "#4c1d95",
                    photo,
                    mobile: true,
                  });
                  setScreen(2);
                  complete();
                  setFeedback(
                    "PDF exported with your title, readable text and optional image. Open it from your downloads.",
                  );
                } catch {
                  setFeedback(
                    "Export failed. Keep your project backup and try again.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Preparing PDF…" : "Share → Download → PDF"}
            </button>
            <p className="mt-3 text-xs text-slate-600">
              {project.draft
                ? "Your saved draft is used in the preview and PDF."
                : "No saved draft yet: the worked photography guide is loaded for practice. Personalise and verify it before selling."}
            </p>
            <p className="mt-3 text-xs text-slate-600">
              Inspect Cover, Preparation and Steps before exporting.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Training editor, not the live Canva interface. The export is a
              real PDF with narrow pages for phone reading, made by
              TechSkillNow. Canva offers additional templates and layout
              controls.
            </p>
          </div>
        )}
      </BrowserFrame>
      {feedback && <Notice>{feedback}</Notice>}
    </>
  );
}
