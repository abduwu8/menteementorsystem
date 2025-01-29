const express = require('express');
const router = express.Router();
const SessionRequest = require('../models/SessionRequest');
const auth = require('../middleware/auth');

// Get upcoming sessions for the authenticated user
router.get('/upcoming', auth, async (req, res) => {
  try {
    const now = new Date();
    const query = {
      mentor: req.user.id,
      date: { $gte: now },
      status: { $in: ['approved', 'pending'] }  // Include both approved and pending sessions
    };

    console.log('Fetching upcoming sessions with query:', query);

    const sessions = await SessionRequest.find(query)
      .populate('mentee', 'name email currentRole')
      .sort('date')
      .limit(3)
      .lean();

    console.log('Found sessions:', sessions);

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({ message: 'Error fetching upcoming sessions' });
  }
});

// Get all session requests for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'mentor' 
      ? { mentor: req.user.id }
      : { mentee: req.user.id };

    console.log('Fetching all sessions with query:', query);

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

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const sessionRequest = await SessionRequest.findOne({
      _id: requestId,
      $or: [
        { mentor: req.user.id },
        { mentee: req.user.id }
      ]
    });

    if (!sessionRequest) {
      return res.status(404).json({ message: 'Session request not found' });
    }

    // Only mentors can approve/reject, and only mentees can cancel
    if ((status === 'cancelled' && req.user.role !== 'mentee') ||
        (['approved', 'rejected'].includes(status) && req.user.role !== 'mentor')) {
      return res.status(403).json({ message: 'Unauthorized to perform this action' });
    }

    sessionRequest.status = status;
    await sessionRequest.save();

    // Return the updated session request with populated fields
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

module.exports = router; 