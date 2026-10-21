"use client";
import { useEffect } from "react";
import { useT } from "./I18n";
import { ReferralCard } from "./ReferralCard";

/** Full-screen "Invite friends" panel, opened from the lesson header at any step. */
export function InvitePanel({ courseId, onClose }: { courseId: string; onClose: () => void }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg" role="dialog" aria-modal="true" aria-label={t.referral.title}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <p className="text-lg font-bold">🎁 {t.referral.button}</p>
        <button type="button" className="btn btn-secondary min-h-11 py-2" onClick={onClose}>
          {t.common.close}
        </button>
      </div>
      <div className="mx-auto w-full max-w-xl flex-1 overflow-y-auto px-5 pb-10">
        <ReferralCard courseId={courseId} />
      </div>
    </div>
  );
}
