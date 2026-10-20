import "server-only";
import { db } from "./supabase-admin";
import { CODE_ALPHABET, generateCode } from "./codes";
import { env } from "./env";

function randomReferralId(): string {
  const bytes = new Uint32Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/** Creates an access code (retrying on the unlikely collision). Returns the code, or null on a database error. */
export async function createAccessCode(input: {
  courseId: string;
  buyerName: string;
  buyerPhone: string;
  note?: string | null;
  source: "admin" | "payment";
}): Promise<string | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { error } = await db().from("access_codes").insert({
      code,
      course_id: input.courseId,
      buyer_name: input.buyerName,
      buyer_phone: input.buyerPhone,
      note: input.note ?? null,
      max_devices: env.maxDevices,
      source: input.source,
      referral_id: randomReferralId(),
    });
    if (!error) return code;
    if (error.code !== "23505") {
      console.error("create access code failed", error);
      return null;
    }
  }
  return null;
}

/** The learner's referral ID, created for older codes that don't have one yet. */
export async function ensureReferralId(code: string): Promise<string | null> {
  const supabase = db();
  const { data } = await supabase.from("access_codes").select("referral_id").eq("code", code).single();
  if (data?.referral_id) return data.referral_id;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from("access_codes").update({ referral_id: randomReferralId() }).eq("code", code).is("referral_id", null);
    if (!error) break; // else a unique-ID collision: try another
  }
  // Re-read: a concurrent request may have set it first.
  const { data: saved } = await supabase.from("access_codes").select("referral_id").eq("code", code).single();
  return saved?.referral_id ?? null;
}

/** Returns the referral ID if it belongs to a real, non-revoked code. */
export async function validReferral(ref: string | undefined | null): Promise<string | null> {
  const id = String(ref ?? "").toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(id)) return null;
  const { data } = await db().from("access_codes").select("status").eq("referral_id", id).maybeSingle();
  return data && data.status !== "revoked" ? id : null;
}
