import React, { useState } from "react";
import { Lock, User, LogIn, AlertCircle } from "lucide-react";
import { api } from "../utils/api";

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.auth.login(username, password);
      // Persist login state
      localStorage.setItem("authToken", data.token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="login-logo">
            <LogIn size={32} color="var(--accent)" />
          </div>
          <h2>Welcome Back</h2>
          <p>Please sign in to access the billing system</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{ width: "100%", marginTop: "24px", justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? (
              <><div className="spinner" /> Signing in...</>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Default credentials: <code style={{ color: "var(--accent)" }}>employee / employee123</code></p>
        </div>
      </div>

      <style>{`
        .login-container {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top left, #1a1c24 0%, #0a0b0e 100%);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          width: 64px;
          height: 64px;
          background: rgba(79, 142, 247, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .login-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .login-header p {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon .input {
          padding-left: 44px;
        }

        .login-footer {
          margin-top: 32px;
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .login-footer p {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
