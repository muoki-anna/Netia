import { jsPDF } from 'jspdf';

const MARGIN = 18;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export function generateResourcePdf(resource) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  doc.setFillColor(20, 83, 45);
  doc.rect(0, 0, PAGE_WIDTH, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('NetiaX Agrotech Solutions', MARGIN, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(resource.category, MARGIN, 23);

  y = 44;
  doc.setTextColor(20, 83, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(resource.title, CONTENT_WIDTH);
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * 7 + 4;

  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10.5);
  const descLines = doc.splitTextToSize(resource.description, CONTENT_WIDTH);
  doc.text(descLines, MARGIN, y);
  y += descLines.length * 5 + 6;

  doc.setDrawColor(210, 210, 210);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  resource.sections.forEach((section) => {
    if (y > 265) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setTextColor(217, 119, 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.text(section.heading, MARGIN, y);
    y += 6;

    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    const bodyLines = doc.splitTextToSize(section.body, CONTENT_WIDTH);
    if (y + bodyLines.length * 5 > 280) {
      doc.addPage();
      y = MARGIN;
    }
    doc.text(bodyLines, MARGIN, y);
    y += bodyLines.length * 5 + 7;
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('NetiaX Limited · 283-01001 Juja · netiaxke@gmail.com · 0725000250', MARGIN, 290);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN - 18, 290);
  }

  doc.save(resource.fileName);
}
