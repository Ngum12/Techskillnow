import { getAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase-admin";
import { normalizeCode } from "@/lib/codes";
import { json, readJson } from "@/lib/http";
import { getCourse } from "@/content";
import { pickReplyKind } from "@/lib/mission-app-check";

/** Manual review of a mission email, for when automatic checking is not set up. */
export async function POST(req: Request) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const body = await readJson<{ code: string; courseId: string; action: "pass" | "fail"; note: string }>(req);
  const code = normalizeCode(String(body.code ?? ""));
  if (!code || (body.action !== "pass" && body.action !== "fail")) return json({ error: "bad_request" }, 400);
  const note = String(body.note ?? "").trim().slice(0, 500);
  const courseId = String(body.courseId ?? "");
  const now = new Date().toISOString();

  // "application" missions have two stages: passing the application sends the learner the recruiter's reply.
  if (body.action === "pass" && getCourse(courseId)?.mission?.kind === "application") {
    const { data: row } = await db().from("missions").select("stage").eq("code", code).eq("course_id", courseId).maybeSingle();
    if (row && row.stage !== "reply") {
      const { error } = await db()
        .from("missions")
        .update({ stage: "reply", reply_kind: pickReplyKind(code), status: "waiting", feedback: [], received_at: now, updated_at: now })
        .eq("code", code)
        .eq("course_id", courseId);
      return error ? json({ error: "server" }, 500) : json({ ok: true, stage: "reply" });
    }
  }

  const { error } = await db()
    .from("missions")
    .update({
      status: body.action === "pass" ? "passed" : "failed",
      feedback: body.action === "fail" && note ? [`note:${note}`] : [],
      received_at: now,
      updated_at: now,
    })
    .eq("code", code)
    .eq("course_id", courseId);
  if (error) return json({ error: "server" }, 500);
  return json({ ok: true });
}
