"use client";
import { useRouter } from "next/navigation";
import { useLocale, useT } from "./I18n";
import type { Locale } from "@/content/types";

/** EN | FR toggle. Stores the choice in a cookie that the server reads. */
export function LanguageSwitch() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();

  function choose(next: Locale) {
    if (next === locale) return;
    document.cookie = `tsn_lang=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <div role="group" aria-label={t.lang.label} className="flex overflow-hidden rounded-full border border-line text-sm font-semibold">
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === locale}
          onClick={() => choose(l)}
          className={`min-h-11 min-w-12 px-3 ${l === locale ? "bg-primary text-white" : "bg-surface text-ink"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
