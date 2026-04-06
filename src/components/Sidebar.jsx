/**
 * Sidebar.jsx — Fixed sidebar navigation
 */

import React from "react";
import { Users, FileText, Mic, BarChart2, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",   icon: BarChart2  },
  { id: "voice",      label: "Voice Bills & Employees", icon: Mic        },
  { id: "bills",      label: "Bill History",icon: FileText   },
  { id: "companies",  label: "Companies",   icon: Users      },
];

export default function Sidebar({ active, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>BillFlow</h2>
        <span>Employee Billing System</span>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1 }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${active === id ? "active" : ""}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div style={{ padding: "0 12px 12px" }}>
        <button 
          className="nav-item text-error" 
          onClick={onLogout}
          style={{ width: "100%", color: "#ff4d4f" }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <div style={{
        padding: "16px 20px",
        borderTop: "1px solid var(--border)",
        fontSize: "0.72rem",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
      }}>
        v1.0.0 &nbsp;·&nbsp; Auth Enabled
      </div>
    </aside>
  );
}
