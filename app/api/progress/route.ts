import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { db } from "@/lib/supabase-admin";
import { json, readJson } from "@/lib/http";

export async function POST(req: Request) {
  const body = await readJson<{ courseId: string; step: number; completed: boolean }>(req);
  const course = getCourse(String(body.courseId ?? ""));
  if (!course) return json({ error: "not_found" }, 404);
  const learner = await getLearner(course.id);
  if (!learner) return json({ error: "locked" }, 401);

  const step = Math.min(Math.max(1, Math.trunc(Number(body.step) || 1)), course.steps.length);
  const completed = body.completed === true && step === course.steps.length;
  const supabase = db();
  const { error } = await supabase.rpc("save_progress", {
    p_code: learner.code,
    p_course_id: course.id,
    p_step: step,
    p_completed: completed,
  });
  if (error) {
    console.error("save_progress failed", error);
    return json({ error: "server" }, 500);
  }
  // Touch the device so the admin can see activity.
  await supabase.from("code_devices").update({ last_seen: new Date().toISOString() }).eq("code", learner.code).eq("device_id", learner.deviceId);
  return json({ ok: true });
}
