import "server-only";
import type { Course } from "@/content/types";
import { db } from "./supabase-admin";
import { env } from "./env";
import { CODE_ALPHABET } from "./codes";
import type { Learner } from "./session";
import { percent } from "./assessment";

export type Journey = {
  step: number;
  lessonsDone: boolean;
  completedAt: string | null;
  pre: { score: number; total: number } | null;
  post: { score: number; total: number } | null;
  postPassed: boolean;
  missionEnabled: boolean;
  mission: { gmail: string; status: "waiting" | "passed" | "failed"; feedback: string[] } | null;
  missionPassed: boolean;
  certificateId: string | null;
  eligible: boolean;
};

/** Everything the learner has done in a course, read in one go. */
export async function getJourney(learner: Learner, course: Course): Promise<Journey> {
  const supabase = db();
  const [{ data: progress }, { data: tests }, { data: mission }, { data: cert }] = await Promise.all([
    supabase.from("progress").select("step, completed_at").eq("code", learner.code).eq("course_id", course.id).maybeSingle(),
    supabase.from("assessments").select("kind, score, total").eq("code", learner.code).eq("course_id", course.id),
    supabase.from("missions").select("gmail, status, feedback").eq("code", learner.code).eq("course_id", course.id).maybeSingle(),
    supabase.from("certificates").select("id").eq("code", learner.code).eq("course_id", course.id).maybeSingle(),
  ]);
  const pre = tests?.find((t) => t.kind === "pre") ?? null;
  const post = tests?.find((t) => t.kind === "post") ?? null;
  const missionEnabled = !!env.missionEmail;
  const postPassed = !!post && post.score >= course.assessment.passMark;
  const missionPassed = !missionEnabled || mission?.status === "passed";
  const lessonsDone = !!progress?.completed_at;

  return {
    step: progress?.step ?? 1,
    lessonsDone,
    completedAt: progress?.completed_at ?? null,
    pre: pre ? { score: pre.score, total: pre.total } : null,
    post: post ? { score: post.score, total: post.total } : null,
    postPassed,
    missionEnabled,
    mission: mission ? { gmail: mission.gmail, status: mission.status, feedback: mission.feedback ?? [] } : null,
    missionPassed,
    certificateId: cert?.id ?? null,
    // A certificate already issued stays valid even if requirements change later.
    eligible: !!cert || (lessonsDone && postPassed && missionPassed),
  };
}

function certificateId(): string {
  const bytes = new Uint32Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
  return `TSN-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

/** Issues the certificate if the learner is eligible and doesn't have one yet. Returns its ID. */
export async function issueCertificate(learner: Learner, course: Course, journey: Journey): Promise<string | null> {
  if (journey.certificateId) return journey.certificateId;
  if (!journey.eligible || !journey.post) return null;
  const supabase = db();
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = certificateId();
    const { error } = await supabase.from("certificates").insert({
      id,
      code: learner.code,
      course_id: course.id,
      name: learner.buyerName,
      // The warm-up is shorter than the final test, so its result is stored as a percentage.
      pre_score: journey.pre ? percent(journey.pre.score, journey.pre.total) : null,
      post_score: journey.post.score,
      total: journey.post.total,
      mission: journey.missionEnabled && journey.missionPassed,
    });
    if (!error) return id;
    if (error.code !== "23505") break;
    // 23505 is either an ID collision (retry) or a concurrent issue for this learner (read it back).
    const { data } = await supabase.from("certificates").select("id").eq("code", learner.code).eq("course_id", course.id).maybeSingle();
    if (data) return data.id;
  }
  return null;
}
