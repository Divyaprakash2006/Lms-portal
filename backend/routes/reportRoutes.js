const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/reports
// @desc    Get all reports (Trainer only)
// @access  Private/Trainer
router.get('/', protect, authorize('trainer', 'admin'), async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('studentId', 'name email')
      .populate('examId', 'title subject')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
});

// @route   GET /api/reports/student/:studentId
// @desc    Get reports by student
// @access  Private
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const reports = await Report.find({ studentId: req.params.studentId })
      .populate('examId', 'title subject')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
});

// @route   GET /api/reports/exam/:examId
// @desc    Get reports by exam (Trainer only)
// @access  Private/Trainer
router.get('/exam/:examId', protect, authorize('trainer', 'admin'), async (req, res) => {
  try {
    const reports = await Report.find({ examId: req.params.examId })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
});

module.exports = router;
