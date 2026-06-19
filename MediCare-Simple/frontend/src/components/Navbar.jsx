// src/components/Navbar.jsx
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const PUBLIC_LINKS = [
  { to: '/',              label: '🏠 Home'         },
  { to: '/doctors',       label: '🩺 Find Doctors'  },
]

export default function Navbar() {
  const { user, logout, toast } = useApp()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast('Logged out successfully.')
    navigate('/')
    setOpen(false)
  }

  // Combine public links + Dashboard if user
  const links = [...PUBLIC_LINKS]
  if (user) {
    links.push({ to: '/dashboard', label: '📊 Dashboard' })
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">

        <NavLink to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          <div className="logo-icon">🏥</div>
          Medi<span>Care</span>
        </NavLink>

        <div className={`navbar-links ${open ? 'open' : ''}`}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className={`navbar-right ${open ? 'open' : ''}`}>
          {user ? (
            <>
              <span style={{ fontSize: 14, color: 'var(--gray-600)' }}>
                👤 <strong>{user.name}</strong>
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <NavLink to="/admin-login" style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', textDecoration: 'none' }} onClick={() => setOpen(false)}>
                Admin
              </NavLink>
              <span style={{ color: 'var(--gray-300)' }}>|</span>
              <NavLink to="/doctor-login" style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', textDecoration: 'none' }} onClick={() => setOpen(false)}>
                Doctor
              </NavLink>
              <span style={{ color: 'var(--gray-300)', marginRight: 12 }}>|</span>
              <NavLink to="/login" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                Patient Login
              </NavLink>
            </div>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>

      </div>
    </nav>
  )
}
