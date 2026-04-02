/**
 * EmployeeTable.jsx — Displays all employees with salary & attendance
 */

import React, { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AttendancePct({ present, total }) {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const cls  = pct >= 90 ? "badge-green" : pct >= 75 ? "badge-amber" : "badge-red";
  return (
    <div className="flex items-center gap-2">
      <div className="attendance-bar">
        <div className="attendance-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className={`badge ${cls}`}>{pct}%</span>
    </div>
  );
}

export default function EmployeeTable({ employees, onGenerateBill, onDeleteEmployee, loading }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
        <div className="spinner" style={{ margin: "0 auto 12px" }} />
        Loading employees…
      </div>
    );
  }

  if (!employees.length) {
    return (
      <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
        No employees found.
      </div>
    );
  }

  const openDeleteModal = (emp) => {
    setSelected(emp);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selected) onDeleteEmployee(selected.id);
  };

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Designation</th>
            <th>Monthly Salary</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Attendance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="fade-in">
              <td>
                <div className="flex items-center gap-2">
                  <div className="avatar">{getInitials(emp.name)}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{emp.name}</div>
                    <div className="td-secondary">{emp.email}</div>
                  </div>
                </div>
              </td>
              <td className="td-secondary">{emp.designation}</td>
              <td>
                <span className="td-mono text-accent">
                  ₹{emp.monthly_salary.toLocaleString("en-IN")}
                </span>
              </td>
              <td>
                <span className="badge badge-green">{emp.attendance_present}d</span>
              </td>
              <td>
                <span className={`badge ${emp.attendance_absent > 3 ? "badge-red" : "badge-amber"}`}>
                  {emp.attendance_absent}d
                </span>
              </td>
              <td>
                <AttendancePct
                  present={emp.attendance_present}
                  total={emp.working_days}
                />
              </td>
              <td>
                <div className="flex gap-2">
                  {onGenerateBill && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onGenerateBill(emp)}
                    >
                      <FileText size={13} />
                      Bill
                    </button>
                  )}
                  {onDeleteEmployee && (
                    <button
                      className="btn btn-ghost btn-sm text-error"
                      onClick={() => openDeleteModal(emp)}
                      style={{ color: "var(--error)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        message={`Are you sure you want to remove ${selected?.name}? This will permanently delete their record.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
