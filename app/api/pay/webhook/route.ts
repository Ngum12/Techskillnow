import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/supabase-admin";
import { syncOrder, type Order } from "@/lib/orders";
import { env } from "@/lib/env";
import { readJson } from "@/lib/http";

/**
 * Fapshi calls this when a payment succeeds, fails or expires. The body is only a hint:
 * the order is re-checked directly with Fapshi before any code is created.
 */
export async function POST(req: Request) {
  const secret = env.fapshi?.webhookSecret;
  if (secret) {
    const given = Buffer.from(req.headers.get("x-wh-secret") ?? "");
    const expected = Buffer.from(secret);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return new Response("unauthorized", { status: 401 });
  }
  const { transId } = await readJson<{ transId: string }>(req);
  if (transId) {
    const { data } = await db().from("orders").select("*").eq("trans_id", String(transId)).maybeSingle();
    if (data) {
      try {
        await syncOrder(data as Order, { force: true });
      } catch (e) {
        console.error("webhook sync failed", transId, e);
      }
    }
  }
  return new Response("ok");
}
