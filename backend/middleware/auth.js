const jwt = require('jsonwebtoken');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');

const auth = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
      console.log('Found token in Authorization header');
    }

    // If no token in header, check cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Found token in cookies');
    }

    // If no token found in either place, return error
    if (!token) {
      console.log('No token found in:', {
        headers: req.headers,
        cookies: req.cookies
      });
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('Verifying token:', token.substring(0, 20) + '...');
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Find user based on role
    let user;
    if (decoded.role === 'mentor') {
      user = await Mentor.findById(decoded.id);
      console.log('Found mentor:', user ? user._id : 'not found');
    } else if (decoded.role === 'mentee') {
      user = await Mentee.findById(decoded.id);
      console.log('Found mentee:', user ? user._id : 'not found');
    }

    if (!user) {
      console.log('User not found for decoded token:', decoded);
      return res.status(401).json({ message: 'User not found' });
    }

    // Set user info on request object
    req.user = user.toObject(); // Convert to plain object
    req.user.id = user._id;
    req.user._id = user._id;
    req.user.role = decoded.role;

    console.log('Auth successful:', {
      userId: req.user.id,
      role: req.user.role
    });

    next();
  } catch (err) {
    console.error('Auth middleware error:', {
      error: err.message,
      stack: err.stack,
      headers: req.headers,
      cookies: req.cookies
    });
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth; 