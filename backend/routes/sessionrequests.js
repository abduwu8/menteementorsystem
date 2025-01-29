const express = require('express');
const router = express.Router();
const SessionRequest = require('../models/SessionRequest');
const auth = require('../middleware/auth');

// Get all session requests for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'mentor') {
      // For mentors, show only pending requests in the sessions page
      query = { 
        mentor: req.user.id,
        status: 'pending'
      };
    } else {
      // For mentees, show all their requests
      query = { 
        mentee: req.user.id
      };
    }

    console.log('Fetching session requests with query:', query);

    const sessions = await SessionRequest.find(query)
      .populate('mentor', 'name email currentRole expertise')
      .populate('mentee', 'name email currentRole')
      .sort('-date')
      .lean();

    console.log('Found sessions:', sessions);

    res.json(sessions);
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
      [req.user.role === 'mentor' ? 'mentor' : 'mentee']: req.user.id,
      status: 'approved',
      date: { $gte: now }
    };

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

// Complete a session
router.post('/:sessionId/complete', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find and remove the session
    const session = await SessionRequest.findByIdAndDelete(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // You might want to store completed sessions in a separate collection
    // or mark them as completed instead of deleting
    
    res.json({ message: 'Session marked as completed successfully' });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ message: 'Failed to complete session' });
  }
});

// Update session request status
router.put('/:requestId/status', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    console.log('Updating session request:', {
      requestId,
      status,
      userRole: req.user.role,
      userId: req.user.id
    });

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // First verify the user's role
    if (!req.user.role) {
      console.error('User role not found:', req.user);
      return res.status(403).json({ message: 'User role not found' });
    }

    // Verify user has permission for this action
    if ((['approved', 'rejected'].includes(status) && req.user.role !== 'mentor') ||
        (status === 'cancelled' && req.user.role !== 'mentee')) {
      console.log('Unauthorized action:', {
        requestedStatus: status,
        userRole: req.user.role,
        allowedRole: ['approved', 'rejected'].includes(status) ? 'mentor' : 'mentee'
      });
      return res.status(403).json({ 
        message: 'You do not have permission to handle this request',
        role: req.user.role,
        requiredRole: ['approved', 'rejected'].includes(status) ? 'mentor' : 'mentee'
      });
    }

    // Find the session request
    const sessionRequest = await SessionRequest.findOne({
      _id: requestId,
      [req.user.role === 'mentor' ? 'mentor' : 'mentee']: req.user.id
    });

    if (!sessionRequest) {
      console.log('Session request not found:', {
        requestId,
        userId: req.user.id,
        userRole: req.user.role
      });
      return res.status(404).json({ message: 'Session request not found' });
    }

    // Update the status
    sessionRequest.status = status;
    await sessionRequest.save();

    console.log('Session request updated successfully:', {
      requestId,
      newStatus: status,
      userRole: req.user.role
    });

    // Return the updated session request with populated fields
    const updatedRequest = await SessionRequest.findById(requestId)
      .populate('mentor', 'name email currentRole expertise')
      .populate('mentee', 'name email currentRole')
      .lean();

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating session request:', {
      error: error.message,
      stack: error.stack,
      requestId: req.params.requestId,
      userId: req.user?.id,
      userRole: req.user?.role
    });
    res.status(500).json({ message: 'Error updating session request' });
  }
});

module.exports = router; 