const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Configure CORS - Must be before other middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow same-origin requests in production
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  next();
});

// Other Middleware
app.use(express.json());
app.use(cookieParser());

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
  
  // Resolve paths
  const frontendBuildPath = path.resolve(__dirname, '../frontend/dist');
  console.log('Frontend build path:', frontendBuildPath);
  
  // Verify build directory exists
  if (fs.existsSync(frontendBuildPath)) {
    console.log('Frontend build directory exists');
    
    // Serve static files
    app.use(express.static(frontendBuildPath));

    // Serve index.html for all non-API routes (SPA support)
    app.get('/*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      
      const indexPath = path.join(frontendBuildPath, 'index.html');
      console.log('Attempting to serve:', indexPath);
      
      try {
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          console.error('index.html not found');
          res.status(404).send('Frontend file not found');
        }
      } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Error serving frontend');
      }
    });
  } else {
    console.error('Frontend build directory not found');
    app.get('/*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.status(404).send('Frontend not built');
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Node environment:', process.env.NODE_ENV);
  console.log('Current working directory:', process.cwd());
  console.log('Application directory:', __dirname);
});