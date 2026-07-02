const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Recruiter = require('../models/Recruiter');

const getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'candidate' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    const activeJobs = await Job.countDocuments({ status: 'active' });
    const verifiedRecruiters = await Recruiter.countDocuments({ isVerified: true });

    const recentUsers = await User.find({ role: 'candidate' })
      .sort({ createdAt: -1 })
      .limit(10);

    const recentJobs = await Job.find()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const jobStats = await Job.aggregate([
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 }
        }
      }
    ]);

    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalRecruiters,
        totalJobs,
        totalApplications,
        activeJobs,
        verifiedRecruiters
      },
      recentUsers,
      recentJobs,
      jobStats,
      applicationStats
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      jobs
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getAllRecruiters = async (req, res, next) => {
  try {
    const recruiters = await Recruiter.find()
      .populate('user', 'name email isActive')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: recruiters.length,
      recruiters
    });
  } catch (error) {
    next(error);
  }
};

const verifyRecruiter = async (req, res, next) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id);
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found'
      });
    }

    recruiter.isVerified = true;
    await recruiter.save();

    const user = await User.findByIdAndUpdate(recruiter.user, { isVerified: true });

    res.status(200).json({
      success: true,
      message: 'Recruiter verified successfully',
      recruiter
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  updateUserStatus,
  getAllJobs,
  deleteJob,
  getAllRecruiters,
  verifyRecruiter
};
