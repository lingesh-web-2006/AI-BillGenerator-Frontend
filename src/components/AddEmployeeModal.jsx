import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { api } from "../utils/api";

export default function AddEmployeeModal({ companyId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    designation: "",
    monthly_salary: "",
    attendance_present: "0",
    attendance_absent: "0",
    working_days: "30",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!form.name || !form.email || !form.monthly_salary) {
      setError("Please fill in all required fields (Name, Email, Salary).");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        company_id: companyId,
        monthly_salary: parseFloat(form.monthly_salary),
        attendance_present: parseInt(form.attendance_present) || 0,
        attendance_absent: parseInt(form.attendance_absent) || 0,
        working_days: parseInt(form.working_days) || 30,
      };
      await api.employees.create(payload);
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to create employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, backdropFilter: "blur(4px)",
    }}>
      <div className="card fade-in" style={{ width: "100%", maxWidth: 480, position: "relative" }}>
        {/* Modal header */}
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="avatar" style={{ background: "var(--accent-dim)" }}>
              <UserPlus size={18} />
            </div>
            <div>
              <div className="card-title">Add New Employee</div>
              <div className="card-subtitle">Enter employee details for the roster</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} type="button">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="input"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="input"
              value={form.email}
              onChange={handleChange}
              placeholder="jane.doe@company.com"
            />
          </div>

          <div className="grid-2" style={{ gap: "16px", marginBottom: "20px" }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Designation</label>
              <input
                type="text"
                name="designation"
                className="input"
                value={form.designation}
                onChange={handleChange}
                placeholder="Product Manager"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Monthly Salary (₹) *</label>
              <input
                type="number"
                name="monthly_salary"
                className="input"
                value={form.monthly_salary}
                onChange={handleChange}
                placeholder="60000"
              />
            </div>
          </div>

          <div className="grid-3" style={{ gap: "12px", marginBottom: "20px" }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Present Days</label>
              <input
                type="number"
                name="attendance_present"
                className="input"
                value={form.attendance_present}
                onChange={handleChange}
                placeholder="e.g. 26"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Absent Days</label>
              <input
                type="number"
                name="attendance_absent"
                className="input"
                value={form.attendance_absent}
                onChange={handleChange}
                placeholder="e.g. 4"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Total Days</label>
              <input
                type="number"
                name="working_days"
                className="input"
                value={form.working_days}
                onChange={handleChange}
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex gap-3" style={{ marginTop: "24px" }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
              disabled={loading}
            >
              {loading ? <><div className="spinner" /> Saving…</> : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
