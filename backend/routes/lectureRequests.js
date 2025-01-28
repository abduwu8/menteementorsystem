const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mock data (replace with database later)
const lectureRequests = [];

// Get all lecture requests
router.get('/', auth, async (req, res) => {
  try {
    res.json(lectureRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lecture requests' });
  }
});

// Create a lecture request
router.post('/', auth, async (req, res) => {
  try {
    const { mentorId, subject, description, date } = req.body;
    
    const newRequest = {
      id: Date.now().toString(),
      mentorId,
      menteeId: req.user.id,
      subject,
      description,
      date,
      status: 'pending'
    };
    
    lectureRequests.push(newRequest);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating lecture request' });
  }
});

// Update lecture request status
router.put('/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const request = lectureRequests.find(r => r.id === requestId);
    if (!request) {
      return res.status(404).json({ message: 'Lecture request not found' });
    }

    request.status = status;
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lecture request' });
  }
});

module.exports = router; 