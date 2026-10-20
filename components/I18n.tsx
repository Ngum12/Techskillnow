"use client";
import { createContext, useContext } from "react";
import type { Dict } from "@/lib/i18n";
import type { Locale } from "@/content/types";

const I18nContext = createContext<{ dict: Dict; locale: Locale } | null>(null);

export function I18nProvider({ dict, locale, children }: { dict: Dict; locale: Locale; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ dict, locale }}>{children}</I18nContext.Provider>;
}

function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useT must be used inside I18nProvider");
  return value;
}

export function useT(): Dict {
  return useI18n().dict;
}

export function useLocale(): Locale {
  return useI18n().locale;
}
