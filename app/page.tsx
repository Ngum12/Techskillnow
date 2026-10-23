import Link from "next/link";
import { Newsreader } from "next/font/google";
import { getDict, fmt, money } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { listCourses, type CourseSummary } from "@/content";
import { env } from "@/lib/env";
import { waLink } from "@/lib/whatsapp";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Icon } from "@/components/home/Art";
import { CertificateScene, HeroScene, PracticeScene } from "@/components/home/Scenes";
import { CourseCatalog } from "@/components/home/CourseCatalog";

// The headline serif is only loaded on this page; lessons keep the light system font.
const display = Newsreader({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });

const wrap = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const eyebrow = "text-[0.7rem] font-bold uppercase tracking-[0.16em]";

/**
 * The category chip a course appears under. New courses fall into one of these by their track and id;
 * add a category here (and its label in the locale files) when a new kind of course arrives.
 */
function categoryOf(c: CourseSummary): string {
  if (c.track !== "exam") return "jobs";
  if (c.id.startsWith("maths")) return "maths";
  return "science";
}

/** A short rule and an uppercase label above a section title. */
function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`${eyebrow} flex items-center gap-2.5 ${light ? "text-[#9fd3b4]" : "text-primary"}`}>
      <span className={`h-px w-6 shrink-0 ${light ? "bg-[#9fd3b4]" : "bg-primary"}`} aria-hidden="true" />
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

