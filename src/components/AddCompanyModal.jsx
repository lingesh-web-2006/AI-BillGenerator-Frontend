/**
 * AddCompanyModal.jsx — Form for creating/editing a company profile
 */

import React, { useState, useEffect } from "react";
import { Building2, X, PlusCircle, Save } from "lucide-react";
import { api } from "../utils/api";

export default function AddCompanyModal({ company, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    address: "",
    gst_number: "",
    phone: "",
    template_name: "Modern",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!company;

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        logo_url: company.logo_url || "",
        address: company.address || "",
        gst_number: company.gst_number || "",
        phone: company.phone || "",
        template_name: company.template_name || "Modern",
      });
    }
  }, [company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return setError("Company Name is required");
    
    setLoading(true);
    setError("");

    try {
      if (isEdit) {
        await api.companies.update(company.id, formData);
      } else {
        await api.companies.create(formData);
      }
      onSuccess();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="icon-circle">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-display">{isEdit ? "Edit Profile" : "Add Profile"}</h2>
              <p className="text-secondary">Configure your business details.</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="alert alert-error mb-4">{error}</div>}
          
          <div className="form-group">
            <label>Company Name <span className="text-error">*</span></label>
            <input 
              type="text" 
              placeholder="e.g. Acme Corporation" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Logo URL</label>
            <input 
              type="url" 
              placeholder="https://example.com/logo.png" 
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            />
          </div>

          <div className="grid grid-2 gap-4">
            <div className="form-group">
              <label>GST Number</label>
              <input 
                type="text" 
                placeholder="27AAAAA0000A1Z5" 
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                placeholder="+91 99999 00000" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Business Address</label>
            <textarea 
              rows={3} 
              placeholder="123 Tech Park, Silicon Valley" 
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Invoice Template</label>
            <select 
              value={formData.template_name}
              onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
            >
              <option value="Modern">Modern (Futuristic Gray/Blue)</option>
              <option value="Professional">Professional (Classic Corporate)</option>
            </select>
          </div>

          <div className="modal-footer flex-end gap-3">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEdit ? <Save size={16} /> : <PlusCircle size={16} />}
              {isEdit ? "Save Profile" : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
