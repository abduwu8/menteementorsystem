const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const auth = require('../middleware/auth');
const Mentor = require('../models/Mentor');
const SessionRequest = require('../models/SessionRequest');

// Get all sessions for the authenticated user (mentor or mentee)
router.get('/my-sessions', auth, async (req, res) => {
  try {
    const query = req.user.role === 'mentor' 
      ? { mentor: req.user.id }
      : { mentee: req.user.id };

    const sessions = await SessionRequest.find(query)
      .populate('mentor', 'name email currentRole expertise')
      .populate('mentee', 'name email currentRole')
      .sort('-date')
      .lean();

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Error fetching sessions' });
  }
});

// Get upcoming sessions for the authenticated user
router.get('/upcoming', auth, async (req, res) => {
  try {
    const now = new Date();
    const query = {
      [req.user.role === 'mentor' ? 'mentor' : 'mentee']: req.user.id,
      date: { $gte: now },
      status: 'approved'
    };

    const sessions = await SessionRequest.find(query)
      .populate(req.user.role === 'mentor' ? 'mentee' : 'mentor', 'name email currentRole')
      .sort('date')
      .lean();

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({ message: 'Error fetching upcoming sessions' });
  }
});

// Get upcoming sessions for mentor
router.get('/upcoming', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    const sessions = await Session.find({
      mentor: req.user.id,
      status: 'approved',
      date: { $gte: currentDate }
    })
    .populate('mentee', 'name email')
    .sort({ date: 1 })
    .limit(3);

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({ message: 'Error fetching upcoming sessions' });
  }
});

// Get available sessions
router.get('/available', auth, async (req, res) => {
  try {
    const mentors = await Mentor.find({}, 'name availableSlots');
    const availableSessions = mentors.map(mentor => ({
      mentorId: mentor._id,
      mentorName: mentor.name,
      slots: mentor.availableSlots
    }));
    res.json(availableSessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available sessions' });
  }
});

// Get session requests (for mentors)
router.get('/requests', auth, async (req, res) => {
  try {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ message: 'Only mentors can view session requests' });
    }

    const requests = await SessionRequest.find({
      mentor: req.user.id,
      status: 'pending'
    })
    .populate('mentee', 'name email currentRole')
    .sort('-createdAt')
    .lean();

    res.json(requests);
  } catch (error) {
    console.error('Error fetching session requests:', error);
    res.status(500).json({ message: 'Error fetching session requests' });
  }
});

// Get booked slots for a mentor on a specific date
router.get('/booked-slots', auth, async (req, res) => {
  try {
    const { mentorId, date } = req.query;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedSessions = await SessionRequest.find({
      mentor: mentorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'approved'
    })
    .select('timeSlot')
    .lean();

    const bookedSlots = bookedSessions.map(session => session.timeSlot);
    res.json(bookedSlots);
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ message: 'Error fetching booked slots' });
  }
});

// Get all sessions for a user (mentor or mentee)
router.get('/', auth, async (req, res) => {
  try {
    let sessions;
    
    if (req.user.role === 'mentee') {
      // For mentees, get their session requests
      sessions = await SessionRequest.find({
        mentee: req.user._id
      })
      .populate('mentor', 'name email expertise')
      .sort({ date: 1 })
      .lean();
    } else {
      // For mentors, get their sessions
      sessions = await Session.find({
        mentor: req.user._id
      })
      .populate('mentor', 'name')
      .populate('mentee', 'name')
      .sort({ date: 1 });
    }

    // Add a more descriptive error message if no sessions are found
    if (!sessions) {
      return res.status(404).json({ message: 'No sessions found' });
    }

    res.json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ message: 'Error fetching sessions' });
  }
});

// Request a new session
router.post('/request', auth, async (req, res) => {
  try {
    const { mentorId, date, timeSlot, topic, description } = req.body;

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
    res.status(201).json(sessionRequest);
  } catch (error) {
    console.error('Error creating session request:', error);
    res.status(500).json({ message: 'Error creating session request' });
  }
});

// Handle session request (approve/reject)
router.put('/requests/:requestId', auth, async (req, res) => {
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

    res.json(sessionRequest);
  } catch (error) {
    console.error('Error handling session request:', error);
    res.status(500).json({ message: 'Error handling session request' });
  }
});

// Schedule a session
router.post('/:sessionId/schedule', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { mentorId, slotId } = req.body;

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Here you would typically update the slot's availability and create a session record
    res.json({ message: 'Session scheduled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error scheduling session' });
  }
});

module.exports = router; 