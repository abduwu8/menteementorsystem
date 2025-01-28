const express = require('express');
const router = express.Router();
const Mentee = require('../models/Mentee');
const auth = require('../middleware/auth');

// Get all mentees
router.get('/', auth, async (req, res) => {
  try {
    const mentees = await Mentee.find({}, {
      password: 0,
      __v: 0
    });
    res.json(mentees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mentees' });
  }
});

// Get mentee profile
router.get('/profile', auth, async (req, res) => {
  try {
    const mentee = await Mentee.findById(req.user.id, {
      password: 0,
      __v: 0
    }).populate('connectedMentors', 'name email expertise');
    
    if (!mentee) {
      return res.status(404).json({ message: 'Mentee not found' });
    }
    res.json(mentee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update mentee profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { interests, goals, currentRole, education } = req.body;
    const updatedMentee = await Mentee.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          interests,
          goals,
          currentRole,
          education
        }
      },
      { new: true, select: '-password -__v' }
    );
    res.json(updatedMentee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Create a new mentee
router.post('/', async (req, res) => {
  const mentee = new Mentee(req.body);
  try {
    const newMentee = await mentee.save();
    res.status(201).json(newMentee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 