import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase-admin";
import { listCourses } from "@/content";
import { getDict, fmt } from "@/lib/i18n";
import { env } from "@/lib/env";
import { AdminHeader } from "./AdminHeader";
import { CreateCodeForm } from "./CreateCodeForm";
import { CodeActions } from "./CodeActions";

export const dynamic = "force-dynamic";

type CodeRow = {
  code: string;
  course_id: string;
  buyer_name: string;
  buyer_phone: string;
  note: string | null;
  status: "unused" | "active" | "revoked";
  max_devices: number;
  created_at: string;
  source: "admin" | "payment";
  device_resets: number;
  code_devices: { count: number }[];
  progress: { step: number; completed_at: string | null }[];
};

const statusStyle = {
  unused: "bg-[#eef2f6] text-ink",
  active: "bg-ok-soft text-ok",
  revoked: "bg-err-soft text-err",
};

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const email = await requireAdmin();
  const t = getDict();
  const courses = listCourses();
  const courseTitle = Object.fromEntries(courses.map((c) => [c.id, c.title]));
  const { q } = await searchParams;
  // Strip characters that have meaning in PostgREST filter syntax.
  const search = (typeof q === "string" ? q : "").replace(/[,()*%\\"':]/g, " ").trim().slice(0, 60);

  let query = db()
    .from("access_codes")
    .select("code, course_id, buyer_name, buyer_phone, note, status, max_devices, created_at, source, device_resets, code_devices(count), progress(step, completed_at)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (search) query = query.or(`buyer_name.ilike.*${search}*,buyer_phone.ilike.*${search}*,code.ilike.*${search}*`);
  const { data, error } = await query;
  const rows = (data ?? []) as unknown as CodeRow[];

  return (
    <div className="min-h-dvh">
      <AdminHeader active="codes" email={email} />
      <main className="mx-auto max-w-4xl px-5 py-6">
        <CreateCodeForm courses={courses.map((c) => ({ id: c.id, title: c.title }))} appUrl={env.appUrl} />

        <section className="mt-10">
          <h2 className="text-xl font-bold">{t.admin.listTitle}</h2>
          <form className="mt-3 flex gap-2" role="search">
            <input name="q" defaultValue={search} placeholder={t.admin.search} aria-label={t.admin.search} className="input flex-1" />
            <button type="submit" className="btn btn-secondary">
              {t.admin.searchButton}
            </button>
          </form>

          {error && <p className="mt-4 text-err">{t.common.errorGeneric}</p>}
          {!error && rows.length === 0 && <p className="mt-4 text-muted">{t.admin.noCodes}</p>}

          <ul className="mt-4 flex flex-col gap-3">
            {rows.map((r) => {
              const used = r.code_devices[0]?.count ?? 0;
              const prog = r.progress[0];
              return (
                <li key={r.code} className="card p-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono text-lg font-bold tracking-wider">{r.code}</span>
                    <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${statusStyle[r.status]}`}>{t.admin.status[r.status]}</span>
                    <span className="text-sm text-muted">{fmt(t.admin.devices, { used, max: r.max_devices })}</span>
                    {r.source === "payment" && <span className="rounded-full bg-primary-soft px-3 py-0.5 text-sm text-primary">{t.admin.paidOnline}</span>}
                  </div>
                  {r.device_resets >= 2 && (
                    <p className="mt-2 rounded-lg bg-warn-soft px-3 py-1 text-sm font-semibold text-warn">{fmt(t.admin.sharing, { n: r.device_resets })}</p>
                  )}
                  <p className="mt-2 font-semibold">
                    {r.buyer_name} · <span className="font-normal">{r.buyer_phone}</span>
                  </p>
                  <p className="text-sm text-muted">
                    {courseTitle[r.course_id] ?? r.course_id} · {new Date(r.created_at).toLocaleDateString("en-GB")}
                    {prog && (prog.completed_at ? ` · ${t.admin.completed}` : ` · ${fmt(t.admin.stepReached, { n: prog.step })}`)}
                  </p>
                  {r.note && <p className="mt-1 text-sm">{r.note}</p>}
                  <CodeActions code={r.code} hasDevices={used > 0} revoked={r.status === "revoked"} />
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
