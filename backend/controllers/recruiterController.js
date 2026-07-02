const Recruiter = require('../models/Recruiter');
const User = require('../models/User');

const createRecruiterProfile = async (req, res, next) => {
  try {
    const { company } = req.body;

    const existingRecruiter = await Recruiter.findOne({ user: req.user._id });
    if (existingRecruiter) {
      return res.status(400).json({
        success: false,
        message: 'Recruiter profile already exists'
      });
    }

    const recruiter = await Recruiter.create({
      user: req.user._id,
      company
    });

    res.status(201).json({
      success: true,
      message: 'Recruiter profile created successfully',
      recruiter
    });
  } catch (error) {
    next(error);
  }
};

const getRecruiterProfile = async (req, res, next) => {
  try {
    const recruiter = await Recruiter.findOne({ user: req.user._id })
      .populate('user', 'name email phone avatar');

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    res.status(200).json({
      success: true,
      recruiter
    });
  } catch (error) {
    next(error);
  }
};

const updateRecruiterProfile = async (req, res, next) => {
  try {
    const recruiter = await Recruiter.findOne({ user: req.user._id });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    if (req.body.company) {
      recruiter.company = { ...recruiter.company, ...req.body.company };
    }

    if (req.file) {
      recruiter.company.logo = req.file.path.replace(/\\/g, '/');
    }

    await recruiter.save();

    res.status(200).json({
      success: true,
      message: 'Recruiter profile updated successfully',
      recruiter
    });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const recruiter = await Recruiter.findOne({ user: req.user._id });
    const Job = require('../models/Job');
    const Application = require('../models/Application');

    const totalJobs = await Job.countDocuments({ postedBy: req.user._id });
    const activeJobs = await Job.countDocuments({ postedBy: req.user._id, status: 'active' });
    const totalApplications = await Application.countDocuments({ recruiter: req.user._id });
    const pendingApplications = await Application.countDocuments({ 
      recruiter: req.user._id, 
      status: 'pending' 
    });

    const recentJobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentApplications = await Application.find({ recruiter: req.user._id })
      .populate('applicant', 'name email avatar')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications
      },
      recentJobs,
      recentApplications
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecruiterProfile,
  getRecruiterProfile,
  updateRecruiterProfile,
  getDashboard
};
