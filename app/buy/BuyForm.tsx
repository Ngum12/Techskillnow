"use client";
import { useState } from "react";
import { useT } from "@/components/I18n";

export function BuyForm({ courseId, referral, payLabel }: { courseId: string; referral: string | null; payLabel: string }) {
  const t = useT();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 3 || phone.replace(/\D/g, "").length < 9) return setError(t.buy.errors.missing);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/pay/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, name, phone, ref: referral }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.link) {
        window.location.href = data.link;
        return;
      }
      const key = data.error as keyof typeof t.buy.errors;
      setError(t.buy.errors[key] ?? t.buy.errors.server);
    } catch {
      setError(t.buy.errors.server);
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6" noValidate>
      <label htmlFor="name" className="label">
        {t.buy.name}
      </label>
      <input id="name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      <label htmlFor="phone" className="label mt-4">
        {t.buy.phone}
      </label>
      <input id="phone" className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="6XX XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} />
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-err-soft p-3 text-err">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary mt-5 w-full" disabled={busy}>
        {busy ? t.buy.opening : payLabel}
      </button>
      <p className="mt-2 text-center text-sm text-muted">{t.buy.secure}</p>
    </form>
  );
}
