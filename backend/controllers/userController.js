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
