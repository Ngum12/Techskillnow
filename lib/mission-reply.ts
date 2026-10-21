import "server-only";
import type { Course } from "@/content/types";
import { db } from "./supabase-admin";
import { ensureProfile, getCv } from "./profile";
import { fillTemplate, missionReference, type ReplyKind } from "./mission-app-check";

export type MissionReply = { kind: ReplyKind; from: string; subject: string; body: string; instruction: string };

/** Reference prefix from the organisation's initials, e.g. "Nyanga Youth Futures" → "NYF". */
function refPrefix(org: string): string {
  return (
    org
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 4) || "REF"
  );
}

/** The recruiter's automatic reply to a correct application ("application" missions). */
export function renderReply(course: Course, kind: ReplyKind, code: string, name: string): MissionReply | null {
  const r = course.mission.replies?.[kind];
  if (!r) return null;
  const org = course.mission.advert?.org ?? "";
  const vars = {
    name: name.trim() || (course.locale === "fr" ? "candidat(e)" : "Candidate"),
    role: course.mission.advert?.title ?? "",
    org,
    ref: missionReference(refPrefix(org), code),
  };
  return { kind, from: r.from, subject: fillTemplate(r.subject, vars), body: fillTemplate(r.body, vars), instruction: r.instruction };
}

/** The learner's name as on their CV (it signs the letter), or the buyer's name. */
export async function learnerName(code: string): Promise<string> {
  try {
    const { cv } = await getCv(await ensureProfile(code));
    if (cv.header.fullName.trim()) return cv.header.fullName.trim();
  } catch {}
  const { data } = await db().from("access_codes").select("buyer_name").eq("code", code).maybeSingle();
  return data?.buyer_name ?? "";
}

/** Stage of an "application" mission: the reply to answer, once the application has passed. */
export async function missionStage(course: Course, code: string): Promise<{ stage: "application" | "reply"; reply: MissionReply | null }> {
  if (course.mission.kind !== "application") return { stage: "application", reply: null };
  const { data } = await db().from("missions").select("stage, reply_kind").eq("code", code).eq("course_id", course.id).maybeSingle();
  if (data?.stage !== "reply" || !data.reply_kind) return { stage: "application", reply: null };
  return { stage: "reply", reply: renderReply(course, data.reply_kind as ReplyKind, code, await learnerName(code)) };
}
