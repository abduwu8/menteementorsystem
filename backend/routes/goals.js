const router = require('express').Router();
const Goal = require('../models/Goal');
const auth = require('../../server/middleware/auth');

// Get all goals for a mentee
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ mentee: req.user.id });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new goal
router.post('/', auth, async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      mentee: req.user.id
    });
    
    const newGoal = await goal.save();
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update goal progress
router.patch('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      mentee: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (req.body.progress) {
      goal.progress = req.body.progress;
      if (goal.progress === 100) {
        goal.status = 'completed';
      } else if (goal.progress > 0) {
        goal.status = 'in-progress';
      }
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 