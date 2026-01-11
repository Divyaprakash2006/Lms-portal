const Exam = require('../models/Exam');
const User = require('../models/User');

exports.createExam = async (req, res) => {
  const exam = await Exam.create(req.body);

  // 🔗 CONNECT EXAM TO STUDENTS
  for (const studentId of req.body.assignedStudents) {
    await User.findByIdAndUpdate(studentId, {
      $addToSet: { assignedExams: exam._id }
    });
  }

  res.status(201).json(exam);
};

exports.getStudentExams = async (req, res) => {
  const exams = await Exam.find({
    assignedStudents: req.user._id
  });
  res.json({
    success: true,
    count: exams.length,
    data: exams
  });
};

exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find();
    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    await exam.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
