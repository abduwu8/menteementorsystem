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

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', { ...decoded, id: decoded.id });
    
    // Find user based on role and ensure role matches
    let user;
    if (decoded.role === 'mentor') {
      user = await Mentor.findById(decoded.id);
      if (user) {
        user.role = 'mentor'; // Explicitly set role
      }
      console.log('Found mentor:', user ? user._id : 'not found');
    } else if (decoded.role === 'mentee') {
      user = await Mentee.findById(decoded.id);
      if (user) {
        user.role = 'mentee'; // Explicitly set role
      }
      console.log('Found mentee:', user ? user._id : 'not found');
    }

    if (!user) {
      console.log('User not found for decoded token:', decoded);
      return res.status(401).json({ message: 'User not found' });
    }

    // Set user info on request object with explicit role
    const userObj = user.toObject();
    req.user = {
      ...userObj,
      id: user._id.toString(),
      _id: user._id.toString(),
      role: decoded.role // Ensure role is set from the token
    };

    // Add role to response headers for frontend reference
    res.set('X-User-Role', decoded.role);

    console.log('Auth successful:', {
      userId: req.user.id,
      role: req.user.role,
      method: req.method,
      path: req.path
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