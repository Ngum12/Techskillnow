"use client";
import { useEffect, useRef, useState } from "react";
import type { InterviewTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "./Feedback";

type Mode = "type" | "voice";

/** Interview practice: 90-second answers (typed or recorded on the phone only), STAR self-check, model answer. */
export function InterviewCards({ task, passed, onPass }: { task: InterviewTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.interview;
  const { reportAttempt } = useLesson();
  const [card, setCard] = useState(0);
  const [mode, setMode] = useState<Mode>("type");
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(task.seconds);
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState(false);
  const [stars, setStars] = useState<boolean[]>([false, false, false, false]);
  const [showModel, setShowModel] = useState(false);
  const [doneCards, setDoneCards] = useState<number[]>(passed ? task.cards.map((_, i) => i) : []);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const canRecord = typeof window !== "undefined" && typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  const c = task.cards[card];
  const answered = text.trim().split(/\s+/).length >= 15 || !!audioUrl;

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      stopAll();
      return;
    }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, left]);

  // Free the recording when leaving the card; nothing is ever uploaded.
  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  function stopAll() {
    setRunning(false);
    if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
  }

  async function startVoice() {
    setMicError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        setAudioUrl(URL.createObjectURL(new Blob(chunks.current, { type: rec.mimeType || "audio/webm" })));
        setRecording(false);
      };
      recorder.current = rec;
      rec.start();
      setRecording(true);
      setLeft(task.seconds);
      setRunning(true);
    } catch {
      setMicError(true);
    }
  }

  function startTyping() {
    setLeft(task.seconds);
    setRunning(true);
  }

  function complete() {
    const next = doneCards.includes(card) ? doneCards : [...doneCards, card];
    setDoneCards(next);
    reportAttempt(true, []);
    if (next.length >= task.required && !passed) onPass();
  }

  function goTo(i: number) {
    stopAll();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setText("");
    setStars([false, false, false, false]);
    setShowModel(false);
    setLeft(task.seconds);
    setCard(i);
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <p className="mt-2 text-sm font-semibold text-muted" aria-live="polite">
        {fmt(s.progress, { n: doneCards.length, total: task.required })}
      </p>
      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
        {task.cards.map((q, i) => (
          <button
            key={q.question}
            type="button"
            onClick={() => goTo(i)}
            aria-current={i === card}
            className={`min-h-11 min-w-11 shrink-0 rounded-full border-2 font-semibold ${
              i === card ? "border-primary bg-primary text-white" : doneCards.includes(i) ? "border-ok bg-ok-soft text-ok" : "border-line bg-surface"
            }`}
          >
            {doneCards.includes(i) ? "✓" : i + 1}
          </button>
        ))}
      </div>

      <section className="card mt-3 p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{s.interviewer}</p>
        <p className="mt-1 text-xl font-bold">“{c.question}”</p>
        <p className="mt-2 text-[0.95rem] text-muted">{c.tip}</p>

        <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label={s.howAnswer}>
          {(["type", "voice"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              disabled={running || (m === "voice" && !canRecord)}
              onClick={() => setMode(m)}
              className={`min-h-11 rounded-xl border-2 font-semibold ${mode === m ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}
            >
              {s.modes[m]}
            </button>
          ))}
        </div>
        {!canRecord && <p className="mt-1 text-sm text-muted">{s.noMic}</p>}

        <div className="mt-4 flex items-center justify-between rounded-lg bg-ink px-3 py-2 text-white">
          <span>{running ? (recording ? s.recording : s.answering) : s.timer}</span>
          <span className={`font-mono text-2xl font-bold ${left <= 10 && running ? "text-[#ffb4a8]" : ""}`}>
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </span>
        </div>

        {mode === "type" ? (
          <>
            <textarea
              className="input mt-3 min-h-36"
              placeholder={s.typePlaceholder}
              value={text}
              onFocus={() => !running && left === task.seconds && startTyping()}
              onChange={(e) => setText(e.target.value)}
              readOnly={!running && left <= 0}
              aria-label={c.question}
            />
            {running && (
              <button type="button" className="btn btn-secondary mt-2 w-full" onClick={stopAll}>
                {s.stop}
              </button>
            )}
          </>
        ) : (
          <div className="mt-3">
            {!recording && !audioUrl && (
              <button type="button" className="btn btn-primary w-full" onClick={startVoice}>
                🎙 {s.record}
              </button>
            )}
            {recording && (
              <button type="button" className="btn btn-danger w-full" onClick={stopAll}>
                ■ {s.stop}
              </button>
            )}
            {audioUrl && (
              <>
                <audio controls src={audioUrl} className="w-full" />
                <button
                  type="button"
                  className="btn btn-ghost mt-1 w-full"
                  onClick={() => {
                    URL.revokeObjectURL(audioUrl);
                    setAudioUrl(null);
                  }}
                >
                  {s.recordAgain}
                </button>
              </>
            )}
            {micError && <p className="mt-2 text-sm text-err">{s.micError}</p>}
            <p className="mt-2 text-sm text-muted">{s.privacy}</p>
          </div>
        )}
      </section>

      {answered && !running && (
        <section className="mt-4">
          <p className="font-semibold">{s.starTitle}</p>
          {s.star.map((label, i) => (
            <label key={label} className="mt-2 flex min-h-11 items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5" checked={stars[i]} onChange={(e) => setStars(stars.map((x, j) => (j === i ? e.target.checked : x)))} />
              <span>{label}</span>
            </label>
          ))}
          <button type="button" className="btn btn-ghost mt-2 w-full" onClick={() => setShowModel(!showModel)}>
            {showModel ? s.hideModel : s.showModel}
          </button>
          {showModel && <p className="mt-2 rounded-xl bg-primary-soft p-4 leading-relaxed">{c.model}</p>}
          <button type="button" className="btn btn-primary mt-3 w-full" disabled={!stars.some(Boolean)} onClick={complete}>
            {doneCards.includes(card) ? s.saved : s.markDone}
          </button>
          {doneCards.includes(card) && card < task.cards.length - 1 && (
            <button type="button" className="btn btn-secondary mt-2 w-full" onClick={() => goTo(card + 1)}>
              {s.nextQuestion}
            </button>
          )}
        </section>
      )}
      {doneCards.length >= task.required && <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />}
    </div>
  );
}
