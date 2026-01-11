const router = require('express').Router();
const { createExam, getStudentExams, getAllExams, deleteExam } = require('../controllers/examController');
const { protect, trainerOnly } = require('../middleware/auth');

router.post('/create', protect, trainerOnly, createExam);
router.get('/student', protect, getStudentExams);
router.get('/', protect, getAllExams);
router.delete('/:id', protect, trainerOnly, deleteExam);

module.exports = router;
