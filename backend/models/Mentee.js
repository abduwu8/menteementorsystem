const mongoose = require('mongoose');

const menteeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  interests: [{
    type: String
  }],
  goals: {
    type: String,
    default: ''
  },
  currentRole: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  connectedMentors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor'
  }]
}, {
  timestamps: true
});

// Add pre-save middleware for logging
menteeSchema.pre('save', function(next) {
  console.log('Saving mentee:', this.email);
  next();
});

module.exports = mongoose.model('Mentee', menteeSchema); 