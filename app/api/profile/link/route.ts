import { createHash } from "node:crypto";
import { getCourse, listCourses } from "@/content";
import { getLearner } from "@/lib/session";
import { ensureProfile, linkProfiles } from "@/lib/profile";
import { normalizeCode } from "@/lib/codes";
import { db } from "@/lib/supabase-admin";
import { json, readJson } from "@/lib/http";

/** Other courses unlocked on this phone whose code is on a different profile: one-tap linking. */
export async function GET(req: Request) {
  const course = getCourse(new URL(req.url).searchParams.get("course") ?? "");
  const learner = course ? await getLearner(course.id) : null;
  if (!course || !learner) return json({ error: "locked" }, 401);
  try {
    const mine = await ensureProfile(learner.code);
    const suggestions: { courseId: string; title: string }[] = [];
    for (const other of listCourses()) {
      if (other.id === course.id) continue;
      const otherLearner = await getLearner(other.id);
      if (otherLearner && (await ensureProfile(otherLearner.code)) !== mine) suggestions.push({ courseId: other.id, title: other.title });
    }
    return json({ suggestions });
  } catch (e) {
    console.error("profile suggestions failed", e);
    return json({ suggestions: [] });
  }
}

function ipHash(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  return createHash("sha256").update(`tsn:${ip}`).digest("hex").slice(0, 32);
}

/** Links this course's code to an earlier code's profile, proven by the earlier code or this phone's session. */
export async function POST(req: Request) {
  const body = await readJson<{ courseId: string; previousCode: string; fromCourseId: string }>(req);
  const course = getCourse(String(body.courseId ?? ""));
  const learner = course ? await getLearner(course.id) : null;
  if (!course || !learner) return json({ error: "locked" }, 401);

  let previous: string | null = null;
  if (body.fromCourseId) {
    previous = (await getLearner(String(body.fromCourseId)))?.code ?? null;
  } else {
    const code = normalizeCode(String(body.previousCode ?? ""));
    if (!code) return json({ error: "format" }, 400);
    const supabase = db();
    const ip = ipHash(req);
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase.from("redeem_attempts").select("id", { count: "exact", head: true }).eq("ip_hash", ip).gte("created_at", since);
    if ((count ?? 0) >= 10) return json({ error: "too_many" }, 429);
    const { data } = await supabase.from("access_codes").select("code, status").eq("code", code).maybeSingle();
    if (!data || data.status === "revoked") {
      await supabase.from("redeem_attempts").insert({ ip_hash: ip });
      return json({ error: "not_found" }, 404);
    }
    previous = data.code;
  }
  if (!previous) return json({ error: "not_found" }, 404);
  if (previous === learner.code) return json({ error: "same" }, 400);

  try {
    await linkProfiles(learner.code, previous);
    return json({ ok: true });
  } catch (e) {
    console.error("link profiles failed", e);
    return json({ error: "unavailable" }, 503);
  }
}
