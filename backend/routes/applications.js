const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middlewares/auth');
const { applicationValidation } = require('../middlewares/validator');
const { uploadSingle } = require('../middlewares/upload');

router.post('/apply', protect, authorize('candidate'), uploadSingle('resume'), applicationValidation, applicationController.applyJob);
router.get('/my-applications', protect, authorize('candidate'), applicationController.getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter'), applicationController.getJobApplications);
router.put('/:id/status', protect, authorize('recruiter'), applicationController.updateApplicationStatus);
router.post('/save', protect, authorize('candidate'), applicationController.saveJob);
router.delete('/save/:jobId', protect, authorize('candidate'), applicationController.unsaveJob);
router.get('/saved', protect, authorize('candidate'), applicationController.getSavedJobs);
router.post('/upload-resume', protect, authorize('candidate'), uploadSingle('resume'), applicationController.uploadResume);
router.post('/analyze-resume', protect, authorize('candidate'), applicationController.analyzeResume);
router.get('/:id', protect, authorize('recruiter', 'admin'), applicationController.getApplicationById);
router.delete('/:id', protect, authorize('candidate'), applicationController.withdrawApplication);

module.exports = router;
