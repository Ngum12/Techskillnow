import { getCourse, stepFor } from "@/content";
import { getLearner } from "@/lib/session";
import { getLocale, isLocale } from "@/lib/locale";
import { json } from "@/lib/http";

export async function GET(req: Request, ctx: RouteContext<"/api/learn/[courseId]/[step]">) {
  const { courseId, step } = await ctx.params;
  // The language is part of the URL so the offline cache keeps each language separately.
  const lang = new URL(req.url).searchParams.get("lang");
  const course = getCourse(courseId, isLocale(lang) ? lang : await getLocale());
  const n = Number.parseInt(step, 10);
  if (!course || !Number.isInteger(n) || n < 1 || n > course.steps.length) return json({ error: "not_found" }, 404);

  const learner = await getLearner(course.id);
  if (n > course.freeSteps && !learner) return json({ error: "locked" }, 401);
  return json({ step: stepFor(course, n, learner?.code), n, total: course.steps.length });
}
