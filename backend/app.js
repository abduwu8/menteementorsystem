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

// Connect to MongoDB with enhanced options
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mentors', require('./routes/mentors'));
app.use('/api/mentees', require('./routes/mentees'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/sessionrequests', require('./routes/sessionrequests'));
app.use('/api/lecture-requests', require('./routes/lectureRequests'));
app.use('/api/chat', require('./routes/chat'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Production setup
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode');
  
  const frontendBuildPath = path.join(__dirname, '../frontend/dist');
  console.log('Frontend build path:', frontendBuildPath);
  
  // Verify build directory exists
  if (fs.existsSync(frontendBuildPath)) {
    console.log('Frontend build directory exists');
    
    // Serve static files with proper MIME types
    app.use(express.static(frontendBuildPath, {
      maxAge: '1y',
      etag: true,
      index: false // Don't serve index.html automatically
    }));

    // Handle all routes
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api')) {
        return next();
      }

      const indexPath = path.join(frontendBuildPath, 'index.html');
      
      // Verify index.html exists
      if (fs.existsSync(indexPath)) {
        console.log('Serving index.html for path:', req.path);
        // Set proper headers for SPA
        res.set({
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/html',
        });
        res.sendFile(indexPath);
      } else {
        console.error('index.html not found at:', indexPath);
        res.status(404).send('Frontend not found');
      }
    });
  } else {
    console.error('Frontend build directory not found at:', frontendBuildPath);
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.status(404).send('Frontend build not found');
      } else {
        next();
      }
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler for API routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ message: 'API endpoint not found' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Node environment:', process.env.NODE_ENV);
  console.log('Current working directory:', process.cwd());
  console.log('Application directory:', __dirname);
});