import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCourse } from "@/content";
import { getLearner } from "@/lib/session";
import { getLocale } from "@/lib/locale";
import { getJourney, issueCertificate } from "@/lib/journey";
import { env } from "@/lib/env";
import { getDict, fmt } from "@/lib/i18n";
import { qrMatrix, qrPath } from "@/lib/qr";
import { db } from "@/lib/supabase-admin";
import { percent } from "@/lib/assessment";
import { Watermark } from "@/components/Watermark";
import { ShareCertificate } from "@/components/ShareCertificate";
import { ReferralCard } from "@/components/ReferralCard";

export const dynamic = "force-dynamic";

export default async function CertificatePage({ params }: PageProps<"/learn/[courseId]/certificate">) {
  const { courseId } = await params;
  const locale = await getLocale();
  const course = getCourse(courseId, locale);
  if (!course) notFound();
  const learner = await getLearner(course.id);
  if (!learner) redirect("/redeem");
  const t = getDict(locale);

  const journey = await getJourney(learner, course);
  const id = journey.eligible ? await issueCertificate(learner, course, journey) : null;
  if (!id) {
    return (
      <main className="mx-auto max-w-xl px-5 py-10">
        <p>{t.certificate.notDone}</p>
        <Link href={`/learn/${course.id}/finish`} className="btn btn-primary mt-6 w-full">
          {t.certificate.continue}
        </Link>
        <Watermark name={learner.buyerName} phoneLast4={learner.phoneLast4} />
      </main>
    );
  }

  const { data: cert } = await db().from("certificates").select("name, pre_score, post_score, total, mission, issued_at").eq("id", id).single();
  if (!cert) notFound();
  const date = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(cert.issued_at));
  const verifyUrl = `${env.appUrl}/verify/${id}`;
  const matrix = qrMatrix(verifyUrl);
  const scoreLine =
    cert.pre_score !== null
      ? fmt(t.certificate.scores, { pre: cert.pre_score, post: percent(cert.post_score, cert.total) })
      : fmt(t.certificate.finalScore, { post: cert.post_score, total: cert.total });


  return (
    <main className="mx-auto max-w-xl px-5 pb-10 pt-6">
      <Link href="/" className="font-bold text-primary">
        {t.appName}
      </Link>
      <p className="mt-4 text-lg font-semibold">{t.certificate.congrats}</p>

      <section className="card mt-4 border-2 border-primary px-5 py-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/illustrations/certificate-badge.webp" alt="" width={120} height={120} className="mx-auto h-24 w-24" />
        <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted">{t.certificate.title}</p>
        <p className="mt-4">{t.certificate.awarded}</p>
        <p className="mt-1 text-2xl font-bold">{cert.name}</p>
        <p className="mt-3">{t.certificate.completed}</p>
        <p className="mt-1 text-xl font-bold text-primary">{course.title}</p>
        <p className="mt-4 font-semibold">{scoreLine}</p>
        {cert.mission && <p className="mt-1 text-sm">✓ {t.certificate.missionDone}</p>}
        <p className="mt-4 text-muted">{fmt(t.certificate.on, { date })}</p>
        <div className="mt-5 flex items-center justify-center gap-4">
          <svg viewBox={`-2 -2 ${matrix.length + 4} ${matrix.length + 4}`} className="h-24 w-24 bg-white" role="img" aria-label={t.certificate.verify}>
            <path d={qrPath(matrix)} fill="#17201b" />
          </svg>
          <div className="text-left text-sm">
            <p className="font-semibold">{t.certificate.verify}</p>
            <p className="font-mono">{id}</p>
          </div>
        </div>
      </section>

      <ShareCertificate
        name={cert.name}
        course={course.title}
        date={fmt(t.certificate.on, { date })}
        scoreLine={scoreLine}
        missionLine={cert.mission ? t.certificate.missionDone : ""}
        id={id}
        qr={matrix}
      />

      <ReferralCard courseId={course.id} />
      <Watermark name={learner.buyerName} phoneLast4={learner.phoneLast4} />
    </main>
  );
}
