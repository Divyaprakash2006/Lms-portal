const express = require('express');
const multer = require('multer');
const router = express.Router();
const MoodleImportService = require('../services/MoodleImportService');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { protect, authorize } = require('../middleware/auth');

// Configure multer for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only accept XML files
    if (file.mimetype === 'text/xml' || 
        file.mimetype === 'application/xml' || 
        file.originalname.endsWith('.xml')) {
      cb(null, true);
    } else {
      cb(new Error('Only XML files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @route   POST /api/questions/import/:examId
 * @desc    Import questions from Moodle XML file
 * @access  Private/Trainer
 */
router.post('/import/:examId', protect, authorize('trainer', 'admin'), upload.single('xmlFile'), async (req, res) => {
  try {
    const { examId } = req.params;
    
    // Validate exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an XML file'
      });
    }

    // Convert buffer to string
    const xmlContent = req.file.buffer.toString('utf-8');

    console.log('📥 Starting XML import for exam:', examId);
    console.log('📄 File size:', req.file.size, 'bytes');

    // Import questions
    const results = await MoodleImportService.importQuestionsFromXML(xmlContent, examId);

    console.log('✅ Import completed:', results);

    // Return detailed results
    res.status(200).json({
      success: true,
      message: `Import completed: ${results.success} succeeded, ${results.failed} failed out of ${results.total} questions`,
      data: results
    });

  } catch (error) {
    console.error('❌ Import error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to import questions',
      details: error.stack
    });
  }
});

/**
 * @route   POST /api/questions/import-preview/:examId
 * @desc    Preview questions from Moodle XML file without saving
 * @access  Private/Trainer
 */
router.post('/import-preview/:examId', protect, authorize('trainer', 'admin'), upload.single('xmlFile'), async (req, res) => {
  try {
    const { examId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an XML file'
      });
    }

    const xmlContent = req.file.buffer.toString('utf-8');
    const xml2js = require('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });
    const result = await parser.parseStringPromise(xmlContent);
    
    const questions = result.quiz.question;
    const questionArray = Array.isArray(questions) ? questions : [questions];
    
    const preview = questionArray
      .filter(q => q.$.type !== 'category')
      .map(q => {
        try {
          return MoodleImportService.parseMoodleQuestion(q, examId);
        } catch (error) {
          return {
            error: true,
            message: error.message,
            questionName: q.name?.text || 'Unknown'
          };
        }
      });

    res.status(200).json({
      success: true,
      data: {
        total: preview.length,
        questions: preview
      }
    });

  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to preview questions'
    });
  }
});

/**
 * @route   GET /api/questions/exam/:examId
 * @desc    Get all questions for a specific exam
 * @access  Public
 */
router.get('/exam/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    
    const questions = await Question.find({ examId }).select('-correctAnswer');
    
    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch questions'
    });
  }
});

/**
 * @route   GET /api/questions/:id
 * @desc    Get a single question
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch question'
    });
  }
});

/**
 * @route   DELETE /api/questions/:id
 * @desc    Delete a question
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    await question.deleteOne();
    
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete question'
    });
  }
});

module.exports = router;
