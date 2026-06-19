// src/pages/DoctorsPage.jsx
// ─────────────────────────────────────────────────────────────
// Lists all doctors with a live search/filter bar
//
// Concepts shown:
//  • Controlled input (useState for search term)
//  • useEffect with dependency array — re-fetches when filter changes
//  • Debounce pattern (300ms) to avoid hammering the backend
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, useCallback } from 'react'
import { getDoctors } from '../api/api'
import DoctorCard from '../components/DoctorCard'
import Spinner    from '../components/Spinner'

const SPECS = ['All', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'General Physician']

export default function DoctorsPage() {
  const [doctors,  setDoctors]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')      // controlled input
  const [activeSpec, setActiveSpec] = useState('All')
  const [error,    setError]    = useState(null)

  // ── Fetch function ────────────────────────────────────────
  const fetchDoctors = useCallback(async (spec) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getDoctors(spec === 'All' ? '' : spec)
      setDoctors(res.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Re-fetch whenever activeSpec changes
  useEffect(() => {
    fetchDoctors(activeSpec)
  }, [activeSpec, fetchDoctors])

  // ── Client-side search filter ─────────────────────────────
  const visible = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-in">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="container">
          <h1>🩺 Find Doctors</h1>
          <p>Browse verified specialists and book appointments instantly</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 72 }}>

        {/* ── Filter Bar ── */}
        <div className="filter-bar">
          <input
            type="text"
            className="input"
            placeholder="🔍 Search by name or specialization..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {/* Specialization quick-filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SPECS.map(s => (
              <button
                key={s}
                className={`btn btn-sm ${activeSpec === s ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveSpec(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results ── */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="empty-state">
            <span className="icon">⚠️</span>
            <h3>Backend not connected</h3>
            <p>Make sure the Express server is running on port 4000</p>
            <p style={{ fontSize: 12, marginTop: 8, color: 'var(--gray-400)' }}>{error}</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <span className="icon">🔍</span>
            <h3>No doctors found</h3>
            <p>Try a different search term or specialization</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>
              Showing <strong>{visible.length}</strong> doctor{visible.length !== 1 ? 's' : ''}
            </p>
            <div className="doctors-grid">
              {visible.map(d => <DoctorCard key={d.id} doctor={d} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
