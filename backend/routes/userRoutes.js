const router = require('express').Router();
const { getStudents } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Allow trainer and admin roles to access students
router.get('/students', protect, authorize('trainer', 'admin'), getStudents);
router.put('/:id', protect, authorize('trainer', 'admin'), require('../controllers/userController').updateStudent);

module.exports = router;
