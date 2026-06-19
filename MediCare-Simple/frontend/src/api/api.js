// src/api/api.js
// ─────────────────────────────────────────────────────────────
// All backend calls live here (one place = easy to maintain)
// In the full project these are split: doctorApi.js, appointmentApi.js, etc.
// Base URL uses Vite proxy → /api → http://localhost:4000/api
// ─────────────────────────────────────────────────────────────

const BASE = '/api'

// Generic fetch helper — handles JSON + errors in one place
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

// ── Doctors ───────────────────────────────────────────────────
export const getDoctors      = (spec = '')  => request(`/doctors${spec ? `?spec=${spec}` : ''}`)
export const getDoctorById   = (id)         => request(`/doctors/${id}`)

// ── Appointments ──────────────────────────────────────────────
export const getAppointments = ()           => request('/appointments')
export const bookAppointment = (payload)    => request('/appointments', { method: 'POST', body: JSON.stringify(payload) })
export const cancelAppointment = (id)       => request(`/appointments/${id}`, { method: 'DELETE' })

// ── Stats (dashboard) ─────────────────────────────────────────
export const getStats        = ()           => request('/stats')
