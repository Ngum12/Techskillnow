import type { CreatorProject } from "./types";
// Export learner-authored content only. Practice answers never enter the product.
export async function exportGuide(
  project: CreatorProject,
  options: {
    fontSize?: number;
    color?: string;
    photo?: string;
    mobile?: boolean;
  } = {},
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    unit: "mm",
    format: options.mobile ? [108, 192] : "a4",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = options.mobile ? 12 : 23;
  const startY = options.mobile ? 18 : 25;
  const contentWidth = pageWidth - margin * 2;
  const clean = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[—–]/g, "-")
      .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
  let y = startY;
  const bodySize = options.fontSize
    ? Math.min(14, Math.max(11, options.fontSize * 0.7))
    : 12;
  const line = (text: string, size: number, color: string) => {
    doc.setFontSize(size);
    doc.setTextColor(color);
    for (const row of doc.splitTextToSize(
      clean(text),
      contentWidth,
    ) as string[]) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = startY;
      }
      doc.text(row, margin, y);
      y += size * 0.5 + 2;
    }
    y += 7;
  };
  line(project.title, options.mobile ? 20 : 24, options.color || "#4c1d95");
  line(project.outcome, 13, "#57534e");
  line(`For: ${project.audience}`, 11, "#57534e");
  if (options.photo) {
    const image = doc.getImageProperties(options.photo);
    const width = Math.min(
      contentWidth,
      ((options.mobile ? 60 : 90) * image.width) / image.height,
    );
    const height = (width * image.height) / image.width;
    if (y + height > pageHeight - 20) {
      doc.addPage();
      y = startY;
    }
    doc.addImage(
      options.photo,
      image.fileType,
      (pageWidth - width) / 2,
      y,
      width,
      height,
    );
  }
  doc.addPage();
  y = startY;
  line("Before you begin", 18, "#4c1d95");
  line(project.experience, 11, "#292524");
  line("Your route", 18, "#4c1d95");
  line(project.outline, 11, "#292524");
  doc.addPage();
  y = startY;
  line(project.draft, bodySize, "#292524");
  for (let page = 1; page <= doc.getNumberOfPages(); page++) {
    doc.setPage(page);
    doc.setFontSize(9);
    doc.setTextColor("#78716c");
    doc.text(String(page), pageWidth - margin, pageHeight - 8);
  }
  doc.save(
    `${project.title.replace(/[^a-z0-9]+/gi, "-").slice(0, 65) || "my-digital-guide"}.pdf`,
  );
}
export function launchPack(p: CreatorProject) {
  return `${p.title}\n\nREADER\n${p.audience}\n\nPROMISE\n${p.outcome}\n\nLISTING\n${p.description}\n\nPRICE (XAF)\n${p.price}\n\nSTORE\n${p.storeUrl}\n\nLAUNCH MESSAGES AND PLAN\n${p.launch}\n\nVERIFICATION NOTES (PRIVATE)\n${p.verification}\n\nREADER FEEDBACK (PRIVATE)\n${p.review}`;
}
