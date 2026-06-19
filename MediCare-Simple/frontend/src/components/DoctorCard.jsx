// src/components/DoctorCard.jsx
// ─────────────────────────────────────────────────────────────
// Reusable card component — receives a doctor object as prop
// Props: { doctor, onBook }
// ─────────────────────────────────────────────────────────────
import { useNavigate } from 'react-router-dom'

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate()

  return (
    <div className="card doctor-card fade-in">
      {/* Avatar area */}
      <div className="card-avatar">{doctor.image}</div>

      <div className="card-body">
        <h3>{doctor.name}</h3>
        <p className="spec">{doctor.specialization}</p>

        <div className="meta">
          <span>⏱ {doctor.experience}</span>
          <span className="fee">₹{doctor.fee}</span>
        </div>

        {/* Availability badge */}
        <div style={{ marginBottom: 14 }}>
          {doctor.available
            ? <span className="badge badge-success">● Available</span>
            : <span className="badge badge-danger">● Unavailable</span>
          }
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={!doctor.available}
          onClick={() => navigate(`/book/${doctor.id}`)}
        >
          {doctor.available ? 'Book Appointment' : 'Not Available'}
        </button>
      </div>
    </div>
  )
}
