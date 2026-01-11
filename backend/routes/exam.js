const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/exams
// @desc    Get all exams (trainers see all, students see only assigned)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // If student, only show assigned exams
    if (req.user.role === 'student') {
      query.assignedStudents = req.user._id;
    }
    
    const exams = await Exam.find(query).populate('createdBy', 'name email');
    res.json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/exams
// @desc    Create exam (Trainer only)
// @access  Private/Trainer
router.post('/', protect, authorize('trainer', 'admin'), async (req, res) => {
  try {
    const examData = { ...req.body, createdBy: req.user._id };
    const exam = await Exam.create(examData);
    
    // Connect exam to assigned students
    if (exam.assignedStudents && exam.assignedStudents.length > 0) {
      for (const studentId of exam.assignedStudents) {
        await User.findByIdAndUpdate(studentId, {
          $addToSet: { assignedExams: exam._id }
        });
      }
    }
    
    res.status(201).json({
      success: true,
      data: exam
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/exams/:id
// @desc    Get single exam
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/exams/:id/questions
// @desc    Get all questions for an exam
// @access  Public
router.get('/:id/questions', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ 
        success: false,
        message: 'Exam not found' 
      });
    }

    const questions = await Question.find({ examId: req.params.id });
    
    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update exam (Trainer only)
// @access  Private/Trainer
router.put('/:id', protect, authorize('trainer', 'admin'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ 
        success: false,
        message: 'Exam not found' 
      });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      data: updatedExam
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam (Trainer only)
// @access  Private/Trainer
router.delete('/:id', protect, authorize('trainer', 'admin'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ 
        success: false,
        message: 'Exam not found' 
      });
    }

    // Delete all questions associated with this exam
    await Question.deleteMany({ examId: req.params.id });
    
    // Delete all submissions associated with this exam
    await Submission.deleteMany({ examId: req.params.id });

    // Delete the exam
    await Exam.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Exam and all associated data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;