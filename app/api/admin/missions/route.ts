import { getAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase-admin";
import { normalizeCode } from "@/lib/codes";
import { json, readJson } from "@/lib/http";

/** Manual review of a mission email, for when automatic checking is not set up. */
export async function POST(req: Request) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const body = await readJson<{ code: string; courseId: string; action: "pass" | "fail"; note: string }>(req);
  const code = normalizeCode(String(body.code ?? ""));
  if (!code || (body.action !== "pass" && body.action !== "fail")) return json({ error: "bad_request" }, 400);
  const note = String(body.note ?? "").trim().slice(0, 500);
  const { error } = await db()
    .from("missions")
    .update({
      status: body.action === "pass" ? "passed" : "failed",
      feedback: body.action === "fail" && note ? [`note:${note}`] : [],
      received_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("code", code)
    .eq("course_id", String(body.courseId ?? ""));
  if (error) return json({ error: "server" }, 500);
  return json({ ok: true });
}
