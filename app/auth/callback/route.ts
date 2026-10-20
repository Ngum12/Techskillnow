import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { authClient } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await authClient();

  // token_hash links work in any browser; code links (PKCE) only in the browser that requested them.
  const { error } = tokenHash && type
    ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    : code
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: new Error(url.searchParams.get("error_description") ?? "missing code") };
  if (error) console.error("auth callback failed:", error.message);
  return NextResponse.redirect(new URL(error ? "/admin/login?error=link" : "/admin", req.url));
}
