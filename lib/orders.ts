import "server-only";
import { db } from "./supabase-admin";
import { createAccessCode } from "./access";
import { paymentStatus } from "./fapshi";

export type Order = {
  id: string;
  course_id: string;
  buyer_name: string;
  buyer_phone: string;
  amount: number;
  referral_id: string | null;
  trans_id: string | null;
  status: "pending" | "paid" | "failed" | "expired";
  code: string | null;
  view_token: string;
  last_checked_at: string | null;
};

/** Marks the order paid (once) and creates its access code. Safe to call more than once. */
export async function fulfillOrder(order: Order): Promise<void> {
  const supabase = db();
  const { data: won, error } = await supabase.rpc("mark_order_paid", { p_order: order.id });
  if (error) throw error;
  if (!won) return; // Another request already fulfilled it.
  const code = await createAccessCode({
    courseId: order.course_id,
    buyerName: order.buyer_name,
    buyerPhone: order.buyer_phone,
    note: order.referral_id ? `Referral ${order.referral_id}` : null,
    source: "payment",
  });
  if (!code) throw new Error(`Paid order ${order.id} but could not create a code`);
  await supabase.from("orders").update({ code }).eq("id", order.id);
}

/**
 * Checks a pending order with Fapshi and fulfils it if paid.
 * Throttled to one Fapshi call per 10 seconds per order (Fapshi allows 6 per minute).
 */
export async function syncOrder(order: Order, { force = false } = {}): Promise<void> {
  if (order.status !== "pending" || !order.trans_id) return;
  if (!force && order.last_checked_at && Date.now() - new Date(order.last_checked_at).getTime() < 10_000) return;
  const supabase = db();
  await supabase.from("orders").update({ last_checked_at: new Date().toISOString() }).eq("id", order.id);

  const payment = await paymentStatus(order.trans_id);
  if (payment.status === "SUCCESSFUL") {
    if (typeof payment.amount === "number" && payment.amount < order.amount) {
      console.error("Fapshi amount lower than order", order.id, payment.amount, order.amount);
      return;
    }
    await fulfillOrder(order);
  } else if (payment.status === "FAILED" || payment.status === "EXPIRED") {
    await supabase.from("orders").update({ status: payment.status === "FAILED" ? "failed" : "expired" }).eq("id", order.id).eq("status", "pending");
  }
}
