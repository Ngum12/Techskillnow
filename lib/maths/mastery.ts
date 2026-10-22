/**
 * Skill mastery on this phone. Checked answers count fully; self-ticked paper work counts half.
 * Levels: 0 not started · 1 started · 2 getting there · 3 mastered.
 */
export type SkillRecord = { right: number; wrong: number; self: number };
const KEY = "tsn_maths_mastery";

function readAll(): Record<string, SkillRecord> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, SkillRecord>;
  } catch {
    return {};
  }
}

export function recordSkill(skill: string, outcome: "right" | "wrong" | "self"): void {
  try {
    const all = readAll();
    const r = all[skill] ?? { right: 0, wrong: 0, self: 0 };
    r[outcome]++;
    all[skill] = r;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}

export function skillLevel(r: SkillRecord | undefined): 0 | 1 | 2 | 3 {
  if (!r || r.right + r.wrong + r.self === 0) return 0;
  const score = r.right + r.self * 0.5;
  const accuracy = r.right / Math.max(1, r.right + r.wrong);
  if (score >= 6 && accuracy >= 0.75) return 3;
  if (score >= 3) return 2;
  return 1;
}

export const skillRecords = readAll;

/* Where the learner is inside a lesson (resume after closing the app). */
const PART_KEY = "tsn_maths_part";
export function savedPart(lesson: string): number {
  try {
    return (JSON.parse(localStorage.getItem(PART_KEY) ?? "{}") as Record<string, number>)[lesson] ?? 0;
  } catch {
    return 0;
  }
}
export function savePart(lesson: string, part: number): void {
  try {
    const all = JSON.parse(localStorage.getItem(PART_KEY) ?? "{}") as Record<string, number>;
    all[lesson] = part;
    localStorage.setItem(PART_KEY, JSON.stringify(all));
  } catch {}
}
