const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  questionText: {
    type: String,
    required: [true, 'Please add question text']
  },
  questionType: {
    type: String,
    enum: ['mcq', 'true-false', 'short-answer'],
    required: [true, 'Please specify question type']
  },
  options: {
    type: [String],
    default: []
  },
  correctAnswer: {
    type: String,
    required: [true, 'Please add correct answer']
  },
  marks: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);