const router = require('express').Router();
const { getStudents } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Allow trainer and admin roles to access students
router.get('/students', protect, authorize('trainer', 'admin'), getStudents);

module.exports = router;
