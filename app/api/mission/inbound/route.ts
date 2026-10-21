import { timingSafeEqual } from "node:crypto";
import { getCourse } from "@/content";
import { db } from "@/lib/supabase-admin";
import { env } from "@/lib/env";
import { normalizeCode } from "@/lib/codes";
import { checkMissionEmail } from "@/lib/mission-check";
import { checkCvMission, type CheckedAttachment } from "@/lib/mission-cv-check";
import { checkApplicationMission, checkReplyMission, pickReplyKind, type ReplyKind } from "@/lib/mission-app-check";
import { learnerName, renderReply, type MissionReply } from "@/lib/mission-reply";
import { json } from "@/lib/http";

export const maxDuration = 30;

/** Largest PDF we open (bytes). Bigger files are reported as unreadable. */
const MAX_PDF = 2 * 1024 * 1024;

type InboundAttachment = { filename?: string; contentType?: string; size?: number; content?: string };
type InboundBody = { from?: string; to?: string | string[]; subject?: string; text?: string; attachments?: InboundAttachment[] };

function secretOk(given: string | null): boolean {
  const expected = env.inboundSecret;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Address part of "Name <a@b.com>". */
function address(value: string): string {
  const m = value.match(/<([^>]+)>/);
  return (m ? m[1] : value).trim().toLowerCase();
}

/** The access code in a tagged recipient such as mission+ABCD-2345@domain. */
function codeFromRecipients(to: string | string[] | undefined): string | null {
  for (const r of (Array.isArray(to) ? to : [to ?? ""]).map(address)) {
    const tag = r.match(/\+([a-z0-9-]{8,9})@/i)?.[1];
    const code = tag ? normalizeCode(tag) : null;
    if (code) return code;
  }
  return null;
}

/** Reads a PDF in memory: page count and text. Nothing is written to disk or stored. */
async function readPdf(a: InboundAttachment): Promise<Pick<CheckedAttachment, "pages" | "text">> {
  if (!a.content) return {};
  try {
    const bytes = Buffer.from(a.content, "base64");
    if (bytes.length === 0 || bytes.length > MAX_PDF) return {};
    const { getDocumentProxy, extractText } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    return { pages: totalPages, text };
  } catch (e) {
    console.error("mission pdf unreadable", e);
    return {};
  }
}

/**
 * Receives a mission email from an inbound-email forwarder (e.g. the Cloudflare Email Worker).
 * Body: { from, to, subject, text, attachments: [{ filename, contentType, content(base64) }] }, header x-inbound-secret.
 * Attachments are checked in memory and discarded immediately.
 * For "application" missions, a passing application gets the recruiter's reply in the response
 * ({ reply: { from, subject, text } }), which the worker sends back to the learner.
 */
export async function POST(req: Request) {
  if (!secretOk(req.headers.get("x-inbound-secret"))) return json({ error: "unauthorized" }, 401);
  let body: InboundBody;
  try {
    body = (await req.json()) as InboundBody;
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const from = address(String(body.from ?? ""));
  if (!from) return json({ error: "no_sender" }, 400);
  const subject = String(body.subject ?? "").slice(0, 500);
  const text = String(body.text ?? "").slice(0, 20000);
  const rawAttachments = (Array.isArray(body.attachments) ? body.attachments : []).slice(0, 10);

  // Find the learner: by the code in the recipient address, otherwise by the sender's Gmail.
  const supabase = db();
  const tagged = codeFromRecipients(body.to);
  const query = supabase.from("missions").select("*").neq("status", "passed");
  const { data: missions } = tagged ? await query.eq("code", tagged) : await query.eq("gmail", from);

  let checked: CheckedAttachment[] | null = null;
  const readAttachments = async () =>
    (checked ??= await Promise.all(
      rawAttachments.map(async (a) => {
        const filename = String(a.filename ?? "");
        const contentType = String(a.contentType ?? "");
        const isPdf = contentType === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
        return { filename, contentType, ...(isPdf ? await readPdf(a) : {}) };
      }),
    ));
  let reply: MissionReply | null = null;
  for (const m of missions ?? []) {
    const en = getCourse(m.course_id, "en");
    const fr = getCourse(m.course_id, "fr");
    if (!en) continue;
    // The learner may use either language, so accept the subject words of both.
    const words = [...en.mission.subjectWords, ...(fr?.mission.subjectWords ?? [])];
    let issues: string[];
    const now = new Date().toISOString();
    if (en.mission.kind === "application") {
      const email = { from, subject, text, attachments: await readAttachments() };
      if (m.stage === "reply" && m.reply_kind) {
        issues = checkReplyMission(m.reply_kind as ReplyKind, email, m.gmail);
      } else {
        const name = await learnerName(m.code);
        const orgWords = [...(en.mission.orgWords ?? []), ...(fr?.mission.orgWords ?? [])];
        issues = checkApplicationMission(email, { gmail: m.gmail, name, roleWords: words, orgWords });
        if (!issues.length) {
          // Application accepted: the recruiter now writes back, and the learner must answer.
          const kind = pickReplyKind(m.code);
          await supabase
            .from("missions")
            .update({ stage: "reply", reply_kind: kind, status: "waiting", feedback: [], received_at: now, updated_at: now })
            .eq("code", m.code)
            .eq("course_id", m.course_id);
          const course = (m.locale === "fr" && fr) || en;
          reply ??= renderReply(course, kind, m.code, name);
          continue;
        }
      }
    } else if (en.mission.kind === "cv") {
      issues = checkCvMission({ from, subject, text, attachments: await readAttachments() }, m.gmail, words);
    } else {
      issues = checkMissionEmail(words, m.gmail, {
        from,
        subject,
        text,
        attachments: rawAttachments.map((a) => ({ filename: String(a.filename ?? ""), contentType: String(a.contentType ?? "") })),
      });
    }
    await supabase
      .from("missions")
      .update({ status: issues.length ? "failed" : "passed", feedback: issues, received_at: now, updated_at: now })
      .eq("code", m.code)
      .eq("course_id", m.course_id);
  }
  return json({
    ok: true,
    matched: missions?.length ?? 0,
    ...(reply ? { reply: { from: reply.from, subject: reply.subject, text: `${reply.body}

—
${reply.instruction}` } } : {}),
  });
}
