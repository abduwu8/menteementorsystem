const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const SessionRequest = require('../models/SessionRequest');
const auth = require('../middleware/auth');

// Get all mentors
router.get('/', auth, async (req, res) => {
  try {
    const mentors = await Mentor.find({}, {
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0
    });
    res.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ message: 'Error fetching mentors' });
  }
});

// Get mentor by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id, {
      password: 0,
      __v: 0
    });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    res.json(mentor);
  } catch (error) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({ message: 'Error fetching mentor' });
  }
});

// Update mentor profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, expertise, yearsOfExperience, currentRole, company, linkedIn, availableSlots } = req.body;
    const updatedMentor = await Mentor.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          name,
          bio,
          expertise,
          yearsOfExperience,
          currentRole,
          company,
          linkedIn,
          availableSlots
        }
      },
      { new: true, select: '-password -__v' }
    );
    res.json(updatedMentor);
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Add this route to get mentor's dashboard stats
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    // Get total sessions
    const totalSessions = await SessionRequest.countDocuments({
      mentor: req.user.id,
      status: 'completed'
    });

    // Calculate total hours spent
    const sessions = await SessionRequest.find({
      mentor: req.user.id,
      status: 'completed'
    });
    const hoursSpent = sessions.reduce((total, session) => {
      const duration = (new Date(session.timeSlot.endTime) - new Date(session.timeSlot.startTime)) / (1000 * 60 * 60);
      return total + duration;
    }, 0);

    // Get active mentees (unique mentees from completed sessions)
    const uniqueMentees = await SessionRequest.distinct('mentee', {
      mentor: req.user.id,
      status: 'completed'
    });

    res.json({
      totalSessions,
      hoursSpent: Math.round(hoursSpent),
      activeMentees: uniqueMentees.length
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

module.exports = router; 