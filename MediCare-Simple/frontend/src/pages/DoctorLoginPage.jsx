// src/pages/DoctorLoginPage.jsx
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const API_URL = 'http://localhost:4000/api';

export default function DoctorLoginPage() {
  const { login, toast } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (data.success) {
        // ENFORCE DOCTOR ROLE
        if (data.data.role !== 'doctor') {
           toast('Access Denied: You are not a registered Doctor!', 'error');
           return;
        }

        login(data.data);
        toast(`Welcome back Dr. ${data.data.name}! 👋`);
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
      <div className="booking-form" style={{ width: '100%', borderTop: '4px solid #10b981' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍⚕️</div>
          <h2 style={{ fontSize: 26, marginBottom: 6 }}>Doctor Portal</h2>
          <p style={{ fontSize: 14 }}>Sign in to manage your appointments</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label>Doctor Email</label>
            <input type="email" name="email" className="input" placeholder="doctor@medicare.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group" style={{ marginBottom: 28 }}>
            <label>Password</label>
            <input type="password" name="password" className="input" placeholder="******" value={form.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', background: '#10b981' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In as Doctor'}
          </button>
        </form>

      </div>
    </div>
  )
}
