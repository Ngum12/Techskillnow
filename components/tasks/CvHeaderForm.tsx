"use client";
import { useState } from "react";
import type { CvHeaderTask } from "@/content/types";
import { useT } from "@/components/I18n";
import { useLesson } from "@/components/LessonContext";
import { useCv } from "@/components/cv/CvContext";
import type { CvData } from "@/lib/cv/model";
import { Feedback } from "./Feedback";

const NICKNAME = /(sexy|baby|boss|queen|king|sweet|princess|prince|lover|swag|cute|bad|fine|chou|bebe|cool|star|hot|love|girl|boy)/i;

/** +237 6XX XX XX XX */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^00/, "");
  const local = d.startsWith("237") ? d.slice(3) : d;
  if (!/^6\d{8}$/.test(local)) return raw.trim();
  return `+237 ${local.slice(0, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
}

type Issue = "name" | "email" | "nickname" | "phone" | "city" | "linkedin";

function check(h: CvData["header"]): Issue[] {
  const issues: Issue[] = [];
  if (h.fullName.trim().split(/\s+/).length < 2) issues.push("name");
  const email = h.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) issues.push("email");
  else if (NICKNAME.test(email.split("@")[0])) issues.push("nickname");
  if (!/^\+2376\d{8}$/.test(h.phone.replace(/[\s.-]/g, ""))) issues.push("phone");
  if (!h.city.trim()) issues.push("city");
  if (h.linkedin.trim() && !/linkedin\.com\/in\/[^\s/]+/i.test(h.linkedin)) issues.push("linkedin");
  return issues;
}

export function CvHeaderForm({ task, passed, onPass }: { task: CvHeaderTask; passed: boolean; onPass: () => void }) {
  const t = useT();
  const s = t.sim.header;
  const store = useCv();
  const { reportAttempt } = useLesson();
  const [issues, setIssues] = useState<Issue[] | null>(passed ? [] : null);
  if (!store) return null;
  const h = store.cv.header;

  const set = (patch: Partial<CvData["header"]>) => {
    store.update((cv) => ({ ...cv, header: { ...cv.header, ...patch } }));
    if (issues?.length) setIssues(null);
  };

  function submit() {
    const found = check(h);
    setIssues(found);
    reportAttempt(found.length === 0, found.map((i) => s.issues[i]));
    if (found.length === 0) onPass();
  }

  const field = (key: "fullName" | "email" | "phone" | "city" | "linkedin", props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="mt-4 block">
      <span className="label">{s.fields[key]}</span>
      <input className="input" value={h[key]} onChange={(e) => set({ [key]: e.target.value })} {...props} />
    </label>
  );

  return (
    <div>
      <p className="font-semibold">{task.instruction}</p>
      {field("fullName", { autoComplete: "name", placeholder: s.placeholders.fullName })}
      {field("email", { type: "email", inputMode: "email", autoCapitalize: "none", autoComplete: "email", placeholder: s.placeholders.email })}
      {field("phone", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "+237 6XX XX XX XX", onBlur: () => set({ phone: formatPhone(h.phone) }) })}
      {field("city", { autoComplete: "address-level2", placeholder: s.placeholders.city })}
      {field("linkedin", { inputMode: "url", autoCapitalize: "none", placeholder: "linkedin.com/in/firstname-lastname" })}
      <p className="mt-1 text-sm text-muted">{s.linkedinHint}</p>

      <section className="mt-6 rounded-xl border border-line bg-surface p-4">
        <p className="font-bold">{s.normsTitle}</p>
        <p className="mt-2 text-[0.95rem]">
          <span className="font-semibold">{s.local}: </span>
          {task.localNorm}
        </p>
        <p className="mt-2 text-[0.95rem]">
          <span className="font-semibold">{s.international}: </span>
          {task.internationalNorm}
        </p>
        <p className="mt-2 text-sm text-muted">{s.choiceNote}</p>
        <label className="mt-3 flex min-h-11 items-center gap-3">
          <input type="checkbox" className="h-5 w-5" checked={h.showDob} onChange={(e) => set({ showDob: e.target.checked })} />
          {s.includeDob}
        </label>
        {h.showDob && <input className="input mt-1" placeholder={s.placeholders.dob} value={h.dob} onChange={(e) => set({ dob: e.target.value })} aria-label={s.includeDob} />}
        <label className="mt-3 flex min-h-11 items-center gap-3">
          <input type="checkbox" className="h-5 w-5" checked={h.showMarital} onChange={(e) => set({ showMarital: e.target.checked })} />
          {s.includeMarital}
        </label>
        {h.showMarital && (
          <input className="input mt-1" placeholder={s.placeholders.marital} value={h.marital} onChange={(e) => set({ marital: e.target.value })} aria-label={s.includeMarital} />
        )}
        <p className="mt-3 text-sm text-muted">{s.photoNote}</p>
      </section>

      <button type="button" className="btn btn-secondary mt-4 w-full" onClick={submit}>
        {t.task.check}
      </button>
      {issues &&
        (issues.length === 0 ? (
          <Feedback kind="ok" title={t.task.correct} messages={[task.success]} />
        ) : (
          <Feedback kind="err" title={t.task.tryAgain} messages={issues.map((i) => s.issues[i])} />
        ))}
    </div>
  );
}
