import Link from "next/link";
import { getDict, fmt, money } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { listCourses, type CourseSummary } from "@/content";
import { env } from "@/lib/env";
import { buyTarget } from "@/lib/buy";
import { waLink } from "@/lib/whatsapp";
import { Illustration } from "@/components/Illustration";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { CourseMotif, Icon } from "@/components/home/Art";

type Dict = ReturnType<typeof getDict>;

function CourseCard({ course, t }: { course: CourseSummary; t: Dict }) {
  const buy = buyTarget(t, course);
  const s = t.landing;
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(23,32,27,0.04)]">
      <div className="p-3 pb-0">{course.cover ? <Illustration name={course.cover} /> : <CourseMotif id={course.id} />}</div>
      <div className="flex flex-1 flex-col p-5 pt-4">
        {course.series && <p className="text-xs font-bold uppercase tracking-wider text-primary">{course.series}</p>}
        <h3 className="mt-1 text-xl font-bold leading-snug">{course.title}</h3>
        {course.audience && <p className="mt-1 text-sm text-muted">{course.audience}</p>}
        <p className="mt-3">{course.promise}</p>
        {course.outcomes && course.outcomes.length > 0 && (
          <div className="mt-4 rounded-xl bg-bg p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{s.leaveWith}</p>
            <ul className="mt-2 space-y-1.5">
              {course.outcomes.map((o) => (
                <li key={o} className="flex gap-2 text-[0.95rem]">
                  <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-ok" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-2xl font-bold">
              {money(course.price)} <span className="text-base font-semibold text-muted">FCFA</span>
            </p>
            <p className="text-sm text-muted">
              {fmt(s.lessons, { n: course.totalSteps })} · <span className="font-semibold text-ok">{course.freeSteps > 1 ? fmt(s.freeMany, { n: course.freeSteps }) : s.freeOne}</span>
            </p>
          </div>
          <div className="mt-4 grid gap-2 min-[420px]:grid-cols-2">
            <Link href={`/learn/${course.id}`} className="btn btn-primary w-full">
              {s.start}
            </Link>
            <a href={buy.href} className="btn btn-secondary w-full" {...(buy.online ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
              {buy.online ? s.buyNow : s.buyWhatsApp}
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}

function Track({ id, icon, title, intro, courses, t }: { id: string; icon: string; title: string; intro: string; courses: CourseSummary[]; t: Dict }) {
  if (!courses.length) return null;
  return (
    <section id={id} className="scroll-mt-20 py-12">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
          <Icon name={icon} />
        </span>
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      <p className="mt-3 max-w-2xl text-lg text-muted">{intro}</p>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} t={t} />
        ))}
      </ul>
    </section>
  );
}

export default async function Home() {
  const locale = await getLocale();
  const t = getDict(locale);
  const s = t.landing;
  const courses = listCourses(locale);
  const online = !!env.fapshi;
  const help = waLink(env.whatsappNumber, t.redeem.supportMessage);
  const career = courses.filter((c) => c.track !== "exam");
  const exam = courses.filter((c) => c.track === "exam");
  const from = (list: CourseSummary[]) => (list.length ? Math.min(...list.map((c) => c.price)) : 0);
  const steps = online ? s.how : s.howWhatsApp;
  const wrap = "mx-auto w-full max-w-5xl px-5";

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className={`${wrap} flex h-16 items-center justify-between gap-2`}>
          <Link href="/" className="flex min-w-0 items-center gap-2 font-bold text-primary">
            <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm text-white min-[380px]:flex" aria-hidden="true">
              T
            </span>
            <span className="truncate text-base min-[400px]:text-lg">{t.appName}</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex" aria-label={s.nav.courses}>
            <a href="#paths" className="hover:text-primary">
              {s.nav.courses}
            </a>
            <a href="#how" className="hover:text-primary">
              {s.nav.how}
            </a>
            <a href="#faq" className="hover:text-primary">
              {s.nav.faq}
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitch compact />
            <Link href="/redeem" className="btn btn-secondary min-h-11 px-3 py-1.5 text-sm">
              <span className="min-[400px]:hidden">{s.codeShort}</span>
              <span className="hidden min-[400px]:inline">{s.haveCode}</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className={`${wrap} grid items-center gap-8 pb-12 pt-8 md:grid-cols-2 md:pt-14`}>
          <div>
            <p className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">{s.eyebrow}</p>
            <h1 className="mt-4 text-[2.1rem] font-bold leading-[1.1] tracking-tight sm:text-5xl">{s.heroTitle}</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">{s.heroText}</p>
            <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
              <a href="#paths" className="btn btn-primary px-6">
                {s.ctaFind}
                <Icon name="arrow" className="ml-1 h-5 w-5" />
              </a>
              <Link href={`/learn/${courses[0]?.id ?? ""}`} className="btn btn-secondary px-6">
                {s.ctaFree}
              </Link>
            </div>
            <ul className="mt-6 grid grid-cols-1 gap-2 text-sm min-[420px]:grid-cols-2">
              {s.trust.map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <Icon name="check" className="h-5 w-5 shrink-0 text-ok" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-primary-soft" aria-hidden="true" />
            <Illustration name="hero" priority />
          </div>
        </section>

        {/* Choose a path */}
        <section id="paths" className="scroll-mt-16 border-y border-line bg-surface py-12">
          <div className={wrap}>
            <h2 className="text-2xl font-bold sm:text-3xl">{s.pathsTitle}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {(
                [
                  ["career", "briefcase", s.paths.career, career],
                  ["exam", "cap", s.paths.exam, exam],
                ] as const
              ).map(([id, icon, p, list]) => (
                <a key={id} href={`#${id}`} className="group flex flex-col rounded-2xl border-2 border-line bg-bg p-6 transition-colors hover:border-primary">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                    <Icon name={icon} className="h-7 w-7" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-muted">{p.who}</p>
                  <h3 className="mt-1 text-2xl font-bold">{p.title}</h3>
                  <p className="mt-2 flex-1">{p.text}</p>
                  <p className="mt-4 text-sm font-semibold text-muted">{fmt(list.length === 1 ? s.pathMetaOne : s.pathMeta, { n: list.length, price: money(from(list)) })}</p>
                  <span className="mt-3 inline-flex items-center gap-1 font-semibold text-primary">
                    {p.cta}
                    <Icon name="arrow" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className={wrap}>
          <Track id="career" icon="briefcase" title={s.paths.career.title} intro={s.careerIntro} courses={career} t={t} />
          <Track id="exam" icon="cap" title={s.paths.exam.title} intro={s.examIntro} courses={exam} t={t} />
        </div>

        {/* How you learn */}
        <section className="border-y border-line bg-surface py-12">
          <div className={wrap}>
            <h2 className="text-2xl font-bold sm:text-3xl">{s.whyTitle}</h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {s.features.map((f) => (
                <li key={f.title} className="rounded-2xl border border-line bg-bg p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={f.icon} />
                  </span>
                  <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
                  <p className="mt-1 text-muted">{f.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className={`${wrap} scroll-mt-16 py-12`}>
          <h2 className="text-2xl font-bold sm:text-3xl">{s.howTitle}</h2>
          <ol className="mt-6 grid gap-5 sm:grid-cols-3">
            {steps.map((line, i) => (
              <li key={line} className="rounded-2xl border border-line bg-surface p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">{i + 1}</span>
                <p className="mt-3 text-lg">{line}</p>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-primary-soft p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">{s.howNote}</p>
            <p className="text-muted">🎁 {s.referral}</p>
          </div>
        </section>

        {/* Questions */}
        <section id="faq" className="scroll-mt-16 border-t border-line bg-surface py-12">
          <div className={`${wrap} max-w-3xl`}>
            <h2 className="text-2xl font-bold sm:text-3xl">{s.faqTitle}</h2>
            <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-bg">
              {s.faq.map((f) => (
                <details key={f.q} className="group px-5 py-4">
                  <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                    {f.q}
                    <span className="text-xl text-primary transition-transform group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-muted">{f.a}</p>
                </details>
              ))}
            </div>
            <a href={help} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block font-semibold text-primary underline underline-offset-4">
              {s.help}
            </a>
          </div>
        </section>

        {/* Final call to action */}
        <section className={`${wrap} py-12`}>
          <div className="rounded-3xl bg-primary px-6 py-10 text-center text-white sm:px-10">
            <h2 className="text-2xl font-bold sm:text-3xl">{s.finalTitle}</h2>
            <div className="mt-6 flex flex-col justify-center gap-3 min-[420px]:flex-row">
              <a href="#paths" className="btn bg-white px-6 text-primary hover:bg-primary-soft">
                {s.ctaFind}
              </a>
              <Link href="/redeem" className="btn border-2 border-white/70 px-6 text-white hover:bg-white/10">
                {s.haveCode}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className={`${wrap} flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <p className="font-bold text-ink">{t.appName}</p>
            <p>{s.footer}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href={help} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              WhatsApp
            </a>
            <Link href="/redeem" className="hover:text-primary">
              {s.haveCode}
            </Link>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
