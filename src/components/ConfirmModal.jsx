import React from "react";
import { AlertCircle, Trash2, X } from "lucide-react";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  type = "danger" 
}) {
  if (!isOpen) return null;

  const colors = {
    danger:  { bg: "rgba(239, 68, 68, 0.1)",  text: "#ef4444", border: "rgba(239, 68, 68, 0.2)" },
    warning: { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.2)" },
    info:    { bg: "rgba(59, 130, 246, 0.1)",  text: "#3b82f6", border: "rgba(59, 130, 246, 0.2)" },
  };

  const current = colors[type] || colors.danger;

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-content scale-up" style={{ maxWidth: 400 }}>
        <div style={{
          position: "absolute", top: 12, right: 12, cursor: "pointer", color: "var(--text-muted)"
        }} onClick={onClose}>
          <X size={18} />
        </div>

        <div style={{ textAlign: "center", paddingBottom: 8 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: current.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", color: current.text, border: `1px solid ${current.border}`
          }}>
            {type === "danger" ? <Trash2 size={24} /> : <AlertCircle size={24} />}
          </div>
          
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>{title}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        <div className="flex gap-3" style={{ marginTop: 32 }}>
          <button className="btn btn-ghost w-full" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>
            Cancel
          </button>
          <button 
            className="btn btn-primary w-full" 
            onClick={() => { onConfirm(); onClose(); }} 
            style={{ 
              flex: 1, justifyContent: "center", 
              background: type === "danger" ? "#ef4444" : "var(--accent)",
              borderColor: type === "danger" ? "#ef4444" : "var(--accent)"
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: rgba(18, 20, 25, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          width: 100%;
          position: relative;
        }

        .scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
