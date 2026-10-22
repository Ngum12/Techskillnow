import type { Course, MathsLessonTask } from "../../types";
import type { MisconceptionRule } from "@/lib/maths/types";
import misconceptionsJson from "./misconceptions.json" with { type: "json" };
import algebraMisconceptions from "../algebra/misconceptions.json" with { type: "json" };
import { lessons } from "./lessons";

/*
 * GCE A Level Maths · Topic 2: Functions (Cameroon GCE Board, Pure Mathematics, 0765/0770).
 * One course step per lesson. Lesson content: ./lessons.ts and ./lessons-2.ts; question generators:
 * ./generators.ts and ./generators-2.ts; hints for common errors: ./misconceptions.json (the Algebra
 * hints are included too, because the starting check reuses Algebra skills).
 */

const misconceptions = [...(misconceptionsJson as MisconceptionRule[]), ...(algebraMisconceptions as MisconceptionRule[])];
const topicSkills = lessons.flatMap((l) => l.skills.map((s) => ({ ...s, lesson: l.title })));

const course: Course = {
  id: "maths-functions",
  locale: "en",
  title: "A Level Maths: Functions",
  promise: "Domain and range, composite and inverse functions, transformations and graph sketching, with machines you can run and graphs you can move, ready for the GCE.",
  price: 500,
  track: "exam",
  audience: "For Lower and Upper Sixth students (0765 and 0770)",
  outcomes: ["Composite and inverse functions, step by step", "Move graphs yourself and see every transformation", "GCE-style questions marked M1, A1 and B1"],
  series: "GCE A Level Maths · Pure Mathematics",
  freeSteps: 2,
  steps: lessons.map((l) => ({
    title: l.title,
    // Step intros are plain text: show $x^2$ as x².
    body: l.body.map((b) => b.replace(/\$([^$]+)\$/g, (_, m: string) => m.replace(/\\/g, "").replace(/\^(\d)/g, (_x, d: string) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]))),
    task: { type: "mathsLesson", topic: "functions", lesson: l.id, skills: l.skills, topicSkills, misconceptions, parts: l.parts } satisfies MathsLessonTask,
  })),
  assessment: {
    passMark: 7,
    warmup: [0, 2, 4, 6, 8],
    questions: [
      { step: 2, question: "Which of these is NOT a function?", options: ["x ↦ x²", "x ↦ 2x + 1", "x ↦ ±√x", "x ↦ |x|"], answer: 2 },
      { step: 3, question: "f(x) = (x − 2)² + 5, x ∈ ℝ. What is the range of f?", options: ["x ≥ 2", "f(x) ≥ 5", "f(x) ≥ 2", "x ≥ 5"], answer: 1 },
      { step: 3, question: "What is the largest domain of g(x) = √(x − 3)?", options: ["x > 3", "x ≥ 3", "x ≥ 0", "x ≠ 3"], answer: 1 },
      { step: 4, question: "f(x) = x + 1 and g(x) = 2x. What is fg(3)?", options: ["8", "7", "6", "9"], answer: 1 },
      { step: 5, question: "f(x) = 4x − 3. What is f⁻¹(x)?", options: ["1/(4x − 3)", "(x + 3)/4", "x/4 + 3", "4x + 3"], answer: 1 },
      { step: 6, question: "The graph of y = f⁻¹(x) is the reflection of y = f(x) in…", options: ["the x-axis", "the y-axis", "the line y = x", "the origin"], answer: 2 },
      { step: 7, question: "What are the asymptotes of y = 3/(x + 2) − 1?", options: ["x = 2, y = 1", "x = −2, y = −1", "x = −2, y = 3", "x = 3, y = −1"], answer: 1 },
      { step: 8, question: "How does y = f(x + 4) relate to y = f(x)?", options: ["Moved 4 right", "Moved 4 left", "Moved 4 up", "Stretched by 4"], answer: 1 },
      { step: 9, question: "(2, 3) is on y = f(x). Where does it go on y = −f(x)?", options: ["(−2, 3)", "(2, −3)", "(−2, −3)", "(3, 2)"], answer: 1 },
      { step: 10, question: "f(x) = x² − 4. The part of y = |f(x)| between x = −2 and x = 2 is…", options: ["deleted", "reflected above the x-axis", "moved up by 4", "unchanged"], answer: 1 },
    ],
  },
};

export default course;
