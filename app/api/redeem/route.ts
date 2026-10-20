import { cookies } from "next/headers";
import { db } from "@/lib/supabase-admin";
import { normalizeCode } from "@/lib/codes";
import { createSessionValue, sessionCookieName, sessionCookieOptions } from "@/lib/session";
import { json, readJson } from "@/lib/http";
import { env } from "@/lib/env";
import { createHash } from "node:crypto";

const MAX_FAILURES = 10;
const WINDOW_MS = 10 * 60 * 1000;

function ipHash(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`tsn:${ip}`).digest("hex").slice(0, 32);
}

export async function POST(req: Request) {
  const body = await readJson<{ code: string; deviceId: string }>(req);
  const code = normalizeCode(String(body.code ?? ""));
  const deviceId = String(body.deviceId ?? "");
  if (!code) return json({ error: "format" }, 400);
  // The format check above needs no database, so it is not rate limited.
  if (!/^[A-Za-z0-9-]{16,64}$/.test(deviceId)) return json({ error: "server" }, 400);

  const supabase = db();
  // Slow down code guessing: at most 10 failed tries per IP every 10 minutes.
  const ip = ipHash(req);
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await supabase.from("redeem_attempts").select("id", { count: "exact", head: true }).eq("ip_hash", ip).gte("created_at", since);
  if ((count ?? 0) >= MAX_FAILURES) return json({ error: "too_many" }, 429);

  const { data: result, error } = await supabase.rpc("redeem_code", { p_code: code, p_device_id: deviceId });
  if (error) {
    console.error("redeem_code failed", error);
    return json({ error: "server" }, 500);
  }
  if (result !== "ok") {
    if (result === "not_found") await supabase.from("redeem_attempts").insert({ ip_hash: ip });
    let max = env.maxDevices;
    if (result === "device_limit") {
      const { data } = await supabase.from("access_codes").select("max_devices").eq("code", code).maybeSingle();
      max = data?.max_devices ?? max;
    }
    return json({ error: result, max }, result === "not_found" ? 404 : 403);
  }

  const { data: row } = await supabase.from("access_codes").select("course_id").eq("code", code).single();
  const courseId = row!.course_id as string;
  const store = await cookies();
  store.set(sessionCookieName(courseId), createSessionValue({ c: code, d: deviceId, course: courseId }), sessionCookieOptions);
  return json({ ok: true, courseId });
}
