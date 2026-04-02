/**
 * App.jsx — Root application component
 * Manages global state: employees, bills, active page
 */

import React, { useState, useEffect, useCallback } from "react";
import "./styles/global.css";

import Sidebar       from "./components/Sidebar";
import Dashboard     from "./components/Dashboard";
import EmployeesPage from "./components/EmployeesPage";
import VoicePanel    from "./components/VoicePanel";
import BillHistory   from "./components/BillHistory";
import { api }       from "./utils/api";
import LoginPage from "./components/LoginPage";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  voice:     "Voice Bills & Employees",
  bills:     "Bill History",
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("authToken"));
  const [page,      setPage]      = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [bills,     setBills]     = useState([]);
  const [empLoad,   setEmpLoad]   = useState(true);
  const [billLoad,  setBillLoad]  = useState(true);

  const fetchEmployees = useCallback(async () => {
    if (!isLoggedIn) return;
    setEmpLoad(true);
    try {
      const data = await api.employees.getAll();
      setEmployees(data);
    } catch (e) {
      console.error("Failed to load employees:", e);
    } finally {
      setEmpLoad(false);
    }
  }, [isLoggedIn]);

  const fetchBills = useCallback(async () => {
    if (!isLoggedIn) return;
    setBillLoad(true);
    try {
      const data = await api.bills.getAll();
      setBills(data);
    } catch (e) {
      console.error("Failed to load bills:", e);
    } finally {
      setBillLoad(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchEmployees();
      fetchBills();
    }
  }, [fetchEmployees, fetchBills, isLoggedIn]);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setPage("dashboard");
  };

  // Refresh bills whenever voice or employee page triggers a new bill
  const handleBillGenerated = () => fetchBills();

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="app-shell">
      <Sidebar active={page} onNavigate={setPage} onLogout={handleLogout} />

      <div className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <span className="topbar-title">{PAGE_TITLES[page]}</span>
          <span className="topbar-meta">{today}</span>
        </header>

        {/* Page body */}
        <main className="page-body">
          {page === "dashboard" && (
            <Dashboard employees={employees} bills={bills} />
          )}
          {page === "voice" && (
            <VoicePanel
              employees={employees}
              loading={empLoad}
              onBillGenerated={handleBillGenerated}
              onEmployeeAdded={fetchEmployees}
            />
          )}
          {page === "bills" && (
            <BillHistory bills={bills} loading={billLoad} onRefresh={fetchBills} />
          )}
        </main>
      </div>
    </div>
  );
}
