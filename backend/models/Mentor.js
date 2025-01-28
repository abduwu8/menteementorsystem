const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v) {
        // Validate time format (HH:mm)
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format. Use HH:mm`
    }
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    validate: {
      validator: function(v) {
        // Validate time format (HH:mm)
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format. Use HH:mm`
    }
  }
}, { 
  _id: false,
  timestamps: false,
  validateBeforeSave: true
});

// Add validation to ensure end time is after start time
timeSlotSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    const start = new Date(`1970-01-01T${this.startTime}`);
    const end = new Date(`1970-01-01T${this.endTime}`);
    if (end <= start) {
      this.invalidate('endTime', 'End time must be after start time');
    }
  }
  next();
});

const availableSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(v) {
        // Ensure date is not in the past
        return v >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Date cannot be in the past'
    }
  },
  timeSlots: {
    type: [timeSlotSchema],
    validate: {
      validator: function(slots) {
        if (!Array.isArray(slots) || slots.length === 0) return true;
        
        // Sort slots by start time
        const sortedSlots = [...slots].sort((a, b) => {
          const timeA = new Date(`1970-01-01T${a.startTime}`);
          const timeB = new Date(`1970-01-01T${b.startTime}`);
          return timeA - timeB;
        });

        // Check for overlapping slots
        for (let i = 1; i < sortedSlots.length; i++) {
          const prevEnd = new Date(`1970-01-01T${sortedSlots[i-1].endTime}`);
          const currentStart = new Date(`1970-01-01T${sortedSlots[i].startTime}`);
          if (currentStart <= prevEnd) {
            return false;
          }
        }
        return true;
      },
      message: 'Time slots cannot overlap'
    }
  }
}, { _id: false });

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  expertise: {
    type: [String],
    required: [true, 'At least one expertise is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Please select at least one area of expertise'
    }
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Years of experience cannot be negative']
  },
  currentRole: {
    type: String,
    required: [true, 'Current role is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true
  },
  linkedIn: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/([a-zA-Z0-9-]+\.)?linkedin\.com\/.*$/,
      'Please enter a valid LinkedIn URL'
    ]
  },
  availableSlots: {
    type: [availableSlotSchema],
    validate: {
      validator: function(slots) {
        // Ensure each date appears at most once
        const dates = slots.map(slot => slot.date.toISOString().split('T')[0]);
        return new Set(dates).size === dates.length;
      },
      message: 'Each date can only appear once in available slots'
    },
    default: []
  },
  mentees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentee'
  }]
}, {
  timestamps: true,
  collection: 'mentors'
});

// Add pre-save middleware for logging
mentorSchema.pre('save', function(next) {
  console.log('Saving mentor:', this.email);
  next();
});

// Add method to transform yearsOfExperience to number
mentorSchema.pre('save', function(next) {
  if (typeof this.yearsOfExperience === 'string') {
    this.yearsOfExperience = Number(this.yearsOfExperience);
  }
  next();
});

const Mentor = mongoose.model('Mentor', mentorSchema);

module.exports = Mentor; 