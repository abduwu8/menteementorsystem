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
  // Don't exit the process, let the application continue
  // process.exit(1);
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

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Express server is working' });
});

// Production setup
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode');
  
  // Resolve paths
  const rootDir = path.resolve(__dirname, '..');
  const frontendBuildPath = path.join(rootDir, 'frontend', 'dist');
  const indexPath = path.join(frontendBuildPath, 'index.html');
  
  // Log all relevant paths
  console.log('Root directory:', rootDir);
  console.log('Frontend build path:', frontendBuildPath);
  console.log('Index.html path:', indexPath);
  
  // Check directory structure
  try {
    // Check if frontend/dist exists
    if (fs.existsSync(frontendBuildPath)) {
      console.log('Frontend build directory exists');
      
      // List contents of the build directory
      const files = fs.readdirSync(frontendBuildPath);
      console.log('Files in build directory:', files);
      
      // Check if index.html exists
      if (fs.existsSync(indexPath)) {
        console.log('index.html found');
        
        // Read index.html contents to verify it's readable
        try {
          const indexContent = fs.readFileSync(indexPath, 'utf8');
          console.log('Successfully read index.html, length:', indexContent.length);
          
          // Serve static files
          app.use(express.static(frontendBuildPath));
          
          // Root path handler
          app.get('/', (req, res) => {
            console.log('Serving root path (/)');
            res.sendFile(indexPath);
          });
          
          // Catch-all handler for client-side routing
          app.get('*', (req, res, next) => {
            if (req.path.startsWith('/api')) {
              return next();
            }
            console.log('Serving index.html for path:', req.path);
            res.sendFile(indexPath);
          });
          
        } catch (error) {
          console.error('Error reading index.html:', error);
          app.get('*', (req, res) => {
            res.status(500).send('Error reading index.html file');
          });
        }
      } else {
        console.error('index.html not found at:', indexPath);
        app.get('*', (req, res) => {
          res.status(404).send('index.html not found in build directory');
        });
      }
    } else {
      console.error('Build directory not found at:', frontendBuildPath);
      app.get('*', (req, res) => {
        res.status(404).send('Frontend build directory not found');
      });
    }
  } catch (error) {
    console.error('Error setting up static files:', error);
    app.get('*', (req, res) => {
      res.status(500).send('Server configuration error');
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
  } else if (process.env.NODE_ENV !== 'production') {
    res.status(404).json({ message: 'Not Found' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Node environment:', process.env.NODE_ENV);
  
  // Log current working directory and absolute path
  console.log('Current working directory:', process.cwd());
  console.log('Application directory:', __dirname);
  
  if (process.env.NODE_ENV === 'production') {
    const frontendBuildPath = path.resolve(__dirname, '../frontend/dist');
    console.log('Absolute frontend build path:', frontendBuildPath);
  }
}); 