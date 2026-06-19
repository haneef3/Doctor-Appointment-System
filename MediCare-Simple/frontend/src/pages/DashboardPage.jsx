import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { getAppointments, cancelAppointment } from '../api/api';

const STATUS_BADGE = {
  confirmed: 'badge-success',
  pending: 'badge-warning',
  cancelled: 'badge-danger',
};

const API_URL = 'http://localhost:4000/api';

export default function DashboardPage() {
  const { user, toast } = useApp();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]); // For admin
  const [loading, setLoading] = useState(true);

  // Admin form state
  const [docForm, setDocForm] = useState({ name: '', email: '', password: '', specialization: '', fee: '' });

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch appointments based on role
      const res = await fetch(`${API_URL}/appointments?userId=${user.id}&role=${user.role}`);
      const data = await res.json();
      if (data.success) setAppointments(data.data);

      // 2. Fetch doctors if admin
      if (user.role === 'admin') {
        const docRes = await fetch(`${API_URL}/doctors`);
        const docData = await docRes.json();
        if (docData.success) setDoctors(docData.data);
      }
    } catch (e) {
      toast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      loadData();
    }
  }, [user, navigate]);

  const handleCancelAppt = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await fetch(`${API_URL}/appointments/${id}`, { method: 'DELETE' });
      setAppointments(prev => prev.filter(a => a.id !== id));
      toast('Appointment cancelled');
    } catch (e) {
      toast('Could not cancel', 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        toast('Status updated');
      }
    } catch (e) {
      toast('Update failed', 'error');
    }
  };

  // Admin: Add doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm)
      });
      const data = await res.json();
      if (data.success) {
        toast('Doctor added successfully!');
        setDoctors(prev => [...prev, data.data]);
        setDocForm({ name: '', email: '', password: '', specialization: '', fee: '' });
      } else {
        toast(data.message, 'error');
      }
    } catch (e) {
      toast('Failed to add doctor', 'error');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Remove this doctor?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/doctors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDoctors(prev => prev.filter(d => d.id !== id));
        toast('Doctor removed');
        loadData(); // Reload appts just in case
      }
    } catch (e) {
      toast('Could not delete', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>👋 Hello, {user.name}</h1>
            <p>Role: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{user.role}</span> Dashboard</p>
          </div>
          {user.role === 'user' && (
            <a href="/book" className="btn btn-primary">+ Book Appointment</a>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 72 }}>
        {loading ? <Spinner /> : (
          <>
            {/* Appointments View */}
            <div className="appt-table-wrap" style={{ marginBottom: 40 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  {user.role === 'user' ? 'My Appointments' : user.role === 'doctor' ? 'Assigned Appointments' : 'All Appointments'}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={loadData}>↻ Refresh</button>
              </div>

              {appointments.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
                  No appointments found.
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date / Time</th>
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
                        <td>{a.date} at {a.time}</td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[a.status] || 'badge-primary'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td>
                          {/* User action */}
                          {user.role === 'user' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancelAppt(a.id)}>Cancel</button>
                          )}

                          {/* Doctor action */}
                          {user.role === 'doctor' && (
                            <select
                              value={a.status}
                              onChange={(e) => handleUpdateStatus(a.id, e.target.value)}
                              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}

                          {/* Admin action */}
                          {user.role === 'admin' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancelAppt(a.id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Admin Doctor Management View */}
            {user.role === 'admin' && (
              <div className="appt-table-wrap" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 20 }}>🩺 Manage Doctors</h3>

                {/* Add Doctor Form */}
                <form onSubmit={handleAddDoctor} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 30 }}>
                  <input type="text" placeholder="Dr. Name" required className="input" style={{ flex: 1, minWidth: 150 }} value={docForm.name} onChange={e => setDocForm({ ...docForm, name: e.target.value })} />
                  <input type="email" placeholder="Email" required className="input" style={{ flex: 1, minWidth: 150 }} value={docForm.email} onChange={e => setDocForm({ ...docForm, email: e.target.value })} />
                  <input type="password" placeholder="Password" required className="input" style={{ flex: 1, minWidth: 120 }} value={docForm.password} onChange={e => setDocForm({ ...docForm, password: e.target.value })} />
                  <input type="text" placeholder="Specialization" className="input" style={{ flex: 1, minWidth: 150 }} value={docForm.specialization} onChange={e => setDocForm({ ...docForm, specialization: e.target.value })} />
                  <input type="number" placeholder="Fee ($)" className="input" style={{ width: 100 }} value={docForm.fee} onChange={e => setDocForm({ ...docForm, fee: e.target.value })} />
                  <button type="submit" className="btn btn-primary">Add</button>
                </form>

                {/* Doctors List */}
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Specialization</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map(d => (
                      <tr key={d.id}>
                        <td><strong>{d.name}</strong></td>
                        <td>{d.email}</td>
                        <td>{d.specialization}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDoctor(d.id)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
