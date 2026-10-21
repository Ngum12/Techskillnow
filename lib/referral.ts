import "server-only";
import { db } from "./supabase-admin";
import { env } from "./env";
import { createAccessCode, ensureReferralId } from "./access";
import { ensureProfile } from "./profile";
import { countFriends, rewardStatus } from "./referral-math";
import { getCourse, listCourses } from "@/content";
import type { Locale } from "@/content/types";

export type ReferralSummary = {
  link: string;
  friends: number;
  earned: number;
  available: number;
  towardsNext: number;
  perCourse: number;
  discount: number;
  /** Courses the learner can pick as a free course (ones they don't have yet). */
  claimable: { id: string; title: string }[];
  claimed: { courseId: string; title: string; code: string | null }[];
};

async function referrer(code: string) {
  const { data } = await db().from("access_codes").select("code, course_id, buyer_name, buyer_phone, profile_id").eq("code", code).single();
  return data!;
}

/** Courses already unlocked by any code on the learner's profile. */
async function ownedCourses(code: string): Promise<Set<string>> {
  const profile = await ensureProfile(code);
  const { data } = await db().from("access_codes").select("course_id, status").eq("profile_id", profile);
  return new Set((data ?? []).filter((c) => c.status !== "revoked").map((c) => c.course_id));
}

export async function referralSummary(code: string, locale: Locale): Promise<ReferralSummary> {
  const supabase = db();
  const [referralId, me] = await Promise.all([ensureReferralId(code), referrer(code)]);
  if (!referralId) throw new Error("no referral id");
  const [{ data: orders }, { data: rewards }, owned] = await Promise.all([
    supabase.from("orders").select("buyer_phone").eq("referral_id", referralId).eq("status", "paid"),
    supabase.from("referral_rewards").select("kind, course_id, code").eq("referral_id", referralId).eq("kind", "course").order("seq"),
    ownedCourses(code),
  ]);
  const friends = countFriends(orders ?? [], me.buyer_phone);
  const claimed = (rewards ?? []).map((r) => ({
    courseId: r.course_id as string,
    title: getCourse(r.course_id as string, locale)?.title ?? (r.course_id as string),
    code: r.code as string | null,
  }));
  const status = rewardStatus(friends, claimed.length, env.referralFriendsPerCourse);
  return {
    link: `${env.appUrl}/buy?course=${me.course_id}&ref=${referralId}`,
    friends,
    ...status,
    discount: env.referralDiscount,
    claimable: listCourses(locale)
      .filter((c) => !owned.has(c.id))
      .map((c) => ({ id: c.id, title: c.title })),
    claimed,
  };
}

export type ClaimResult = { ok: true; code: string; courseId: string } | { ok: false; error: "no_reward" | "owned" | "course" | "busy" | "server" };

/** Turns one earned reward into a free access code for a course the learner doesn't have yet. */
export async function claimFreeCourse(code: string, rewardCourseId: string, locale: Locale): Promise<ClaimResult> {
  const supabase = db();
  const summary = await referralSummary(code, locale);
  if (summary.available < 1) return { ok: false, error: "no_reward" };
  if (!listCourses().some((c) => c.id === rewardCourseId)) return { ok: false, error: "course" };
  if (!summary.claimable.some((c) => c.id === rewardCourseId)) return { ok: false, error: "owned" };

  const referralId = (await ensureReferralId(code))!;
  // The unique (referral_id, seq) index makes two simultaneous claims fail safely.
  const seq = summary.claimed.length + 1;
  const { data: reward, error } = await supabase
    .from("referral_rewards")
    .insert({ referral_id: referralId, kind: "course", seq, course_id: rewardCourseId, note: "Free course: 3 friends" })
    .select("id")
    .single();
  if (error || !reward) return { ok: false, error: error?.code === "23505" ? "busy" : "server" };

  const me = await referrer(code);
  const newCode = await createAccessCode({
    courseId: rewardCourseId,
    buyerName: me.buyer_name,
    buyerPhone: me.buyer_phone,
    note: `Referral reward (${referralId})`,
    source: "admin",
  });
  if (!newCode) {
    await supabase.from("referral_rewards").delete().eq("id", reward.id);
    return { ok: false, error: "server" };
  }
  // Same learner, same CV: put the new code on the referrer's profile.
  const profile = await ensureProfile(code);
  await Promise.all([
    supabase.from("access_codes").update({ profile_id: profile }).eq("code", newCode),
    supabase.from("referral_rewards").update({ code: newCode }).eq("id", reward.id),
  ]);
  return { ok: true, code: newCode, courseId: rewardCourseId };
}
