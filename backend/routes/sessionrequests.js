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

module.exports = router; 