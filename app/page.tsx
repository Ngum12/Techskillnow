import Link from "next/link";
import { getDict, fmt } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { listCourses, DEFAULT_COURSE_ID } from "@/content";
import { env } from "@/lib/env";
import { buyTarget } from "@/lib/buy";
import { waLink } from "@/lib/whatsapp";
import { Illustration } from "@/components/Illustration";
import { LanguageSwitch } from "@/components/LanguageSwitch";

export default async function Home() {
  const locale = await getLocale();
  const t = getDict(locale);
  const courses = listCourses(locale);
  const course = courses.find((c) => c.id === DEFAULT_COURSE_ID) ?? courses[0];
  const buy = buyTarget(t, course.id, course.title);
  const help = waLink(env.whatsappNumber, fmt(t.landing.buyMessage, { course: course.title }));

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

      <div className="card mt-6 p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{t.landing.courseLabel}</p>
        <p className="text-xl font-bold">{course.title}</p>
        <p className="text-muted">{fmt(t.landing.steps, { n: course.totalSteps })}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Link href={`/learn/${course.id}`} className="btn btn-primary w-full">
          {t.landing.tryFree}
        </Link>
        <a href={buy.href} className="btn btn-secondary w-full" {...(buy.online ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
          {buy.label}
        </a>
        <Link href="/redeem" className="btn btn-ghost w-full">
          {t.landing.haveCode}
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold">{t.landing.howTitle}</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          {(buy.online ? t.landing.how : t.landing.howWhatsApp).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </section>

      {buy.online && (
        <a href={help} target="_blank" rel="noopener noreferrer" className="mt-8 text-center text-primary underline underline-offset-4">
          {t.landing.help}
        </a>
      )}
    </main>
  );
}
