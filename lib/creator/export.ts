import type { CreatorProject } from './types';
// Export learner-authored content only. Practice answers never enter the product.
export async function exportGuide(project: CreatorProject) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const clean = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[—–]/g, '-').replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '');
  let y = 28;
  const line = (text: string, size: number, color: string) => {
    doc.setFontSize(size); doc.setTextColor(color);
    for (const row of doc.splitTextToSize(clean(text), 164) as string[]) {
      if (y > 270) { doc.addPage(); y = 25; }
      doc.text(row, 23, y); y += size * 0.5 + 2;
    }
    y += 7;
  };
  line(project.title, 24, '#4c1d95');
  line(project.outcome, 13, '#57534e');
  line(`For: ${project.audience}`, 11, '#57534e');
  doc.addPage(); y = 25;
  line('Before you begin', 18, '#4c1d95');
  line(project.experience, 11, '#292524');
  line('Your route', 18, '#4c1d95');
  line(project.outline, 11, '#292524');
  doc.addPage(); y = 25;
  line(project.draft, 12, '#292524');
  for (let page = 1; page <= doc.getNumberOfPages(); page++) {
    doc.setPage(page); doc.setFontSize(9); doc.setTextColor('#78716c'); doc.text(String(page), 185, 287);
  }
  doc.save(`${project.title.replace(/[^a-z0-9]+/gi, '-').slice(0, 65) || 'my-digital-guide'}.pdf`);
}
export function launchPack(p: CreatorProject) {
  return `${p.title}\n\nREADER\n${p.audience}\n\nPROMISE\n${p.outcome}\n\nLISTING\n${p.description}\n\nPRICE (XAF)\n${p.price}\n\nSTORE\n${p.storeUrl}\n\nLAUNCH MESSAGES AND PLAN\n${p.launch}\n\nVERIFICATION NOTES (PRIVATE)\n${p.verification}\n\nREADER FEEDBACK (PRIVATE)\n${p.review}`;
}
