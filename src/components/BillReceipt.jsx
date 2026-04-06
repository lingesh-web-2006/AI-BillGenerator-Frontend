/**
 * BillReceipt.jsx
 * Professional GST Tax Invoice preview panel.
 * Mirrors the PDF layout for on-screen display.
 */

import React, { useMemo } from "react";
import { Download, CheckCircle, Building2, CreditCard, FileText, Printer } from "lucide-react";
import { generateBillPDF } from "../utils/pdfGenerator";

// ── Constants ────────────────────────────────────────────────────────────────
const CGST_RATE = 0.09;
const SGST_RATE = 0.09;

function fmt(n, dec = 2) {
  return Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

function numberToWords(amount) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
    "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function convert(n) {
    if (n < 20)       return ones[n];
    if (n < 100)      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)     return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000)   return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }
  const rupees = Math.floor(amount);
  const paise  = Math.round((amount - rupees) * 100);
  let result   = rupees > 0 ? convert(rupees) : "Zero";
  if (paise > 0) result += ` and ${convert(paise)} Paise`;
  return `Indian Rupees ${result} Only`;
}

// ── Sub-components ───────────────────────────────────────────────────────────
function InfoRow({ label, value, mono = false, danger = false, accent = false }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: "0.85rem",
    }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{
        fontFamily: mono ? "var(--font-mono)" : "inherit",
        fontWeight: 600,
        color: danger ? "var(--danger)" : accent ? "var(--accent)" : "var(--text-primary)",
      }}>{value}</span>
    </div>
  );
}

