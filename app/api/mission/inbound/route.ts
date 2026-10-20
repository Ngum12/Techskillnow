import { timingSafeEqual } from "node:crypto";
import { getCourse } from "@/content";
import { db } from "@/lib/supabase-admin";
import { env } from "@/lib/env";
import { checkMissionEmail, type InboundEmail } from "@/lib/mission-check";
import { json, readJson } from "@/lib/http";

function secretOk(given: string | null): boolean {
  const expected = env.inboundSecret;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Address part of "Name <a@b.com>". */
function address(from: string): string {
  const m = from.match(/<([^>]+)>/);
  return (m ? m[1] : from).trim().toLowerCase();
}

/**
 * Receives a mission email from an inbound-email forwarder (e.g. a Cloudflare Email Worker).
 * Body: { from, subject, text, attachments: [{ filename, contentType }] }, header x-inbound-secret.
 */
export async function POST(req: Request) {
  if (!secretOk(req.headers.get("x-inbound-secret"))) return json({ error: "unauthorized" }, 401);
  const body = await readJson<InboundEmail>(req);
  const email: InboundEmail = {
    from: address(String(body.from ?? "")),
    subject: String(body.subject ?? "").slice(0, 500),
    text: String(body.text ?? "").slice(0, 20000),
    attachments: (Array.isArray(body.attachments) ? body.attachments : []).slice(0, 10).map((a) => ({
      filename: String(a?.filename ?? ""),
      contentType: String(a?.contentType ?? ""),
    })),
  };
  if (!email.from) return json({ error: "no_sender" }, 400);

  const supabase = db();
  const { data: missions } = await supabase.from("missions").select("code, course_id, gmail, status").eq("gmail", email.from).neq("status", "passed");
  for (const m of missions ?? []) {
    // The learner may use either language, so accept the subject words of both.
    const words = [...(getCourse(m.course_id, "en")?.mission.subjectWords ?? []), ...(getCourse(m.course_id, "fr")?.mission.subjectWords ?? [])];
    const issues = checkMissionEmail(words, m.gmail, email);
    await supabase
      .from("missions")
      .update({ status: issues.length ? "failed" : "passed", feedback: issues, received_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("code", m.code)
      .eq("course_id", m.course_id);
  }
  return json({ ok: true, matched: missions?.length ?? 0 });
}
