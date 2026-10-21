import "server-only";
import { db } from "./supabase-admin";
import { emptyCv, isEmptyCv, parseCv, type CvData } from "./cv/model";

/** The learner profile behind an access code, created on first use. */
export async function ensureProfile(code: string): Promise<string> {
  const { data, error } = await db().rpc("ensure_profile", { p_code: code });
  if (error || !data) throw new Error(`ensure_profile failed: ${error?.message ?? "no profile"}`);
  return data as string;
}

export async function getCv(profileId: string): Promise<{ cv: CvData; updatedAt: string | null }> {
  const { data, error } = await db().from("cv_drafts").select("data, updated_at").eq("profile_id", profileId).maybeSingle();
  if (error) throw error;
  return { cv: data ? parseCv(data.data) : emptyCv(), updatedAt: data?.updated_at ?? null };
}

export async function saveCv(profileId: string, cv: CvData): Promise<string> {
  const updatedAt = new Date().toISOString();
  const { error } = await db().from("cv_drafts").upsert({ profile_id: profileId, data: cv, updated_at: updatedAt });
  if (error) throw error;
  return updatedAt;
}

export async function deleteCv(profileId: string): Promise<void> {
  const { error } = await db().from("cv_drafts").delete().eq("profile_id", profileId);
  if (error) throw error;
}

/**
 * Moves `code` onto the profile of `previousCode`, so a later course opens with the learner's CV.
 * If only the current profile has CV data, it is carried over. The old, now unused profile is removed.
 */
export async function linkProfiles(code: string, previousCode: string): Promise<void> {
  const supabase = db();
  const [current, target] = await Promise.all([ensureProfile(code), ensureProfile(previousCode)]);
  if (current === target) return;

  const [mine, theirs] = await Promise.all([getCv(current), getCv(target)]);
  if (isEmptyCv(theirs.cv) && !isEmptyCv(mine.cv)) await saveCv(target, mine.cv);

  const { error } = await supabase.from("access_codes").update({ profile_id: target }).eq("code", code);
  if (error) throw error;

  const { count } = await supabase.from("access_codes").select("code", { count: "exact", head: true }).eq("profile_id", current);
  if (!count) await supabase.from("learner_profiles").delete().eq("id", current);
}
