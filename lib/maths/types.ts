/**
 * Shapes shared by the maths engine and the topic content in /content/maths.
 * Text fields may contain inline maths between $…$ (rendered with KaTeX).
 */
import type { Rng } from "./rng";

/** How a final answer is checked. Values use the keypad's linear syntax, e.g. "2x^2 - 3x + 1", "-3/4". */
export type AnswerSpec =
  | { kind: "expr"; value: string; form?: "expanded" | "factorised" | "monomial" | "partial" }
  /** Any linear factor (x − r) of the polynomial `value`. */
  | { kind: "factorOf"; value: string }
  | { kind: "number"; value: string }
  | { kind: "solutions"; values: string[]; variable?: string }
  | { kind: "relation"; value: string }
  | { kind: "choice"; options: string[]; answer: number };

/** One line of working. `value` (linear syntax) lets the app check a learner's version of this line. */
export type SolutionLine = { latex: string; note?: string; mark?: string; value?: string };

/**
 * A long-division layout as written on paper (numbers or polynomials): the quotient on top, the
 * dividend, then for each stage the product to subtract and what is left. Cells hold LaTeX ("" = empty).
 */
export type DivisionLayout = {
  kind: "number" | "poly";
  divisor: string;
  quotient: string[];
  dividend: string[];
  stages: { product: string[]; after: string[] }[];
  /** Which stage each quotient cell was written at (for revealing step by step). */
  quotientStage: number[];
};

export type Sign = "+" | "-";
export type SignDiagram = { critical: string[]; factors: { latex: string; signs: Sign[] }[]; result: { latex: string; signs: Sign[] } };

/** A table the learner fills in (e.g. remainder after dividing vs f(a)). */
export type FillTable = { headers: string[]; rows: { cells: ({ latex: string } | { answer: AnswerSpec })[] }[] };

export type Question = {
  generator: string;
  skill: string;
  seed: number;
  prompt: string;
  /** Line-by-line working, checked against this starting expression or statement. */
  work?: { mode: "expr" | "equation" | "relation"; start: string };
  answers: { label?: string; spec: AnswerSpec }[];
  solution: SolutionLine[];
  /** Known wrong answers produced by a specific misconception (answer index → value). */
  bugs?: { misconception: string; answer?: number; value: string }[];
  division?: DivisionLayout;
  table?: FillTable;
  /** A sign diagram to fill: critical values, each factor's sign on each interval, and the result. */
  signs?: SignDiagram;
  /** Area (grid) model for a product: the terms of each factor, in linear syntax. */
  grid?: { rows: string[]; cols: string[] };
};

/** What a generator writes; the engine adds its id, skill and seed. */
export type QuestionBody = Omit<Question, "generator" | "skill" | "seed">;
export type Generator = { id: string; skill: string; generate: (r: Rng) => QuestionBody };

/* ---------- Exam questions (M/A/B marks with follow-through) ---------- */

export type MarkCtx = {
  /** The learner's raw input for part p, input i. */
  raw: (p: number, i?: number) => string;
  /** The learner's input as a number (exact fractions allowed), or null. */
  num: (p: number, i?: number) => number | null;
};

export type MarkPoint = {
  type: "M" | "A" | "B";
  text: string;
  /** Follow-through: earned with the learner's own earlier (wrong) value. */
  ft?: boolean;
  check: (c: MarkCtx) => boolean;
};

export type ExamPart = {
  label: string;
  prompt: string;
  inputs: { label: string }[];
  marks: MarkPoint[];
  solution: SolutionLine[];
};

/** `model`: the answers that earn full marks, per part and input (shown after marking). */
export type ExamQuestion = { generator: string; seed: number; intro: string; parts: ExamPart[]; model: string[][] };

export type ExamGenerator = { id: string; skill: string; generate: (r: Rng) => Omit<ExamQuestion, "generator" | "seed"> };

/* ---------- Lessons ---------- */

export type MisconceptionRule = { id: string; title: string; hint: string };
export type KeyIdea = { id: string; text: string; keywords: string[][] };

export type GraphSpec = {
  x: [number, number];
  y: [number, number];
  /** Curves to draw; params are written as single letters (a, b, n…). */
  curves: { expr: string; colour?: string; label?: string }[];
  params?: { name: string; label: string; min: number; max: number; step: number; value: number }[];
  /** Pick the curve by an integer parameter, e.g. degree n → its own expression. */
  select?: { param: string; exprs: Record<string, string> };
  /** A draggable point on the first curve: its x controls this parameter. */
  dragPoint?: { param: string; label?: string };
  showRoots?: boolean;
  tangentAt?: string;
  chord?: [string, string];
  shade?: { from: string; to: string };
  /** Light up the part of the first curve below (or above) the x-axis, and those x-values on the axis. */
  highlight?: "below" | "above";
};

/** One part of a lesson, in the order of the lesson rhythm. */
export type LessonPart =
  | { kind: "see"; title: string; text: string; graph?: GraphSpec; visual?: "area"; questions: { prompt: string; options: string[]; answer: number; explain: string }[] }
  | { kind: "paper"; title: string; instruction: string; lines: SolutionLine[]; photo?: boolean }
  | { kind: "worked"; title: string; generator?: string; seed?: number; prompt?: string; lines?: SolutionLine[] }
  /** `hide`: indexes of the working lines to fill in; negative counts from the end (−1 = last line). */
  | { kind: "gaps"; title: string; generator: string; hide: number[] }
  | { kind: "division"; title: string; generator: string; mode: "show" | "fill" }
  | { kind: "table"; title: string; generator: string; question: { prompt: string; options: string[]; answer: number; explain: string } }
  | { kind: "grid"; title: string; generator: string }
  | { kind: "signs"; title: string; generator: string }
  | { kind: "practice"; title: string; generators: string[]; count: number }
  | { kind: "traps"; title: string; cards: TrapCard[] }
  | { kind: "exam"; title: string; generator: string }
  | { kind: "sayItBack"; title: string; prompt: string; ideas: KeyIdea[]; need: number }
  | { kind: "notebook"; title: string; page: NotebookModel }
  | { kind: "mastery"; title: string; generators: string[]; count: number; need: number }
  | { kind: "diagnostic"; title: string; skills: { id: string; name: string; generator: string; repair: SolutionLine[]; explain: string }[]; perSkill: number };

export type TrapCard = { prompt: string; lines: string[]; wrong: number; options: string[]; answer: number; explain: string };

export type NotebookModel = {
  heading: string;
  blocks: ({ type: "definition" | "rule" | "note"; title: string; text: string } | { type: "example"; title: string; prompt: string; lines: SolutionLine[] } | { type: "sketch"; title: string; graph: GraphSpec })[];
};

export type MathsLessonTask = {
  type: "mathsLesson";
  topic: string;
  lesson: string;
  skills: { id: string; name: string }[];
  /** Every skill of the topic with its lesson, for the skills map. */
  topicSkills: { id: string; name: string; lesson: string }[];
  misconceptions: MisconceptionRule[];
  parts: LessonPart[];
};
