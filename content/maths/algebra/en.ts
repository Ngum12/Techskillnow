import type { Course, MathsLessonTask } from "../../types";
import type { MisconceptionRule } from "@/lib/maths/types";
import misconceptionsJson from "./misconceptions.json" with { type: "json" };
import { lessons } from "./lessons";

/*
 * GCE A Level Maths · Topic 1: Algebra (Cameroon GCE Board, Pure Mathematics, 0765/0770).
 * One course step per lesson. Lesson content: ./lessons.ts; question generators: ./generators.ts;
 * hints for common errors: ./misconceptions.json.
 */

const misconceptions = misconceptionsJson as MisconceptionRule[];
const topicSkills = lessons.flatMap((l) => l.skills.map((s) => ({ ...s, lesson: l.title })));

const course: Course = {
  id: "maths-algebra",
  locale: "en",
  title: "A Level Maths: Algebra",
  promise: "Polynomials, division, the remainder and factor theorems, partial fractions, inequalities and modulus, step by step with your exercise book, ready for the GCE.",
  price: 500,
  track: "exam",
  audience: "For Lower and Upper Sixth students (0765 and 0770)",
  outcomes: ["Polynomials, long division and the remainder theorem", "Your working checked line by line, with hints", "GCE-style questions marked M1, A1 and B1"],
  series: "GCE A Level Maths · Pure Mathematics",
  freeSteps: 2,
  steps: lessons.map((l) => ({
    title: l.title,
    // Step intros are plain text: show $x^2$ as x².
    body: l.body.map((b) => b.replace(/\$([^$]+)\$/g, (_, m: string) => m.replace(/\\/g, "").replace(/\^(\d)/g, (_x, d: string) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]))),
    task: { type: "mathsLesson", topic: "algebra", lesson: l.id, skills: l.skills, topicSkills, misconceptions, parts: l.parts } satisfies MathsLessonTask,
  })),
  assessment: {
    passMark: 7,
    warmup: [0, 2, 4, 6, 8],
    questions: [
      { step: 1, question: "Work out −3 − (−5) × 2.", options: ["7", "−13", "4", "−4"], answer: 0 },
      { step: 1, question: "Factorise x² − x − 12.", options: ["(x − 4)(x + 3)", "(x + 4)(x − 3)", "(x − 6)(x + 2)", "(x − 12)(x + 1)"], answer: 0 },
      { step: 2, question: "What is the degree of 7x² − 2x⁵ + x?", options: ["2", "3", "5", "7"], answer: 2 },
      { step: 2, question: "What is the leading coefficient of 3 + 4x − 6x³?", options: ["3", "4", "−6", "6"], answer: 2 },
      { step: 3, question: "Simplify (2x² + x) − (x² − 3x + 2).", options: ["x² − 2x + 2", "x² + 4x − 2", "x² + 4x + 2", "3x² − 2x − 2"], answer: 1 },
      { step: 3, question: "Expand (x − 4)².", options: ["x² + 16", "x² − 16", "x² − 8x + 16", "x² − 4x + 16"], answer: 2 },
      { step: 4, question: "In polynomial long division, what are the four repeated steps?", options: ["Divide, multiply, subtract, bring down", "Add, divide, multiply, subtract", "Multiply, add, divide, bring down", "Divide, subtract, add, multiply"], answer: 0 },
      { step: 4, question: "When x³ − 7x + 6 is divided by (x − 1), what do you write for the missing x² term?", options: ["Nothing", "0x²", "x²", "−x²"], answer: 1 },
      { step: 5, question: "What is the remainder when x³ + 2x − 1 is divided by (x + 1)?", options: ["2", "−4", "−2", "4"], answer: 1 },
      { step: 5, question: "The remainder when f(x) is divided by (2x − 1) is:", options: ["f(1)", "f(2)", "f(½)", "f(−½)"], answer: 2 },
    ],
  },
};

export default course;
