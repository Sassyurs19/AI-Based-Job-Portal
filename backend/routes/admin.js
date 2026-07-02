const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/dashboard', protect, authorize('admin'), adminController.getDashboard);
router.get('/users', protect, authorize('admin'), adminController.getAllUsers);
router.put('/users/:id/status', protect, authorize('admin'), adminController.updateUserStatus);
router.get('/jobs', protect, authorize('admin'), adminController.getAllJobs);
router.delete('/jobs/:id', protect, authorize('admin'), adminController.deleteJob);
router.get('/recruiters', protect, authorize('admin'), adminController.getAllRecruiters);
router.put('/recruiters/:id/verify', protect, authorize('admin'), adminController.verifyRecruiter);

module.exports = router;
