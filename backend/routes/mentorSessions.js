const express = require('express');
const router = express.Router();
const SessionRequest = require('../models/SessionRequest');
const auth = require('../middleware/auth');

// Get upcoming sessions for a mentor
router.get('/upcoming', auth, async (req, res) => {
  try {
    // Verify user is a mentor
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ message: 'Only mentors can access this endpoint' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingSessions = await SessionRequest.find({
      mentor: req.user.id,
      date: { $gte: today },
      status: 'approved'
    })
    .populate('mentee', 'name email currentRole')
    .sort('date timeSlot.startTime')
    .lean();

    // Format the response to match frontend expectations
    const formattedSessions = upcomingSessions.map(session => ({
      _id: session._id,
      mentee: {
        fullName: session.mentee.name,
        email: session.mentee.email,
        currentRole: session.mentee.currentRole
      },
      topic: session.topic,
      scheduledDate: session.date.toISOString().split('T')[0],
      scheduledTime: `${session.timeSlot.startTime} - ${session.timeSlot.endTime}`,
      description: session.description,
      status: session.status
    }));

    console.log('Sending formatted sessions:', formattedSessions);
    res.json(formattedSessions);
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({ message: 'Error fetching upcoming sessions' });
  }
});

module.exports = router; 