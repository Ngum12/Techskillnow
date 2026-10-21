/** Validation for the simulated online application portal. */

export type FileInfo = { name: string; size: number };
export type PortalValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  qualification: string;
  institution: string;
  year: string;
  motivation: string;
  cv: FileInfo | null;
  letter: FileInfo | null;
};
export type PortalPage = "personal" | "education" | "motivation" | "documents";
export type PortalError = "required" | "email" | "phone" | "year" | "tooLong" | "tooShort" | "fileType" | "fileSize";
export type PortalConfig = { wordLimit: number; maxFileMb: number; allowedTypes: string[] };

export const PORTAL_PAGES: PortalPage[] = ["personal", "education", "motivation", "documents"];
export const MIN_MOTIVATION_WORDS = 30;

export function emptyPortal(): PortalValues {
  return { firstName: "", lastName: "", email: "", phone: "", city: "", qualification: "", institution: "", year: "", motivation: "", cv: null, letter: null };
}

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** Enforces the hard word limit while typing: extra words are cut. */
export function limitWords(text: string, limit: number): string {
  if (countWords(text) <= limit) return text;
  let seen = 0;
  // Keep the original spacing up to and including the last allowed word.
  return text.replace(/\S+/g, (word) => (++seen <= limit ? word : "")).replace(/\s+$/, "");
}

export function validateFile(file: FileInfo | null, config: PortalConfig): PortalError | null {
  if (!file) return "required";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!config.allowedTypes.includes(ext)) return "fileType";
  if (file.size > config.maxFileMb * 1024 * 1024) return "fileSize";
  return null;
}

/** Errors for one page, keyed by field. An empty object means the page is valid. */
export function validatePage(page: PortalPage, v: PortalValues, config: PortalConfig): Partial<Record<keyof PortalValues, PortalError>> {
  const e: Partial<Record<keyof PortalValues, PortalError>> = {};
  const req = (k: keyof PortalValues) => {
    if (!String(v[k] ?? "").trim()) e[k] = "required";
  };
  if (page === "personal") {
    (["firstName", "lastName", "email", "phone", "city"] as const).forEach(req);
    if (!e.email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.email.trim())) e.email = "email";
    if (!e.phone && !/^(\+?237)?6\d{8}$/.test(v.phone.replace(/[\s.-]/g, ""))) e.phone = "phone";
  } else if (page === "education") {
    (["qualification", "institution", "year"] as const).forEach(req);
    const year = Number(v.year);
    if (!e.year && !(Number.isInteger(year) && year >= 1970 && year <= new Date().getFullYear() + 1)) e.year = "year";
  } else if (page === "motivation") {
    const words = countWords(v.motivation);
    if (words === 0) e.motivation = "required";
    else if (words > config.wordLimit) e.motivation = "tooLong";
    else if (words < MIN_MOTIVATION_WORDS) e.motivation = "tooShort";
  } else if (page === "documents") {
    const cv = validateFile(v.cv, config);
    if (cv) e.cv = cv;
    const letter = validateFile(v.letter, config);
    if (letter) e.letter = letter;
  }
  return e;
}

/** A reference number such as "NYF-2026-48213", stable for the same seed. */
export function referenceNumber(prefix: string, seed: string): string {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `${prefix}-${new Date().getFullYear()}-${String(10000 + (h % 90000))}`;
}
