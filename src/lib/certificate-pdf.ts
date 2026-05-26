import jsPDF from "jspdf";

export function downloadCertificate(opts: {
  name: string;
  course: string;
  code: string;
  date: string;
}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // background
  doc.setFillColor(252, 248, 243);
  doc.rect(0, 0, w, h, "F");

  // outer border
  doc.setDrawColor(15, 27, 61);
  doc.setLineWidth(3);
  doc.rect(28, 28, w - 56, h - 56);
  doc.setLineWidth(0.8);
  doc.rect(40, 40, w - 80, h - 80);

  // title
  doc.setFont("times", "bold");
  doc.setTextColor(15, 27, 61);
  doc.setFontSize(40);
  doc.text("Certificate of Completion", w / 2, 130, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.text("This certificate is proudly presented to", w / 2, 180, { align: "center" });

  // name
  doc.setFont("times", "bold");
  doc.setFontSize(36);
  doc.setTextColor(232, 93, 58);
  doc.text(opts.name, w / 2, 240, { align: "center" });

  // line
  doc.setDrawColor(200, 200, 200);
  doc.line(w / 2 - 180, 255, w / 2 + 180, 255);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text("for successfully completing the course", w / 2, 285, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(24);
  doc.setTextColor(15, 27, 61);
  doc.text(`"${opts.course}"`, w / 2, 325, { align: "center" });

  // footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Issued on ${opts.date}`, 80, h - 80);
  doc.text(`Verify at: /verify/${opts.code}`, 80, h - 60);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 27, 61);
  doc.text("JewelIQ Academy", w - 80, h - 80, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Certificate ID: ${opts.code}`, w - 80, h - 60, { align: "right" });

  doc.save(`JewelIQ-Certificate-${opts.code}.pdf`);
}
