const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
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
    required: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  }
}, { 
  timestamps: true,
  collection: 'sessions' // Use the same collection as SessionRequest
});

module.exports = mongoose.model('Session', sessionSchema); 