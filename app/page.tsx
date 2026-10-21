import Link from "next/link";
import { getDict, fmt, money } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { listCourses } from "@/content";
import { env } from "@/lib/env";
import { buyTarget } from "@/lib/buy";
import { waLink } from "@/lib/whatsapp";
import { Illustration } from "@/components/Illustration";
import { LanguageSwitch } from "@/components/LanguageSwitch";

export default async function Home() {
  const locale = await getLocale();
  const t = getDict(locale);
  const courses = listCourses(locale);
  const online = !!env.fapshi;
  const help = waLink(env.whatsappNumber, t.redeem.supportMessage);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pb-10 pt-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-bold text-primary">{t.appName}</p>
        <LanguageSwitch />
      </div>
      <h1 className="mt-5 text-[1.75rem] font-bold leading-tight">{t.landing.promise}</h1>

      <div className="mt-6">
        <Illustration name="hero" priority />
      </div>

      <h2 className="mt-8 text-lg font-bold">{t.landing.coursesTitle}</h2>
      <ul className="mt-3 flex flex-col gap-4">
        {courses.map((course) => {
          const buy = buyTarget(t, course);
          return (
            <li key={course.id} className="card p-4">
              {course.series && <p className="text-sm font-semibold uppercase tracking-wide text-primary">{course.series}</p>}
              <h3 className="mt-1 text-xl font-bold">{course.title}</h3>
              <p className="mt-1">{course.promise}</p>
              <p className="mt-2 text-muted">
                {fmt(t.landing.steps, { n: course.totalSteps })} · <span className="font-semibold text-ink">{money(course.price)} FCFA</span>
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link href={`/learn/${course.id}`} className="btn btn-primary w-full">
                  {t.landing.tryFree}
                </Link>
                <a href={buy.href} className="btn btn-secondary w-full" {...(buy.online ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
                  {buy.label}
                </a>
              </div>
            </li>
          );
        })}
      </ul>

      <Link href="/redeem" className="btn btn-ghost mt-4 w-full">
        {t.landing.haveCode}
      </Link>

      <section className="mt-8">
        <h2 className="text-lg font-bold">{t.landing.howTitle}</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          {(online ? t.landing.how : t.landing.howWhatsApp).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </section>

      <a href={help} target="_blank" rel="noopener noreferrer" className="mt-8 text-center text-primary underline underline-offset-4">
        {t.landing.help}
      </a>
    </main>
  );
}
