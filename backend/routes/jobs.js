const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, authorize } = require('../middlewares/auth');
const { jobValidation, createJobValidation } = require('../middlewares/validator');

router.route('/')
  .get(jobController.getJobs)
  .post(protect, authorize('recruiter', 'admin'), createJobValidation, jobController.createJob);

router.route('/my-jobs')
  .get(protect, authorize('recruiter'), jobController.getMyJobs);

router.route('/stats')
  .get(protect, authorize('recruiter'), jobController.getJobStats);

router.route('/:id')
  .get(jobController.getJobById)
  .put(protect, authorize('recruiter', 'admin'), jobValidation, jobController.updateJob)
  .delete(protect, authorize('recruiter', 'admin'), jobController.deleteJob);

module.exports = router;
