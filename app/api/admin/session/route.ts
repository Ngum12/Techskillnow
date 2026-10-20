import { authClient } from "@/lib/admin-auth";
import { env } from "@/lib/env";
import { json, readJson } from "@/lib/http";

/** Turns the tokens from a magic link into the admin's Supabase auth cookies. Anyone else is refused. */
export async function POST(req: Request) {
  const body = await readJson<{ access_token: string; refresh_token: string }>(req);
  const access_token = String(body.access_token ?? "");
  const refresh_token = String(body.refresh_token ?? "");
  if (!access_token || !refresh_token) return json({ error: "missing" }, 400);

  const supabase = await authClient();
  // setSession verifies the access token with Supabase before storing it.
  const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error || data.user?.email?.toLowerCase() !== env.adminEmail) {
    console.error("admin session refused:", error?.message ?? "email is not ADMIN_EMAIL");
    if (!error) await supabase.auth.signOut();
    return json({ error: "denied" }, 403);
  }
  return json({ ok: true });
}
