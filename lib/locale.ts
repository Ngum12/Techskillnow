import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "@/content/types";

export const LOCALE_COOKIE = "tsn_lang";
export const LOCALES: Locale[] = ["en", "fr"];

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "fr";
}

/** The learner's chosen language (cookie), defaulting to English. */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "en";
}
