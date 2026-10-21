/** Lab-notebook marking: keyword marking points, cloze gaps and the full written method. */

export type MarkingPoint = { id: string; text: string; keywords: string[][] };
export type Checkpoint = {
  id: string;
  title: string;
  prompt: string;
  maxWords: number;
  sentences: string[];
  cloze: string[];
  points: MarkingPoint[];
};

/** Lower case, unified dashes and units, no accents on Latin letters (chemical subscripts kept). */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‐-―]/g, "-")
    .replace(/cm3/g, "cm³")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A keyword matches at the start of a word (so "rins" matches "rinsed"); phrases match as written. */
export function hasKeyword(sentence: string, keyword: string): boolean {
  const k = normalise(keyword);
  if (!k.trim()) return false;
  const startsWithLetter = /^\p{L}|^\d/u.test(k);
  const re = new RegExp(`${startsWithLetter ? "(^|[^\\p{L}\\d])" : ""}${escape(k)}`, "u");
  return re.test(sentence);
}

/** Splits a written answer into sentences (also on new lines and semicolons). */
export function sentencesOf(text: string): string[] {
  return normalise(text)
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const wordCount = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

/** A point is met when one sentence contains a keyword from every group. */
export function pointMet(point: MarkingPoint, text: string): boolean {
  return sentencesOf(text).some((s) => point.keywords.every((group) => group.some((k) => hasKeyword(s, k))));
}

export type NotebookMark = { met: string[]; missed: string[]; tooLong: boolean };

/** Marks free writing against a checkpoint. Overlong answers are flagged (keyword stuffing earns nothing). */
export function markCheckpoint(cp: Checkpoint, text: string): NotebookMark {
  const tooLong = wordCount(text) > cp.maxWords;
  const met = tooLong ? [] : cp.points.filter((p) => pointMet(p, text)).map((p) => p.id);
  return { met, missed: cp.points.map((p) => p.id).filter((id) => !met.includes(id)), tooLong };
}

/* ---------- Cloze ---------- */

export type ClozePart = string | { answers: string[] };

/** "Rinse with [[acid|the acid]]." → ["Rinse with ", {answers}, "."] */
export function parseCloze(line: string): ClozePart[] {
  const parts: ClozePart[] = [];
  let last = 0;
  for (const m of line.matchAll(/\[\[([^\]]+)\]\]/g)) {
    if (m.index! > last) parts.push(line.slice(last, m.index));
    parts.push({ answers: m[1].split("|").map((a) => a.trim()) });
    last = m.index! + m[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

export function clozeGapOk(gap: { answers: string[] }, value: string): boolean {
  const v = normalise(value).replace(/[.,;]$/, "");
  return gap.answers.some((a) => normalise(a) === v);
}

/** The sentence with every gap filled by its first answer (equals the model sentence). */
export function fillCloze(line: string): string {
  return parseCloze(line)
    .map((p) => (typeof p === "string" ? p : p.answers[0]))
    .join("");
}

/* ---------- Scaffolding that fades ---------- */

export type Scaffold = "order" | "cloze" | "free";

/** Attempt 1: put the sentences in order; attempt 2: fill the gaps; from attempt 3: free writing. */
export function scaffoldFor(attempt: number): Scaffold {
  return attempt <= 1 ? "order" : attempt === 2 ? "cloze" : "free";
}

/** A fixed shuffle that never returns the original order (for the ordering exercise). */
export function shuffledOrder(n: number, seed: number): number[] {
  if (n < 2) return [0];
  const order = Array.from({ length: n }, (_, i) => i);
  let s = seed || 1;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.every((v, i) => v === i)) order.push(order.shift()!);
  return order;
}

/* ---------- The assembled method ---------- */

export type MethodSection = { id: string; title: string; text: string; model: string; points: { id: string; text: string; met: boolean }[] };

/** All checkpoints together: the learner's text beside the model answer, each point ticked or missing. */
export function assembleMethod(checkpoints: Checkpoint[], written: Record<string, string>): MethodSection[] {
  return checkpoints.map((cp) => {
    const text = written[cp.id] ?? "";
    const mark = markCheckpoint(cp, text);
    return {
      id: cp.id,
      title: cp.title,
      text,
      model: cp.sentences.join(" "),
      points: cp.points.map((p) => ({ id: p.id, text: p.text, met: mark.met.includes(p.id) })),
    };
  });
}
