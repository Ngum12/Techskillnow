"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";
import { getDeviceId } from "@/lib/device";
import { normalizeCode } from "@/lib/codes";

type ErrorKey = "format" | "not_found" | "revoked" | "device_limit" | "too_many" | "server";

export function RedeemForm({ supportLink }: { supportLink: string }) {
  const t = useT();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ key: ErrorKey; max?: number } | null>(null);

  function onChange(raw: string) {
    // Auto-format as XXXX-XXXX while typing.
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    setValue(clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = normalizeCode(value);
    if (!code) return setError({ key: "format" });
    setBusy(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, deviceId: getDeviceId() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.courseId) {
        router.replace(`/learn/${data.courseId}`);
        router.refresh();
        return;
      }
      setError({ key: (data.error as ErrorKey) ?? "server", max: data.max });
    } catch {
      setError({ key: "server" });
    }
    setBusy(false);
  }

  const needsSupport = error && (error.key === "revoked" || error.key === "device_limit");

  return (
    <form onSubmit={onSubmit} className="mt-6" noValidate>
      <label htmlFor="code" className="label">
        {t.redeem.label}
      </label>
      <input
        id="code"
        className="input text-center font-mono text-2xl tracking-[0.2em] uppercase"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ABCD-2345"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        inputMode="text"
        aria-invalid={!!error}
        aria-describedby={error ? "code-error" : undefined}
      />
      {error && (
        <div id="code-error" role="alert" className="mt-3 rounded-lg bg-err-soft p-3 text-err">
          {fmt(t.redeem.errors[error.key], { n: error.max ?? 2 })}
        </div>
      )}
      <button type="submit" className="btn btn-primary mt-5 w-full" disabled={busy || value.length < 9}>
        {busy ? t.redeem.checking : t.redeem.submit}
      </button>
      {needsSupport && (
        <a href={supportLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-3 w-full">
          {t.redeem.contact}
        </a>
      )}
    </form>
  );
}
