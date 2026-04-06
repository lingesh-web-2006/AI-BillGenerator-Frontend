/**
 * VoicePanel.jsx — Conversational AI Assistant for Payroll & Billing
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, Mic, MicOff, Send, RotateCcw, Sparkles, 
  CheckCircle, Plus, Building2, TrendingUp, AlertCircle
} from "lucide-react";
import { useVoice } from "../hooks/useVoice";
import { api } from "../utils/api";
import BillReceipt from "./BillReceipt";
import EmployeeTable from "./EmployeeTable";
import AddEmployeeModal from "./AddEmployeeModal";

export default function VoicePanel({ employees, loading, selectedCompany, onBillGenerated, onEmployeeAdded }) {
  const { listening, transcript, error: voiceError, supported, startListening, stopListening, clearTranscript } =
    useVoice();

  const [manualText, setManualText] = useState("");
  const [processing,  setProcessing]  = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync voice transcript to manualText
  useEffect(() => {
    if (transcript) setManualText(transcript);
  }, [transcript]);

  const handleProcess = async () => {
    const text = manualText.trim();
    if (!text) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.voice.process({ 
        text, 
        company_id: selectedCompany?.id 
      });
      setResult(data);
      if (data.type === "bill" || data.type === "bulk") {
        onBillGenerated();
      }
    } catch (e) {
      console.error("Voice process error:", e);
      setError(e.message || "I encountered an unexpected issue while processing your request.");
      // Attempt to extract the conversational message if available
      if (e.response?.data?.message) {
        setError(e.response.data.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    clearTranscript();
    setManualText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="voice-panel-content page-fade">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-heading">Voice Assistant</h1>
          <p className="section-sub" style={{ margin: 0 }}>Natural language payroll management for {selectedCompany?.name}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="grid grid-2 gap-8">
        {/* Left Column: Recording & Input */}
        <div className="flex flex-col gap-6">
          <section className="voice-panel card shadow-lg">
            <div className="mic-area">
              <button 
                className={`mic-ring ${listening ? "listening" : ""}`}
                onClick={listening ? stopListening : startListening}
              >
                {listening ? <MicOff size={32} color="#fff" /> : <Mic size={32} color="var(--accent)" />}
              </button>
              <p className="voice-status">
                {listening ? "Processing speech..." : "Click to speak command"}
              </p>
            </div>

            <div className="form-group mb-6">
              <label className="input-label">Your Command</label>
              <textarea
                className="input"
                rows={3}
                placeholder="e.g. Generate bill for Arun Kumar with 2000 bonus..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button 
                className="btn btn-primary w-full" 
                onClick={handleProcess}
                disabled={processing || !manualText.trim()}
              >
                {processing ? (
                  <> <span className="spinner mr-2" /> Thinking... </>
                ) : (
                  <> <Send size={16} /> Process Command </>
                )}
              </button>
              <button className="btn btn-ghost" onClick={handleReset}>
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="example-commands mt-8">
              <p className="text-xs font-bold text-muted uppercase mb-4 letter-spacing-lg">Example Commands</p>
              <ul className="text-sm space-y-3 text-secondary">
                <li className="cursor-pointer hover:text-accent transition-colors" onClick={() => setManualText("Generate bill for Arun Kumar")}>
                  ▸ Generate Arun bill with 2000 bonus
                </li>
                <li className="cursor-pointer hover:text-accent transition-colors" onClick={() => setManualText("Generate salary for everyone this month")}>
                  ▸ Generate salary for everyone this month
                </li>
                <li className="cursor-pointer hover:text-accent transition-colors" onClick={() => setManualText("Who has the highest salary?")}>
                  ▸ Who has the highest salary?
                </li>
                <li className="cursor-pointer hover:text-accent transition-colors" onClick={() => setManualText("List employees with more than 3 absents")}>
                  ▸ List employees with more than 3 absents
                </li>
              </ul>
            </div>
          </section>

          {/* Employee Roster Reference */}
          <section className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title" style={{ fontSize: '0.9rem' }}>Company Roster</h3>
              <Building2 size={14} className="text-muted" />
            </div>
            <EmployeeTable 
              employees={employees} 
              loading={loading} 
              compact
              onGenerateBill={(emp) => setManualText(`Generate ${emp.name} bill`)}
            />
          </section>
        </div>

        {/* Right Column: AI Assistant Response */}
        <div className="ai-response-column">
          {(processing || result || error) ? (
            <div className="ai-chat-bubble card animate-slide-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="assistant-avatar">
                  <Bot size={18} />
                </div>
                <span className="font-bold text-sm text-accent">Assistant Response</span>
              </div>

              {processing ? (
                <div className="typing-indicator flex gap-1 p-4">
                  <span></span><span></span><span></span>
                </div>
              ) : (
                <div className="ai-message text-display" style={{ fontSize: "1.05rem", lineHeight: "1.6" }}>
                  {result?.message || error}
                </div>
              )}

              {result && !processing && (
                <div className="mt-8 border-top pt-8 border-brand">
                  {result.type === "bill" && (
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-success uppercase">
                        <TrendingUp size={14} />
                        Invoice Generated
                      </div>
                      <BillReceipt bill={result} company={selectedCompany} hideActions />
                    </div>
                  )}
                  {result.type === "bulk" && (
                    <div className="alert alert-success animate-fade-in">
                      <CheckCircle size={18} />
                      Processed {result.count} payroll records successfully.
                    </div>
                  )}
                  {result.type === "list" && (
                    <div className="animate-fade-in">
                      <h4 className="text-xs font-bold text-muted uppercase mb-4">Query Results</h4>
                      <EmployeeTable employees={result.data} compact />
                    </div>
                  )}
                  {result.type === "stat" && (
                    <div className="card shadow-md animate-fade-in" style={{ border: '1px solid var(--accent-dim)' }}>
                       {result.data?.name ? (
                         <div className="flex items-center gap-4">
                            <div className="avatar">{result.data.name[0]}</div>
                            <div>
                               <div className="font-bold">{result.data.name}</div>
                               <div className="text-accent text-sm">₹{result.data.monthly_salary?.toLocaleString()} / mo</div>
                            </div>
                         </div>
                       ) : (
                         <div className="text-center py-4">
                            <div className="text-2xl font-bold text-success">₹{result.data?.total?.toLocaleString()}</div>
                            <div className="text-xs text-muted mt-1 uppercase font-bold">Total Payout for {result.data?.month || 'Period'}</div>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-chat card flex flex-col items-center justify-center p-12 text-center h-full opacity-60">
              <Sparkles size={48} className="text-muted mb-6 opacity-20" />
              <h3 className="text-muted font-bold">Assistant Offline</h3>
              <p className="text-sm text-muted mt-3 max-w-xs mx-auto">
                State your payroll requirement to the assistant. It can generate bills, query statistics, or search for employees.
              </p>
            </div>
          )}
        </div>
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
    </div>
  );
}
