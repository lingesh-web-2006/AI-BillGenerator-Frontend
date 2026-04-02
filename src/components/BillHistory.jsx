/**
 * BillHistory.jsx — All generated bills with PDF download
 */

import React, { useState } from "react";
import { Download, Search, Trash2 } from "lucide-react";
import { generateBillPDF } from "../utils/pdfGenerator";
import { api } from "../utils/api";
import ConfirmModal from "./ConfirmModal";

export default function BillHistory({ bills, loading, onRefresh }) {
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(false);
  
  // Modal state
  const [modal, setModal] = useState({ open: false, type: "single", id: null });

  const handleRemove = async (id) => {
    try {
      if (id) await api.bills.remove(id);
      else await api.bills.clearAll();
      onRefresh?.();
    } catch (err) {
      alert("Failed to perform action: " + err.message);
    }
  };

  const openDeleteModal = (id = null) => {
    setModal({ open: true, type: id ? "single" : "bulk", id });
  };

  const filtered = bills.filter((b) =>
    b.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.bill_date?.includes(search) ||
    String(b.id).includes(search)
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
        <div className="spinner" style={{ margin: "0 auto 12px" }} />
        Loading bills…
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="section-heading">Bill History</div>
          <div className="section-sub" style={{ margin: 0 }}>All generated payslips stored in the database</div>
        </div>
        {bills.length > 0 && (
          <button 
            className="btn btn-ghost text-error" 
            onClick={() => openDeleteModal()}
            disabled={deleting}
            style={{ color: "var(--error)", fontSize: '0.8rem' }}
          >
            {deleting ? <div className="spinner" /> : <Trash2 size={14} />}
            Clear All History
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card mb-6" style={{ marginBottom: 24, padding: "16px 20px" }}>
        <div style={{ position: "relative" }}>
          <Search
            size={15}
            style={{
              position: "absolute", left: 12, top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by name, date, or bill ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            {bills.length === 0 ? "No bills generated yet." : "No results match your search."}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Employee</th>
                  <th>Bill Date</th>
                  <th>Working Days</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Deduction</th>
                  <th>Net Amount</th>
                  <th>Status</th>
                  <th>Generated</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="fade-in">
                    <td className="td-mono text-accent">#{b.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.employee_name}</div>
                      <div className="td-secondary" style={{ fontSize: "0.75rem" }}>{b.designation}</div>
                    </td>
                    <td className="td-secondary">{b.bill_date}</td>
                    <td className="td-secondary">{b.working_days}d</td>
                    <td><span className="badge badge-green">{b.present_days}d</span></td>
                    <td>
                      <span className={`badge ${b.absent_days > 3 ? "badge-red" : "badge-amber"}`}>
                        {b.absent_days}d
                      </span>
                    </td>
                    <td className="text-danger td-mono">- ₹{Number(b.deduction).toFixed(2)}</td>
                    <td className="text-success td-mono font-bold">
                      ₹{Number(b.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className="badge badge-green">
                        {b.status || "PAID"}
                      </span>
                    </td>
                    <td className="td-secondary" style={{ fontSize: "0.72rem" }}>
                      {new Date(b.generated_at).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="flex gap-2 justify-end">
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Download PDF"
                          onClick={() =>
                            generateBillPDF({
                              bill_id: b.id,
                              employee_name: b.employee_name,
                              designation: b.designation,
                              email: b.email,
                              monthly_salary: b.monthly_salary,
                              working_days: b.working_days,
                              present_days: b.present_days,
                              absent_days: b.absent_days,
                              per_day_salary: b.monthly_salary / (b.working_days || 30),
                              deduction: b.deduction,
                              net_amount: b.amount,
                              bill_date: b.bill_date,
                              generated_at: b.generated_at,
                              notes: b.notes,
                            })
                          }
                        >
                          <Download size={13} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm text-error"
                          title="Delete Record"
                          onClick={() => openDeleteModal(b.id)}
                          style={{ color: "var(--error)" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        onConfirm={() => handleRemove(modal.id)}
        title={modal.type === "bulk" ? "Clear All History" : "Delete Bill"}
        message={
          modal.type === "bulk" 
            ? "Are you sure you want to delete ALL bill history? This action cannot be undone."
            : `Are you sure you want to delete Bill #${modal.id}?`
        }
        confirmText={modal.type === "bulk" ? "Clear All" : "Delete"}
        type="danger"
      />

      {/* Summary footer */}
      {filtered.length > 0 && (
        <div style={{
          marginTop: 16,
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          textAlign: "right",
          fontFamily: "var(--font-mono)",
        }}>
          {filtered.length} bill{filtered.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
          Total paid: ₹{filtered.reduce((s, b) => s + b.amount, 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
      )}
    </div>
  );
}
