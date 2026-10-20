import { magicLinkClient } from "@/lib/admin-auth";
import { env } from "@/lib/env";
import { json, readJson } from "@/lib/http";

export async function POST(req: Request) {
  const { email } = await readJson<{ email: string }>(req);
  const normalized = String(email ?? "").trim().toLowerCase();
  // Only the configured admin gets a link. Same response either way, so the admin email isn't revealed.
  if (normalized && normalized === env.adminEmail) {
    const { error } = await magicLinkClient().auth.signInWithOtp({
      email: normalized,
      options: { emailRedirectTo: `${new URL(req.url).origin}/auth/confirm` },
    });
    if (error) {
      console.error("signInWithOtp failed", error);
      if (error.status === 429) return json({ error: "rate_limit" }, 429);
      return json({ error: "server" }, 500);
    }
  }
  return json({ ok: true });
}
