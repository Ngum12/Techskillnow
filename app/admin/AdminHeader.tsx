import Link from "next/link";
import { getDict } from "@/lib/i18n";

export function AdminHeader({ active, email }: { active: "codes" | "stats" | "missions" | "referrals"; email: string }) {
  const t = getDict();
  const tab = (key: "codes" | "stats" | "missions" | "referrals", href: string, label: string) => (
    <Link
      href={href}
      aria-current={active === key ? "page" : undefined}
      className={`flex min-h-11 items-center border-b-4 px-3 font-semibold ${active === key ? "border-primary text-primary" : "border-transparent text-muted"}`}
    >
      {label}
    </Link>
  );
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 pt-3">
        <p className="font-bold text-primary">
          {t.appName} · {t.admin.title}
        </p>
        <form action="/api/admin/logout" method="post">
          <button type="submit" className="min-h-11 text-sm text-muted underline" title={email}>
            {t.admin.signOut}
          </button>
        </form>
      </div>
      <nav className="mx-auto flex max-w-4xl gap-2 px-5">
        {tab("codes", "/admin", t.admin.codesTab)}
        {tab("stats", "/admin/stats", t.admin.statsTab)}
        {tab("missions", "/admin/missions", t.admin.missionsTab)}
        {tab("referrals", "/admin/referrals", t.admin.referralsTab)}
      </nav>
    </header>
  );
}
