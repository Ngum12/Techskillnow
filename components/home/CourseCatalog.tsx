"use client";
/**
 * The course list on the home page: category chips on top, compact cards below. On a phone each card
 * is one row (cover on the left), so several courses fit on one screen.
 */
import { useState } from "react";
import Link from "next/link";
import { CourseMotif, Icon } from "./Art";

export type CatalogCourse = { id: string; title: string; category: string; price: string; lessons: string; free: string };
export type CatalogCategory = { id: string; label: string };

export function CourseCatalog({ courses, categories, allLabel, startLabel }: { courses: CatalogCourse[]; categories: CatalogCategory[]; allLabel: string; startLabel: string }) {
  const [active, setActive] = useState("all");
  const used = categories.filter((c) => courses.some((x) => x.category === c.id));
  const shown = active === "all" ? courses : courses.filter((c) => c.category === active);
  const label = (id: string) => categories.find((c) => c.id === id)?.label ?? "";

  return (
    <div>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0" role="tablist">
        {[{ id: "all", label: allLabel }, ...used].map((c) => {
          const on = active === c.id;
          const n = c.id === "all" ? courses.length : courses.filter((x) => x.category === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(c.id)}
              className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[0.82rem] font-semibold transition-colors ${on ? "border-primary bg-primary text-white" : "border-[#e4ded2] bg-white text-ink hover:border-primary"}`}
            >
              {c.label}
              <span className={`text-[0.72rem] ${on ? "text-white/75" : "text-muted"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-5 grid gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {shown.map((c) => (
          <li key={c.id}>
            <Link
              href={`/learn/${c.id}`}
              className="group flex h-full overflow-hidden rounded-[14px] border border-[#e4ded2] bg-white transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(23,32,27,0.35)] sm:flex-col"
            >
              <div className="w-[38%] shrink-0 overflow-hidden border-r border-[#ece7dc] sm:aspect-[16/9] sm:w-full sm:border-b sm:border-r-0">
                <CourseMotif id={c.id} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-5">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-primary sm:text-[0.68rem]">{label(c.category)}</p>
                <h3 className="mt-1 text-[0.95rem] font-semibold leading-snug tracking-tight sm:mt-2 sm:text-[1.15rem]">{c.title}</h3>
                <p className="mt-1 text-[0.75rem] text-muted sm:mt-2 sm:text-[0.82rem]">
                  {c.lessons}
                  <span className="font-semibold text-ok"> · {c.free}</span>
                </p>
                <div className="mt-auto flex items-end justify-end gap-2 pt-2.5 sm:justify-between sm:mt-4 sm:border-t sm:border-[#ece7dc] sm:pt-4">
                  <span className="hidden items-center gap-1 text-[0.85rem] font-semibold text-primary sm:inline-flex">
                    {startLabel}
                    <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="whitespace-nowrap">
                    <span className="text-[1.05rem] font-semibold tracking-tight sm:text-[1.35rem]">{c.price}</span> <span className="text-[0.68rem] font-semibold text-muted">FCFA</span>
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
