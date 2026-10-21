import { getAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase-admin";
import { json, readJson } from "@/lib/http";

/** Records Mobile Money cashback the admin has paid to a referrer by hand. */
export async function POST(req: Request) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const body = await readJson<{ referralId: string; amount: number; note: string }>(req);
  const referralId = String(body.referralId ?? "").toUpperCase();
  const amount = Math.trunc(Number(body.amount));
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(referralId) || !(amount > 0 && amount <= 1_000_000)) return json({ error: "bad_request" }, 400);
  const { error } = await db()
    .from("referral_rewards")
    .insert({ referral_id: referralId, kind: "cashback", amount, note: String(body.note ?? "").trim().slice(0, 200) || null });
  if (error) return json({ error: "server" }, 500);
  return json({ ok: true });
}
