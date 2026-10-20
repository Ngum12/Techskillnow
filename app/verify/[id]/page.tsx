import Link from "next/link";
import type { Metadata } from "next";
import { getCourse } from "@/content";
import { getLocale } from "@/lib/locale";
import { db } from "@/lib/supabase-admin";
import { getDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false } };

/** Public page an employer reaches by scanning the certificate's QR code. */
export default async function VerifyPage({ params }: PageProps<"/verify/[id]">) {
  const { id } = await params;
  const locale = await getLocale();
  const t = getDict(locale);
  const certId = decodeURIComponent(id).toUpperCase();
  const { data: cert } = /^TSN-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(certId)
    ? await db().from("certificates").select("id, course_id, name, pre_score, post_score, total, mission, issued_at").eq("id", certId).maybeSingle()
    : { data: null };

  const course = cert ? getCourse(cert.course_id, locale) : null;
  const date = cert
    ? new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(cert.issued_at))
    : "";

  return (
    <main className="mx-auto max-w-xl px-5 pb-10 pt-6">
      <Link href="/" className="font-bold text-primary">
        {t.appName}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t.verify.title}</h1>
      {cert ? (
        <section className="card mt-5 border-2 border-ok p-5">
          <p className="flex items-center gap-2 text-lg font-bold text-ok">
            <span aria-hidden="true">✓</span> {t.verify.valid}
          </p>
          <dl className="mt-4 space-y-3">
            {[
              [t.verify.holder, cert.name],
              [t.verify.course, course?.title ?? cert.course_id],
              [t.verify.issued, date],
              [t.verify.score, `${cert.post_score}/${cert.total}`],
              ...(cert.pre_score !== null ? [[t.verify.improvement, `${cert.pre_score}%`]] : []),
              [t.verify.id, cert.id],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="text-lg font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          {cert.mission && <p className="mt-4 rounded-lg bg-ok-soft p-3">✓ {t.verify.mission}</p>}
        </section>
      ) : (
        <p className="mt-5 rounded-xl bg-err-soft p-4 text-err">{t.verify.invalid}</p>
      )}
    </main>
  );
}
