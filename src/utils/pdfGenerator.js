/**
 * pdfGenerator.js — Professional GST Tax Invoice Generator
 * Generates a real-company-style invoice with CGST/SGST breakdown,
 * bank details, authorized signature, and compliance footer.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  headerBg:   [15,  23,  42],   // slate-900
  headerText: [255, 255, 255],
  accent:     [79,  70,  229],  // indigo-600
  accentLight:[224, 231, 255],  // indigo-100
  tableHead:  [30,  41,  59],   // slate-800
  tableHeadT: [203, 213, 225],  // slate-300
  rowAlt:     [248, 250, 252],  // slate-50
  border:     [203, 213, 225],  // slate-300
  ink:        [15,  23,  42],   // almost black
  muted:      [100, 116, 139],  // slate-500
  success:    [22,  163, 74],   // green-600
  danger:     [220, 38,  38],   // red-600
  totalBg:    [30,  41,  59],
  totalText:  [255, 255, 255],
  paidStamp:  [22,  163, 74],
};

// ── GST Rate (18 % split as 9+9) ───────────────────────────────────────────
const GST_RATE  = 0.18;
const CGST_RATE = 0.09;
const SGST_RATE = 0.09;

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n, decimals = 2) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const inr = (n) => `Rs. ${fmt(n)}`;

function today() {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function dueDate(date) {
  const d = date ? new Date(date) : new Date();
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Main export ─────────────────────────────────────────────────────────────
export function generateBillPDF(bill, company) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  renderGSTInvoice(doc, bill, company);
  const name = `GST_Invoice_${(company?.name || "Company").replace(/\s+/g, "_")}_${(bill.employee_name || "Employee").replace(/\s+/g, "_")}_${bill.bill_id || bill.id || "001"}.pdf`;
  doc.save(name);
}

// ── Render full GST invoice ──────────────────────────────────────────────────
function renderGSTInvoice(doc, bill, company) {
  const W  = doc.internal.pageSize.getWidth();   // 210
  const H  = doc.internal.pageSize.getHeight();  // 297
  const ML = 14;   // margin left
  const MR = W - 14; // margin right

  // ═══════════════════════════════════════════════════════════
  // 1. HEADER BAND
  // ═══════════════════════════════════════════════════════════
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, W, 42, "F");

  // Company name (left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C.headerText);
  doc.text((company?.name || "YOUR COMPANY NAME").toUpperCase(), ML + 2, 17);

  // Tag line / address (left, small)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  const addressLine = [
    company?.address || "123, Business Park, Tech City",
    company?.phone   ? `Ph: ${company.phone}` : null,
    company?.email   ? company.email          : null,
  ].filter(Boolean).join("   |   ");
  doc.text(addressLine, ML + 2, 24);

  // GST & PAN (left)
  doc.setFontSize(7.5);
  doc.text(
    `GSTIN: ${company?.gst_number || "27AABCU9603R1ZM"}   |   PAN: ${company?.pan_number || "AABCU9603R"}   |   State: ${company?.state || "Maharashtra (27)"}`,
    ML + 2, 30
  );

  // "TAX INVOICE" label (right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...C.headerText);
  doc.text("TAX INVOICE", MR - 2, 16, { align: "right" });

  // Thin accent underline below tax invoice
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.6);
  doc.line(MR - 52, 18, MR - 2, 18);

  // Invoice meta (right)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const invNo = `INV-${String(bill.bill_id || bill.id || 1).padStart(5, "0")}`;
  doc.text(`Invoice No: ${invNo}`, MR - 2, 26, { align: "right" });
  doc.text(`Date: ${bill.bill_date ? new Date(bill.bill_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : today()}`, MR - 2, 32, { align: "right" });
  doc.text(`Due Date: ${dueDate(bill.bill_date)}`, MR - 2, 38, { align: "right" });

  // ═══════════════════════════════════════════════════════════
  // 2. BILLED TO / BILL FROM SECTION
  // ═══════════════════════════════════════════════════════════
  let y = 52;

  // Light background box for billing info
  doc.setFillColor(248, 250, 252);
  doc.rect(ML, y - 5, W - ML * 2, 38, "F");
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.rect(ML, y - 5, W - ML * 2, 38, "S");

  // Left column — BILL TO
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.accent);
  doc.text("BILL TO", ML + 5, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C.ink);
  doc.text(bill.employee_name || "Employee Name", ML + 5, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.muted);
  const empLines = [
    bill.designation || "Role / Designation",
    `Employee ID: EMP-${String(bill.employee_id || "001").padStart(4, "0")}`,
    `PAN: ${bill.pan_number || "N/A"}`,
    `Period: ${bill.bill_date ? new Date(bill.bill_date).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "N/A"}`,
  ];
  empLines.forEach((line, i) => doc.text(line, ML + 5, y + 14 + i * 5.5));

  // Right column — PAYMENT DETAILS
  const midX = W / 2 + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.accent);
  doc.text("PAYMENT STATUS", midX, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(22, 163, 74);
  doc.text("PAID", midX, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.muted);
  doc.text(`Days Worked : ${bill.present_days || 0} / ${bill.working_days || 0}`, midX, y + 14);
  doc.text(`Absent Days : ${bill.absent_days || 0} days`, midX, y + 20);
  doc.text(`Attendance  : ${bill.working_days > 0 ? ((bill.present_days / bill.working_days) * 100).toFixed(1) : 0}%`, midX, y + 26);

  y += 42;

  // ═══════════════════════════════════════════════════════════
  // 3. LINE ITEMS TABLE
  // ═══════════════════════════════════════════════════════════
  const grossSalary  = bill.monthly_salary      || 0;
  const perDayRate   = bill.per_day_salary       || (grossSalary / (bill.working_days || 30));
  const earnedSalary = perDayRate * (bill.present_days || 0);
  const deduction    = bill.deduction            || (perDayRate * (bill.absent_days || 0));
  const subtotal     = earnedSalary;

  // GST is applicable on service fees / professional charges
  const cgstAmt = subtotal * CGST_RATE;
  const sgstAmt = subtotal * SGST_RATE;
  const totalGST = cgstAmt + sgstAmt;
  const grandTotal = subtotal + totalGST;

  // We show net payable = bill.net_amount but also show GST for compliance
  const netPayable = bill.net_amount ?? grandTotal;

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: ML },
    head: [[
      "#",
      "Description",
      "HSN / SAC",
      "Rate/Day (Rs.)",
      "Days",
      "Amount (Rs.)",
    ]],
    body: [
      [
        "01",
        `Professional Employment Services\n${bill.designation || "Staff"}`,
        "998511",
        fmt(perDayRate),
        `${bill.present_days || 0}`,
        fmt(earnedSalary),
      ],
      [
        "02",
        `Deduction – Absent / LWP\n(${bill.absent_days || 0} day(s) unpaid)`,
        "998511",
        fmt(perDayRate),
        `(${bill.absent_days || 0})`,
        `(${fmt(deduction)})`,
      ],
    ],
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
      textColor: [...C.ink],
      font: "helvetica",
      lineColor: [...C.border],
      lineWidth: 0.2,
      valign: "middle",
    },
    headStyles: {
      fillColor: [...C.tableHead],
      textColor: [...C.tableHeadT],
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: 6,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 65 },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 30, halign: "right", fontStyle: "bold" },
    },
    theme: "grid",
  });

  y = doc.lastAutoTable.finalY + 4;

  // ═══════════════════════════════════════════════════════════
  // 4. TOTALS + GST SUMMARY BOX (right side)
  // ═══════════════════════════════════════════════════════════
  const summW  = 90;
  const summX  = MR - summW;
  const rowH   = 8;
  let   sy     = y + 2;

  // White box for totals
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.rect(summX, sy - 4, summW, rowH * 7 + 8, "FD");

  const drawRow = (label, value, bold = false, color = C.ink) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...color);
    doc.text(label, summX + 5,    sy + 1);
    doc.text(value, MR - 4,       sy + 1, { align: "right" });
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(summX, sy + rowH - 3, MR, sy + rowH - 3);
    sy += rowH;
  };

  drawRow("Earned Salary (Subtotal)",     `Rs. ${fmt(subtotal)}`);
  drawRow("CGST @ 9%",                    `Rs. ${fmt(cgstAmt)}`);
  drawRow("SGST @ 9%",                    `Rs. ${fmt(sgstAmt)}`);
  drawRow("Total GST (18%)",              `Rs. ${fmt(totalGST)}`, true, C.accent);
  drawRow("Other Deductions",             `(Rs. ${fmt(deduction)})`);

  // Grand total row (dark background)
  doc.setFillColor(...C.totalBg);
  doc.rect(summX, sy - 4, summW, rowH + 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("NET PAYABLE", summX + 5, sy + 3);
  doc.text(`Rs. ${fmt(netPayable)}`, MR - 4, sy + 3, { align: "right" });

  // ── Amount in words (below totals on left) ──
  sy += rowH + 6;
  const leftBlockW = summX - ML - 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.rect(ML, y + 2, leftBlockW, 22, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.accent);
  doc.text("AMOUNT IN WORDS", ML + 5, y + 10);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...C.ink);
  const words = numberToWords(netPayable);
  const wordLines = doc.splitTextToSize(`Indian Rupees ${words} Only`, leftBlockW - 10);
  wordLines.forEach((line, i) => doc.text(line, ML + 5, y + 16 + i * 5));

  y = Math.max(sy, y + 28) + 4;

  // ═══════════════════════════════════════════════════════════
  // 5. GST TAX SUMMARY TABLE (HSN-wise — mandatory for GST)
  // ═══════════════════════════════════════════════════════════
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.ink);
  doc.text("GST TAX SUMMARY (HSN / SAC WISE)", ML, y + 4);

  autoTable(doc, {
    startY: y + 7,
    margin: { left: ML, right: ML },
    head: [["HSN/SAC", "Description", "Taxable Value", "CGST Rate", "CGST Amt", "SGST Rate", "SGST Amt", "Total GST"]],
    body: [[
      "998511",
      "Employment & Payroll Services",
      `Rs. ${fmt(subtotal)}`,
      "9%",
      `Rs. ${fmt(cgstAmt)}`,
      "9%",
      `Rs. ${fmt(sgstAmt)}`,
      `Rs. ${fmt(totalGST)}`,
    ]],
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [...C.ink],
      lineColor: [...C.border],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [...C.tableHead],
      textColor: [...C.tableHeadT],
      fontStyle: "bold",
      fontSize: 7,
      cellPadding: 4,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    theme: "grid",
  });

  y = doc.lastAutoTable.finalY + 6;

  // ═══════════════════════════════════════════════════════════
  // 6. BANK DETAILS + TERMS + SIGNATURE
  // ═══════════════════════════════════════════════════════════
  const colW   = (W - ML * 2 - 6) / 3;
  const bankX  = ML;
  const termsX = ML + colW + 3;
  const sigX   = ML + colW * 2 + 6;
  const blockH = 42;

  // Bank Details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...C.border);
  doc.rect(bankX, y, colW, blockH, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.accent);
  doc.text("BANK DETAILS", bankX + 5, y + 7);

  const bankLines = [
    [`Bank Name:`,    company?.bank_name    || "State Bank of India"],
    [`A/C No:`,       company?.bank_account || "123456789012"],
    [`IFSC:`,         company?.ifsc_code    || "SBIN0001234"],
    [`Branch:`,       company?.bank_branch  || "Main Branch"],
    [`A/C Type:`,     "Current Account"],
  ];
  bankLines.forEach(([lbl, val], i) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(lbl, bankX + 5, y + 14 + i * 5.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.ink);
    doc.text(val, bankX + 22, y + 14 + i * 5.5);
  });

  // Terms & Conditions
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...C.border);
  doc.rect(termsX, y, colW, blockH, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.accent);
  doc.text("TERMS & CONDITIONS", termsX + 5, y + 7);

  const terms = [
    "1. Payment due within 7 days of invoice.",
    "2. Late payment attracts 1.5% monthly.",
    "3. This is a computer-generated invoice.",
    "4. Subject to local jurisdiction only.",
    "5. GST registered under GSTIN above.",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  terms.forEach((t, i) => doc.text(t, termsX + 5, y + 14 + i * 5.5));

  // Authorized Signature
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...C.border);
  doc.rect(sigX, y, colW, blockH, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.accent);
  doc.text("FOR " + (company?.name || "COMPANY NAME").toUpperCase(), sigX + 5, y + 7);

  // Signature line
  doc.setDrawColor(...C.muted);
  doc.setLineWidth(0.4);
  doc.line(sigX + 5, y + 32, sigX + colW - 5, y + 32);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.ink);
  doc.text("Authorized Signatory", sigX + 5, y + 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.muted);
  doc.text("(Stamp & Signature)", sigX + 5, y + 43);

  y += blockH + 6;

  // ═══════════════════════════════════════════════════════════
  // 7. PAID WATERMARK STAMP
  // ═══════════════════════════════════════════════════════════
  doc.setFont("helvetica", "bold");
  doc.setFontSize(52);
  doc.setTextColor(22, 163, 74, 0.08); // very transparent green
  doc.text("PAID", W / 2, 160, { align: "center", angle: 35 });

  // ═══════════════════════════════════════════════════════════
  // 8. FOOTER BAND
  // ═══════════════════════════════════════════════════════════
  doc.setFillColor(...C.headerBg);
  doc.rect(0, H - 18, W, 18, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "This is a system-generated GST Tax Invoice and does not require a physical signature unless stamped above.",
    W / 2, H - 11, { align: "center" }
  );
  doc.text(
    `${company?.name || "BillFlow"} | GSTIN: ${company?.gst_number || "N/A"} | Generated: ${today()} | Page 1 of 1`,
    W / 2, H - 5, { align: "center" }
  );

  // ── Thin accent bar at absolute top ──
  doc.setFillColor(...C.accent);
  doc.rect(0, 0, W, 2, "F");
}

// ── Number to Words (Indian system) ────────────────────────────────────────
function numberToWords(amount) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n) {
    if (n < 20)      return ones[n];
    if (n < 100)     return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000)  return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000)return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }

  const rupees = Math.floor(amount);
  const paise  = Math.round((amount - rupees) * 100);
  let result   = rupees > 0 ? convert(rupees) : "Zero";
  if (paise > 0) result += ` and ${convert(paise)} Paise`;
  return result;
}
