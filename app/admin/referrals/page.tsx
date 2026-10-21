import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase-admin";
import { getCourse } from "@/content";
import { env } from "@/lib/env";
import { getDict, fmt, money } from "@/lib/i18n";
import { phoneForWhatsApp } from "@/lib/codes";
import { waLink } from "@/lib/whatsapp";
import { countFriends, rewardStatus } from "@/lib/referral-math";
import { AdminHeader } from "../AdminHeader";
import { CashbackForm } from "./CashbackForm";

export const dynamic = "force-dynamic";

/** Who brought friends, what they earned, and cashback paid by hand. */
export default async function ReferralsPage() {
  const email = await requireAdmin();
  const t = getDict();
  const s = t.admin.referralsPage;
  const supabase = db();

  const { data: orders } = await supabase.from("orders").select("referral_id, buyer_name, buyer_phone, amount, paid_at").eq("status", "paid").not("referral_id", "is", null);
  const ids = [...new Set((orders ?? []).map((o) => o.referral_id as string))];
  const [{ data: referrers }, { data: rewards }] = ids.length
    ? await Promise.all([
        supabase.from("access_codes").select("code, course_id, buyer_name, buyer_phone, referral_id").in("referral_id", ids),
        supabase.from("referral_rewards").select("referral_id, kind, course_id, code, amount, note, created_at").in("referral_id", ids).order("created_at"),
      ])
    : [{ data: [] }, { data: [] }];

  const rows = (referrers ?? [])
    .map((r) => {
      const theirOrders = (orders ?? []).filter((o) => o.referral_id === r.referral_id);
      const friends = countFriends(theirOrders, r.buyer_phone);
      const mine = (rewards ?? []).filter((x) => x.referral_id === r.referral_id);
      const courses = mine.filter((x) => x.kind === "course");
      const cashback = mine.filter((x) => x.kind === "cashback");
      return {
        ...r,
        friends,
        selfBuys: theirOrders.length - friends,
        status: rewardStatus(friends, courses.length, env.referralFriendsPerCourse),
        courses,
        cashback,
        cashbackTotal: cashback.reduce((sum, x) => sum + (x.amount ?? 0), 0),
        buyers: theirOrders.map((o) => o.buyer_name),
      };
    })
    .sort((a, b) => b.friends - a.friends);

  return (
    <div className="min-h-dvh">
      <AdminHeader active="referrals" email={email} />
      <main className="mx-auto max-w-4xl px-5 py-6">
        <h1 className="text-xl font-bold">{s.title}</h1>
        <p className="mt-1 text-muted">{fmt(s.rule, { per: env.referralFriendsPerCourse, discount: money(env.referralDiscount) })}</p>
        {rows.length === 0 && <p className="mt-6 text-muted">{s.none}</p>}

        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.code} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {r.buyer_name} · <span className="font-normal">{r.buyer_phone}</span>
                  </p>
                  <p className="text-sm text-muted">
                    {getCourse(r.course_id)?.title ?? r.course_id} · {r.code} · {s.link} {r.referral_id}
                  </p>
                </div>
                <p className="text-right">
                  <span className="text-2xl font-bold">{r.friends}</span> <span className="text-sm text-muted">{s.friends}</span>
                </p>
              </div>

              <p className="mt-2 text-[0.95rem]">{fmt(s.boughtBy, { names: r.buyers.join(", ") })}</p>
              {r.selfBuys > 0 && <p className="text-sm text-warn">{fmt(s.selfBuys, { n: r.selfBuys })}</p>}

              <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-bg p-2">
                  <dt className="text-muted">{s.earned}</dt>
                  <dd className="text-lg font-bold">{r.status.earned}</dd>
                </div>
                <div className="rounded-lg bg-bg p-2">
                  <dt className="text-muted">{s.claimed}</dt>
                  <dd className="text-lg font-bold">{r.courses.length}</dd>
                </div>
                <div className="rounded-lg bg-bg p-2">
                  <dt className="text-muted">{s.cashbackPaid}</dt>
                  <dd className="text-lg font-bold">{money(r.cashbackTotal)}</dd>
                </div>
              </dl>
              {r.courses.length > 0 && (
                <p className="mt-2 text-sm text-muted">
                  {s.freeCourses}: {r.courses.map((c) => `${getCourse(c.course_id ?? "")?.title ?? c.course_id} (${c.code ?? "—"})`).join(", ")}
                </p>
              )}
              {r.cashback.length > 0 && (
                <p className="mt-1 text-sm text-muted">
                  {s.payments}: {r.cashback.map((c) => `${money(c.amount ?? 0)} FCFA ${new Date(c.created_at).toLocaleDateString("en-GB")}${c.note ? ` (${c.note})` : ""}`).join(" · ")}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={waLink(phoneForWhatsApp(r.buyer_phone), fmt(s.thanks, { name: r.buyer_name.split(" ")[0], n: r.friends, per: env.referralFriendsPerCourse }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary min-h-11 py-2 text-sm"
                >
                  {s.whatsapp}
                </a>
              </div>
              <CashbackForm referralId={r.referral_id as string} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
