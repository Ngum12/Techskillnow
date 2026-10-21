import "server-only";
import { createHash } from "node:crypto";
import type { Course, Locale, Step, Task } from "./types";
import emailForWorkEn from "./email-for-work/en";
import emailForWorkFr from "./email-for-work/fr";
import cvEn from "./cv/en";
import cvFr from "./cv/fr";
import applicationsEn from "./applications/en";
import applicationsFr from "./applications/fr";

const courses: Record<string, Partial<Record<Locale, Course>>> = {
  "email-for-work": { en: emailForWorkEn, fr: emailForWorkFr },
  cv: { en: cvEn, fr: cvFr },
  applications: { en: applicationsEn, fr: applicationsFr },
};

export const DEFAULT_COURSE_ID = "email-for-work";

export function getCourse(id: string, locale: Locale = "en"): Course | null {
  const byLocale = courses[id];
  if (!byLocale) return null;
  return byLocale[locale] ?? byLocale.en ?? null;
}

export type CourseSummary = { id: string; title: string; promise: string; series?: string; price: number; totalSteps: number };

export function listCourses(locale: Locale = "en"): CourseSummary[] {
  return Object.keys(courses)
    .map((id) => getCourse(id, locale))
    .filter((c): c is Course => c !== null)
    .map((c) => ({ id: c.id, title: c.title, promise: c.promise, series: c.series, price: c.price, totalSteps: c.steps.length }));
}

/**
 * The step a learner sees. Paid learners get one task variant, chosen from their code so it is
 * stable across visits but differs between learners (so answers can't simply be copied).
 */
export function stepFor(course: Course, n: number, code?: string): Step {
  const step = course.steps[n - 1];
  if (!code || !step.task || !step.variants?.length) return { ...step, variants: undefined };
  const tasks: Task[] = [step.task, ...step.variants];
  const pick = createHash("sha256").update(`${code}:${course.id}:${step.variantGroup ?? n}`).digest()[0] % tasks.length;
  return { ...step, task: tasks[pick], variants: undefined };
}
