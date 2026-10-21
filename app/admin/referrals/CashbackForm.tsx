"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18n";

/** Records Mobile Money cashback you have already sent to this referrer. */
export function CashbackForm({ referralId }: { referralId: string }) {
  const t = useT();
  const s = t.admin.referralsPage;
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/admin/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralId, amount: Number(amount), note }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return window.alert(t.common.errorGeneric);
    setAmount("");
    setNote("");
    router.refresh();
  }

  return (
    <details className="mt-3">
      <summary className="cursor-pointer py-2 font-semibold text-primary">{s.record}</summary>
      <form onSubmit={save} className="grid gap-2 sm:grid-cols-[8rem_1fr_auto]">
        <input className="input" inputMode="numeric" placeholder={s.amount} aria-label={s.amount} value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
        <input className="input" placeholder={s.note} aria-label={s.note} value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={busy || !Number(amount)}>
          {s.save}
        </button>
      </form>
      <p className="mt-1 text-sm text-muted">{s.recordHelp}</p>
    </details>
  );
}
