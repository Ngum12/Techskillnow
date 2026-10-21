"use client";
import { useT } from "@/components/I18n";
import { sectionOrder, type CvData } from "@/lib/cv/model";

const dates = (start: string, end: string, present: string) => [start, end || (start ? present : "")].filter(Boolean).join(" – ");

/** The learner's CV as a page, matching the PDF layout (single column, clear headings). */
export function CvPreview({ cv }: { cv: CvData }) {
  const t = useT();
  const s = t.cv;
  const h = cv.header;
  const contact = [h.email, h.phone, h.city, h.linkedin].filter((x) => x.trim());
  const personal = [h.showDob && h.dob ? `${s.dob}: ${h.dob}` : "", h.showMarital && h.marital ? `${s.marital}: ${h.marital}` : ""].filter(Boolean);
  const experiences = cv.experiences.filter((e) => e.title.trim());
  const education = cv.education.filter((e) => e.degree.trim());
  const skills = cv.skills.filter((x) => x.name.trim());
  const languages = cv.languages.filter((x) => x.name.trim());
  const empty = !h.fullName && !cv.profile && !experiences.length && !education.length && !skills.length;

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h3 className="mt-4 border-b-2 border-primary pb-0.5 text-[0.8rem] font-bold uppercase tracking-wider text-primary">{children}</h3>
  );

  return (
    <article className="rounded-lg border border-line bg-white p-5 text-[0.85rem] leading-snug text-ink shadow-sm" aria-label={s.myCv}>
      {empty && <p className="py-8 text-center text-muted">{s.emptyPreview}</p>}
      {h.fullName && <h2 className="text-xl font-bold">{h.fullName}</h2>}
      {contact.length > 0 && <p className="mt-0.5 break-words text-muted">{contact.join("  |  ")}</p>}
      {personal.length > 0 && <p className="text-muted">{personal.join("  |  ")}</p>}

      {sectionOrder(cv).map((section) => {
        if (section === "profile" && cv.profile.trim())
          return (
            <section key={section}>
              <Heading>{s.sections.profile}</Heading>
              <p className="mt-1.5">{cv.profile}</p>
            </section>
          );
        if (section === "experience" && experiences.length)
          return (
            <section key={section}>
              <Heading>{s.sections.experience}</Heading>
              {experiences.map((e) => (
                <div key={e.id} className="mt-2">
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold">{[e.title, [e.org, e.place].filter(Boolean).join(", ")].filter(Boolean).join(" — ")}</p>
                    <p className="shrink-0 text-muted">{dates(e.start, e.end, s.present)}</p>
                  </div>
                  <ul className="mt-0.5 list-disc pl-5">
                    {e.bullets.filter((b) => b.trim()).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          );
        if (section === "education" && education.length)
          return (
            <section key={section}>
              <Heading>{s.sections.education}</Heading>
              {education.map((e) => (
                <div key={e.id} className="mt-2">
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold">{[e.degree, [e.school, e.place].filter(Boolean).join(", ")].filter(Boolean).join(" — ")}</p>
                    <p className="shrink-0 text-muted">{dates(e.start, e.end, s.present)}</p>
                  </div>
                  {e.details && <p className="text-muted">{e.details}</p>}
                </div>
              ))}
            </section>
          );
        if (section === "skills" && skills.length)
          return (
            <section key={section}>
              <Heading>{s.sections.skills}</Heading>
              <ul className="mt-1.5 list-disc pl-5">
                {skills.map((x) => (
                  <li key={x.id}>
                    {x.name} ({s.skillLevels[x.level]})
                  </li>
                ))}
              </ul>
            </section>
          );
        if (section === "languages" && languages.length)
          return (
            <section key={section}>
              <Heading>{s.sections.languages}</Heading>
              <p className="mt-1.5">{languages.map((l) => `${l.name}: ${s.languageLevels[l.level]}`).join("   |   ")}</p>
            </section>
          );
        if (section === "interests" && cv.interests.trim())
          return (
            <section key={section}>
              <Heading>{s.sections.interests}</Heading>
              <p className="mt-1.5">{cv.interests}</p>
            </section>
          );
        return null;
      })}
    </article>
  );
}
