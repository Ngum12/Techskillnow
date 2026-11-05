"use client";
import type { ReactNode } from "react";
export const control =
  "min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-40";
export const primary =
  "min-h-12 rounded-xl bg-violet-800 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-900 disabled:opacity-40";
export const input =
  "min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-950 focus:outline-2 focus:outline-violet-600";
export function Coach({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[.18em]">
        Your next action
      </span>
      {children}
    </div>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="mt-4 rounded-xl bg-violet-50 p-4 text-sm leading-relaxed text-violet-950"
    >
      {children}
    </p>
  );
}
export function BrowserFrame({
  title,
  host,
  children,
  dark = false,
}: {
  title: string;
  host: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-lg">
      <div className="flex items-center gap-2 border-b bg-slate-100 px-3 py-2">
        <span aria-hidden="true" className="flex gap-1">
          <i className="h-2 w-2 rounded-full bg-red-300" />
          <i className="h-2 w-2 rounded-full bg-amber-300" />
          <i className="h-2 w-2 rounded-full bg-emerald-300" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1 text-[10px] text-slate-600">
          {host} · training screen
        </span>
      </div>
      <div
        className={`flex items-center justify-between gap-2 border-b px-4 py-3 ${dark ? "bg-slate-950 text-white" : "text-slate-950"}`}
      >
        <strong>{title}</strong>
        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-950">
          Simulation
        </span>
      </div>
      {children}
    </div>
  );
}
