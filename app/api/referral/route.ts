import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { getLocale } from "@/lib/locale";
import { env } from "@/lib/env";
import { referralSummary } from "@/lib/referral";
import { json } from "@/lib/http";

/** The learner's invite link, friends who bought, and free courses earned. */
export async function GET(req: Request) {
  const course = getCourse(new URL(req.url).searchParams.get("course") ?? "");
  const learner = course ? await getLearner(course.id) : null;
  if (!course || !learner) return json({ error: "locked" }, 401);
  // Referrals only work with online payment (the discount is applied at checkout).
  if (!env.fapshi) return json({ enabled: false });
  try {
    return json({ enabled: true, ...(await referralSummary(learner.code, await getLocale())) });
  } catch (e) {
    console.error("referral summary failed", e);
    return json({ error: "unavailable" }, 503);
  }
}
