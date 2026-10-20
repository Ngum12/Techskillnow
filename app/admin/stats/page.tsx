import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase-admin";
import { listCourses } from "@/content";
import { getDict, fmt, money } from "@/lib/i18n";
import { env } from "@/lib/env";
import { phoneForWhatsApp } from "@/lib/codes";
import { waLink } from "@/lib/whatsapp";
import { AdminHeader } from "../AdminHeader";
import { percent } from "@/lib/assessment";

export const dynamic = "force-dynamic";

type ProgressRow = {
  code: string;
  course_id: string;
  step: number;
  completed_at: string | null;
  updated_at: string;
  access_codes: { buyer_name: string; buyer_phone: string; status: string } | null;
};

const DAY = 24 * 60 * 60 * 1000;
const INACTIVE_DAYS = 3;

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : "–";
}

export default async function StatsPage() {
  const email = await requireAdmin();
  const t = getDict();
  const supabase = db();
  const [{ data: codes }, { data: progress }, { data: tests }, { data: certs }, { data: orders }, { data: fails }] = await Promise.all([
    supabase.from("access_codes").select("course_id").limit(10000),
    supabase
      .from("progress")
      .select("code, course_id, step, completed_at, updated_at, access_codes(buyer_name, buyer_phone, status)")
      .order("updated_at", { ascending: false })
      .limit(10000),
    supabase.from("assessments").select("course_id, kind, score, total").limit(20000),
    supabase.from("certificates").select("course_id").limit(10000),
    supabase.from("orders").select("course_id, amount, referral_id").eq("status", "paid").limit(10000),
    supabase.from("attempts").select("course_id, step, failed").eq("kind", "check").eq("passed", false).order("created_at", { ascending: false }).limit(5000),
  ]);
  const rows = (progress ?? []) as unknown as ProgressRow[];
  const now = Date.now();

  return (
    <div className="min-h-dvh">
      <AdminHeader active="stats" email={email} />
      <main className="mx-auto max-w-4xl px-5 py-6">
        <h1 className="text-xl font-bold">{t.admin.statsTitle}</h1>
        {listCourses().map((course) => {
          const learners = rows.filter((r) => r.course_id === course.id);
          const completed = learners.filter((r) => r.completed_at);
          const created = (codes ?? []).filter((c) => c.course_id === course.id).length;
          const paid = (orders ?? []).filter((o) => o.course_id === course.id);
          const courseTests = (tests ?? []).filter((x) => x.course_id === course.id);
          const stoppedAt = Array.from({ length: course.totalSteps }, (_, i) => learners.filter((r) => !r.completed_at && r.step === i + 1).length);

          // Most common mistakes: count each failed-rule message, keep the top 8.
          const counts = new Map<string, { step: number; message: string; n: number }>();
          for (const a of (fails ?? []).filter((f) => f.course_id === course.id)) {
            for (const message of a.failed ?? []) {
              const key = `${a.step}|${message}`;
              const entry = counts.get(key) ?? { step: a.step, message, n: 0 };
              entry.n++;
              counts.set(key, entry);
            }
          }
          const topFails = [...counts.values()].sort((a, b) => b.n - a.n).slice(0, 8);

          const tiles: [string, string | number][] = [
            [t.admin.codesSold, created],
            [t.admin.learners, learners.length],
            [t.admin.completions, completed.length],
            [t.admin.certificates, (certs ?? []).filter((c) => c.course_id === course.id).length],
            [t.admin.revenue, `${money(paid.reduce((sum, o) => sum + o.amount, 0))} FCFA`],
            [t.admin.referrals, paid.filter((o) => o.referral_id).length],
          ];

          return (
            <section key={course.id} className="card mt-5 p-4">
              <h2 className="text-lg font-bold">{course.title}</h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
                {tiles.map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-bg p-3">
                    <dt className="text-sm text-muted">{label}</dt>
                    <dd className="text-2xl font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-muted">
                {fmt(t.admin.avgScores, {
                  pre: average(courseTests.filter((x) => x.kind === "pre").map((x) => percent(x.score, x.total))),
                  post: average(courseTests.filter((x) => x.kind === "post").map((x) => percent(x.score, x.total))),
                })}
              </p>

              <h3 className="mt-5 font-semibold">{t.admin.stoppedAt}</h3>
              <table className="mt-2 w-full text-left">
                <thead>
                  <tr className="border-b border-line text-sm text-muted">
                    <th className="py-1 pr-3 font-semibold">{t.admin.stepCol}</th>
                    <th className="py-1 font-semibold">{t.admin.countCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {stoppedAt.map((count, i) => (
                    <tr key={i} className="border-b border-line last:border-b-0">
                      <td className="py-1 pr-3">{i + 1}</td>
                      <td className={`py-1 ${count ? "font-semibold" : "text-muted"}`}>{count}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-1 pr-3 font-semibold">{t.admin.completed}</td>
                    <td className="py-1 font-semibold">{completed.length}</td>
                  </tr>
                </tbody>
              </table>

              {topFails.length > 0 && (
                <>
                  <h3 className="mt-5 font-semibold">{t.admin.topFails}</h3>
                  <table className="mt-2 w-full text-left text-[0.95rem]">
                    <thead>
                      <tr className="border-b border-line text-sm text-muted">
                        <th className="py-1 pr-3 font-semibold">{t.admin.stepCol}</th>
                        <th className="py-1 pr-3 font-semibold" />
                        <th className="py-1 font-semibold">{t.admin.failsCol}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topFails.map((f) => (
                        <tr key={`${f.step}|${f.message}`} className="border-b border-line align-top last:border-b-0">
                          <td className="py-1 pr-3">{f.step}</td>
                          <td className="py-1 pr-3">{f.message}</td>
                          <td className="py-1 font-semibold">{f.n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <h3 className="mt-5 font-semibold">{t.admin.learnerList}</h3>
              <ul className="mt-2 divide-y divide-line">
                {learners.map((r) => {
                  const idleDays = Math.floor((now - new Date(r.updated_at).getTime()) / DAY);
                  const stalled = !r.completed_at && idleDays >= INACTIVE_DAYS && r.access_codes?.status !== "revoked";
                  const name = r.access_codes?.buyer_name ?? r.code;
                  return (
                    <li key={r.code} className="py-2">
                      <div className="flex flex-wrap justify-between gap-x-3">
                        <span>
                          <span className="font-semibold">{name}</span> <span className="text-sm text-muted">{r.access_codes?.buyer_phone}</span>
                        </span>
                        <span className={r.completed_at ? "font-semibold text-ok" : ""}>
                          {r.completed_at ? t.admin.completed : fmt(t.admin.stepReached, { n: r.step })}
                        </span>
                      </div>
                      {stalled && r.access_codes && (
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          <span className="text-sm text-warn">{fmt(t.admin.inactive, { n: idleDays })}</span>
                          <a
                            href={waLink(
                              phoneForWhatsApp(r.access_codes.buyer_phone),
                              fmt(t.admin.nudgeMessage, { name, step: r.step, course: course.title, url: `${env.appUrl}/learn/${course.id}` }),
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-primary underline"
                          >
                            {t.admin.nudge}
                          </a>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}
