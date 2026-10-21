"use client";
import { useState } from "react";
import { useT } from "@/components/I18n";
import { newId, type LanguageLevel } from "@/lib/cv/model";
import { formatPhone } from "@/components/tasks/CvHeaderForm";
import { useCv } from "./CvContext";

/** For learners who start a "Get the Job" course without a CV: a short basic CV in one screen. */
export function QuickCv({ onOpenMyCv }: { onOpenMyCv: () => void }) {
  const t = useT();
  const s = t.sim3.quickCv;
  const store = useCv();
  const [f, setF] = useState({ fullName: "", email: "", phone: "", city: "", degree: "", school: "", year: "", title: "", org: "", line: "", skills: "", en: "good", fr: "good", profile: "" });
  const [error, setError] = useState(false);
  if (!store) return null;

  const bind = (k: keyof typeof f) => ({ value: f[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      setF((cur) => ({ ...cur, [k]: v }));
    },
  });

  function save() {
    if (f.fullName.trim().split(/\s+/).length < 2 || !/@/.test(f.email) || !f.degree.trim()) return setError(true);
    store!.update((cv) => ({
      ...cv,
      header: { ...cv.header, fullName: f.fullName.trim(), email: f.email.trim(), phone: formatPhone(f.phone), city: f.city.trim() },
      profile: f.profile.trim(),
      education: [{ id: newId(), degree: f.degree.trim(), school: f.school.trim(), place: "", start: "", end: f.year.trim(), details: "" }],
      experiences: f.title.trim() ? [{ id: newId(), title: f.title.trim(), org: f.org.trim(), place: "", start: "", end: "", bullets: f.line.trim() ? [f.line.trim()] : [] }] : [],
      skills: f.skills
        .split(/[,;\n]/)
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 12)
        .map((name) => ({ id: newId(), name, level: "good" as const })),
      languages: [
        { id: newId(), name: s.english, level: f.en as LanguageLevel },
        { id: newId(), name: s.french, level: f.fr as LanguageLevel },
      ],
    }));
  }

  const input = (k: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="text-sm text-muted">{label}</span>
      <input className="input" {...bind(k)} {...props} />
    </label>
  );

  return (
    <section className="card mb-6 border-2 border-primary p-4">
      <h2 className="text-lg font-bold">{s.title}</h2>
      <p className="mt-1">{s.text}</p>
      <button type="button" className="btn btn-ghost mt-1 min-h-11 px-0" onClick={onOpenMyCv}>
        {s.haveOne}
      </button>
      <div className="mt-3 grid gap-3">
        {input("fullName", s.fullName, { autoComplete: "name" })}
        {input("email", s.email, { type: "email", inputMode: "email", autoCapitalize: "none" })}
        <div className="grid grid-cols-2 gap-2">
          {input("phone", s.phone, { type: "tel", inputMode: "tel", placeholder: "+237 6XX XX XX XX" })}
          {input("city", s.city)}
        </div>
        {input("degree", s.degree)}
        <div className="grid grid-cols-[2fr_1fr] gap-2">
          {input("school", s.school)}
          {input("year", s.year, { inputMode: "numeric" })}
        </div>
        {input("title", s.jobTitle)}
        {input("org", s.org)}
        {input("line", s.line, { placeholder: s.linePlaceholder })}
        {input("skills", s.skills, { placeholder: s.skillsPlaceholder })}
        <div className="grid grid-cols-2 gap-2">
          {(["en", "fr"] as const).map((k) => (
            <label key={k}>
              <span className="text-sm text-muted">{k === "en" ? s.english : s.french}</span>
              <select className="input" {...bind(k)}>
                {(["native", "fluent", "good", "basic"] as const).map((lv) => (
                  <option key={lv} value={lv}>
                    {t.cv.languageLevels[lv]}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <label className="block">
          <span className="text-sm text-muted">{s.profile}</span>
          <textarea className="input min-h-24" {...bind("profile")} placeholder={s.profilePlaceholder} />
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-err">
          {s.error}
        </p>
      )}
      <button type="button" className="btn btn-primary mt-4 w-full" onClick={save}>
        {s.save}
      </button>
    </section>
  );
}
