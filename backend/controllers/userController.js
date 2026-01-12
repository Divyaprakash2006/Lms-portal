const User = require('../models/User');

exports.getStudents = async (req, res) => {
  try {
    console.log('Fetching students, requested by:', req.user.role);

    // Fetch only students with unique email addresses, sorted by name
    const students = await User.find({ role: 'student' })
      .select('name email role createdAt')
      .sort({ name: 1 })
      .lean();

    // Remove any potential duplicates based on email
    const uniqueStudents = students.filter((student, index, self) =>
      index === self.findIndex((s) => s.email === student.email)
    );

    console.log(`Found ${uniqueStudents.length} unique students`);

    res.json({
      success: true,
      count: uniqueStudents.length,
      data: uniqueStudents
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Build update object
    const updateFields = { name, email };

    // Only update password if provided
    if (password && password.trim() !== '') {
      // Note: We're relying on the User model's pre-save hook to hash the password
      // or if using findOneAndUpdate, we might need to hash it here manually 
      // if the hook isn't triggered. 
      // Let's use findById, update fields, and save() to ensure hooks run.
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.name = name || user.name;
      user.email = email || user.email;
      user.password = password; // Will be hashed by pre-save hook

      await user.save();

      return res.json({
        success: true,
        data: user
      });
    }

    // If no password change, we can use findOneAndUpdate for efficiency 
    // or just stick to the save pattern for consistency.
    // Let's use findByIdAndUpdate for non-password updates to avoid re-hashing issues if any
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message
    });
  }
};
