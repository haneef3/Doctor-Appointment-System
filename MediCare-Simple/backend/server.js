// ─────────────────────────────────────────────────────────────
//  MediCare Simple Backend  –  server.js (MongoDB version)
// ─────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 4000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors()); // Allow all frontend ports (5173, 5174, etc)
app.use(express.json());

// ── Database Connection ───────────────────────────────────────
mongoose.connect('mongodb://127.0.0.1:27017/medicare_simple')
  .then(() => console.log('✅ MongoDB Connected to medicare_simple'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// ── Mongoose Models ───────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'doctor', 'admin'], default: 'user' },
  // Doctor specifics
  specialization: { type: String },
  fee: { type: Number },
  available: { type: Boolean, default: true }
});
const User = mongoose.model('User', UserSchema);

const AppointmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: String,
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: String,
  date: String,
  time: String,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
});
const Appointment = mongoose.model('Appointment', AppointmentSchema);

// ── AUTH ROUTES ───────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });

    const newUser = await User.create({ name, email, password, role: 'user' });
    res.json({ success: true, message: 'Registered successfully', data: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET DOCTORS ───────────────────────────────────────────────
app.get('/api/doctors', async (req, res) => {
  try {
    const docs = await User.find({ role: 'doctor' }).select('-password');
    // Map _id to id for frontend compatibility
    const mappedDocs = docs.map(d => ({ ...d.toObject(), id: d._id }));
    res.json({ success: true, data: mappedDocs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── ADMIN DOCTOR MANAGEMENT ───────────────────────────────────
app.post('/api/admin/doctors', async (req, res) => {
  try {
    const { name, email, password, specialization, fee } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Fields required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });

    const newDoctor = await User.create({
      name, email, password, role: 'doctor',
      specialization: specialization || 'General', 
      fee: fee ? Number(fee) : 500, 
      available: true
    });

    res.json({ success: true, message: 'Doctor added', data: { ...newDoctor.toObject(), id: newDoctor._id } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/api/admin/doctors/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doctor = await User.findOneAndUpdate({ _id: id, role: 'doctor' }, req.body, { new: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    res.json({ success: true, message: 'Doctor updated' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/admin/doctors/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await User.findOneAndDelete({ _id: id });
    await Appointment.deleteMany({ doctorId: id });
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── APPOINTMENT ROUTES ────────────────────────────────────────

app.get('/api/appointments', async (req, res) => {
  try {
    const { userId, role } = req.query;
    let query = {};

    // Filter based on role
    if (userId && role) {
      if (role === 'user') query.patientId = userId;
      else if (role === 'doctor') query.doctorId = userId;
    }

    const appointments = await Appointment.find(query);
    const mapped = appointments.map(a => ({ ...a.toObject(), id: a._id }));

    res.json({ success: true, data: mapped });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { doctorId, patientId, date, time } = req.body;
    if (!doctorId || !patientId || !date || !time) return res.status(400).json({ success: false, message: 'Missing fields' });

    // Check if the doctor is already booked for this specific date and time
    const existingAppointment = await Appointment.findOne({ 
      doctorId, 
      date, 
      time, 
      status: { $ne: 'cancelled' } // ignore cancelled appointments
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked for this doctor' });
    }

    const doctor = await User.findById(doctorId);
    const patient = await User.findById(patientId);

    if (!doctor || !patient) return res.status(404).json({ success: false, message: 'User/Doctor not found' });

    const newAppointment = await Appointment.create({
      doctorId: doctor._id,
      doctorName: doctor.name,
      patientId: patient._id,
      patientName: patient.name,
      date,
      time,
      status: 'pending'
    });

    res.json({ success: true, message: 'Appointment booked', data: { ...newAppointment.toObject(), id: newAppointment._id } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const appt = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
    if (!appt) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, message: 'Status updated' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Appointment.findByIdAndDelete(id);
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Database Connection & Start ───────────────────────────────

const startServer = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/medicare_simple');
    console.log('✅ MongoDB Connected to medicare_simple');

    // Seed Admin
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      await User.create({ name: 'Admin User', email: 'admin@medicare.com', password: '123', role: 'admin' });
      console.log('✅ Default Admin seeded (admin@medicare.com / 123)');
    }

    app.listen(PORT, () => {
      console.log(`\n🏥 MediCare Simple API (MongoDB) → http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log('❌ Failed to start server or connect to MongoDB:', err.message);
    console.log('💡 TIP: Make sure your MongoDB service is running!');
  }
};

startServer();
