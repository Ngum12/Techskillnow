"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { phoneForWhatsApp } from "@/lib/codes";
import { waLink } from "@/lib/whatsapp";

type Created = { code: string; courseTitle: string; buyerName: string; buyerPhone: string; maxDevices: number };

export function CreateCodeForm({ courses, appUrl }: { courses: { id: string; title: string }[]; appUrl: string }) {
  const t = useT();
  const router = useRouter();
  const [form, setForm] = useState({ buyerName: "", buyerPhone: "", courseId: courses[0]?.id ?? "", note: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);

  const bind = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) {
      const key = data.error as keyof typeof t.admin.errors;
      return setError(t.admin.errors[key] ?? t.admin.errors.server);
    }
    setCreated(data as Created);
    setCopied(false);
    setForm({ ...form, buyerName: "", buyerPhone: "", note: "" });
    router.refresh();
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard API is unavailable on plain http; fall back to a temporary textarea.
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
  }

  const message =
    created &&
    fmt(t.admin.whatsappMessage, { name: created.buyerName, course: created.courseTitle, code: created.code, url: appUrl, n: created.maxDevices });

  return (
    <section>
      <h1 className="text-xl font-bold">{t.admin.createTitle}</h1>
      <form onSubmit={onSubmit} className="mt-3 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="label">{t.admin.buyerName}</span>
          <input className="input" required autoComplete="off" {...bind("buyerName")} />
        </label>
        <label>
          <span className="label">{t.admin.buyerPhone}</span>
          <input className="input" required inputMode="tel" autoComplete="off" placeholder="+237 6XX XX XX XX" {...bind("buyerPhone")} />
        </label>
        <label>
          <span className="label">{t.admin.course}</span>
          <select className="input" {...bind("courseId")}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">{t.admin.note}</span>
          <input className="input" autoComplete="off" {...bind("note")} />
        </label>
        {error && (
          <p role="alert" className="text-err sm:col-span-2">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary sm:col-span-2" disabled={busy}>
          {busy ? t.admin.creating : t.admin.create}
        </button>
      </form>

      {created && message && (
        <div className="card mt-5 border-2 border-primary p-4" role="status">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">{t.admin.newCode}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="font-mono text-3xl font-bold tracking-widest">{created.code}</span>
            <button type="button" className="btn btn-secondary min-h-11 py-2" onClick={() => copy(created.code)}>
              {copied ? t.common.copied : t.common.copy}
            </button>
          </div>
          <p className="mt-2 text-muted">
            {created.buyerName} · {created.buyerPhone} · {created.courseTitle}
          </p>
          <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-bg p-3 font-sans text-[0.95rem]">{message}</pre>
          <a href={waLink(phoneForWhatsApp(created.buyerPhone), message)} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-3 w-full">
            {t.admin.sendWhatsApp}
          </a>
        </div>
      )}
    </section>
  );
}
