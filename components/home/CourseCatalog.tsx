"use client";
/**
 * The course list on the home page: category chips on top, compact cards below. Each card shows two lines
 * about the course with "Read more" (which also lists what you leave with), then lessons, price and Start free.
 */
import { useState } from "react";
import Link from "next/link";
import { CourseMotif, Icon } from "./Art";

export type CatalogCourse = { id: string; title: string; promise: string; outcomes: string[]; category: string; price: string; lessons: string; free: string };
export type CatalogCategory = { id: string; label: string };
type Labels = { all: string; start: string; more: string; less: string; leaveWith: string };

function CourseCard({ c, category, labels }: { c: CatalogCourse; category: string; labels: Labels }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="flex flex-col overflow-hidden rounded-[14px] border border-[#e4ded2] bg-white transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(20,28,51,0.35)]">
      <div className="flex gap-3.5 p-3.5 sm:flex-col sm:gap-0 sm:p-0">
        <Link href={`/learn/${c.id}`} tabIndex={-1} aria-hidden="true" className="aspect-square w-24 shrink-0 self-start overflow-hidden sm:self-stretch rounded-[10px] border border-[#ece7dc] sm:aspect-[16/9] sm:w-full sm:rounded-none sm:border-0 sm:border-b">
          <CourseMotif id={c.id} />
        </Link>
        <div className="min-w-0 flex-1 sm:px-5 sm:pt-5">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-primary sm:text-[0.68rem]">{category}</p>
          <h3 className="mt-1 text-[1rem] font-semibold leading-snug tracking-tight sm:mt-2 sm:text-[1.15rem]">
            <Link href={`/learn/${c.id}`} className="hover:text-primary">
              {c.title}
            </Link>
          </h3>
          <p className={`mt-1.5 text-[0.82rem] leading-relaxed text-[#4a5568] ${open ? "" : "line-clamp-2"}`}>{c.promise}</p>
          {open && c.outcomes.length > 0 && (
            <div className="mt-3">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-muted">{labels.leaveWith}</p>
              <ul className="mt-1.5 space-y-1">
                {c.outcomes.map((o) => (
                  <li key={o} className="flex gap-2 text-[0.8rem] leading-snug">
                    <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="mt-1 min-h-8 text-[0.8rem] font-semibold text-primary underline-offset-2 hover:underline">
            {open ? labels.less : labels.more}
          </button>
        </div>
      </div>
      <div className="mt-auto px-3.5 pb-3.5 sm:px-5 sm:pb-5">
        <div className="flex items-end justify-between gap-3 border-t border-[#ece7dc] pt-3">
          <p className="text-[0.78rem] leading-snug text-muted">
            {c.lessons}
            <br />
            <span className="font-semibold text-ok">{c.free}</span>
          </p>
          <p className="whitespace-nowrap">
            <span className="text-[1.2rem] font-semibold tracking-tight sm:text-[1.35rem]">{c.price}</span> <span className="text-[0.7rem] font-semibold text-muted">FCFA</span>
          </p>
        </div>
        <Link href={`/learn/${c.id}`} className="btn btn-primary mt-3 min-h-11 w-full py-2 text-[0.88rem]">
          {labels.start}
          <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
    </li>
  );
}

export function CourseCatalog({ courses, categories, labels }: { courses: CatalogCourse[]; categories: CatalogCategory[]; labels: Labels }) {
  const [active, setActive] = useState("all");
  const used = categories.filter((c) => courses.some((x) => x.category === c.id));
  const shown = active === "all" ? courses : courses.filter((c) => c.category === active);
  const label = (id: string) => categories.find((c) => c.id === id)?.label ?? "";

  return (
    <div>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0" role="tablist">
        {[{ id: "all", label: labels.all }, ...used].map((c) => {
          const on = active === c.id;
          const n = c.id === "all" ? courses.length : courses.filter((x) => x.category === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(c.id)}
              className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[0.82rem] font-semibold transition-colors ${on ? "border-[#141c33] bg-[#141c33] text-white" : "border-[#e4ded2] bg-white text-ink hover:border-primary"}`}
            >
              {c.label}
              <span className={`text-[0.72rem] ${on ? "text-white/70" : "text-muted"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-5 grid items-start gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {shown.map((c) => (
          <CourseCard key={c.id} c={c} category={label(c.category)} labels={labels} />
        ))}
      </ul>
    </div>
  );
}
