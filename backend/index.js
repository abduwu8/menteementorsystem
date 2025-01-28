const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth');
const mentorRoutes = require('./routes/mentors');
const menteeRoutes = require('./routes/mentees');
const sessionRoutes = require('./routes/sessions');
const mentorSessionRoutes = require('./routes/mentorSessions');
const lectureRoutes = require('./routes/lectureRequests');
const sessionRequestRoutes = require('./routes/sessionrequests');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/mentees', menteeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/mentor/sessions', mentorSessionRoutes);
app.use('/api/lecture-requests', lectureRoutes);
app.use('/api/sessionrequests', sessionRequestRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 