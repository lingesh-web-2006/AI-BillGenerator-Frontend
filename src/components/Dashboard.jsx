/**
 * Dashboard.jsx — Summary statistics and overview
 */

import React from "react";
import { Users, FileText, TrendingUp, AlertCircle } from "lucide-react";

export default function Dashboard({ employees, bills }) {
  const totalEmployees  = employees.length;
  const totalBills      = bills.length;
  const totalPaid       = bills.reduce((s, b) => s + b.amount, 0);
  const avgAttendance   = employees.length
    ? (
        employees.reduce((s, e) => s + (e.attendance_present / (e.working_days || 30)) * 100, 0) /
        employees.length
      ).toFixed(1)
    : 0;

  return (
    <div>
      <div className="section-heading">Dashboard</div>
      <div className="section-sub">Company payroll overview at a glance</div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-label">Total Employees</div>
              <div className="stat-value">{totalEmployees}</div>
              <div className="stat-sub">Active workforce</div>
            </div>
            <Users size={28} color="var(--accent)" opacity={0.4} />
          </div>
        </div>

        <div className="stat-card green">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-label">Bills Generated</div>
              <div className="stat-value">{totalBills}</div>
              <div className="stat-sub">All time</div>
            </div>
            <FileText size={28} color="var(--success)" opacity={0.4} />
          </div>
        </div>

        <div className="stat-card amber">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-label">Total Paid Out</div>
              <div className="stat-value" style={{ fontSize: "1.3rem" }}>
                ₹{(totalPaid / 1000).toFixed(1)}k
              </div>
              <div className="stat-sub">Across all bills</div>
            </div>
            <TrendingUp size={28} color="var(--warning)" opacity={0.4} />
          </div>
        </div>

        <div className="stat-card green">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-label">Avg Attendance</div>
              <div className="stat-value">{avgAttendance}%</div>
              <div className="stat-sub">Company average</div>
            </div>
            <AlertCircle size={28} color="var(--success)" opacity={0.4} />
          </div>
        </div>
      </div>

      {/* Recent bills */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Bills</div>
            <div className="card-subtitle">Latest 5 generated payslips</div>
          </div>
        </div>

        {bills.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
            No bills generated yet. Use Voice Bills to get started.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Deduction</th>
                  <th>Net Amount</th>
                </tr>
              </thead>
              <tbody>
                {bills.slice(0, 5).map((b) => (
                  <tr key={b.id} className="fade-in">
                    <td className="td-mono text-accent">#{b.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.employee_name}</div>
                      <div className="td-secondary">{b.designation}</div>
                    </td>
                    <td className="td-secondary">{b.bill_date}</td>
                    <td className="text-danger td-mono">- ₹{b.deduction?.toFixed(2)}</td>
                    <td className="text-success td-mono font-bold">
                      ₹{b.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
