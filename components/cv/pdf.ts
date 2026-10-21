/**
 * PDF export for the CV and the cover letter. Loaded only when the learner exports
 * (dynamic import), so jsPDF never enters the main bundle.
 * Output is real, selectable text in one column: readable by applicant tracking systems.
 */
import type { jsPDF as JsPDF } from "jspdf";
import { sectionOrder, type CvData } from "@/lib/cv/model";

export type CvLabels = {
  sections: Record<"profile" | "experience" | "education" | "skills" | "languages" | "interests", string>;
  skillLevels: Record<string, string>;
  languageLevels: Record<string, string>;
  dob: string;
  marital: string;
  present: string;
};

const PAGE = { w: 595.28, h: 841.89, margin: 50 };
const INK: [number, number, number] = [23, 32, 27];
const MUTED: [number, number, number] = [79, 90, 84];
const ACCENT: [number, number, number] = [29, 84, 64];

// Standard PDF fonts cover Latin-1 plus a few typographic characters; replace anything else.
const EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
function safe(text: string): string {
  return Array.from(text.replace(/[‐-‒]/g, "-").replace(/→/g, "->"))
    .map((c) => (c.charCodeAt(0) <= 0xff || EXTRA.includes(c) ? c : ""))
    .join("");
}

class Writer {
  y = PAGE.margin;
  doc: JsPDF;
  constructor(doc: JsPDF) {
    this.doc = doc;
  }

  get width() {
    return PAGE.w - PAGE.margin * 2;
  }

  ensure(space: number) {
    if (this.y + space > PAGE.h - PAGE.margin) {
      this.doc.addPage();
      this.y = PAGE.margin;
    }
  }

  text(value: string, opts: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number; gap?: number } = {}) {
    const { size = 10.5, bold = false, color = INK, indent = 0, gap = 2 } = opts;
    const doc = this.doc;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines: string[] = doc.splitTextToSize(safe(value), this.width - indent);
    const lh = size * 1.35;
    for (const line of lines) {
      this.ensure(lh);
      doc.text(line, PAGE.margin + indent, this.y + size);
      this.y += lh;
    }
    this.y += gap;
  }

  /** A line with text on the left and (dates) on the right. */
  row(left: string, right: string) {
    const doc = this.doc;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const rightW = right ? doc.getTextWidth(safe(right)) + 10 : 0;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    const lines: string[] = doc.splitTextToSize(safe(left), this.width - rightW);
    this.ensure(lines.length * 14 + 2);
    doc.setTextColor(...INK);
    lines.forEach((line, i) => doc.text(line, PAGE.margin, this.y + 10.5 + i * 14));
    if (right) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...MUTED);
      doc.text(safe(right), PAGE.w - PAGE.margin, this.y + 10.5, { align: "right" });
    }
    this.y += lines.length * 14 + 2;
  }

  bullet(value: string) {
    const doc = this.doc;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    const lines: string[] = doc.splitTextToSize(safe(value), this.width - 14);
    lines.forEach((line, i) => {
      this.ensure(14);
      if (i === 0) doc.text("•", PAGE.margin + 2, this.y + 10.5);
      doc.text(line, PAGE.margin + 14, this.y + 10.5);
      this.y += 14;
    });
    this.y += 1;
  }

  heading(value: string) {
    this.ensure(40);
    this.y += 8;
    const doc = this.doc;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...ACCENT);
    doc.text(safe(value.toUpperCase()), PAGE.margin, this.y + 11);
    this.y += 15;
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.8);
    doc.line(PAGE.margin, this.y, PAGE.w - PAGE.margin, this.y);
    this.y += 7;
  }
}

const dates = (start: string, end: string, present: string) => [start, end || (start ? present : "")].filter(Boolean).join(" – ");

async function newDoc(title: string): Promise<JsPDF> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  doc.setProperties({ title, creator: "TechSkillNow" });
  return doc;
}

export async function makeCvPdf(cv: CvData, labels: CvLabels): Promise<{ blob: Blob; pages: number }> {
  const h = cv.header;
  const doc = await newDoc(`${h.fullName} – CV`);
  const w = new Writer(doc);

  w.text(h.fullName || "—", { size: 20, bold: true, gap: 4 });
  const contact = [h.email, h.phone, h.city, h.linkedin].map((s) => s.trim()).filter(Boolean).join("  |  ");
  if (contact) w.text(contact, { size: 10, color: MUTED, gap: 2 });
  const personal = [h.showDob && h.dob ? `${labels.dob}: ${h.dob}` : "", h.showMarital && h.marital ? `${labels.marital}: ${h.marital}` : ""]
    .filter(Boolean)
    .join("  |  ");
  if (personal) w.text(personal, { size: 10, color: MUTED });

  for (const section of sectionOrder(cv)) {
    if (section === "profile" && cv.profile.trim()) {
      w.heading(labels.sections.profile);
      w.text(cv.profile.trim());
    }
    if (section === "experience" && cv.experiences.some((e) => e.title.trim())) {
      w.heading(labels.sections.experience);
      for (const e of cv.experiences.filter((x) => x.title.trim())) {
        w.row([e.title, [e.org, e.place].filter(Boolean).join(", ")].filter(Boolean).join(" — "), dates(e.start, e.end, labels.present));
        e.bullets.filter((b) => b.trim()).forEach((b) => w.bullet(b));
        w.y += 4;
      }
    }
    if (section === "education" && cv.education.some((e) => e.degree.trim())) {
      w.heading(labels.sections.education);
      for (const e of cv.education.filter((x) => x.degree.trim())) {
        w.row([e.degree, [e.school, e.place].filter(Boolean).join(", ")].filter(Boolean).join(" — "), dates(e.start, e.end, labels.present));
        if (e.details.trim()) w.text(e.details, { size: 10, color: MUTED });
        w.y += 2;
      }
    }
    if (section === "skills" && cv.skills.some((s) => s.name.trim())) {
      w.heading(labels.sections.skills);
      cv.skills.filter((s) => s.name.trim()).forEach((s) => w.bullet(`${s.name} (${labels.skillLevels[s.level]})`));
    }
    if (section === "languages" && cv.languages.some((l) => l.name.trim())) {
      w.heading(labels.sections.languages);
      w.text(cv.languages.filter((l) => l.name.trim()).map((l) => `${l.name}: ${labels.languageLevels[l.level]}`).join("   |   "));
    }
    if (section === "interests" && cv.interests.trim()) {
      w.heading(labels.sections.interests);
      w.text(cv.interests.trim());
    }
  }

  return { blob: doc.output("blob"), pages: doc.getNumberOfPages() };
}

export async function makeLetterPdf(input: { name: string; contact: string; date: string; recipient: string[]; paragraphs: string[] }) {
  const doc = await newDoc(`${input.name} – Cover letter`);
  const w = new Writer(doc);
  w.text(input.name, { size: 16, bold: true, gap: 2 });
  if (input.contact) w.text(input.contact, { size: 10, color: MUTED, gap: 14 });
  input.recipient.filter(Boolean).forEach((line) => w.text(line, { gap: 0 }));
  w.y += 10;
  w.text(input.date, { color: MUTED, gap: 14 });
  input.paragraphs.filter((p) => p.trim()).forEach((p) => w.text(p.trim(), { gap: 10 }));
  return { blob: doc.output("blob"), pages: doc.getNumberOfPages() };
}

/** Downloads the file, so it lands in the phone's Downloads folder, ready to attach in Gmail. */
export function saveFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
