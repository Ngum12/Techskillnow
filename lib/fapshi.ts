import "server-only";
import { env } from "./env";

export type FapshiStatus = "CREATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "EXPIRED";

async function call<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const config = env.fapshi;
  if (!config) throw new Error("Fapshi is not configured");
  const res = await fetch(`${config.baseUrl}${path}`, {
    method: init?.method ?? "GET",
    headers: { apiuser: config.user, apikey: config.key, "Content-Type": "application/json" },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Fapshi ${path} failed (${res.status}): ${data?.message ?? "unknown error"}`);
  return data as T;
}

/** Creates a hosted checkout link (valid 24 hours). */
export function initiatePay(input: { amount: number; externalId: string; redirectUrl: string; message: string }) {
  return call<{ link: string; transId: string }>("/initiate-pay", { method: "POST", body: input });
}

/** Asks Fapshi directly for the status of a payment. Never trust a webhook body on its own. */
export function paymentStatus(transId: string) {
  return call<{ status: FapshiStatus; amount?: number; transId?: string; externalId?: string }>(
    `/payment-status/${encodeURIComponent(transId)}`,
  );
}
