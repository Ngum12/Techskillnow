import { getAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase-admin";
import { normalizeCode } from "@/lib/codes";
import { json, readJson } from "@/lib/http";

export async function POST(req: Request, ctx: RouteContext<"/api/admin/codes/[code]">) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const code = normalizeCode((await ctx.params).code);
  if (!code) return json({ error: "not_found" }, 404);
  const { action } = await readJson<{ action: string }>(req);

  const supabase = db();
  if (action === "revoke") {
    const { error } = await supabase.from("access_codes").update({ status: "revoked" }).eq("code", code);
    if (error) return json({ error: "server" }, 500);
  } else if (action === "reset") {
    const { error } = await supabase.from("code_devices").delete().eq("code", code);
    if (error) return json({ error: "server" }, 500);
    // Count resets: many resets on one code usually means it is being shared.
    const { data } = await supabase.from("access_codes").select("device_resets").eq("code", code).single();
    await supabase.from("access_codes").update({ device_resets: (data?.device_resets ?? 0) + 1 }).eq("code", code);
  } else {
    return json({ error: "unknown action" }, 400);
  }
  return json({ ok: true });
}
