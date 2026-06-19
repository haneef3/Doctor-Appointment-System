// src/pages/BookPage.jsx
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDoctors, bookAppointment } from '../api/api'
import { useApp } from '../context/AppContext'
import Spinner from '../components/Spinner'

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
]

const today = new Date().toISOString().split('T')[0]

export default function BookPage() {
  const { doctorId } = useParams()
  const navigate     = useNavigate()
  const { user, toast } = useApp()

  const [doctors,  setDoctors]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [submitting, setSub]    = useState(false)

  const [form, setForm] = useState({
    doctorId:    doctorId || '',
    patientName: user ? user.name : '',
    date:        '',
    time:        '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    getDoctors().then(res => {
      setDoctors(res.data.filter(d => d.available))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.doctorId)    e.doctorId    = 'Please select a doctor'
    if (!form.patientName.trim()) e.patientName = 'Patient name is required'
    if (!form.date)        e.date        = 'Please pick a date'
    if (!form.time)        e.time        = 'Please pick a time slot'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return

    setSub(true)
    try {
      await bookAppointment({ ...form, patientId: user.id })
      toast('Appointment booked successfully! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast(err.message || 'Booking failed', 'error')
    } finally {
      setSub(false)
    }
  }

  if (loading) return <Spinner />

  const selectedDoctor = doctors.find(d => d.id === parseInt(form.doctorId))

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1>📅 Book an Appointment</h1>
          <p>Fill in your details and choose a convenient time slot</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 72 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

          <form className="booking-form" onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
            <h2>Patient Details</h2>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label>Select Doctor *</label>
              <select name="doctorId" className="input" value={form.doctorId} onChange={handleChange}>
                <option value="">-- Choose a doctor --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialization} (₹{d.fee})
                  </option>
                ))}
              </select>
              {errors.doctorId && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.doctorId}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label>Your Full Name *</label>
              <input
                type="text"
                name="patientName"
                className="input"
                placeholder="e.g. Rahul Kumar"
                value={form.patientName}
                onChange={handleChange}
              />
              {errors.patientName && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.patientName}</span>}
            </div>

            <div className="form-row" style={{ marginBottom: 18 }}>
              <div className="form-group">
                <label>Appointment Date *</label>
                <input
                  type="date"
                  name="date"
                  className="input"
                  min={today}
                  value={form.date}
                  onChange={handleChange}
                />
                {errors.date && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.date}</span>}
              </div>
              <div className="form-group">
                <label>Time Slot *</label>
                <select name="time" className="input" value={form.time} onChange={handleChange}>
                  <option value="">-- Pick time --</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.time && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.time}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? 'Booking...' : '✅ Confirm Booking'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/doctors')}>
                Cancel
              </button>
            </div>
          </form>

          {selectedDoctor && (
            <div className="card fade-in" style={{ padding: 28 }}>
              <div style={{ textAlign: 'center', fontSize: 64, marginBottom: 16 }}>
                👩‍⚕️
              </div>
              <h3 style={{ textAlign: 'center', marginBottom: 4 }}>{selectedDoctor.name}</h3>
              <p style={{ textAlign: 'center', color: 'var(--accent)', fontWeight: 600, marginBottom: 20 }}>
                {selectedDoctor.specialization}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Consultation Fee</span>
                  <strong style={{ color: 'var(--primary)' }}>₹{selectedDoctor.fee}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Status</span>
                  <span className="badge badge-success">● Available</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
