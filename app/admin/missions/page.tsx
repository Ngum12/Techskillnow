import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase-admin";
import { env } from "@/lib/env";
import { getDict, fmt } from "@/lib/i18n";
import { AdminHeader } from "../AdminHeader";
import { MissionReview } from "./MissionReview";

export const dynamic = "force-dynamic";

type MissionRow = {
  code: string;
  course_id: string;
  gmail: string;
  status: string;
  updated_at: string;
  access_codes: { buyer_name: string } | null;
};

/** Missions waiting for a check: approve or send feedback when automatic checking is not set up. */
export default async function MissionsPage() {
  const email = await requireAdmin();
  const t = getDict();
  const { data } = await db()
    .from("missions")
    .select("code, course_id, gmail, status, updated_at, access_codes(buyer_name)")
    .eq("status", "waiting")
    .order("updated_at", { ascending: true })
    .limit(200);
  const rows = (data ?? []) as unknown as MissionRow[];

  return (
    <div className="min-h-dvh">
      <AdminHeader active="missions" email={email} />
      <main className="mx-auto max-w-4xl px-5 py-6">
        <h1 className="text-xl font-bold">{t.admin.missionsTitle}</h1>
        {env.missionEmail ? (
          <p className="mt-2 text-muted">{fmt(t.admin.missionsHelp, { email: env.missionEmail })}</p>
        ) : (
          <p className="mt-2 rounded-lg bg-warn-soft p-3 text-warn">{t.admin.missionDisabled}</p>
        )}
        {rows.length === 0 && <p className="mt-6 text-muted">{t.admin.missionsNone}</p>}
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((m) => (
            <li key={`${m.code}-${m.course_id}`} className="card p-4">
              <p className="font-semibold">{m.access_codes?.buyer_name ?? m.code}</p>
              <p className="break-all text-muted">{fmt(t.admin.missionFrom, { gmail: m.gmail })}</p>
              <p className="text-sm text-muted">
                {m.code} · {new Date(m.updated_at).toLocaleString("en-GB")}
              </p>
              <MissionReview code={m.code} courseId={m.course_id} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
