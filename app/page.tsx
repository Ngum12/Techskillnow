import Link from "next/link";
import { Newsreader } from "next/font/google";
import { getDict, fmt, money } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { listCourses, type CourseSummary } from "@/content";
import { env } from "@/lib/env";
import { buyTarget } from "@/lib/buy";
import { waLink } from "@/lib/whatsapp";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { CourseMotif, Icon } from "@/components/home/Art";
import { CertificateScene, HeroScene, PracticeScene } from "@/components/home/Scenes";

// The headline serif is only loaded on this page; lessons keep the light system font.
const display = Newsreader({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });

type Dict = ReturnType<typeof getDict>;

const wrap = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const eyebrow = "text-[0.7rem] font-bold uppercase tracking-[0.16em]";

/** A short rule and an uppercase label above a section title. */
function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`${eyebrow} flex items-center gap-2.5 ${light ? "text-[#9fd3b4]" : "text-primary"}`}>
      <span className={`h-px w-6 ${light ? "bg-[#9fd3b4]" : "bg-primary"}`} aria-hidden="true" />
      {children}
    </p>
  );
}

function Logo({ name, light = false }: { name: string; light?: boolean }) {
  return (
    <span className={`flex min-w-0 items-center gap-2.5 font-semibold ${light ? "text-white" : "text-ink"}`}>
      {/* Steps: learning one step at a time. */}
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={light ? "#fff" : "#1d5440"} />
        <path d="M8 23h5v-5h5v-5h6" fill="none" stroke={light ? "#1d5440" : "#fff"} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="9" r="2.2" fill={light ? "#1d5440" : "#e9b949"} />
      </svg>
      <span className="truncate text-[1.05rem] tracking-tight">{name}</span>
    </span>
  );
}

