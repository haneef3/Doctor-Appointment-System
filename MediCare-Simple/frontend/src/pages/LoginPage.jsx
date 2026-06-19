// src/pages/LoginPage.jsx
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const API_URL = 'http://localhost:4000/api';

export default function LoginPage() {
  const { login, toast } = useApp()
  const navigate = useNavigate()

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (data.success) {
        // ENFORCE PATIENT/USER ROLE
        if (data.data.role !== 'user') {
           toast('Access Denied: Please use the Admin or Doctor login portals!', 'error');
           return;
        }

        login(data.data); // data.data contains the user object {id, name, email, role}
        toast(`Welcome, ${data.data.name}! 👋`);
        navigate('/dashboard');
      } else {
        toast(data.message, 'error');
      }
    } catch (e) {
      toast('Failed to connect to backend', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in" style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--gray-50)' }}>
      <div className="booking-form" style={{ width: '100%', borderTop: '4px solid var(--primary)' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏥</div>
          <h2 style={{ fontSize: 26, marginBottom: 6 }}>
            {isRegister ? 'Patient Registration' : 'Patient Login'}
          </h2>
          <p style={{ fontSize: 14 }}>
            {isRegister ? 'Create an account to book' : 'Sign in to manage appointments'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {isRegister && (
            <div className="form-group" style={{ marginBottom: 18 }}>
              <label>Full Name</label>
              <input type="text" name="name" className="input" placeholder="e.g. Rahul Kumar" value={form.name} onChange={handleChange} required />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 18 }}>
            <label>Email Address</label>
            <input type="email" name="email" className="input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group" style={{ marginBottom: 28 }}>
            <label>Password</label>
            <input type="password" name="password" className="input" placeholder="******" value={form.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>

        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--gray-500)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span 
            style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Sign In →' : 'Register Here →'}
          </span>
        </p>


      </div>
    </div>
  )
}
