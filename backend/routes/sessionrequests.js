const express = require('express');
const router = express.Router();
const SessionRequest = require('../models/SessionRequest');
const auth = require('../middleware/auth');

// Get all session requests for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching session requests for user:', req.user.id);

    // Build query based on user role
    const query = req.user.role === 'mentor' 
      ? { mentor: req.user.id }
      : { mentee: req.user.id };

    const sessions = await SessionRequest.find(query)
      .populate({
        path: 'mentor',
        select: 'name email currentRole expertise',
        match: { _id: { $exists: true } }
      })
      .populate({
        path: 'mentee',
        select: 'name email currentRole',
        match: { _id: { $exists: true } }
      })
      .sort('-date')
      .lean();

    // Filter out any sessions where population failed
    const validSessions = sessions.filter(session => session.mentor && session.mentee);

    console.log('Found valid sessions:', validSessions);

    res.json(validSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Error fetching sessions' });
  }
});

// Get upcoming sessions for the authenticated user's dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const now = new Date();
    const query = {
      status: 'approved',
      date: { $gte: now }
    };

    // Add user-specific filter
    if (req.user.role === 'mentor') {
      query.mentor = req.user.id;
    } else {
      query.mentee = req.user.id;
    }

    console.log('Fetching dashboard sessions with query:', query);

    const sessions = await SessionRequest.find(query)
      .populate('mentor', 'name email currentRole expertise')
      .populate('mentee', 'name email currentRole')
      .sort('date timeSlot.startTime')
      .lean();

    console.log('Found dashboard sessions:', sessions);

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching dashboard sessions:', error);
    res.status(500).json({ message: 'Error fetching dashboard sessions' });
  }
});

// Get upcoming sessions
router.get('/upcoming', auth, async (req, res) => {
  try {
    const now = new Date();
    const query = {
      date: { $gte: now },
      status: 'approved'
    };

    // Add user-specific filter
    if (req.user.role === 'mentor') {
      query.mentor = req.user.id;
    } else {
      query.mentee = req.user.id;
    }

    console.log('Fetching upcoming sessions with query:', query);

    const sessions = await SessionRequest.find(query)
      .populate('mentor', 'name email currentRole expertise')
      .populate('mentee', 'name email currentRole')
      .sort('date timeSlot.startTime')
      .lean();

    console.log('Found upcoming sessions:', sessions);

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({ message: 'Error fetching upcoming sessions' });
  }
});

// Get available slots
router.get('/available', auth, async (req, res) => {
  try {
    const { mentorId, date } = req.query;
    const query = {
      mentor: mentorId,
      date: date ? new Date(date) : { $gte: new Date() },
      status: 'approved'
    };

    const bookedSessions = await SessionRequest.find(query)
      .select('timeSlot')
      .lean();

    const bookedSlots = bookedSessions.map(session => session.timeSlot);
    res.json(bookedSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Error fetching available slots' });
  }
});

// Create a new session request
router.post('/', auth, async (req, res) => {
  try {
    const { mentorId, date, timeSlot, topic, description } = req.body;

    // Verify user is a mentee
    if (req.user.role !== 'mentee') {
      return res.status(403).json({ message: 'Only mentees can create session requests' });
    }

    const sessionRequest = new SessionRequest({
      mentee: req.user.id,
      mentor: mentorId,
      date,
      timeSlot,
      topic,
      description,
      status: 'pending'
    });

    await sessionRequest.save();

    const populatedRequest = await SessionRequest.findById(sessionRequest._id)
      .populate('mentor', 'name email currentRole expertise')
      .populate('mentee', 'name email currentRole')
      .lean();

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Error creating session request:', error);
    res.status(500).json({ message: 'Error creating session request' });
  }
});

// Update session request status
router.put('/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find the session request and verify ownership
    const sessionRequest = await SessionRequest.findOne({
      _id: requestId,
      [req.user.role === 'mentor' ? 'mentor' : 'mentee']: req.user.id
    });

    if (!sessionRequest) {
      return res.status(404).json({ message: 'Session request not found' });
    }

    // Verify permissions based on role and requested status
    if (
      (req.user.role === 'mentor' && !['approved', 'rejected'].includes(status)) ||
      (req.user.role === 'mentee' && status !== 'cancelled')
    ) {
      return res.status(403).json({ message: 'Unauthorized to perform this action' });
    }

    sessionRequest.status = status;
    await sessionRequest.save();

    const updatedRequest = await SessionRequest.findById(requestId)
      .populate('mentor', 'name email currentRole expertise')
      .populate('mentee', 'name email currentRole')
      .lean();

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating session request:', error);
    res.status(500).json({ message: 'Error updating session request' });
  }
});

// Complete a session request
router.post('/:requestId/complete', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    console.log('Completing session request:', {
      requestId,
      userId: req.user.id,
      userRole: req.user.role
    });

    // Find the session request and verify ownership
    const sessionRequest = await SessionRequest.findOne({
      _id: requestId,
      [req.user.role === 'mentor' ? 'mentor' : 'mentee']: req.user.id
    });
    
    if (!sessionRequest) {
      console.log('Session request not found:', { requestId });
      return res.status(404).json({ message: 'Session request not found' });
    }

    // Verify session is in approved state
    if (sessionRequest.status !== 'approved') {
      console.log('Invalid session status for completion:', {
        requestId,
        currentStatus: sessionRequest.status
      });
      return res.status(400).json({ 
        message: 'Only approved sessions can be marked as completed'
      });
    }

    // Update status to completed
    sessionRequest.status = 'completed';
    await sessionRequest.save();

    // Return the updated session request with populated fields
    const updatedRequest = await SessionRequest.findById(requestId)
      .populate('mentor', 'name email currentRole expertise')
      .populate('mentee', 'name email currentRole')
      .lean();
    
    console.log('Session completed successfully:', {
      requestId,
      sessionData: updatedRequest
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error completing session:', {
      error: error.message,
      stack: error.stack,
      requestId: req.params.requestId
    });
    res.status(500).json({ message: 'Failed to complete session' });
  }
});

module.exports = router; 