const mongoose = require('mongoose');

const sessionRequestSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  topic: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const SessionRequest = mongoose.model('SessionRequest', sessionRequestSchema);

module.exports = SessionRequest; 