// Add this route to your existing users.js routes file
router.get('/mentors', auth, async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' })
      .select('name email');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}); 