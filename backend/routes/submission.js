const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const Exam = require('../models/Exam');

/**
 * Evaluate submission automatically
 * @param {Array} answers - Student's answers
 * @param {String} examId - Exam ID
 * @returns {Object} Evaluation results
 */
async function evaluateSubmission(answers, examId) {
  try {
    // Get all questions for the exam
    const questions = await Question.find({ examId });
    
    let totalScore = 0;
    let totalMarks = 0;
    const evaluatedAnswers = [];

    for (const studentAnswer of answers) {
      const question = questions.find(q => q._id.toString() === studentAnswer.questionId.toString());
      
      if (!question) continue;

      totalMarks += question.marks;
      
      // Check if answer is correct
      const isCorrect = studentAnswer.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      
      if (isCorrect) {
        totalScore += question.marks;
      }

      evaluatedAnswers.push({
        questionId: studentAnswer.questionId,
        answer: studentAnswer.answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        marksObtained: isCorrect ? question.marks : 0,
        totalMarks: question.marks
      });
    }

    const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

    return {
      score: totalScore,
      totalMarks,
      percentage: Math.round(percentage * 100) / 100,
      evaluatedAnswers
    };
  } catch (error) {
    throw new Error(`Evaluation failed: ${error.message}`);
  }
}

const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/submissions
// @desc    Get all submissions (Trainer only)
// @access  Private/Trainer
router.get('/', protect, authorize('trainer', 'admin'), async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('examId', 'title')
      .populate('studentId', 'name email');
      
    res.json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/submissions/student/:studentId
// @desc    Get submissions by student
// @access  Private
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    // Students can only view their own submissions
    if (req.user.role === 'student' && req.user._id.toString() !== req.params.studentId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only view your own submissions' 
      });
    }
    
    const submissions = await Submission.find({ studentId: req.params.studentId })
      .populate('examId', 'title subject totalMarks passingMarks')
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });
      
    res.json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/submissions/exam/:examId
// @desc    Get submissions by exam (Trainer only)
// @access  Private/Trainer
router.get('/exam/:examId', protect, authorize('trainer', 'admin'), async (req, res) => {
  try {
    const submissions = await Submission.find({ examId: req.params.examId })
      .populate('examId', 'title')
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });
      
    res.json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/submissions/:id
// @desc    Get single submission with detailed results
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('examId', 'title subject totalMarks passingMarks')
      .populate('studentId', 'name email');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Get questions for detailed view
    const questionIds = submission.answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    // Build detailed results
    const detailedAnswers = submission.answers.map(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId.toString());
      return {
        questionId: answer.questionId,
        questionText: question ? question.questionText : 'Unknown',
        questionType: question ? question.questionType : 'Unknown',
        studentAnswer: answer.answer,
        correctAnswer: answer.correctAnswer,
        isCorrect: answer.isCorrect,
        marksObtained: answer.marksObtained,
        totalMarks: answer.totalMarks
      };
    });

    res.json({
      success: true,
      data: {
        ...submission.toObject(),
        detailedAnswers
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/submissions
// @desc    Submit exam and auto-evaluate
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { examId, studentId, answers, timeTaken } = req.body;

    // Validate exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Auto-evaluate the submission
    const evaluation = await evaluateSubmission(answers, examId);

    // Determine pass/fail status
    const isPassed = evaluation.score >= exam.passingMarks;

    // Create submission with evaluation results
    const submission = await Submission.create({
      examId,
      studentId,
      answers: evaluation.evaluatedAnswers,
      score: evaluation.score,
      totalMarks: evaluation.totalMarks,
      percentage: evaluation.percentage,
      status: 'evaluated',
      submittedAt: new Date(),
      timeTaken
    });

    // Populate references for response
    const populatedSubmission = await Submission.findById(submission._id)
      .populate('examId', 'title subject totalMarks passingMarks')
      .populate('studentId', 'name email');

    res.status(201).json({
      success: true,
      message: `Exam submitted and evaluated. You ${isPassed ? 'PASSED' : 'FAILED'}!`,
      data: {
        ...populatedSubmission.toObject(),
        isPassed,
        result: isPassed ? 'PASS' : 'FAIL',
        evaluation: evaluation
      }
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to submit exam' 
    });
  }
});

module.exports = router;