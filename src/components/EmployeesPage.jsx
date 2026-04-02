/**
 * EmployeesPage.jsx — Employee list with bill generation modal
 */

import React, { useState } from "react";
import EmployeeTable from "./EmployeeTable";
import BillReceipt from "./BillReceipt";
import { api } from "../utils/api";
import { X } from "lucide-react";

export default function EmployeesPage({ employees, loading, onBillGenerated }) {
  const [selectedEmp,  setSelectedEmp]  = useState(null);
  const [bill,         setBill]         = useState(null);
  const [generating,   setGenerating]   = useState(false);
  const [error,        setError]        = useState(null);
  const [billDate,     setBillDate]     = useState(new Date().toISOString().slice(0, 10));
  const [notes,        setNotes]        = useState("");

  const openModal = (emp) => {
    setSelectedEmp(emp);
    setBill(null);
    setError(null);
    setNotes("");
  };

  const closeModal = () => {
    setSelectedEmp(null);
    setBill(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedEmp) return;
    setGenerating(true);
    setError(null);

    try {
      const data = await api.bills.generate({
        employee_id: selectedEmp.id,
        bill_date:   billDate,
        notes,
      });
      setBill(data);
      onBillGenerated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="section-heading">Employees</div>
      <div className="section-sub">
        Manage employee records, view salary & attendance, and generate payslips.
      </div>

      <div className="card">
        <EmployeeTable
          employees={employees}
          loading={loading}
          onGenerateBill={openModal}
        />
      </div>

      {/* Modal */}
      {selectedEmp && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 200, backdropFilter: "blur(4px)",
        }}>
          <div className="card fade-in" style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            {/* Modal header */}
            <div className="card-header">
              <div>
                <div className="card-title">Generate Bill — {selectedEmp.name}</div>
                <div className="card-subtitle">{selectedEmp.designation}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                <X size={14} />
              </button>
            </div>

            {!bill ? (
              <>
                {error && (
                  <div className="alert alert-error mb-4" style={{ marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                {/* Salary preview */}
                <div style={{
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  marginBottom: 20,
                }}>
                  <div className="flex justify-between" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Gross Salary</span>
                    <span className="td-mono text-accent">₹{selectedEmp.monthly_salary.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Present</span>
                    <span className="badge badge-green">{selectedEmp.attendance_present} days</span>
                  </div>
                  <div className="flex justify-between" style={{ justifyContent: "space-between" }}>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Absent</span>
                    <span className={`badge ${selectedEmp.attendance_absent > 3 ? "badge-red" : "badge-amber"}`}>
                      {selectedEmp.attendance_absent} days
                    </span>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Bill Date</label>
                  <input
                    type="date"
                    className="input"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Notes (optional)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. April salary, performance bonus included"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary w-full"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating
                    ? <><div className="spinner" /> Generating…</>
                    : "Generate & Save Bill"}
                </button>
              </>
            ) : (
              <BillReceipt bill={bill} onClose={closeModal} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
