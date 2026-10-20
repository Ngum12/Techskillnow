"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/i18n";

export function CodeActions({ code, hasDevices }: { code: string; hasDevices: boolean }) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(action: "revoke" | "reset", confirmText: string) {
    if (!window.confirm(fmt(confirmText, { code }))) return;
    setBusy(true);
    const res = await fetch(`/api/admin/codes/${code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) window.alert(t.common.errorGeneric);
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {hasDevices && (
        <button type="button" className="btn btn-secondary min-h-11 py-2 text-sm" disabled={busy} onClick={() => run("reset", t.admin.resetConfirm)}>
          {t.admin.resetDevices}
        </button>
      )}
      <button type="button" className="btn btn-danger min-h-11 py-2 text-sm" disabled={busy} onClick={() => run("revoke", t.admin.revokeConfirm)}>
        {t.admin.revoke}
      </button>
    </div>
  );
}
