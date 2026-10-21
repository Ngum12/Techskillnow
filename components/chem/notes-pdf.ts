/**
 * Revision notes PDF: the learner's written method beside the model answer and marking points.
 * Loaded only when the learner taps "Save" (dynamic import), so jsPDF stays out of the main bundle.
 */
import type { MethodSection } from "@/lib/chem/marking";
import { saveFile } from "@/components/cv/pdf";

/** The built-in PDF fonts have no sub/superscripts or arrows: write them in plain text. */
function plain(text: string): string {
  const sub: Record<string, string> = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9", "³": "3", "⁻": "-" };
  return text
    .replace(/[₀-₉³⁻]/g, (c) => sub[c])
    .replace(/→/g, "->")
    .replace(/[−–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/✓/g, "[x]")
    .replace(/○/g, "[ ]");
}

export async function makeNotesPdf(sections: MethodSection[], labels: { title: string; mine: string; model: string; points: string; empty: string }): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 16, max = W - 2 * M;
  let y = 20;
  const ensure = (h: number) => {
    if (y + h > 282) {
      doc.addPage();
      y = 20;
    }
  };
  const para = (text: string, size: number, style: "normal" | "bold" = "normal", colour: [number, number, number] = [23, 32, 27]) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...colour);
    const lines = doc.splitTextToSize(plain(text), max) as string[];
    for (const line of lines) {
      ensure(size * 0.45);
      doc.text(line, M, y);
      y += size * 0.45;
    }
    y += 1.5;
  };

  para(labels.title, 18, "bold", [29, 84, 64]);
  para(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), 10, "normal", [79, 90, 84]);
  y += 2;
  for (const sec of sections) {
    ensure(20);
    para(sec.title, 13, "bold", [29, 84, 64]);
    para(labels.mine, 9, "bold", [79, 90, 84]);
    para(sec.text || labels.empty, 11);
    para(labels.model, 9, "bold", [79, 90, 84]);
    para(sec.model, 11);
    para(labels.points, 9, "bold", [79, 90, 84]);
    for (const p of sec.points) para(`${p.met ? "✓" : "○"} ${p.text}`, 10, "normal", p.met ? [29, 120, 70] : [176, 40, 40]);
    y += 3;
  }
  saveFile(doc.output("blob"), "Titration_method_revision_notes.pdf");
}
