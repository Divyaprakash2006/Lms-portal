const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    studentName: {
      type: String,
      required: true,
    },
    examTitle: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pass', 'fail'],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);