"use client";
import { useState } from "react";
import type { ComposeTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { failedComposeRules, type ComposeValues } from "@/lib/rules";
import { Feedback } from "./Feedback";
import { TutorTips } from "./TutorTips";
import { useLesson } from "@/components/LessonContext";

const DEFAULT_FILES = ["CV.pdf", "photo.jpg"];

function FileIcon({ name }: { name: string }) {
  const pdf = name.toLowerCase().endsWith(".pdf");
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-[0.6rem] font-bold text-white ${pdf ? "bg-[#c5221f]" : "bg-[#1a73e8]"}`}
    >
      {pdf ? "PDF" : "IMG"}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-h-[52px] items-center gap-3 border-b border-line px-4">
      <span className="w-16 shrink-0 text-muted">{label}</span>
      {children}
    </label>
  );
}

export function MockEmailCompose({ task, passed, onPass }: { task: ComposeTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const { reportAttempt } = useLesson();
  const files = task.files.length ? task.files : DEFAULT_FILES;
  const [v, setV] = useState<ComposeValues>({
    to: task.initial?.to ?? "",
    cc: task.initial?.cc ?? "",
    subject: task.initial?.subject ?? "",
    body: task.initial?.body ?? "",
    attachments: [],
  });
  const [picker, setPicker] = useState(false);
  const [result, setResult] = useState<string[] | null>(passed ? [] : null);
  const sent = result !== null && result.length === 0;

  const set = (field: keyof Omit<ComposeValues, "attachments">) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setV({ ...v, [field]: e.target.value });
    if (result?.length) setResult(null);
  };

  function attach(file: string) {
    if (!v.attachments.includes(file)) setV({ ...v, attachments: [...v.attachments, file] });
    setPicker(false);
    if (result?.length) setResult(null);
  }

  function send() {
    const failed = failedComposeRules(task.rules, v);
    setResult(failed);
    reportAttempt(failed.length === 0, failed);
    if (failed.length === 0) onPass();
  }

  const inputClass = "min-w-0 flex-1 bg-transparent py-3 outline-none";

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      {task.context && <div className="mt-3 whitespace-pre-line rounded-xl border-2 border-dashed border-line bg-surface p-4 text-[0.95rem]">{task.context}</div>}

      <div className="card mt-4 overflow-hidden">
        <div className="flex items-center justify-between bg-[#f2f6fc] px-4 py-3">
          <span className="font-semibold">{t.compose.title}</span>
        </div>
        <fieldset disabled={sent}>
          <Row label={t.compose.to}>
            <input className={inputClass} type="email" inputMode="email" autoCapitalize="none" autoComplete="off" value={v.to} onChange={set("to")} />
          </Row>
          <Row label={t.compose.cc}>
            <input className={inputClass} type="email" inputMode="email" autoCapitalize="none" autoComplete="off" value={v.cc} onChange={set("cc")} />
          </Row>
          <Row label={t.compose.subject}>
            <input className={inputClass} value={v.subject} onChange={set("subject")} />
          </Row>
          <textarea
            className="block min-h-48 w-full resize-y bg-transparent px-4 py-3 leading-relaxed outline-none"
            placeholder={t.compose.body}
            aria-label={t.compose.body}
            value={v.body}
            onChange={set("body")}
          />
          {v.attachments.length > 0 && (
            <ul className="flex flex-col gap-2 px-4 pb-3">
              {v.attachments.map((file) => (
                <li key={file} className="flex items-center gap-3 rounded-lg border border-line p-2">
                  <FileIcon name={file} />
                  <span className="min-w-0 flex-1 truncate">{file}</span>
                  <button
                    type="button"
                    className="h-11 w-11 shrink-0 rounded-full text-xl text-muted"
                    aria-label={fmt(t.compose.remove, { file })}
                    onClick={() => setV({ ...v, attachments: v.attachments.filter((f) => f !== file) })}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-line p-3">
            <button type="button" className="btn btn-secondary" onClick={() => setPicker(!picker)} aria-expanded={picker}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11l-8.5 8.5a5 5 0 01-7-7L14 4a3.5 3.5 0 015 5l-8.5 8.5a2 2 0 01-3-3L15 7" strokeLinecap="round" />
              </svg>
              {t.compose.attach}
            </button>
            <button type="button" className="btn btn-primary min-w-28" onClick={send}>
              {t.compose.send}
            </button>
          </div>
          {picker && (
            <div className="border-t border-line bg-[#fafaf7] p-3">
              <p className="mb-2 font-semibold">{t.compose.chooseFile}</p>
              <ul className="flex flex-col gap-2">
                {files.map((file) => (
                  <li key={file}>
                    <button type="button" className="flex min-h-[52px] w-full items-center gap-3 rounded-lg border border-line bg-surface p-2 text-left" onClick={() => attach(file)}>
                      <FileIcon name={file} />
                      <span className="truncate">{file}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </fieldset>
      </div>

      {result &&
        (result.length === 0 ? (
          <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />
        ) : (
          <Feedback kind="err" title={t.task.tryAgain} messages={result} />
        ))}
      {result && v.body.trim() && <TutorTips payload={() => ({ email: v })} />}
    </div>
  );
}
