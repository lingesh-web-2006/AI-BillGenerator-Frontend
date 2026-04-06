/**
 * BillReceipt.jsx — Displays a generated bill with PDF download
 */

import React from "react";
import { Download, CheckCircle } from "lucide-react";
import { generateBillPDF } from "../utils/pdfGenerator";

export default function BillReceipt({ bill, onClose }) {
  if (!bill) return null;

  const attendance = bill.working_days > 0
    ? ((bill.present_days / bill.working_days) * 100).toFixed(1)
    : 0;

  return (
    <div className="bill-receipt fade-in">
      {/* Header */}
      <div className="bill-receipt-header">
        <div>
          <div className="flex items-center gap-2 mb-4" style={{ marginBottom: 6 }}>
            <CheckCircle size={16} color="var(--success)" />
            <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 600 }}>
              Bill Generated & Saved
            </span>
            <span className="badge badge-green ml-2" style={{ fontSize: "0.65rem", padding: "2px 8px" }}>
              PAID
            </span>
          </div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "var(--text-primary)",
          }}>
            {bill.employee_name}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>
            {bill.designation}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-mono)" }}>
            Bill #{bill.bill_id}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {bill.bill_date}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bill-receipt-body">
        <div className="bill-line">
          <span className="bill-line-label">Gross Monthly Salary</span>
          <span className="bill-line-value">₹ {bill.monthly_salary?.toLocaleString("en-IN")}</span>
        </div>
        <div className="bill-line">
          <span className="bill-line-label">Working Days</span>
          <span className="bill-line-value">{bill.working_days} days</span>
        </div>
        <div className="bill-line">
          <span className="bill-line-label">Days Present</span>
          <span className="bill-line-value text-success">{bill.present_days} days ({attendance}%)</span>
        </div>
        <div className="bill-line">
          <span className="bill-line-label">Days Absent</span>
          <span className="bill-line-value text-danger">{bill.absent_days} days</span>
        </div>
        <div className="bill-line">
          <span className="bill-line-label">Per Day Rate</span>
          <span className="bill-line-value text-mono">₹ {bill.per_day_salary?.toFixed(2)}</span>
        </div>
        <div className="bill-line">
          <span className="bill-line-label">Deduction ({bill.absent_days}d × ₹{bill.per_day_salary?.toFixed(2)})</span>
          <span className="bill-line-value text-danger">- ₹ {bill.deduction?.toFixed(2)}</span>
        </div>
        {bill.notes && (
          <div className="bill-line">
            <span className="bill-line-label">Notes</span>
            <span className="bill-line-value" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              {bill.notes}
            </span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bill-total">
        <span className="bill-total-label">NET PAYABLE</span>
        <span className="bill-total-value">₹ {bill.net_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3" style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
        <button className="btn btn-primary" onClick={() => generateBillPDF(bill, company)}>
          <Download size={14} /> Download PDF
        </button>
        {onClose && (
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    </div>
  );
}
