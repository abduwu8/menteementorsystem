const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS for development
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Test route to verify Express is working
app.get('/test', (req, res) => {
  res.json({ message: 'Express server is working' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mentors', require('./routes/mentors'));
app.use('/api/mentees', require('./routes/mentees'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/sessionrequests', require('./routes/sessionrequests'));
app.use('/api/lecture-requests', require('./routes/lectureRequests'));
app.use('/api/chat', require('./routes/chat'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  const frontendBuildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendBuildPath));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 