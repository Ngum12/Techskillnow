import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/supabase-admin";
import { syncOrder, type Order } from "@/lib/orders";
import { env } from "@/lib/env";
import { json } from "@/lib/http";

const ORDER_COOKIE = "tsn_order";

function sameToken(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

async function loadOrder(id: string) {
  const { data } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  return data as Order | null;
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("order") ?? "";
  const [cookieId, token] = ((await cookies()).get(ORDER_COOKIE)?.value ?? "").split(".");
  if (!/^[0-9a-f-]{36}$/.test(id) || cookieId !== id || !token) return json({ error: "not_found" }, 404);

  let order = await loadOrder(id);
  if (!order || !sameToken(order.view_token, token)) return json({ error: "not_found" }, 404);

  if (order.status === "pending") {
    try {
      await syncOrder(order);
      order = (await loadOrder(id)) ?? order;
    } catch (e) {
      console.error("sync order failed", id, e);
    }
  }
  return json({
    status: order.status,
    code: order.status === "paid" ? order.code : null,
    courseId: order.course_id,
    maxDevices: env.maxDevices,
  });
}
