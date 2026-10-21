import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { getLocale } from "@/lib/locale";
import { claimFreeCourse } from "@/lib/referral";
import { json, readJson } from "@/lib/http";

/** Claims one free course earned by bringing friends. Returns the new access code. */
export async function POST(req: Request) {
  const body = await readJson<{ courseId: string; rewardCourseId: string }>(req);
  const course = getCourse(String(body.courseId ?? ""));
  const learner = course ? await getLearner(course.id) : null;
  if (!course || !learner) return json({ error: "locked" }, 401);
  try {
    const result = await claimFreeCourse(learner.code, String(body.rewardCourseId ?? ""), await getLocale());
    return result.ok ? json(result) : json({ error: result.error }, 409);
  } catch (e) {
    console.error("claim free course failed", e);
    return json({ error: "server" }, 500);
  }
}
