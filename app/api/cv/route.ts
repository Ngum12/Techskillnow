import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { deleteCv, ensureProfile, getCv, saveCv } from "@/lib/profile";
import { parseCv } from "@/lib/cv/model";
import { json, readJson } from "@/lib/http";

const MAX_BYTES = 60_000;

async function learnerFor(courseId: string | null) {
  const course = getCourse(String(courseId ?? ""));
  if (!course?.usesCv) return null;
  return getLearner(course.id);
}

/** The learner's CV draft (shared by every course on the same profile). */
export async function GET(req: Request) {
  const learner = await learnerFor(new URL(req.url).searchParams.get("course"));
  if (!learner) return json({ error: "locked" }, 401);
  try {
    const { cv, updatedAt } = await getCv(await ensureProfile(learner.code));
    return json({ cv, updatedAt });
  } catch (e) {
    console.error("cv load failed", e);
    return json({ error: "unavailable" }, 503);
  }
}

/** Autosave: the whole draft, validated and size-limited. */
export async function PUT(req: Request) {
  const text = await req.text();
  if (text.length > MAX_BYTES) return json({ error: "too_large" }, 413);
  let body: { courseId?: string; cv?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const learner = await learnerFor(body.courseId ?? null);
  if (!learner) return json({ error: "locked" }, 401);
  try {
    const updatedAt = await saveCv(await ensureProfile(learner.code), parseCv(body.cv));
    return json({ ok: true, updatedAt });
  } catch (e) {
    console.error("cv save failed", e);
    return json({ error: "unavailable" }, 503);
  }
}

/** "Delete my CV data". */
export async function DELETE(req: Request) {
  const { courseId } = await readJson<{ courseId: string }>(req);
  const learner = await learnerFor(courseId ?? null);
  if (!learner) return json({ error: "locked" }, 401);
  try {
    await deleteCv(await ensureProfile(learner.code));
    return json({ ok: true });
  } catch (e) {
    console.error("cv delete failed", e);
    return json({ error: "unavailable" }, 503);
  }
}
