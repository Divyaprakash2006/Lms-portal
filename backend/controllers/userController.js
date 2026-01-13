const User = require('../models/User');

exports.getStudents = async (req, res) => {
  try {
    console.log('Fetching students, requested by:', req.user.role);

    // Build query based on role
    let query = { role: 'student' };

    // If trainer, show students created by them OR legacy students (no creator)
    if (req.user.role === 'trainer') {
      query.$or = [
        { createdBy: req.user._id },
        { createdBy: { $exists: false } },
        { createdBy: null }
      ];
    }

    // Fetch students
    const students = await User.find(query)
      .select('name email role createdAt +plainPassword')
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
      user.plainPassword = password; // Update plain password

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

exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Ensure we are deleting a student
    if (student.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Can only delete students' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Failed to delete student' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      plainPassword: password, // Important for Trainer visibility
      role: 'student',
      createdBy: req.user._id // Track who created this student
    });

    // Return the new student (including plainPassword for immediate display if needed)
    // But usually simple response is enough. The list refresh will pick it up.

    res.status(201).json({
      success: true,
      data: user,
      message: 'Student created successfully'
    });

  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student: ' + error.message
    });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isSubscribed = true;
    user.plan = req.body.plan || 'medium'; // Default to medium if not specified
    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'Subscription successful'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe'
    });
  }
};

exports.trackVideoView = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Reset count if new day OR if user has no videoUsage data
    if (!user.videoUsage || user.videoUsage.date !== today) {
      user.videoUsage = { date: today, count: 0 };
    }

    // Check limit for 'active' plan
    // Active plan users get 2 free videos daily
    const isBasicPlan = user.plan === 'active' || user.plan === 'basic' || !user.plan;

    // Allow if:
    // 1. Not basic plan (Medium/Pro)
    // 2. OR count < 2 (Limit for basic)

    if (!isBasicPlan || user.videoUsage.count < 2) {
      user.videoUsage.count += 1;
      await user.save();
      return res.json({ success: true, allowed: true, count: user.videoUsage.count });
    } else {
      return res.json({ success: true, allowed: false, message: 'Daily limit reached' });
    }

  } catch (error) {
    console.error('Track video view error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