export default async function Home() {
  const locale = await getLocale();
  const t = getDict(locale);
  const s = t.landing;
  const courses = listCourses(locale);
  const online = !!env.fapshi;
  const help = waLink(env.whatsappNumber, t.redeem.supportMessage);
  const steps = online ? s.howSteps : s.howStepsWhatsApp;
  const cheapest = courses.length ? Math.min(...courses.map((c) => c.price)) : 0;
  const catalog = courses.map((c) => ({
    id: c.id,
    title: c.title,
    category: categoryOf(c),
    price: money(c.price),
    lessons: fmt(s.lessons, { n: c.totalSteps }),
    free: c.freeSteps > 1 ? fmt(s.freeMany, { n: c.freeSteps }) : s.freeOne,
  }));
  // Facts from the catalogue itself, so they are always true.
  const facts = [
    { value: String(courses.length), label: s.facts.courses },
    { value: String(courses.reduce((n, c) => n + c.totalSteps, 0)), label: s.facts.lessons },
    { value: money(cheapest), label: s.facts.price, prefix: s.facts.from },
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
        {/* Hero: short on a phone, so the courses are one scroll away. */}
        <section className="bg-[#f4f1ea]">
          <div className={`${wrap} grid items-center gap-12 pb-10 pt-8 md:grid-cols-[1.05fr_1fr] md:gap-10 md:pb-20 md:pt-16`}>
            <div>
              <div className="hidden sm:block">
                <Eyebrow>{s.eyebrow}</Eyebrow>
              </div>
              <h1 className="font-display text-[2.4rem] leading-[1.05] tracking-[-0.02em] sm:mt-5 sm:text-[3.4rem] lg:text-[3.8rem]">{s.heroTitle}</h1>
              <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-[#3c4741] sm:mt-5 sm:text-[1.02rem]">{s.heroText}</p>
              <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row sm:mt-8">
                <a href="#courses" className="btn btn-primary px-6">
                  {s.ctaFind}
                  <Icon name="arrow" className="h-5 w-5" />
                </a>
                <Link href={`/learn/${courses[0]?.id ?? ""}`} className="btn btn-secondary bg-white px-6">
                  {s.ctaFree}
                </Link>
              </div>
              <ul className="mt-8 hidden max-w-lg grid-cols-2 gap-x-6 gap-y-2 text-[0.82rem] text-[#3c4741] md:grid">
                {s.trust.map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Icon name="check" className="h-4 w-4 shrink-0 text-ok" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden md:block">
              <HeroScene s={s} />
            </div>
          </div>
        </section>

        {/* Courses, by category */}
        <section id="courses" className="scroll-mt-16 py-10 md:py-20">
          <div className={wrap}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="hidden sm:block">
                  <Eyebrow>{s.pathsEyebrow}</Eyebrow>
                </div>
                <h2 className="font-display text-[1.9rem] leading-tight tracking-tight sm:mt-3 sm:text-[2.6rem]">{s.catalog.title}</h2>
              </div>
              <p className="hidden max-w-sm text-right text-[0.88rem] text-muted md:block">{s.catalog.intro}</p>
            </div>
            <div className="mt-5 sm:mt-7">
              <CourseCatalog courses={catalog} categories={s.catalog.categories} allLabel={s.catalog.all} startLabel={s.startFree} />
            </div>
          </div>
        </section>

        {/* Facts from the catalogue */}
        <section className="border-y border-[#ece7dc] bg-[#fbfaf6]">
          <div className={`${wrap} grid gap-8 py-8 md:grid-cols-[1.2fr_repeat(4,1fr)] md:items-center md:gap-6 md:py-10`}>
            <p className="hidden max-w-xs text-[0.88rem] leading-relaxed text-muted md:block">{s.factsIntro}</p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 md:col-span-4 md:grid-cols-4 md:gap-6">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col-reverse justify-end md:border-l md:border-[#ece7dc] md:pl-6">
                  <dt className="mt-1.5 text-[0.78rem] leading-snug text-muted">{f.label}</dt>
                  <dd className="font-display text-[2rem] leading-none tracking-tight sm:text-[2.3rem]">
                    {f.prefix && <span className="mr-1.5 align-middle text-[0.9rem] italic text-muted">{f.prefix}</span>}
                    {f.value}
                    {f.suffix && <span className="ml-1.5 text-[0.9rem] text-muted">{f.suffix}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Learning by doing */}
        <section className="bg-[#10231b] text-white">
          <div className={`${wrap} grid items-center gap-10 py-12 md:grid-cols-2 md:gap-12 md:py-24`}>
            <div>
              <Eyebrow light>{s.doEyebrow}</Eyebrow>
              <h2 className="font-display mt-4 text-[1.9rem] leading-[1.1] tracking-tight sm:text-[2.6rem]">{s.doTitle}</h2>
              <p className="mt-5 hidden max-w-lg text-[0.98rem] leading-relaxed text-[#c9d6cf] md:block">{s.doText}</p>
              <ul className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4">
                {s.features.map((f) => (
                  <li key={f.title} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-[#9fd3b4]">
                      <Icon name={f.icon} className="h-[1.1rem] w-[1.1rem]" />
                    </span>
                    <span className="text-[0.88rem] font-semibold leading-snug">{f.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <PracticeScene s={s} />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-16 bg-[#f4f1ea]">
          <div className={`${wrap} py-12 md:py-20`}>
            <div className="hidden sm:block">
              <Eyebrow>{s.howEyebrow}</Eyebrow>
            </div>
            <h2 className="font-display text-[1.9rem] leading-tight tracking-tight sm:mt-3 sm:text-[2.6rem]">{s.howTitle}</h2>
            <ol className="mt-6 grid gap-5 md:mt-10 md:grid-cols-3 md:gap-10">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4 border-t border-[#d9d1c1] pt-4 md:pt-5">
                  <span className="font-display text-[1.7rem] leading-none text-primary md:text-[2rem]">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-[0.98rem] font-semibold">{step.title}</span>
                    <span className="mt-1 block text-[0.85rem] leading-relaxed text-muted">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-[0.88rem] font-semibold md:mt-10">
              {s.howNote} <span className="font-normal text-muted">{s.referral}</span>
            </p>
          </div>
        </section>

        {/* Certificate */}
        <section className="py-12 md:py-24">
          <div className={`${wrap} grid items-center gap-10 md:grid-cols-2 md:gap-14`}>
            <div className="order-2 md:order-1">
              <CertificateScene s={s} />
            </div>
            <div className="order-1 md:order-2">
              <Eyebrow>{s.certEyebrow}</Eyebrow>
              <h2 className="font-display mt-3 text-[1.9rem] leading-[1.1] tracking-tight sm:text-[2.5rem]">{s.certTitle}</h2>
              <p className="mt-5 hidden text-[0.95rem] leading-relaxed text-[#3c4741] md:block">{s.certText}</p>
              <ul className="mt-5 space-y-2 md:mt-6">
                {s.certPoints.map((x) => (
                  <li key={x} className="flex items-center gap-2.5 text-[0.88rem]">
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
          <div className={`${wrap} grid gap-6 py-12 md:grid-cols-[0.8fr_1.2fr] md:gap-10 md:py-20`}>
            <div>
              <div className="hidden sm:block">
                <Eyebrow>{s.faqEyebrow}</Eyebrow>
              </div>
              <h2 className="font-display text-[1.9rem] leading-tight tracking-tight sm:mt-3 sm:text-[2.5rem]">{s.faqTitle}</h2>
              <p className="mt-4 hidden max-w-sm text-[0.92rem] text-muted md:block">{s.faqIntro}</p>
              <a href={help} target="_blank" rel="noopener noreferrer" className="mt-5 hidden items-center gap-1 text-[0.9rem] font-semibold text-primary md:inline-flex">
                {s.help}
                <Icon name="arrow" className="h-4 w-4" />
              </a>
            </div>
            <div>
              <div className="divide-y divide-[#ece7dc] border-y border-[#ece7dc]">
                {s.faq.map((f) => (
                  <details key={f.q} className="group py-0.5">
                    <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-4 text-[0.92rem] font-semibold">
                      {f.q}
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e4ded2] text-primary transition-transform group-open:rotate-45" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p className="pb-4 pr-10 text-[0.88rem] leading-relaxed text-muted">{f.a}</p>
                  </details>
                ))}
              </div>
              <a href={help} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 text-[0.88rem] font-semibold text-primary md:hidden">
                {s.help}
                <Icon name="arrow" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Final call to action */}
        <section className="bg-primary text-white">
          <div className={`${wrap} flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between md:py-16`}>
            <div>
              <h2 className="font-display text-[1.9rem] leading-tight tracking-tight sm:text-[2.6rem]">{s.finalTitle}</h2>
              <p className="mt-2 hidden text-[0.95rem] text-[#cfe3d7] sm:block">{s.finalText}</p>
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
        <div className={`${wrap} grid gap-8 py-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10 md:py-14`}>
          <div>
            <Logo name={t.appName} light />
            <p className="mt-4 max-w-xs text-[0.85rem] leading-relaxed">{s.footer}</p>
          </div>
          <div className="hidden md:block">
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
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 text-[0.82rem] md:block md:space-y-2.5">
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
          <div className={`${wrap} flex items-center justify-between gap-2 py-5 text-[0.75rem]`}>
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
