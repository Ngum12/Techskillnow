import type { AssessmentQuestion, Course } from "@/content/types";

/** The optional warm-up ("pre") uses a short subset; the final test ("post") uses every question. */
export function questionsFor(course: Course, kind: "pre" | "post"): AssessmentQuestion[] {
  const all = course.assessment.questions;
  return kind === "pre" ? course.assessment.warmup.map((i) => all[i]).filter(Boolean) : all;
}

/** Whole-number percentage, for comparing the 5-question warm-up with the 10-question final test. */
export function percent(score: number, total: number): number {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

/** Scores answers (one chosen option index per question). Returns the score and the indices of wrong questions. */
export function scoreAssessment(questions: AssessmentQuestion[], answers: unknown): { score: number; total: number; wrong: number[] } {
  const list = Array.isArray(answers) ? answers : [];
  const wrong: number[] = [];
  questions.forEach((q, i) => {
    if (list[i] !== q.answer) wrong.push(i);
  });
  return { score: questions.length - wrong.length, total: questions.length, wrong };
}

/** Questions without their answers, safe to send before the learner answers. */
export function publicQuestions(questions: AssessmentQuestion[]) {
  return questions.map(({ question, options }) => ({ question, options }));
}
