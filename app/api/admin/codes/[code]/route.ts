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
  } else if (action === "delete") {
    // Removes a code and everything attached to it (for test codes). Progress, devices, test scores,
    // certificate, mission and attempts are removed by the database (on delete cascade).
    const { data: row } = await supabase.from("access_codes").select("profile_id").eq("code", code).maybeSingle();
    if (!row) return json({ error: "not_found" }, 404);
    const { error: ordersError } = await supabase.from("orders").delete().eq("code", code);
    if (ordersError) return json({ error: "server" }, 500);
    const { error } = await supabase.from("access_codes").delete().eq("code", code);
    if (error) return json({ error: "server" }, 500);
    // The learner's CV goes too, unless another code still shares the same profile.
    if (row.profile_id) {
      const { count } = await supabase.from("access_codes").select("code", { count: "exact", head: true }).eq("profile_id", row.profile_id);
      if (!count) await supabase.from("learner_profiles").delete().eq("id", row.profile_id);
    }
  } else {
    return json({ error: "unknown action" }, 400);
  }
  return json({ ok: true });
}
