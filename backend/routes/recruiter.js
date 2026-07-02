const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');

router.post('/profile', protect, authorize('recruiter'), recruiterController.createRecruiterProfile);
router.get('/profile', protect, authorize('recruiter'), recruiterController.getRecruiterProfile);
router.put('/profile', protect, authorize('recruiter'), uploadSingle('logo'), recruiterController.updateRecruiterProfile);
router.get('/dashboard', protect, authorize('recruiter'), recruiterController.getDashboard);

module.exports = router;
