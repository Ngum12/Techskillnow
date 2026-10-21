/** Rules for one CV achievement line ("bullet"). */

export type BulletIssue = "empty" | "weakOpening" | "firstPerson" | "noNumber" | "tooShort" | "tooLong";

/** About two lines of an A4 CV in 10–11 pt type. */
export const MAX_BULLET_CHARS = 190;

const WEAK_OPENINGS = [
  /^(responsible|responsibilities|in charge|duties|my duties|tasks included|tasked with|helped|helping|assisted with|worked on|involved in|participated in|was|were)\b/i,
  /^(responsable|charg[ée]e?|mes t[âa]ches|mes missions|j'?ai aid[ée]|aider|particip[ée]|impliqu[ée]e?|[ée]tais)\b/i,
];
const FIRST_PERSON = /^(i|i'm|i've|my|je|j'|j’|mon|ma|mes)\b/i;
const NUMBER = /\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|twelve|twenty|fifty|hundred|thousand|dozens?|half|double|doubled|un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|douze|vingt|cinquante|cent|mille|moiti[ée]|doubl[ée])\b|%/i;

/** Joins the builder's three parts into one line: "Organised … for … , raising …." */
export function composeBullet(verb: string, task: string, result: string): string {
  const parts = [verb.trim(), task.trim()].filter(Boolean).join(" ");
  const line = result.trim() ? `${parts}, ${result.trim().replace(/^[,;\s]+/, "")}` : parts;
  const clean = line.replace(/\s+/g, " ").replace(/[.\s]+$/, "");
  return clean ? `${clean.charAt(0).toUpperCase()}${clean.slice(1)}.` : "";
}

export function checkBullet(line: string): BulletIssue[] {
  const text = line.trim().replace(/^[-•*]\s*/, "");
  if (!text) return ["empty"];
  const issues: BulletIssue[] = [];
  if (WEAK_OPENINGS.some((r) => r.test(text))) issues.push("weakOpening");
  else if (FIRST_PERSON.test(text)) issues.push("firstPerson");
  if (!NUMBER.test(text)) issues.push("noNumber");
  if (text.split(/\s+/).length < 5) issues.push("tooShort");
  if (text.length > MAX_BULLET_CHARS) issues.push("tooLong");
  return issues;
}
