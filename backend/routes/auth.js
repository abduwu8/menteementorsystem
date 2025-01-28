const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const mongoose = require('mongoose');

// Mock user data (replace with database later)
const users = [];

// Add this test route at the top of your routes
router.get('/test', async (req, res) => {
  try {
    // Test database connection
    const mentorCount = await Mentor.countDocuments();
    const menteeCount = await Mentee.countDocuments();
    
    // Test model creation
    const testMentor = new Mentor({
      name: 'Test Mentor',
      email: 'test@mentor.com',
      password: 'password123'
    });

    console.log('Test mentor model:', testMentor);
    
    res.json({
      message: 'Test route working',
      dbConnection: mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected',
      collections: {
        mentors: mentorCount,
        mentees: menteeCount
      }
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user based on role
    let user;
    if (role === 'mentor') {
      user = await Mentor.findOne({ email });
    } else if (role === 'mentee') {
      user = await Mentee.findOne({ email });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      role: role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    // Send token as cookie and in response
    res.cookie('token', token, cookieOptions)
      .json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: role
        }
      });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, expertise, bio, yearsOfExperience, currentRole, company } = req.body;

    // Check if user already exists
    let existingUser;
    if (role === 'mentor') {
      existingUser = await Mentor.findOne({ email });
    } else if (role === 'mentee') {
      existingUser = await Mentee.findOne({ email });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user based on role
    const hashedPassword = await bcrypt.hash(password, 12);
    let user;

    if (role === 'mentor') {
      user = new Mentor({
        name,
        email,
        password: hashedPassword,
        expertise: expertise || [],
        bio: bio || '',
        yearsOfExperience: yearsOfExperience || 0,
        currentRole: currentRole || '',
        company: company || ''
      });
    } else {
      user = new Mentee({
        name,
        email,
        password: hashedPassword,
        interests: [],
        goals: '',
        currentRole: currentRole || ''
      });
    }

    await user.save();

    const payload = {
      id: user.id,
      role: role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    // Send token as cookie and in response
    res.cookie('token', token, cookieOptions)
      .status(201)
      .json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: role
        }
      });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out successfully' });
});

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    // Test database connection
    const dbState = mongoose.connection.readyState;
    const connectionStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Test write access
    const testUser = new Mentor({
      name: 'Test User',
      email: `test_${Date.now()}@test.com`,
      password: 'test123'
    });

    const savedUser = await testUser.save();
    await Mentor.findByIdAndDelete(savedUser._id);

    res.json({
      success: true,
      database: {
        status: connectionStatus[dbState],
        name: mongoose.connection.name,
        host: mongoose.connection.host,
      },
      collections: collectionNames,
      models: mongoose.modelNames(),
      writeTest: 'successful'
    });
  } catch (error) {
    console.error('Database test failed:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        code: error.code,
        connectionState: mongoose.connection.readyState
      }
    });
  }
});

// Refresh token route
router.post('/refresh-token', async (req, res) => {
  try {
    // Get the token from the cookie or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify the existing token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user
    let user;
    if (decoded.role === 'mentor') {
      user = await Mentor.findById(decoded.id);
    } else if (decoded.role === 'mentee') {
      user = await Mentee.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate a new token
    const newToken = jwt.sign(
      { id: user.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    // Send new token as cookie and in response
    res.cookie('token', newToken, cookieOptions)
      .json({
        token: newToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: decoded.role
        }
      });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router; 