import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { env } from "./env";
import { db } from "./supabase-admin";
import { lastDigits } from "./codes";

const MAX_AGE = 60 * 60 * 24 * 365;

type Payload = { c: string; d: string; course: string };

export type Learner = {
  code: string;
  deviceId: string;
  courseId: string;
  buyerName: string;
  phoneLast4: string;
};

export function sessionCookieName(courseId: string) {
  return `tsn_${courseId}`;
}

function sign(data: string) {
  // Keyed with the service role key so no extra secret has to be configured.
  return createHmac("sha256", `tsn-session:${env.serviceRoleKey}`).update(data).digest("base64url");
}

export function createSessionValue(payload: Payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

function readSessionValue(value: string | undefined): Payload | null {
  if (!value) return null;
  const [data, sig] = value.split(".");
  if (!data || !sig) return null;
  const expected = Buffer.from(sign(data));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString()) as Payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

/**
 * Returns the learner for a course if their cookie is valid, the code is not revoked,
 * and their device is still bound to it. Checked against the database on every request.
 */
export const getLearner = cache(async (courseId: string): Promise<Learner | null> => {
  const store = await cookies();
  const payload = readSessionValue(store.get(sessionCookieName(courseId))?.value);
  if (!payload || payload.course !== courseId) return null;

  const supabase = db();
  const [{ data: code }, { data: device }] = await Promise.all([
    supabase.from("access_codes").select("code, course_id, buyer_name, buyer_phone, status").eq("code", payload.c).maybeSingle(),
    supabase.from("code_devices").select("device_id").eq("code", payload.c).eq("device_id", payload.d).maybeSingle(),
  ]);
  if (!code || !device || code.status === "revoked" || code.course_id !== courseId) return null;

  return {
    code: code.code,
    deviceId: payload.d,
    courseId,
    buyerName: code.buyer_name,
    phoneLast4: lastDigits(code.buyer_phone),
  };
});
