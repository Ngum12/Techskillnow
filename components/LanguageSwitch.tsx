"use client";
import { useRouter } from "next/navigation";
import { useLocale, useT } from "./I18n";
import type { Locale } from "@/content/types";

/**
 * EN | FR toggle. Stores the choice in a cookie that the server reads.
 * `compact` shows one button with the other language, for crowded headers on small phones.
 */
export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();

  function choose(next: Locale) {
    if (next === locale) return;
    document.cookie = `tsn_lang=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  if (compact) {
    const other: Locale = locale === "en" ? "fr" : "en";
    return (
      <button
        type="button"
        lang={other}
        onClick={() => choose(other)}
        aria-label={`${t.lang.label}: ${t.lang[other]}`}
        title={t.lang[other]}
        className="min-h-11 min-w-11 rounded-full border border-line bg-surface px-2 text-sm font-semibold text-ink"
      >
        {other.toUpperCase()}
      </button>
    );
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
