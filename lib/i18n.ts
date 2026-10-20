import en, { type Dict } from "@/locales/en";
import fr from "@/locales/fr";
import type { Locale } from "@/content/types";

const dicts: Record<Locale, Dict> = { en, fr };

export const DEFAULT_LOCALE: Locale = "en";

export function getDict(locale: Locale = DEFAULT_LOCALE): Dict {
  return dicts[locale] ?? en;
}

/** Replaces {key} placeholders. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** 5000 -> "5 000" (FCFA amounts). */
export function money(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export type { Dict };
