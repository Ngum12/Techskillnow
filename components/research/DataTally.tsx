"use client";
/**
 * From filled questionnaires to a results table: count the answers to one question, write the frequency and the
 * percentage for each option, then choose the right chart, as in chapter 4 of a project.
 */
import { useState } from "react";
import type { DataTallyTask } from "@/lib/research/types";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { useLesson } from "@/components/LessonContext";
import { Feedback } from "@/components/tasks/Feedback";

const num = (v: string) => Number(v.replace(",", ".").replace("%", "").trim());

export function DataTally({ task, passed, onPass }: { task: DataTallyTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.research.tally;
  const { reportAttempt } = useLesson();
  const n = task.responses.length;
  const freq = task.options.map((_, i) => task.responses.filter((r) => r === i).length);
  const pct = freq.map((f) => Math.round((f / n) * 1000) / 10);
  const [f, setF] = useState<string[]>(() => (passed ? freq.map(String) : task.options.map(() => "")));
  const [p, setP] = useState<string[]>(() => (passed ? pct.map(String) : task.options.map(() => "")));
  const [checked, setChecked] = useState(passed);
  const [chart, setChart] = useState<number | null>(passed ? task.chart.answer : null);
  const fWrong = f.map((v, i) => num(v) !== freq[i]);
  const pWrong = p.map((v, i) => !(Math.abs(num(v) - pct[i]) <= 0.1));
  const tableOk = checked && !fWrong.some(Boolean) && !pWrong.some(Boolean);
  const chartOk = chart === task.chart.answer;

  function check() {
    setChecked(true);
    const bad = task.options.filter((_, i) => fWrong[i] || pWrong[i]);
    reportAttempt(bad.length === 0, bad);
  }

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      <p className="mt-3 rounded-lg bg-bg p-3 text-[0.9rem]">
        <b>Q5.</b> {task.question}
      </p>

      {/* The pile of filled questionnaires. */}
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
        {task.responses.map((r, i) => (
          <div key={i} className="rounded-md border border-[#e0dccf] bg-white p-1.5 shadow-[0_3px_8px_-6px_rgba(20,28,51,0.6)]" style={{ transform: `rotate(${((i * 37) % 7) - 3}deg)` }}>
            <p className="text-[0.55rem] font-bold text-muted">#{String(i + 1).padStart(2, "0")}</p>
            {task.options.map((o, k) => (
              <p key={o} className="flex items-center gap-1 text-[0.55rem] leading-tight">
                <span className={`inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-sm border ${k === r ? "border-[#1f3a8a] text-[#1f3a8a]" : "border-[#b9b2a3]"}`}>{k === r ? "✓" : ""}</span>
                <span className="truncate">{o}</span>
              </p>
            ))}
          </div>
        ))}
      </div>

      <table className="mt-5 w-full border-collapse text-[0.88rem]">
        <caption className="mb-2 text-left text-[0.85rem] font-semibold">{fmt(s.caption, { n })}</caption>
        <thead>
          <tr className="border-y-2 border-ink text-left">
            <th className="py-2 pr-2">{s.response}</th>
            <th className="w-20 py-2 pr-2">{s.frequency}</th>
            <th className="w-24 py-2">{s.percent}</th>
          </tr>
        </thead>
        <tbody>
          {task.options.map((o, i) => (
            <tr key={o} className="border-b border-line">
              <td className="py-1.5 pr-2">{o}</td>
              <td className="py-1.5 pr-2">
                <input inputMode="numeric" value={f[i]} disabled={tableOk} onChange={(e) => (setF(f.map((v, k) => (k === i ? e.target.value : v))), setChecked(false))} aria-label={`${o} ${s.frequency}`} className={`h-10 w-16 rounded-lg border-2 px-2 ${checked ? (fWrong[i] ? "border-err" : "border-ok") : "border-line"}`} />
              </td>
              <td className="py-1.5">
                <input inputMode="decimal" value={p[i]} disabled={tableOk} onChange={(e) => (setP(p.map((v, k) => (k === i ? e.target.value : v))), setChecked(false))} aria-label={`${o} ${s.percent}`} className={`h-10 w-20 rounded-lg border-2 px-2 ${checked ? (pWrong[i] ? "border-err" : "border-ok") : "border-line"}`} />
              </td>
            </tr>
          ))}
          <tr className="border-b-2 border-ink font-semibold">
            <td className="py-2">{s.total}</td>
            <td className="py-2">{n}</td>
            <td className="py-2">100</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-sm text-muted">{fmt(s.hint, { n })}</p>

      {!tableOk && (
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={check} disabled={f.some((v) => !v.trim()) || p.some((v) => !v.trim())}>
          {t.task.check}
        </button>
      )}
      {checked && !tableOk && <Feedback kind="err" title={t.task.wrong} messages={[s.wrong]} />}

      {tableOk && (
        <div className="mt-5">
          <Feedback kind="ok" title={t.task.correct} messages={[s.tableOk]} />
          <p className="mt-4 font-semibold">{task.chart.question}</p>
          <div className="mt-2 grid gap-2">
            {task.chart.options.map((o, i) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  if (chartOk) return;
                  setChart(i);
                  reportAttempt(i === task.chart.answer, i === task.chart.answer ? [] : [o]);
                  if (i === task.chart.answer) onPass();
                }}
                className={`min-h-11 rounded-xl border-2 px-4 py-2 text-left ${chart === i ? (i === task.chart.answer ? "border-ok bg-ok-soft" : "border-err bg-err-soft") : "border-line bg-surface"}`}
              >
                {o}
              </button>
            ))}
          </div>
          {chart !== null && (chartOk ? <Feedback kind="ok" title={t.task.correct} messages={[task.chart.why, task.success]} /> : <Feedback kind="err" title={t.task.wrong} messages={[s.chartHint]} />)}
        </div>
      )}
    </div>
  );
}
