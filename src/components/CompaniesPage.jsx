/**
 * CompaniesPage.jsx — Manage multiple companies
 */

import React, { useState } from "react";
import { Plus, Building2, MapPin, Phone, FileText, Trash2, Edit2 } from "lucide-react";
import AddCompanyModal from "./AddCompanyModal";
import { api } from "../utils/api";
import ConfirmModal from "./ConfirmModal";

export default function CompaniesPage({ companies, onChanged }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editCo, setEditCo] = useState(null);
  const [delCo, setDelCo] = useState(null);

  const handleDelete = async () => {
    if (!delCo) return;
    try {
      await api.companies.remove(delCo.id);
      onChanged();
      setDelCo(null);
    } catch (e) {
      alert("Failed to delete company: " + e.message);
    }
  };

  return (
    <div className="companies-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-display">Companies</h1>
          <p className="text-secondary">Manage your business profiles and invoice templates.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Company
        </button>
      </div>

      <div className="company-grid">
        {companies.map((co) => (
          <div key={co.id} className="company-card card">
            <div className="company-card-header">
              <div className="company-logo-circle">
                {co.logo_url ? (
                  <img src={co.logo_url} alt={co.name} />
                ) : (
                  <Building2 size={24} color="var(--brand-primary)" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 className="text-display" style={{ fontSize: "1.1rem" }}>{co.name}</h3>
                <span className="badge badge-blue">{co.template_name} Template</span>
              </div>
              <div className="company-actions">
                <button className="icon-btn" onClick={() => setEditCo(co)}>
                  <Edit2 size={14} />
                </button>
                <button className="icon-btn text-error" onClick={() => setDelCo(co)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="company-details">
              <div className="detail-item">
                <MapPin size={14} />
                <span>{co.address || "No address provided"}</span>
              </div>
              <div className="detail-item">
                <Phone size={14} />
                <span>{co.phone || "No phone provided"}</span>
              </div>
              <div className="detail-item">
                <FileText size={14} />
                <span>GST: {co.gst_number || "N/A"}</span>
              </div>
            </div>
          </div>
        ))}

        {companies.length === 0 && (
          <div className="empty-state card">
            <Building2 size={48} color="var(--border)" />
            <h3>No Companies Found</h3>
            <p>Add your first company to start generating tailored invoices.</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add Company
            </button>
          </div>
        )}
      </div>

      {(showAdd || editCo) && (
        <AddCompanyModal 
          company={editCo} 
          onClose={() => { setShowAdd(false); setEditCo(null); }} 
          onSuccess={() => { setShowAdd(false); setEditCo(null); onChanged(); }} 
        />
      )}

      {delCo && (
        <ConfirmModal
          title="Delete Company?"
          message={`Are you sure you want to delete "${delCo.name}"? This will affect existing bills.`}
          onConfirm={handleDelete}
          onCancel={() => setDelCo(null)}
          confirmText="Delete"
          danger
        />
      )}
    </div>
  );
}
