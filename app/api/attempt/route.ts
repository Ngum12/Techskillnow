import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { db } from "@/lib/supabase-admin";
import { json, readJson } from "@/lib/http";

/** Logs a practice attempt, so the admin can see which mistakes are most common. */
export async function POST(req: Request) {
  const body = await readJson<{ courseId: string; step: number; passed: boolean; failed: string[] }>(req);
  const course = getCourse(String(body.courseId ?? ""));
  if (!course) return json({ error: "not_found" }, 404);
  const learner = await getLearner(course.id);
  if (!learner) return json({ error: "locked" }, 401);
  const step = Math.trunc(Number(body.step));
  if (!(step >= 1 && step <= course.steps.length)) return json({ error: "step" }, 400);
  const failed = (Array.isArray(body.failed) ? body.failed : []).slice(0, 10).map((f) => String(f).slice(0, 300));
  await db().from("attempts").insert({ code: learner.code, course_id: course.id, step, kind: "check", passed: body.passed === true, failed });
  return json({ ok: true });
}
