import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Client used only to send the magic link. The implicit flow puts the session in the link's
 * redirect (URL fragment), so the link works in any browser and with Supabase's default email template.
 */
export function magicLinkClient() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function authClient() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. Safe to ignore.
        }
      },
    },
  });
}

/** Returns the admin email if the current user is signed in as ADMIN_EMAIL, else null. */
export async function getAdmin(): Promise<string | null> {
  const supabase = await authClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  return email && email === env.adminEmail ? email : null;
}

export async function requireAdmin(): Promise<string> {
  const email = await getAdmin();
  if (!email) redirect("/admin/login");
  return email;
}
