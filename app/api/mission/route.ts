import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { getLocale } from "@/lib/locale";
import { db } from "@/lib/supabase-admin";
import { env } from "@/lib/env";
import { isGmail, missionFeedback } from "@/lib/mission-check";
import { json, readJson } from "@/lib/http";

/** The learner's mission status (polled by the mission page). */
export async function GET(req: Request) {
  const course = getCourse(new URL(req.url).searchParams.get("course") ?? "", await getLocale());
  if (!course) return json({ error: "not_found" }, 404);
  const learner = await getLearner(course.id);
  if (!learner) return json({ error: "locked" }, 401);
  const { data } = await db().from("missions").select("gmail, status, feedback").eq("code", learner.code).eq("course_id", course.id).maybeSingle();
  return json({
    gmail: data?.gmail ?? null,
    status: data?.status ?? null,
    feedback: data ? missionFeedback(course.mission, data.feedback ?? []) : [],
  });
}

/** Sets the Gmail address the learner will send from. */
export async function POST(req: Request) {
  if (!env.missionEmail) return json({ error: "disabled" }, 404);
  const body = await readJson<{ courseId: string; gmail: string }>(req);
  const course = getCourse(String(body.courseId ?? ""));
  if (!course) return json({ error: "not_found" }, 404);
  const learner = await getLearner(course.id);
  if (!learner) return json({ error: "locked" }, 401);
  const gmail = String(body.gmail ?? "").trim().toLowerCase();
  if (!isGmail(gmail)) return json({ error: "gmail" }, 400);

  const supabase = db();
  const key = { code: learner.code, course_id: course.id };
  const { data: existing } = await supabase.from("missions").select("status").match(key).maybeSingle();
  if (existing?.status === "passed") return json({ ok: true });
  await supabase.from("missions").upsert({ ...key, gmail, status: "waiting", feedback: [], updated_at: new Date().toISOString() });
  return json({ ok: true });
}
