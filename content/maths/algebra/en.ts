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
      { step: 2, question: "What is the degree of 7x² − 2x⁵ + x?", options: ["2", "3", "5", "7"], answer: 2 },
      { step: 3, question: "Expand (x − 4)².", options: ["x² + 16", "x² − 16", "x² − 8x + 16", "x² − 4x + 16"], answer: 2 },
      { step: 5, question: "What is the remainder when x³ + 2x − 1 is divided by (x + 1)?", options: ["2", "−4", "−2", "4"], answer: 1 },
      { step: 6, question: "f(2) = 0 for a polynomial f(x). What does this tell you?", options: ["(x + 2) is a factor", "(x − 2) is a factor", "The remainder is 2", "Nothing"], answer: 1 },
      { step: 7, question: "Solve x³ − x = 0.", options: ["x = 0 or x = 1", "x = 1 or x = −1", "x = 0, x = 1 or x = −1", "x = 1"], answer: 2 },
      { step: 8, question: "Which is the right form for (5x + 1)/((x − 1)(x + 2))?", options: ["A/(x − 1) + B/(x + 2)", "A/(x − 1) + B/(x + 2)²", "(Ax + B)/((x − 1)(x + 2))", "A/((x − 1)(x + 2))"], answer: 0 },
      { step: 10, question: "Solve (x − 1)(x − 4) < 0.", options: ["x < 1 or x > 4", "1 < x < 4", "x < 4", "x > 1"], answer: 1 },
      { step: 11, question: "Solve (x − 2)/(x + 3) ≤ 0.", options: ["−3 ≤ x ≤ 2", "−3 < x ≤ 2", "x ≤ 2", "x < −3 or x ≥ 2"], answer: 1 },
      { step: 12, question: "Solve |x − 3| < 2.", options: ["x < 5", "1 < x < 5", "x < 1 or x > 5", "−1 < x < 5"], answer: 1 },
    ],
  },
};

export default course;
