const userSchema = new mongoose.Schema({
  // ... existing fields ...
  role: {
    type: String,
    enum: ['mentee', 'mentor'],
    required: true
  }
}); 