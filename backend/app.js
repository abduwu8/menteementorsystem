const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://oviedu.onrender.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// MongoDB connection (keep your existing implementation)
// ... [keep your existing MongoDB connection code] ...

// API Routes
// ... [keep your existing route configurations] ...

// Enhanced health check endpoints
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint for Render health checks
app.get('/', (req, res) => {
  res.sendStatus(200);
});

// Production setup
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode');
  
  const frontendBuildPath = path.join(__dirname, '../frontend/dist');
  
  // Verify build directory exists
  if (fs.existsSync(frontendBuildPath)) {
    console.log('Serving static files from:', frontendBuildPath);
    
    // Serve static assets
    app.use(express.static(frontendBuildPath));

    // Client-side routing fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
  } else {
    console.error('Frontend build not found at:', frontendBuildPath);
    app.get('*', (req, res) => {
      res.status(404).send('Frontend build not found');
    });
  }
}

// Error handling
// ... [keep your existing error handlers] ...

// Server initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {  // Added '0.0.0.0' here
  console.log(`Server is running on port ${PORT}`);
  console.log('Node environment:', process.env.NODE_ENV);
  console.log('Current working directory:', process.cwd());
});