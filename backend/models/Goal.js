const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentee',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  deadline: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema); 