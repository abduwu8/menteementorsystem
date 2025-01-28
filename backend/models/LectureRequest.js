const mongoose = require('mongoose');

const lectureRequestSchema = new mongoose.Schema({
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentee',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  proposedDate: {
    type: Date,
    required: [true, 'Proposed date is required']
  },
  proposedTime: {
    type: String,
    required: [true, 'Proposed time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const LectureRequest = mongoose.model('LectureRequest', lectureRequestSchema);

module.exports = LectureRequest; 