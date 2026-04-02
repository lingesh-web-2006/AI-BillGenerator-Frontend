/**
 * pdfGenerator.js — Generate downloadable PDF bill using jsPDF
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateBillPDF(bill) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;

  // ── Header ──
  doc.setFillColor(17, 19, 24);
  doc.rect(0, 0, pageW, 50, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(79, 142, 247);
  doc.text("EMPLOYEE BILLING SYSTEM", margin, 22);

  doc.setFontSize(9);
  doc.setTextColor(140, 146, 170);
  doc.text("Payslip / Salary Statement", margin, 30);

  doc.setFontSize(9);
  doc.setTextColor(200, 210, 230);
  doc.text(`Bill ID: #${bill.bill_id || "N/A"}`, pageW - margin, 18, { align: "right" });
  doc.text(`Date: ${bill.bill_date}`, pageW - margin, 25, { align: "right" });
  doc.text(`Generated: ${new Date(bill.generated_at).toLocaleString()}`, pageW - margin, 32, { align: "right" });

  // ── Employee Info ──
  let y = 62;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(232, 236, 244);
  doc.text("Employee Details", margin, y);

  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(136, 146, 170);

  const details = [
    ["Name",         bill.employee_name],
    ["Designation",  bill.designation || "—"],
    ["Email",        bill.email || "—"],
  ];
  details.forEach(([label, value]) => {
    doc.text(label + ":", margin, y);
    doc.setTextColor(232, 236, 244);
    doc.text(value, margin + 32, y);
    doc.setTextColor(136, 146, 170);
    y += 7;
  });

  // ── Attendance Summary ──
  y += 4;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(232, 236, 244);
  doc.text("Attendance Summary", margin, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Working Days", "Days Present", "Days Absent", "Attendance %"]],
    body: [[
      bill.working_days,
      bill.present_days,
      bill.absent_days,
      `${((bill.present_days / bill.working_days) * 100).toFixed(1)}%`,
    ]],
    styles: { fontSize: 9, textColor: [232, 236, 244], fillColor: [24, 28, 36] },
    headStyles: { fillColor: [30, 34, 46], textColor: [140, 146, 170], fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: [20, 24, 32] },
    theme: "grid",
  });

  // ── Salary Breakdown ──
  y = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(232, 236, 244);
  doc.text("Salary Breakdown", margin, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Description", "Amount (₹)"]],
    body: [
      ["Monthly Gross Salary",               `₹ ${bill.monthly_salary?.toFixed(2)}`],
      [`Per Day Rate (÷${bill.working_days})`, `₹ ${bill.per_day_salary?.toFixed(2)}`],
      [`Absent Deduction (${bill.absent_days} days)`, `- ₹ ${bill.deduction?.toFixed(2)}`],
    ],
    styles: { fontSize: 9, textColor: [232, 236, 244], fillColor: [24, 28, 36] },
    headStyles: { fillColor: [30, 34, 46], textColor: [140, 146, 170], fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: [20, 24, 32] },
    theme: "grid",
  });

  // ── Net Payable & Status ──
  y = doc.lastAutoTable.finalY + 6;
  doc.setFillColor(30, 58, 110);
  doc.roundedRect(margin, y, pageW - margin * 2, 18, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(79, 142, 247);
  doc.text("NET PAYABLE AMOUNT", margin + 6, y + 11);
  
  // PAID Status Badge in PDF
  doc.setFillColor(16, 185, 129); // Success Green
  doc.roundedRect(margin + 62, y + 6, 20, 6, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("PAID", margin + 72, y + 10.5, { align: "center" });

  doc.setTextColor(79, 142, 247);
  doc.setFontSize(14);
  doc.text(`₹ ${bill.net_amount?.toFixed(2) || bill.amount?.toFixed(2)}`, pageW - margin - 4, y + 11, { align: "right" });

  // ── Notes ──
  if (bill.notes) {
    y += 28;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(136, 146, 170);
    doc.text(`Notes: ${bill.notes}`, margin, y);
  }

  // ── Footer ──
  const footerY = doc.internal.pageSize.getHeight() - 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(78, 88, 112);
  doc.text("Transaction Verified. This is a system-generated payslip. No signature required.", margin, footerY);
  doc.text(`Page 1 of 1`, pageW - margin, footerY, { align: "right" });

  doc.save(`Bill_${bill.employee_name?.replace(/\s+/g, "_")}_${bill.bill_date}.pdf`);
}
