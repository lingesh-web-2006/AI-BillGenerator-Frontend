/**
 * VoicePanel.jsx — Voice recording + AI bill generation via Claude
 */

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, RefreshCw } from "lucide-react";
import { useVoice } from "../hooks/useVoice";
import { api } from "../utils/api";
import BillReceipt from "./BillReceipt";
import EmployeeTable from "./EmployeeTable";
import AddEmployeeModal from "./AddEmployeeModal";
import { Plus } from "lucide-react";

export default function VoicePanel({ employees, loading, selectedCompany, onBillGenerated, onEmployeeAdded }) {
  const { listening, transcript, error, supported, startListening, stopListening, clearTranscript } =
    useVoice();

  const [manualText, setManualText] = useState("");
  const [processing,  setProcessing]  = useState(false);
  const [result,      setResult]      = useState(null);
  const [apiError,    setApiError]    = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync voice transcript to manualText for editing
  useEffect(() => {
    if (transcript) setManualText(transcript);
  }, [transcript]);

  // Auto-submit command when user stops speaking
  const prevListening = useRef(false);
  useEffect(() => {
    if (prevListening.current && !listening && manualText.trim()) {
      handleProcess();
    }
    prevListening.current = listening;
  }, [listening, manualText]);

  const handleMicClick = () => {
    if (listening) stopListening();
    else startListening();
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await api.employees.remove(id);
      onEmployeeAdded?.();
    } catch (err) {
      setApiError(err.message || "Failed to delete employee");
    }
  };

  const handleProcess = async () => {
    const text = manualText.trim();
    if (!text) return;

    setProcessing(true);
    setApiError(null);
    setResult(null);

    try {
      // Pass company_id so AI filters to this company's employees
      const data = await api.voice.process({ 
        text, 
        company_id: selectedCompany?.id 
      });
      setResult(data);
      onBillGenerated?.();
    } catch (err) {
      setApiError(err.message || "Failed to process command");
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    clearTranscript();
    setManualText("");
    setResult(null);
    setApiError(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
        <div>
          <div className="section-heading">Employees</div>
          <div className="section-sub" style={{ margin: 0 }}>Reference: {selectedCompany?.name} Roster</div>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)}
          style={{ padding: "8px 16px" }}
        >
          <Plus size={16} />
          Add Employee
        </button>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        <EmployeeTable 
          employees={employees} 
          loading={loading} 
          onGenerateBill={(emp) => {
            setManualText(`Generate ${emp.name} bill`);
            document.getElementById("voice-generator")?.scrollIntoView({ behavior: "smooth" });
          }}
          onDeleteEmployee={handleDeleteEmployee}
        />
      </div>

      {showAddModal && (
        <AddEmployeeModal 
          companyId={selectedCompany?.id}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            onEmployeeAdded?.();
          }}
        />
      )}

      <div style={{ textAlign: "center", marginBottom: "40px" }} className="fade-in">
        <button 
          className="btn btn-ghost"
          style={{ 
            borderRadius: "99px", padding: "8px 24px", fontSize: "0.82rem", 
            color: "var(--accent)", borderColor: "var(--accent-dim)", background: "rgba(79, 142, 247, 0.08)",
            boxShadow: "0 0 12px rgba(79, 142, 247, 0.15)"
          }}
          onClick={() => document.getElementById("voice-generator")?.scrollIntoView({ behavior: "smooth" })}
        >
          Scroll down for Voice AI Generator ↓
        </button>
      </div>

      <div className="section-heading" id="voice-generator">Voice Bill Generator</div>
      <div className="section-sub">
        Speak or type a command like <em style={{ color: "var(--accent)" }}>"Generate Arun bill"</em> — Claude AI will parse it and generate the bill automatically.
      </div>

      <div className="grid-2">
        {/* Voice Input Panel */}
        <div className="voice-panel">
          {/* Mic button */}
          <div
            className={`mic-ring ${listening ? "listening" : ""}`}
            onClick={handleMicClick}
            title={listening ? "Stop Recording" : "Start Recording"}
          >
            {listening
              ? <MicOff size={28} color="var(--accent)" />
              : <Mic    size={28} color="var(--text-secondary)" />}
          </div>

          <div className={`voice-status ${listening ? "active" : ""}`}>
            {listening ? "● Listening… speak now" : "Click mic to start recording"}
          </div>

          {/* Transcript / manual input */}
          <div className="input-group" style={{ textAlign: "left" }}>
            <label className="input-label">Command Text</label>
            <textarea
              className="input"
              rows={3}
              placeholder='e.g. "Generate Arun bill" or "Create salary slip for Priya"'
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              style={{ resize: "vertical", fontFamily: "var(--font-mono)" }}
            />
          </div>

          {!supported && (
            <div className="alert alert-info" style={{ marginBottom: 12, textAlign: "left" }}>
              Browser doesn't support speech recognition. Type your command manually.
            </div>
          )}

          {(error) && (
            <div className="alert alert-error" style={{ marginBottom: 12, textAlign: "left" }}>
              {error}
            </div>
          )}

          <div className="flex gap-3" style={{ justifyContent: "center" }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleProcess}
              disabled={processing || !manualText.trim()}
            >
              {processing
                ? <><div className="spinner" /> Processing…</>
                : <><Send size={15} /> Process Command</>
              }
            </button>
            <button className="btn btn-ghost" onClick={handleReset}>
              <RefreshCw size={14} /> Reset
            </button>
          </div>

          {/* Example commands */}
          <div style={{ marginTop: 20, textAlign: "left" }}>
            <div className="input-label" style={{ marginBottom: 8 }}>Example Commands</div>
            {[
              "Generate Arun bill with 2000 bonus",
              "Generate salary for everyone this month",
              "Who has the highest salary?",
              "List employees with more than 3 absents",
              "Total salary paid in March 2026",
              "Show employee with lowest attendance",
            ].map((cmd) => (
              <div
                key={cmd}
                onClick={() => setManualText(cmd)}
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  padding: "5px 0",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => e.target.style.color = "var(--accent)"}
                onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}
              >
                ▸ {cmd}
              </div>
            ))}
          </div>
        </div>

        {/* Result Panel */}
        <div id="voice-result">
          {apiError && (
            <div className="alert alert-error fade-in" style={{ marginBottom: 16 }}>
              <strong>Error:</strong> {apiError}
            </div>
          )}

          {result && (
            <div className="fade-in">
              {/* Parsed command info */}
              <div className="card mb-4" style={{ marginBottom: 16 }}>
                <div className="card-title" style={{ marginBottom: 12, fontSize: '0.8rem', opacity: 0.7 }}>
                  AI Status: <span style={{ color: 'var(--success)' }}>{result.type?.toUpperCase()}</span>
                </div>
                {result.parsed_command && (
                  <pre style={{
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px",
                    fontSize: "0.72rem",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                    overflowX: "auto",
                    margin: 0
                  }}>
                    {JSON.stringify(result.parsed_command, null, 2)}
                  </pre>
                )}
              </div>

              {/* Dynamic Result Rendering */}
              {result.type === "bill" && (
                <BillReceipt bill={result} company={selectedCompany} onClose={handleReset} />
              )}

              {result.type === "bulk" && (
                <div className="card text-center" style={{ padding: '40px 20px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                  <div className="card-title">{result.message}</div>
                  <div className="td-secondary" style={{ marginTop: 8 }}>
                    Reload the dashboard or history to see all generated records.
                  </div>
                  <button className="btn btn-ghost mt-4" onClick={handleReset} style={{ marginTop: 20 }}>
                    Clear Result
                  </button>
                </div>
              )}

              {result.type === "list" && (
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Found {result.data?.length} Employees</div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Designation</th>
                          <th>Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.data?.map(emp => (
                          <tr key={emp.id}>
                            <td style={{ fontWeight: 500 }}>{emp.name}</td>
                            <td className="td-secondary">{emp.designation}</td>
                            <td><span className="badge badge-amber">{emp.attendance_absent} absents</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.type === "stat" && (
                <div className="card" style={{ padding: 24, border: '2px dashed var(--accent-dim)' }}>
                  <div className="stat-label" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {result.action?.replace(/_/g, ' ')}
                  </div>
                  {result.data?.name ? (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{result.data.name}</div>
                      <div className="text-accent" style={{ fontSize: '1.1rem', marginTop: 4 }}>
                        ₹{result.data.monthly_salary?.toLocaleString()} / month
                      </div>
                      <div className="td-secondary" style={{ marginTop: 4 }}>{result.data.designation}</div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700 }} className="text-success">
                        ₹{result.data?.total?.toLocaleString()}
                      </div>
                      <div className="td-secondary">Total for {result.data?.month || 'selected period'}</div>
                    </div>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={handleReset} style={{ marginTop: 20 }}>
                    Done
                  </button>
                </div>
              )}
            </div>
          )}

          {!result && !apiError && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: 300,
              color: "var(--text-muted)",
              fontSize: "0.875rem",
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎙</div>
              <div>Bill result will appear here</div>
              <div className="text-sm" style={{ marginTop: 4 }}>
                Speak or type a command and click Process
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
