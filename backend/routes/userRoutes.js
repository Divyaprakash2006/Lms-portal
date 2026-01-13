const router = require('express').Router();
const { getStudents } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Allow trainer and admin roles to access students
router.get('/students', protect, authorize('trainer', 'admin'), getStudents);
router.post('/students', protect, authorize('trainer', 'admin'), require('../controllers/userController').createStudent);
router.put('/:id', protect, authorize('trainer', 'admin'), require('../controllers/userController').updateStudent);
router.delete('/:id', protect, authorize('trainer', 'admin'), require('../controllers/userController').deleteStudent);
// Subscribe route
router.put('/subscribe/:id', protect, require('../controllers/userController').subscribe);
router.post('/video-view/:id', protect, require('../controllers/userController').trackVideoView);

module.exports = router;
