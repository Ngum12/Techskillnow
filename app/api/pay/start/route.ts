import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getCourse } from "@/content";
import { db } from "@/lib/supabase-admin";
import { env } from "@/lib/env";
import { initiatePay } from "@/lib/fapshi";
import { validReferral } from "@/lib/access";
import { json, readJson } from "@/lib/http";

const ORDER_COOKIE = "tsn_order";

export async function POST(req: Request) {
  if (!env.fapshi) return json({ error: "unavailable" }, 503);
  const body = await readJson<{ courseId: string; name: string; phone: string; ref: string }>(req);
  const course = getCourse(String(body.courseId ?? ""));
  const name = String(body.name ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  const phone = String(body.phone ?? "").trim().slice(0, 30);
  if (!course || name.length < 3 || phone.replace(/\D/g, "").length < 9) return json({ error: "missing" }, 400);

  const referralId = await validReferral(body.ref);
  const amount = Math.max(100, env.coursePrice - (referralId ? env.referralDiscount : 0));
  const viewToken = randomBytes(24).toString("hex");

  const supabase = db();
  const { data: order, error } = await supabase
    .from("orders")
    .insert({ course_id: course.id, buyer_name: name, buyer_phone: phone, amount, referral_id: referralId, view_token: viewToken })
    .select("id")
    .single();
  if (error || !order) {
    console.error("create order failed", error);
    return json({ error: "server" }, 500);
  }

  try {
    const origin = new URL(req.url).origin;
    const { link, transId } = await initiatePay({
      amount,
      externalId: order.id,
      redirectUrl: `${origin}/buy/done?order=${order.id}`,
      message: `TechSkillNow – ${course.title}`,
    });
    await supabase.from("orders").update({ trans_id: transId }).eq("id", order.id);
    // Only this browser can see the code that the order produces.
    (await cookies()).set(ORDER_COOKIE, `${order.id}.${viewToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 48,
    });
    return json({ link });
  } catch (e) {
    console.error("Fapshi initiate-pay failed", e);
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return json({ error: "server" }, 502);
  }
}