function CourseCard({ course, t }: { course: CourseSummary; t: Dict }) {
  const buy = buyTarget(t, course);
  const s = t.landing;
  return (
    <li className="group flex flex-col overflow-hidden rounded-[14px] border border-[#e4ded2] bg-white transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(23,32,27,0.35)]">
      <div className="aspect-[16/9] overflow-hidden border-b border-[#ece7dc]">
        <CourseMotif id={course.id} />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className={`${eyebrow} text-primary`}>{course.series ?? s.startHere}</p>
        <h3 className="mt-2 text-[1.2rem] font-semibold leading-snug tracking-tight">{course.title}</h3>
        {course.audience && <p className="mt-1 text-[0.85rem] text-muted">{course.audience}</p>}
        <p className="mt-3 text-[0.92rem] leading-relaxed text-[#3c4741]">{course.promise}</p>
        {course.outcomes && course.outcomes.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {course.outcomes.map((o) => (
              <li key={o} className="flex gap-2 text-[0.85rem] leading-snug">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t border-[#ece7dc] pt-4">
            <p className="text-[0.8rem] leading-snug text-muted">
              {fmt(s.lessons, { n: course.totalSteps })}
              <br />
              <span className="font-semibold text-ok">{course.freeSteps > 1 ? fmt(s.freeMany, { n: course.freeSteps }) : s.freeOne}</span>
            </p>
            <p className="text-right">
              <span className="text-[1.45rem] font-semibold tracking-tight">{money(course.price)}</span> <span className="text-[0.75rem] font-semibold text-muted">FCFA</span>
            </p>
          </div>
          <div className="mt-4 grid gap-2 min-[420px]:grid-cols-2">
            <Link href={`/learn/${course.id}`} className="btn btn-primary min-h-12 w-full text-[0.9rem]">
              {s.start}
            </Link>
            <a href={buy.href} className="btn btn-secondary min-h-12 w-full text-[0.9rem]" {...(buy.online ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
              {buy.online ? s.buyNow : s.buyWhatsApp}
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}

function Track({ id, label, title, intro, courses, t }: { id: string; label: string; title: string; intro: string; courses: CourseSummary[]; t: Dict }) {
  if (!courses.length) return null;
  return (
    <section id={id} className="scroll-mt-20 pt-14 first:pt-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>{label}</Eyebrow>
          <h3 className="font-display mt-3 text-[1.9rem] leading-tight tracking-tight sm:text-[2.2rem]">{title}</h3>
        </div>
        <p className="max-w-md text-[0.92rem] text-muted md:text-right">{intro}</p>
      </div>
      <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
  const steps = online ? s.howSteps : s.howStepsWhatsApp;
  // Facts from the catalogue itself, so they are always true.
  const facts = [
    { value: String(courses.length), label: s.facts.courses },
    { value: String(courses.reduce((n, c) => n + c.totalSteps, 0)), label: s.facts.lessons },
    { value: money(from(courses)), label: s.facts.price, prefix: s.facts.from },
    { value: "0", label: s.facts.free, suffix: "FCFA" },
  ];

  return (
    <div className={`${display.variable} min-h-dvh bg-white`}>
      <header className="sticky top-0 z-30 border-b border-[#ece7dc] bg-white/92 backdrop-blur">
        <div className={`${wrap} flex h-16 items-center justify-between gap-3`}>
          <Link href="/" aria-label={t.appName}>
            <Logo name={t.appName} />
          </Link>
          <nav className="hidden items-center gap-8 text-[0.85rem] font-medium text-[#3c4741] md:flex" aria-label={s.nav.courses}>
            <a href="#courses" className="hover:text-primary">
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
            <Link href="/redeem" className="inline-flex min-h-11 items-center px-1.5 text-[0.85rem] font-semibold text-ink hover:text-primary">
              <span className="sm:hidden">{s.codeShort}</span>
              <span className="hidden sm:inline">{s.haveCode}</span>
            </Link>
            <a href="#courses" className="btn btn-primary hidden min-h-10 px-4 py-2 text-[0.85rem] sm:inline-flex">
              {s.startFree}
              <Icon name="arrow" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-[#f4f1ea]">
          <div className={`${wrap} grid items-center gap-12 pb-16 pt-10 md:grid-cols-[1.05fr_1fr] md:gap-10 md:pb-20 md:pt-16`}>
            <div>
              <Eyebrow>{s.eyebrow}</Eyebrow>
              <h1 className="font-display mt-5 text-[2.55rem] leading-[1.05] tracking-[-0.02em] sm:text-[3.4rem] lg:text-[3.8rem]">{s.heroTitle}</h1>
              <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-[#3c4741]">{s.heroText}</p>
              <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
                <a href="#courses" className="btn btn-primary px-6">
                  {s.ctaFind}
                  <Icon name="arrow" className="h-5 w-5" />
                </a>
                <Link href={`/learn/${courses[0]?.id ?? ""}`} className="btn btn-secondary bg-white px-6">
                  {s.ctaFree}
                </Link>
              </div>
              <ul className="mt-8 grid max-w-lg grid-cols-1 gap-x-6 gap-y-2 text-[0.82rem] text-[#3c4741] min-[420px]:grid-cols-2">
                {s.trust.map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Icon name="check" className="h-4 w-4 shrink-0 text-ok" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <HeroScene s={s} />
          </div>
        </section>

        {/* Facts from the catalogue */}
        <section className="border-b border-[#ece7dc]">
          <div className={`${wrap} grid gap-8 py-10 md:grid-cols-[1.2fr_repeat(4,1fr)] md:items-center md:gap-6`}>
            <p className="max-w-xs text-[0.88rem] leading-relaxed text-muted">{s.factsIntro}</p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-7 md:col-span-4 md:grid-cols-4 md:gap-6">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col-reverse justify-end md:border-l md:border-[#ece7dc] md:pl-6">
                  <dt className="mt-2 text-[0.8rem] leading-snug text-muted">{f.label}</dt>
                  <dd className="font-display text-[2.3rem] leading-none tracking-tight">
                    {f.prefix && <span className="mr-1.5 align-middle text-[0.9rem] italic text-muted">{f.prefix}</span>}
                    {f.value}
                    {f.suffix && <span className="ml-1.5 text-[0.9rem] text-muted">{f.suffix}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Choose a direction */}
        <section id="courses" className="scroll-mt-16 py-16 md:py-20">
          <div className={wrap}>
            <Eyebrow>{s.pathsEyebrow}</Eyebrow>
            <h2 className="font-display mt-3 text-[2.1rem] leading-tight tracking-tight sm:text-[2.6rem]">{s.pathsTitle}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["career", "briefcase", s.paths.career, career],
                  ["exam", "cap", s.paths.exam, exam],
                ] as const
              ).map(([id, icon, p, list]) => (
                <a key={id} href={`#${id}`} className="group flex items-start gap-4 rounded-[14px] border border-[#e4ded2] bg-[#fbfaf6] p-5 transition-colors hover:border-primary sm:p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#d5e2da] bg-white text-primary">
                    <Icon name={icon} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.75rem] font-semibold text-muted">{p.who}</span>
                    <span className="mt-0.5 block text-[1.2rem] font-semibold tracking-tight">{p.title}</span>
                    <span className="mt-1.5 block text-[0.88rem] leading-relaxed text-[#3c4741]">{p.text}</span>
                    <span className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.8rem]">
                      <span className="text-muted">{fmt(list.length === 1 ? s.pathMetaOne : s.pathMeta, { n: list.length, price: money(from(list)) })}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        {p.cta}
                        <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-16">
              <Track id="career" label={s.trackEyebrow.career} title={s.paths.career.title} intro={s.careerIntro} courses={career} t={t} />
              <Track id="exam" label={s.trackEyebrow.exam} title={s.paths.exam.title} intro={s.examIntro} courses={exam} t={t} />
            </div>
          </div>
        </section>

        {/* Learning by doing */}
        <section className="bg-[#10231b] text-white">
          <div className={`${wrap} grid items-center gap-12 py-16 md:grid-cols-2 md:py-24`}>
            <div>
              <Eyebrow light>{s.doEyebrow}</Eyebrow>
              <h2 className="font-display mt-4 text-[2.1rem] leading-[1.1] tracking-tight sm:text-[2.6rem]">{s.doTitle}</h2>
              <p className="mt-5 max-w-lg text-[0.98rem] leading-relaxed text-[#c9d6cf]">{s.doText}</p>
              <ul className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {s.features.map((f) => (
                  <li key={f.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-[#9fd3b4]">
                      <Icon name={f.icon} className="h-[1.1rem] w-[1.1rem]" />
                    </span>
                    <span>
                      <span className="block text-[0.9rem] font-semibold leading-snug">{f.title}</span>
                      <span className="mt-1 block text-[0.8rem] leading-relaxed text-[#a9bab1]">{f.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <PracticeScene s={s} />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-16 bg-[#f4f1ea]">
          <div className={`${wrap} py-16 md:py-20`}>
            <Eyebrow>{s.howEyebrow}</Eyebrow>
            <h2 className="font-display mt-3 text-[2.1rem] leading-tight tracking-tight sm:text-[2.6rem]">{s.howTitle}</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4 border-t border-[#d9d1c1] pt-5">
                  <span className="font-display text-[2rem] leading-none text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-[1rem] font-semibold">{step.title}</span>
                    <span className="mt-1.5 block text-[0.88rem] leading-relaxed text-muted">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-col gap-3 rounded-[14px] border border-[#e4ded2] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[0.92rem] font-semibold">{s.howNote}</p>
              <p className="text-[0.85rem] text-muted">{s.referral}</p>
            </div>
          </div>
        </section>

        {/* Certificate */}
        <section className="py-16 md:py-24">
          <div className={`${wrap} grid items-center gap-14 md:grid-cols-2`}>
            <div className="order-2 md:order-1">
              <CertificateScene s={s} />
            </div>
            <div className="order-1 md:order-2">
              <Eyebrow>{s.certEyebrow}</Eyebrow>
              <h2 className="font-display mt-3 text-[2.1rem] leading-[1.1] tracking-tight sm:text-[2.5rem]">{s.certTitle}</h2>
              <p className="mt-5 text-[0.95rem] leading-relaxed text-[#3c4741]">{s.certText}</p>
              <ul className="mt-6 space-y-2.5">
                {s.certPoints.map((x) => (
                  <li key={x} className="flex items-center gap-2.5 text-[0.9rem]">
                    <Icon name="check" className="h-4 w-4 shrink-0 text-ok" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Questions */}
        <section id="faq" className="scroll-mt-16 border-t border-[#ece7dc]">
          <div className={`${wrap} grid gap-10 py-16 md:grid-cols-[0.8fr_1.2fr] md:py-20`}>
            <div>
              <Eyebrow>{s.faqEyebrow}</Eyebrow>
              <h2 className="font-display mt-3 text-[2.1rem] leading-tight tracking-tight sm:text-[2.5rem]">{s.faqTitle}</h2>
              <p className="mt-4 max-w-sm text-[0.92rem] text-muted">{s.faqIntro}</p>
              <a href={help} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 text-[0.9rem] font-semibold text-primary">
                {s.help}
                <Icon name="arrow" className="h-4 w-4" />
              </a>
            </div>
            <div className="divide-y divide-[#ece7dc] border-y border-[#ece7dc]">
              {s.faq.map((f, i) => (
                <details key={f.q} className="group py-1" open={i === 0}>
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[0.95rem] font-semibold">
                    {f.q}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e4ded2] text-primary transition-transform group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="pb-5 pr-10 text-[0.9rem] leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final call to action */}
        <section className="bg-primary text-white">
          <div className={`${wrap} flex flex-col gap-8 py-14 md:flex-row md:items-center md:justify-between md:py-16`}>
            <div>
              <h2 className="font-display text-[2.1rem] leading-tight tracking-tight sm:text-[2.6rem]">{s.finalTitle}</h2>
              <p className="mt-2 text-[0.95rem] text-[#cfe3d7]">{s.finalText}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 min-[420px]:flex-row">
              <a href="#courses" className="btn bg-white px-6 text-primary hover:bg-primary-soft">
                {s.ctaFind}
                <Icon name="arrow" className="h-5 w-5" />
              </a>
              <Link href="/redeem" className="btn border-2 border-white/60 px-6 text-white hover:bg-white/10">
                {s.haveCode}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#10231b] text-[#c9d6cf]">
        <div className={`${wrap} grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]`}>
          <div>
            <Logo name={t.appName} light />
            <p className="mt-4 max-w-xs text-[0.85rem] leading-relaxed">{s.footer}</p>
          </div>
          <div>
            <p className="text-[0.8rem] font-semibold text-white">{s.footerCourses}</p>
            <ul className="mt-4 space-y-2.5 text-[0.82rem]">
              {courses.map((c) => (
                <li key={c.id}>
                  <Link href={`/learn/${c.id}`} className="hover:text-white">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.8rem] font-semibold text-white">{s.footerHelp}</p>
            <ul className="mt-4 space-y-2.5 text-[0.82rem]">
              <li>
                <a href="#how" className="hover:text-white">
                  {s.nav.how}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white">
                  {s.nav.faq}
                </a>
              </li>
              <li>
                <Link href="/redeem" className="hover:text-white">
                  {s.haveCode}
                </Link>
              </li>
              <li>
                <a href={help} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className={`${wrap} flex flex-col gap-2 py-6 text-[0.75rem] sm:flex-row sm:items-center sm:justify-between`}>
            <p>
              © {new Date().getFullYear()} {t.appName}
            </p>
            <LanguageSwitch />
          </div>
        </div>
      </footer>
    </div>
  );
}
