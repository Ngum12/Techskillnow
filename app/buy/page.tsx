import Link from "next/link";
import { redirect } from "next/navigation";
import { getCourse, DEFAULT_COURSE_ID } from "@/content";
import { getLocale } from "@/lib/locale";
import { env } from "@/lib/env";
import { validReferral } from "@/lib/access";
import { getDict, fmt, money } from "@/lib/i18n";
import { waLink } from "@/lib/whatsapp";
import { priceFor } from "@/lib/buy";
import { BuyForm } from "./BuyForm";

export const dynamic = "force-dynamic";

export default async function BuyPage({ searchParams }: PageProps<"/buy">) {
  const { course: courseParam, ref } = await searchParams;
  const locale = await getLocale();
  const t = getDict(locale);
  const course = getCourse(typeof courseParam === "string" ? courseParam : DEFAULT_COURSE_ID, locale) ?? getCourse(DEFAULT_COURSE_ID, locale)!;
  const whatsapp = waLink(env.whatsappNumber, fmt(t.landing.buyMessage, { course: course.title }));
  // Without Fapshi set up, buying happens on WhatsApp.
  if (!env.fapshi) redirect(whatsapp);

  const referral = await validReferral(typeof ref === "string" ? ref : null);
  const price = priceFor(course, !!referral);

  return (
    <main className="mx-auto max-w-xl px-5 pb-10 pt-6">
      <Link href="/" className="font-bold text-primary">
        {t.appName}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t.buy.title}</h1>
      <div className="card mt-4 p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{t.landing.courseLabel}</p>
        <p className="text-xl font-bold">{course.title}</p>
        <p className="mt-2 text-3xl font-bold text-primary">{fmt(t.buy.price, { price: money(price) })}</p>
        {referral && <p className="mt-1 font-semibold text-ok">{fmt(t.buy.discount, { n: money(env.referralDiscount) })}</p>}
        <p className="mt-1 text-muted">{t.buy.once}</p>
      </div>
      <BuyForm courseId={course.id} referral={referral} payLabel={fmt(t.buy.pay, { price: money(price) })} />
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-2 w-full">
        {t.landing.help}
      </a>
    </main>
  );
}
