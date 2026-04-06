/**
 * api.js — Centralized API calls to Flask backend
 */

const BASE = process.env.REACT_APP_API_URL || "https://ai-billgenerator-backend-2.onrender.com/api";

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Employees
export const api = {
  employees: {
    getAll:  (companyId) => request("GET",    `/employees/${companyId ? `?company_id=${companyId}` : ""}`),
    getOne:  (id)        => request("GET",    `/employees/${id}`),
    create:  (data)      => request("POST",   "/employees/", data),
    update:  (id, data)  => request("PUT",    `/employees/${id}`, data),
    remove:  (id)        => request("DELETE", `/employees/${id}`),
  },
  bills: {
    getAll:       (companyId) => request("GET",  `/bills/${companyId ? `?company_id=${companyId}` : ""}`),
    getOne:       (id)       => request("GET",  `/bills/${id}`),
    generate:     (data)     => request("POST", "/bills/generate", data),
    byEmployee:   (empId)    => request("GET",  `/bills/employee/${empId}`),
    remove:       (billId)   => request("DELETE", `/bills/${billId}`),
    clearAll:     ()         => request("DELETE", "/bills/"),
  },
  companies: {
    getAll: ()         => request("GET",    "/companies/"),
    getOne: (id)       => request("GET",    `/companies/${id}`),
    create: (data)     => request("POST",   "/companies/", data),
    update: (id, data) => request("PUT",    `/companies/${id}`, data),
    remove: (id)       => request("DELETE", `/companies/${id}`),
  },
  voice: {
    process: (text) => request("POST", "/voice/process", { text }),
  },
  auth: {
    login: (username, password) => request("POST", "/auth/login", { username, password }),
  },
};
