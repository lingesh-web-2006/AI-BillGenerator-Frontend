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
import CompaniesPage from "./components/CompaniesPage";
import { api }       from "./utils/api";
import LoginPage from "./components/LoginPage";
import { Building2 } from "lucide-react";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  voice:     "Voice Bills & Employees",
  bills:     "Bill History",
  companies: "Manage Companies",
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("authToken"));
  const [page,      setPage]      = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [bills,     setBills]     = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [empLoad,   setEmpLoad]   = useState(true);
  const [billLoad,  setBillLoad]  = useState(true);

  const fetchCompanies = useCallback(async () => {
    try {
      const data = await api.companies.getAll();
      setCompanies(data);
      if (data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    } catch (e) {
      console.error("Failed to load companies:", e);
    }
  }, [selectedCompanyId]);

  const fetchEmployees = useCallback(async () => {
    if (!isLoggedIn || !selectedCompanyId) return;
    setEmpLoad(true);
    try {
      const data = await api.employees.getAll(selectedCompanyId);
      setEmployees(data);
    } catch (e) {
      console.error("Failed to load employees:", e);
    } finally {
      setEmpLoad(false);
    }
  }, [isLoggedIn, selectedCompanyId]);

  const fetchBills = useCallback(async () => {
    if (!isLoggedIn || !selectedCompanyId) return;
    setBillLoad(true);
    try {
      const data = await api.bills.getAll(selectedCompanyId);
      setBills(data);
    } catch (e) {
      console.error("Failed to load bills:", e);
    } finally {
      setBillLoad(false);
    }
  }, [isLoggedIn, selectedCompanyId]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCompanies();
    }
  }, [isLoggedIn, fetchCompanies]);

  useEffect(() => {
    if (isLoggedIn && selectedCompanyId) {
      fetchEmployees();
      fetchBills();
    }
  }, [fetchEmployees, fetchBills, isLoggedIn, selectedCompanyId]);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setPage("dashboard");
  };

  const handleBillGenerated = () => fetchBills();
  const handleCompaniesChanged = () => fetchCompanies();

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="app-shell">
      <Sidebar active={page} onNavigate={setPage} onLogout={handleLogout} />

      <div className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="topbar-title">{PAGE_TITLES[page]}</span>
            
            {/* Company Switcher */}
            <div className="company-switcher">
              <Building2 size={14} style={{ color: "var(--brand-primary)" }} />
              <select 
                value={selectedCompanyId || ""} 
                onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
              >
                {companies.map(co => (
                  <option key={co.id} value={co.id}>{co.name}</option>
                ))}
              </select>
            </div>
          </div>
          <span className="topbar-meta">{today}</span>
        </header>

        {/* Page body */}
        <main className="page-body">
          {page === "dashboard" && (
            <Dashboard 
              employees={employees} 
              bills={bills} 
              selectedCompany={selectedCompany} 
            />
          )}
          {page === "voice" && (
            <VoicePanel
              employees={employees}
              loading={empLoad}
              selectedCompany={selectedCompany}
              onBillGenerated={handleBillGenerated}
              onEmployeeAdded={fetchEmployees}
            />
          )}
          {page === "bills" && (
            <BillHistory 
              bills={bills} 
              loading={billLoad} 
              onRefresh={fetchBills} 
              selectedCompany={selectedCompany}
            />
          )}
          {page === "companies" && (
            <CompaniesPage 
              companies={companies} 
              onChanged={handleCompaniesChanged} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
