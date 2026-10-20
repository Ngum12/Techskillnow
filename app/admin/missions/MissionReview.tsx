"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18n";

export function MissionReview({ code, courseId }: { code: string; courseId: string }) {
  const t = useT();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function decide(action: "pass" | "fail") {
    setBusy(true);
    const res = await fetch("/api/admin/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, courseId, action, note }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) window.alert(t.common.errorGeneric);
    router.refresh();
  }

  return (
    <div className="mt-3">
      <label className="block">
        <span className="text-sm text-muted">{t.admin.missionNote}</span>
        <input className="input mt-1" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary min-h-11 py-2 text-sm" disabled={busy} onClick={() => decide("pass")}>
          {t.admin.missionPass}
        </button>
        <button type="button" className="btn btn-danger min-h-11 py-2 text-sm" disabled={busy} onClick={() => decide("fail")}>
          {t.admin.missionFail}
        </button>
      </div>
    </div>
  );
}
