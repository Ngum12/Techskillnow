import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { getLocale } from "@/lib/locale";
import { db } from "@/lib/supabase-admin";
import { env } from "@/lib/env";
import { isGmail, missionFeedback } from "@/lib/mission-check";
import { json, readJson } from "@/lib/http";
import { missionStage } from "@/lib/mission-reply";

/** The learner's mission status (polled by the mission page). */
export async function GET(req: Request) {
  const course = getCourse(new URL(req.url).searchParams.get("course") ?? "", await getLocale());
  if (!course?.mission) return json({ error: "not_found" }, 404);
  const learner = await getLearner(course.id);
  if (!learner) return json({ error: "locked" }, 401);
  const [{ data }, { stage, reply }] = await Promise.all([
    db().from("missions").select("gmail, status, feedback").eq("code", learner.code).eq("course_id", course.id).maybeSingle(),
    missionStage(course, learner.code),
  ]);
  return json({
    gmail: data?.gmail ?? null,
    status: data?.status ?? null,
    feedback: data ? missionFeedback(course.mission!, data.feedback ?? []) : [],
    stage,
    reply,
  });
}

/** Sets the Gmail address the learner will send from. */
export async function POST(req: Request) {
  if (!env.missionEmail) return json({ error: "disabled" }, 404);
  const body = await readJson<{ courseId: string; gmail: string }>(req);
  const course = getCourse(String(body.courseId ?? ""));
  if (!course?.mission) return json({ error: "not_found" }, 404);
  const learner = await getLearner(course.id);
  if (!learner) return json({ error: "locked" }, 401);
  const gmail = String(body.gmail ?? "").trim().toLowerCase();
  if (!isGmail(gmail)) return json({ error: "gmail" }, 400);

  const supabase = db();
  const key = { code: learner.code, course_id: course.id };
  const { data: existing } = await supabase.from("missions").select("status").match(key).maybeSingle();
  if (existing?.status === "passed") return json({ ok: true });
  // "application" missions also remember the language, for the recruiter's reply email.
  const extra = course.mission!.kind === "application" ? { locale: await getLocale() } : {};
  await supabase.from("missions").upsert({ ...key, gmail, status: "waiting", feedback: [], updated_at: new Date().toISOString(), ...extra });
  return json({ ok: true });
}
