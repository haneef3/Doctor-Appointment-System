// src/pages/HomePage.jsx
// ─────────────────────────────────────────────────────────────
// Landing page:  Hero → Stats → Features → Doctor Preview → CTA
//
// Data flow:
//   1. useEffect fires on mount
//   2. getDoctors() fetches from Express /api/doctors
//   3. State updates → React re-renders DoctorCard components
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDoctors, getStats } from '../api/api'
import DoctorCard from '../components/DoctorCard'
import Spinner    from '../components/Spinner'

// Static service data (in real project comes from /api/services)
const SERVICES = [
  { icon: '❤️',  bg: '#fee2e2', title: 'Cardiology',        desc: 'Heart disease diagnosis & treatment' },
  { icon: '🧠',  bg: '#ede9fe', title: 'Neurology',         desc: 'Brain & nervous system care' },
  { icon: '🦴',  bg: '#fef3c7', title: 'Orthopedics',       desc: 'Bone, joint & muscle care' },
  { icon: '👶',  bg: '#d1fae5', title: 'Pediatrics',        desc: 'Specialized care for children' },
  { icon: '👁️',  bg: '#dbeafe', title: 'Ophthalmology',     desc: 'Eye health & vision care' },
  { icon: '🦷',  bg: '#fce7f3', title: 'Dental Care',       desc: 'Complete oral health services' },
]

const FEATURES = [
  { icon: '📅', title: 'Easy Booking',      desc: 'Book appointments with your preferred doctor in just a few clicks — no waiting, no hassle.' },
  { icon: '🔒', title: 'Secure & Private',  desc: 'Your health data is protected with industry-standard encryption and privacy controls.' },
  { icon: '👨‍⚕️', title: 'Expert Doctors',  desc: 'Access 50+ verified specialists across 20+ medical fields with years of experience.' },
  { icon: '💬', title: '24/7 Support',      desc: 'Our support team is always on standby to help you with any query, day or night.' },
]

export default function HomePage() {
  const navigate = useNavigate()

  // ── State ────────────────────────────────────────────────
  const [doctors, setDoctors] = useState([])
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Data fetch on mount ───────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        // Parallel fetch — same pattern as full project
        const [docRes, statsRes] = await Promise.all([getDoctors(), getStats()])
        setDoctors(docRes.data.slice(0, 4))     // show top 4 only
        setStats(statsRes.data)
      } catch {
        // Silently fail on home page — data is optional here
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="fade-in">

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-pill">🏥 Your Health, Our Priority</div>
            <h1>
              Quality Healthcare<br />
              <em>at Your Fingertips</em>
            </h1>
            <p>
              Book appointments with top specialists, access world-class hospital
              services, and manage your health — all in one place.
            </p>
            <div className="hero-btns">
              <button className="btn btn-hero-primary" onClick={() => navigate('/doctors')}>
                Find a Doctor →
              </button>
              <button className="btn btn-hero-outline" onClick={() => navigate('/login')}>
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS STRIP ═══════════════════════════════════════ */}
      <section className="stats-strip">
        <div className="container">
          <div className="stats-grid">
            {stats ? (
              <>
                <div><span className="stat-value">{stats.totalDoctors}+</span><p className="stat-label">Expert Doctors</p></div>
                <div><span className="stat-value">{stats.availableDoctors}</span><p className="stat-label">Available Now</p></div>
                <div><span className="stat-value">{stats.totalAppointments}</span><p className="stat-label">Appointments</p></div>
                <div><span className="stat-value">{stats.confirmed}</span><p className="stat-label">Confirmed Today</p></div>
              </>
            ) : (
              <>
                <div><span className="stat-value">50+</span><p className="stat-label">Expert Doctors</p></div>
                <div><span className="stat-value">10K+</span><p className="stat-label">Happy Patients</p></div>
                <div><span className="stat-value">20+</span><p className="stat-label">Specializations</p></div>
                <div><span className="stat-value">15+</span><p className="stat-label">Years of Service</p></div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════ */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-header">
            <h2>Why Choose MediCare?</h2>
            <p>Everything you need for your complete healthcare journey</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div className="icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Comprehensive healthcare solutions under one roof</p>
          </div>
          <div className="services-grid">
            {SERVICES.map(s => (
              <div key={s.title} className="service-card">
                <div className="service-icon" style={{ background: s.bg }}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED DOCTORS ══════════════════════════════════ */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-header">
            <h2>Our Top Doctors</h2>
            <p>Trusted specialists ready to help you</p>
          </div>
          {loading ? (
            <Spinner />
          ) : doctors.length > 0 ? (
            <>
              <div className="doctors-grid">
                {doctors.map(d => <DoctorCard key={d.id} doctor={d} />)}
              </div>
              <div style={{ textAlign: 'center', marginTop: 36 }}>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/doctors')}>
                  View All Doctors →
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="icon">🩺</span>
              <h3>Backend not connected</h3>
              <p>Start the Express server to see live doctor data</p>
            </div>
          )}
        </div>
      </section>

      {/* ══ CTA BANNER ════════════════════════════════════════ */}
      <section className="cta-banner">
        <div className="container">
          <h2>Ready to take control of your health?</h2>
          <p>Join thousands of patients who trust MediCare for their healthcare needs.</p>
          <button className="btn btn-hero-primary" onClick={() => navigate('/book')}>
            Book Your Appointment Now →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} MediCare — Simple Hospital Management Demo</p>
      </footer>

    </div>
  )
}
