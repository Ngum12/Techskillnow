import { fold } from "./keywords";
import { hasClosing, hasGreeting } from "../rules";
import { countWords } from "./portal";

export type LetterParts = { greeting: string; opening: string; whyMe: string; whyOrg: string; closing: string; signOff: string; name: string };
export type LetterIssue = "role" | "org" | "proofs" | "whyOrg" | "request" | "greeting" | "closing" | "tooLong" | "copiesCv";

export function letterText(p: LetterParts): string {
  return [p.greeting, p.opening, p.whyMe, p.whyOrg, p.closing, p.signOff, p.name].map((s) => s.trim()).filter(Boolean).join("\n\n");
}

const REQUEST = /\b(interview|meet|meeting|discuss|call me|contact me|opportunity to|entretien|rencontrer|echanger|échanger|discuter|me contacter)\b/i;

/** True if 8 or more consecutive words of a CV line appear unchanged in the letter. */
export function copiesCv(letter: string, cvLines: string[]): boolean {
  const l = ` ${fold(letter)} `;
  return cvLines.some((line) => {
    const words = fold(line).split(" ").filter(Boolean);
    for (let i = 0; i + 8 <= words.length; i++) {
      if (l.includes(` ${words.slice(i, i + 8).join(" ")} `)) return true;
    }
    return false;
  });
}

export function checkCoverLetter(p: LetterParts, advert: { role: string; org: string }, cvLines: string[], maxWords: number): LetterIssue[] {
  const issues: LetterIssue[] = [];
  const opening = fold(p.opening);
  if (!opening.includes(fold(advert.role))) issues.push("role");
  if (!fold(`${p.opening} ${p.whyOrg}`).includes(fold(advert.org))) issues.push("org");
  // Two proofs: at least two sentences with something concrete (a number, or "for example").
  const sentences = p.whyMe.split(/[.!?]+/).map((s) => s.trim()).filter((s) => countWords(s) >= 5);
  if (sentences.length < 2) issues.push("proofs");
  if (countWords(p.whyOrg) < 10) issues.push("whyOrg");
  if (!REQUEST.test(p.closing)) issues.push("request");
  if (!hasGreeting(p.greeting)) issues.push("greeting");
  if (!hasClosing(p.signOff)) issues.push("closing");
  const full = letterText(p);
  if (countWords(full) > maxWords) issues.push("tooLong");
  if (copiesCv(full, cvLines)) issues.push("copiesCv");
  return issues;
}
