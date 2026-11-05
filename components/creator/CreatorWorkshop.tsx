"use client";
import { useEffect, useRef, useState } from "react";
import type { CreatorWorkshopTask } from "@/lib/creator/workshop";
import { PROJECT_KEY } from "@/lib/creator/workshop";
import {
  emptyProject,
  type CreatorProject,
  type ProjectField,
} from "@/lib/creator/types";
import { useLesson } from "@/components/LessonContext";
import { AccountWalkthrough } from "./AccountWalkthrough";
import { ChatWalkthrough } from "./ChatWalkthrough";
import { DesignWalkthrough } from "./DesignWalkthrough";
import { ProductWorkbench } from "./ProductWorkbench";
import { StoreWalkthrough } from "./StoreWalkthrough";
import {
  FileDesk,
  HandoverDesk,
  LaunchDesk,
  PaymentDesk,
  PriceDesk,
  ReviewDesk,
} from "./PracticeDesks";
import { control, primary } from "./WorkshopShared";
export function CreatorWorkshop({
  task,
  passed,
  onPass,
}: {
  task: CreatorWorkshopTask;
  passed: boolean;
  onPass: () => void;
}) {
  const { reportAttempt } = useLesson();
  const lessonCard = useRef<HTMLElement>(null);
  const practicePanel = useRef<HTMLDivElement>(null);
  const [project, setProject] = useState<CreatorProject>({ ...emptyProject });
  const [ready, setReady] = useState(false);
  const [note, setNote] = useState("");
  const [reading, setReading] = useState(0);
  const [practice, setPractice] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(passed);
  const [projectOpen, setProjectOpen] = useState(false);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(PROJECT_KEY) || "{}");
      const p = { ...emptyProject };
      for (const k of Object.keys(p) as ProjectField[])
        if (typeof raw?.[k] === "string") p[k] = raw[k].slice(0, 60000);
      setProject(p);
    } catch {
      setNote(
        "Could not restore the saved draft. Import your backup below if needed.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(PROJECT_KEY, JSON.stringify(project));
    } catch {
      setNote(
        "Storage is unavailable. Download a backup before leaving this page.",
      );
    }
  }, [project, ready]);
  useEffect(() => {
    if (practice) practicePanel.current?.scrollIntoView({ block: "start" });
  }, [practice]);
  function save(p: Partial<CreatorProject>) {
    setProject((v) => ({ ...v, ...p }));
  }
  function complete(message?: string) {
    setDone(true);
    reportAttempt(true, []);
    onPass();
    if (message) setNote(message);
  }
  function backup() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(project, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-product-backup.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const card = task.learn[reading];
  const shared = { project, save, complete };
  return (
    <section className="min-w-0 space-y-4">
      <header className="rounded-2xl bg-violet-950 p-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-amber-300">
          See it → practise it → use it
        </p>
        <h3 className="mt-2 text-xl font-bold">{task.title}</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPractice(false)}
            className={`min-h-11 rounded-lg px-3 text-sm ${!practice ? "bg-white text-violet-950" : "border border-white/40"}`}
          >
            1. Learn the steps
          </button>
          <button
            type="button"
            disabled={!started}
            onClick={() => setPractice(true)}
            className={`min-h-11 rounded-lg px-3 text-sm disabled:opacity-40 ${practice ? "bg-white text-violet-950" : "border border-white/40"}`}
          >
            2. Guided simulation
          </button>
        </div>
      </header>
      {!practice && (
        <article
          ref={lessonCard}
          className="scroll-mt-24 rounded-2xl border border-violet-200 bg-white p-5 sm:p-6"
        >
          <p
            aria-live="polite"
            className="text-xs font-bold uppercase tracking-wider text-violet-700"
          >
            Lesson card {reading + 1} of {task.learn.length}
          </p>
          <h4 className="mt-3 text-2xl font-bold leading-tight">
            {card.heading}
          </h4>
          <p className="mt-4 leading-7 text-slate-700">{card.explanation}</p>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Worked example
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">
              {card.example}
            </p>
          </div>
          <aside className="mt-4 rounded-xl border-l-4 border-violet-600 bg-violet-50 p-4">
            <strong className="text-sm text-violet-950">
              Remember: {card.takeaway}
            </strong>
          </aside>
          <div className="mt-5 flex justify-between gap-3">
            <button
              type="button"
              className={control}
              disabled={reading === 0}
              onClick={() => {
                setReading((v) => v - 1);
                lessonCard.current?.scrollIntoView({ block: "start" });
              }}
            >
              ← Back
            </button>
            <button
              type="button"
              className={primary}
              disabled={!ready}
              onClick={() => {
                if (reading < task.learn.length - 1) {
                  setReading((v) => v + 1);
                  lessonCard.current?.scrollIntoView({ block: "start" });
                } else {
                  setPractice(true);
                  setStarted(true);
                }
              }}
            >
              {reading === task.learn.length - 1
                ? "Start guided simulation →"
                : "Next small step →"}
            </button>
          </div>
        </article>
      )}
      {started && (
        <div ref={practicePanel} className="scroll-mt-28" hidden={!practice}>
          {task.mode === "account" && (
            <AccountWalkthrough task={task} complete={complete} />
          )}
          {task.mode === "chat" && <ChatWalkthrough task={task} {...shared} />}
          {(task.mode === "tour" || task.mode === "offer") && (
            <ProductWorkbench phase={task.mode} {...shared} />
          )}
          {task.mode === "review" && (
            <ReviewDesk
              reader={task.phase === "reader"}
              save={save}
              complete={complete}
            />
          )}
          {task.mode === "design" && <DesignWalkthrough {...shared} />}
          {task.mode === "files" &&
            (task.phase === "editor" ? (
              <ProductWorkbench phase="editor" {...shared} />
            ) : (
              <FileDesk project={project} complete={complete} />
            ))}
          {task.mode === "price" && <PriceDesk {...shared} />}
          {task.mode === "store" && (
            <StoreWalkthrough phase={task.phase} {...shared} />
          )}
          {task.mode === "payments" && (
            <PaymentDesk project={project} complete={complete} />
          )}
          {task.mode === "launch" && <LaunchDesk {...shared} />}
          {task.mode === "handover" && <HandoverDesk {...shared} />}
        </div>
      )}
      {done && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-950"
        >
          ✓ {task.success}
        </p>
      )}
      {note && (
        <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm">
          {note}
        </p>
      )}
      <details
        className="rounded-xl border bg-white p-4"
        open={projectOpen}
        onToggle={(e) => setProjectOpen(e.currentTarget.open)}
      >
        <summary className="min-h-10 cursor-pointer text-sm font-semibold">
          My saved project & backups
        </summary>
        <p className="my-3 text-xs leading-relaxed text-slate-600">
          Your work is saved only in this browser, not across devices or
          accounts. Keep backups. Previously saved course drafts are preserved.
          Never enter real passwords, payment PINs or identity documents here.
        </p>
        <p className="my-3 text-sm font-semibold">
          {project.title || "Your product card will appear here."}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            className={control}
            onClick={backup}
            disabled={!ready}
          >
            Download project backup
          </button>
          <label className={`${control} cursor-pointer`}>
            Restore backup
            <input
              type="file"
              accept="application/json,.json"
              className="mt-2 block w-full text-xs"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  if (f.size > 1000000) throw new Error();
                  const raw = JSON.parse(await f.text());
                  const p = { ...emptyProject };
                  for (const k of Object.keys(p) as ProjectField[]) {
                    if (typeof raw?.[k] !== "string") throw new Error();
                    p[k] = raw[k].slice(0, 60000);
                  }
                  if (
                    window.confirm(
                      "Replace the current phone draft with this backup?",
                    )
                  ) {
                    setProject(p);
                    setNote(
                      "Backup restored. Reopen a simulation to load its restored fields.",
                    );
                  }
                } catch {
                  setNote(
                    "Invalid project backup. Your draft has not changed.",
                  );
                }
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <button
          type="button"
          className="mt-3 min-h-12 text-sm text-red-700 underline"
          onClick={() => {
            if (
              window.confirm(
                "Clear this phone’s saved product? Back up your work first.",
              )
            ) {
              setProject({ ...emptyProject });
              setNote(
                "Saved project cleared. Reopen the lesson to reset its practice fields.",
              );
            }
          }}
        >
          Clear shared-phone draft
        </button>
      </details>
    </section>
  );
}