function SectionHeading({ icon: Icon, title }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 20px", borderBottom: "1px solid var(--border)",
      background: "rgba(99,102,241,0.06)",
    }}>
      <Icon size={14} color="var(--accent)" />
      <span style={{
        fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--accent)",
      }}>{title}</span>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function BillReceipt({ bill, company, onClose }) {
  if (!bill) return null;

  const {
    perDayRate, earnedSalary, deduction,
    cgstAmt, sgstAmt, totalGST, subtotal, netPayable, attendance,
  } = useMemo(() => {
    const grossSalary  = bill.monthly_salary || 0;
    const perDayRate   = bill.per_day_salary || (grossSalary / (bill.working_days || 30));
    const earnedSalary = perDayRate * (bill.present_days || 0);
    const deduction    = bill.deduction || (perDayRate * (bill.absent_days || 0));
    const subtotal     = earnedSalary;
    const cgstAmt      = subtotal * CGST_RATE;
    const sgstAmt      = subtotal * SGST_RATE;
    const totalGST     = cgstAmt + sgstAmt;
    const netPayable   = bill.net_amount ?? (subtotal + totalGST - deduction);
    const attendance   = bill.working_days > 0
      ? ((bill.present_days / bill.working_days) * 100).toFixed(1) : 0;
    return { perDayRate, earnedSalary, deduction, cgstAmt, sgstAmt, totalGST, subtotal, netPayable, attendance };
  }, [bill]);

  const invNo = `INV-${String(bill.bill_id || bill.id || 1).padStart(5, "0")}`;
  const empId = `EMP-${String(bill.employee_id || "001").padStart(4, "0")}`;
  const billDate = bill.bill_date
    ? new Date(bill.bill_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "N/A";
  const period = bill.bill_date
    ? new Date(bill.bill_date).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "N/A";

  return (
    <div className="fade-in" style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* ── WATERMARK ── */}
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none", zIndex: 0,
        transform: "rotate(-35deg)",
        fontSize: "6rem", fontWeight: 900,
        color: "rgba(22,163,74,0.05)",
        fontFamily: "var(--font-display)",
        letterSpacing: 12,
      }}>PAID</div>

      {/* ── HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        padding: "20px 24px 16px",
        position: "relative", zIndex: 1,
        borderBottom: "3px solid var(--accent)",
      }}>
        {/* Top accent line */}
        <div style={{ height: 3, background: "var(--accent)", borderRadius: 2, marginBottom: 16 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* Left — Company */}
          <div>
            <div style={{
              fontFamily: "var(--font-display)", fontSize: "1.2rem",
              fontWeight: 800, color: "#F1F5F9", letterSpacing: "0.03em",
            }}>
              {(company?.name || "vips Tech").toUpperCase()}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 4, lineHeight: 1.7 }}>
              {company?.address || "redhills chennai 52"}<br />
              {company?.phone && `Ph: ${company.phone}`}
              {company?.phone && company?.email && " | "}
              {company?.email}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: 4, fontFamily: "var(--font-mono)" }}>
              GSTIN: {company?.gst_number || "27AABCU9603R1ZM"} &nbsp;|&nbsp; PAN: {company?.pan_number || "AABCU9603R"} &nbsp;|&nbsp; State: {company?.state || "Tamil Nadu (TN)"}
            </div>
          </div>

          {/* Right — TAX INVOICE badge */}
          <div style={{ textAlign: "right" }}>
            <div style={{
              display: "inline-block",
              background: "var(--accent)",
              color: "#fff",
              fontSize: "0.75rem", fontWeight: 800,
              letterSpacing: "0.12em",
              padding: "5px 14px",
              borderRadius: 6,
              marginBottom: 10,
            }}>TAX INVOICE</div>
            <div style={{ fontSize: "0.72rem", color: "#94A3B8", fontFamily: "var(--font-mono)", lineHeight: 1.9 }}>
              <div><span style={{ color: "#64748B" }}>Invoice No: </span><strong style={{ color: "#E2E8F0" }}>{invNo}</strong></div>
              <div><span style={{ color: "#64748B" }}>Date: </span>{billDate}</div>
              <div>
                <span style={{ color: "#64748B" }}>Status: </span>
                <span style={{ color: "#22C55E", fontWeight: 700 }}>✓ PAID</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BILLED TO / ATTENDANCE ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        borderBottom: "1px solid var(--border)",
        position: "relative", zIndex: 1,
      }}>
        {/* Billed To */}
        <div style={{ padding: "16px 24px", borderRight: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>
            BILLED TO
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {bill.employee_name}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 3 }}>{bill.designation}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6, lineHeight: 1.8, fontFamily: "var(--font-mono)" }}>
            <div>Employee ID: {empId}</div>
            <div>PAN: {bill.pan_number || "N/A"}</div>
            <div>Period: {period}</div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div style={{ padding: "16px 24px" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>
            ATTENDANCE SUMMARY
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
            {[
              ["Working Days", `${bill.working_days || 0} days`, false],
              ["Days Present", `${bill.present_days || 0} days`, false, "var(--success)"],
              ["Days Absent", `${bill.absent_days || 0} days`, false, "var(--danger)"],
              ["Attendance %", `${attendance}%`, false, Number(attendance) >= 90 ? "var(--success)" : "var(--warning)"],
            ].map(([lbl, val, , color]) => (
              <div key={lbl}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 2 }}>{lbl}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.85rem", color: color || "var(--text-primary)" }}>{val}</div>
              </div>
            ))}
          </div>
          {/* Attendance bar */}
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                width: `${attendance}%`,
                background: Number(attendance) >= 90
                  ? "var(--success)"
                  : Number(attendance) >= 75
                  ? "var(--warning)"
                  : "var(--danger)",
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── LINE ITEMS ── */}
      <SectionHeading icon={FileText} title="Service Details" />
      <div style={{ overflowX: "auto", position: "relative", zIndex: 1 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ background: "rgba(30,41,59,0.8)" }}>
              {["#", "Description", "HSN/SAC", "Rate / Day", "Days", "Amount"].map((h) => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: h === "#" || h === "Days" ? "center" : h === "Rate / Day" || h === "Amount" ? "right" : "left",
                  fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--text-muted)", fontWeight: 700, borderBottom: "1px solid var(--border)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ textAlign: "center", padding: "12px 16px", color: "var(--text-muted)" }}>01</td>
              <td style={{ padding: "12px 16px" }}>
                <div style={{ fontWeight: 600 }}>Professional Employment Services</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{bill.designation || "Staff"} – Salary for {period}</div>
              </td>
              <td style={{ textAlign: "center", padding: "12px 16px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>998511</td>
              <td style={{ textAlign: "right", padding: "12px 16px", fontFamily: "var(--font-mono)" }}>₹ {fmt(perDayRate)}</td>
              <td style={{ textAlign: "center", padding: "12px 16px", fontFamily: "var(--font-mono)" }}>{bill.present_days || 0}</td>
              <td style={{ textAlign: "right", padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>₹ {fmt(earnedSalary)}</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(244,63,94,0.03)" }}>
              <td style={{ textAlign: "center", padding: "12px 16px", color: "var(--text-muted)" }}>02</td>
              <td style={{ padding: "12px 16px" }}>
                <div style={{ fontWeight: 600, color: "var(--danger)" }}>Deduction – Absent / LWP</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{bill.absent_days || 0} day(s) × ₹{fmt(perDayRate)} per day</div>
              </td>
              <td style={{ textAlign: "center", padding: "12px 16px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>998511</td>
              <td style={{ textAlign: "right", padding: "12px 16px", fontFamily: "var(--font-mono)" }}>₹ {fmt(perDayRate)}</td>
              <td style={{ textAlign: "center", padding: "12px 16px", fontFamily: "var(--font-mono)", color: "var(--danger)" }}>({bill.absent_days || 0})</td>
              <td style={{ textAlign: "right", padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--danger)" }}>- ₹ {fmt(deduction)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── TOTALS + GST ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        borderTop: "1px solid var(--border)",
        position: "relative", zIndex: 1,
      }}>
        {/* Left — amount in words */}
        <div style={{ padding: "16px 24px", borderRight: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>
            AMOUNT IN WORDS
          </div>
          <div style={{
            fontStyle: "italic", fontSize: "0.8rem", color: "var(--text-secondary)",
            lineHeight: 1.6, borderLeft: "3px solid var(--accent)", paddingLeft: 12,
          }}>
            {numberToWords(netPayable)}
          </div>
        </div>

        {/* Right — totals */}
        <div style={{ padding: "16px 24px" }}>
          {[
            { label: "Subtotal (Earned Salary)", value: `₹ ${fmt(subtotal)}` },
            { label: `CGST @ 9% (SAC 998511)`,  value: `₹ ${fmt(cgstAmt)}`, accent: true },
            { label: `SGST @ 9% (SAC 998511)`,  value: `₹ ${fmt(sgstAmt)}`, accent: true },
            { label: "Deductions",               value: `- ₹ ${fmt(deduction)}`, danger: true },
          ].map(({ label, value, accent, danger }) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between",
              padding: "6px 0", borderBottom: "1px solid var(--border)",
              fontSize: "0.8rem",
            }}>
              <span style={{ color: "var(--text-secondary)" }}>{label}</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontWeight: 600,
                color: danger ? "var(--danger)" : accent ? "var(--accent)" : "var(--text-primary)",
              }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── GRAND TOTAL ── */}
      <div style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        padding: "18px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "2px solid var(--accent)",
        position: "relative", zIndex: 1,
      }}>
        <div>
          <div style={{ fontSize: "0.65rem", color: "#64748B", letterSpacing: "0.1em", fontWeight: 700 }}>NET PAYABLE AMOUNT</div>
          <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: 3, fontFamily: "var(--font-mono)" }}>
            Total GST: ₹ {fmt(cgstAmt + sgstAmt)} &nbsp;|&nbsp; HSN: 998511
          </div>
        </div>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: "1.8rem",
          fontWeight: 900, color: "var(--accent)",
        }}>
          ₹ {fmt(netPayable)}
        </div>
      </div>

      {/* ── GST SUMMARY TABLE ── */}
      <SectionHeading icon={FileText} title="GST Tax Summary (HSN/SAC Wise)" />
      <div style={{ overflowX: "auto", position: "relative", zIndex: 1 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
          <thead>
            <tr style={{ background: "rgba(30,41,59,0.6)" }}>
              {["HSN/SAC", "Description", "Taxable Value", "CGST @ 9%", "SGST @ 9%", "Total GST"].map((h) => (
                <th key={h} style={{
                  padding: "8px 14px", textAlign: "center",
                  color: "var(--text-muted)", fontWeight: 700,
                  fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase",
                  borderBottom: "1px solid var(--border)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: "rgba(99,102,241,0.04)", borderBottom: "1px solid var(--border)" }}>
              <td style={{ textAlign: "center", padding: "10px 14px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>998511</td>
              <td style={{ textAlign: "center", padding: "10px 14px", color: "var(--text-secondary)" }}>Employment & Payroll Services</td>
              <td style={{ textAlign: "center", padding: "10px 14px", fontFamily: "var(--font-mono)" }}>₹ {fmt(subtotal)}</td>
              <td style={{ textAlign: "center", padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--accent)" }}>₹ {fmt(cgstAmt)}</td>
              <td style={{ textAlign: "center", padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--accent)" }}>₹ {fmt(sgstAmt)}</td>
              <td style={{ textAlign: "center", padding: "10px 14px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)" }}>₹ {fmt(cgstAmt + sgstAmt)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── BANK DETAILS ── */}
      <SectionHeading icon={CreditCard} title="Bank Details" />
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 0, borderBottom: "1px solid var(--border)",
        position: "relative", zIndex: 1,
      }}>
        {[
          ["Bank Name",  company?.bank_name    || "State Bank of India"],
          ["A/C Number", company?.bank_account || "XXXX XXXX XXXX"],
          ["IFSC Code",  company?.ifsc_code    || "SBIN0001234"],
          ["Branch",     company?.bank_branch  || "Main Branch"],
          ["A/C Type",   "Current Account"],
          ["UPI ID",     company?.upi_id       || "company@upi"],
        ].map(([lbl, val], i) => (
          <div key={lbl} style={{
            padding: "12px 20px",
            borderRight: i % 3 !== 2 ? "1px solid var(--border)" : "none",
            borderBottom: i < 3 ? "1px solid var(--border)" : "none",
          }}>
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{lbl}</div>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{val}</div>
          </div>
        ))}
      </div>

      {/* ── TERMS + SIGNATURE ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        position: "relative", zIndex: 1,
        borderBottom: "1px solid var(--border)",
      }}>
        {/* Terms */}
        <div style={{ padding: "16px 24px", borderRight: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 10 }}>
            TERMS & CONDITIONS
          </div>
          {[
            "Payment due within 7 days of this invoice.",
            "Late payment attracts 1.5% interest per month.",
            "This is a computer-generated GST tax invoice.",
            "Subject to local jurisdiction laws only.",
            "GST registered as per government norms.",
          ].map((t, i) => (
            <div key={i} style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginBottom: 5, paddingLeft: 12, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "var(--accent)" }}>›</span>
              {t}
            </div>
          ))}
        </div>

        {/* Authorized Signature */}
        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>
              FOR {(company?.name || "COMPANY NAME").toUpperCase()}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              This invoice is digitally validated. A physical stamp and signature is required on the printed copy for legal compliance.
            </div>
          </div>
          <div>
            <div style={{
              borderTop: "2px solid var(--border-light)", paddingTop: 8, marginTop: 28,
            }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>Authorized Signatory</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>(Stamp & Signature)</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ACTIONS ── */}
      <div style={{
        display: "flex", gap: 12, padding: "14px 24px",
        background: "rgba(15,23,42,0.5)",
        justifyContent: "space-between", alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          ✓ GST Compliant &nbsp;|&nbsp; CGST + SGST @ 18% &nbsp;|&nbsp; HSN 998511
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {onClose && (
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              Close
            </button>
          )}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => generateBillPDF(bill, company)}
            id="download-invoice-pdf"
          >
            <Download size={14} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
