// src/pages/AppointmentsPage.jsx
// ─────────────────────────────────────────────────────────────
// View + cancel appointments — fetched live from Express
//
// Concepts shown:
//  • GET then DELETE pattern (optimistic UI update)
//  • Status badge based on data value
//  • Confirmation before destructive action
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { getAppointments, cancelAppointment } from '../api/api'
import { useApp } from '../context/AppContext'
import Spinner    from '../components/Spinner'

// Map status → badge class
const STATUS_BADGE = {
  confirmed: 'badge-success',
  pending:   'badge-warning',
  cancelled: 'badge-danger',
}

export default function AppointmentsPage() {
  const { toast } = useApp()

  const [appointments, setAppointments] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  // ── Initial fetch ─────────────────────────────────────────
  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAppointments()
      setAppointments(res.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Cancel handler ────────────────────────────────────────
  const handleCancel = async (id, doctorName) => {
    // Confirm before destructive action
    if (!window.confirm(`Cancel appointment with ${doctorName}?`)) return

    try {
      await cancelAppointment(id)   // DELETE /api/appointments/:id
      // Optimistic update — remove from local state immediately
      setAppointments(prev => prev.filter(a => a.id !== id))
      toast('Appointment cancelled.')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <div className="fade-in">

      <div className="page-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>📅 Appointments</h1>
            <p>All scheduled appointments — live from the backend</p>
          </div>
          <a href="/book" className="btn btn-primary">
            + Book New
          </a>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 72 }}>

        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="empty-state">
            <span className="icon">⚠️</span>
            <h3>Could not load appointments</h3>
            <p>Make sure the Express server is running on port 4000</p>
            <p style={{ fontSize: 12, marginTop: 8, color: 'var(--gray-400)' }}>{error}</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={load}>
              Retry
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <span className="icon">🗓️</span>
            <h3>No appointments yet</h3>
            <p>Book your first appointment with a specialist</p>
            <a href="/book" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
              Book Appointment →
            </a>
          </div>
        ) : (

          /* ── Table ── */
          <div className="appt-table-wrap">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>
                {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={load}>↻ Refresh</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ color: 'var(--gray-400)' }}>{i + 1}</td>
                    <td><strong>{a.patientName}</strong></td>
                    <td>{a.doctorName}</td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[a.status] || 'badge-primary'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(a.id, a.doctorName)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        )}
      </div>
    </div>
  )
}
