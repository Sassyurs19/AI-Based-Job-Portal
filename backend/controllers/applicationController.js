const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ResumeAnalysis = require('../models/ResumeAnalysis');

const applyJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    const resume = req.file ? req.file.path.replace(/\\/g, '/') : req.user.resume || 'No resume uploaded';

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      recruiter: job.postedBy,
      coverLetter,
      resume
    });

    job.applicationCount += 1;
    job.applicants.push(application._id);
    await job.save();

    req.user.appliedJobs.push(application._id);
    await req.user.save();

    await Notification.create({
      recipient: job.postedBy,
      type: 'application',
      title: 'New Job Application',
      message: `${req.user.name} has applied to your job: ${job.title}`,
      link: `/recruiter/applications/${application._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title location salary jobType company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

const getJobApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email phone location skills avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    application.status = status;
    await application.save();

    await Notification.create({
      recipient: application.applicant._id,
      type: 'application',
      title: 'Application Status Updated',
      message: `Your application for ${application.job.title} has been ${status}`,
      link: `/candidate/applications/${application._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      application
    });
  } catch (error) {
    next(error);
  }
};

const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!req.user.savedJobs.includes(jobId)) {
      req.user.savedJobs.push(jobId);
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    req.user.savedJobs = req.user.savedJobs.filter(id => id.toString() !== jobId);
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Job removed from saved jobs'
    });
  } catch (error) {
    next(error);
  }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await Job.find({
      _id: { $in: req.user.savedJobs }
    }).populate('postedBy', 'name');

    res.status(200).json({
      success: true,
      count: savedJobs.length,
      jobs: savedJobs
    });
  } catch (error) {
    next(error);
  }
};

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file'
      });
    }

    req.user.resume = req.file.path.replace(/\\/g, '/');
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: req.file.path.replace(/\\/g, '/')
    });
  } catch (error) {
    next(error);
  }
};

const analyzeResume = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!req.user.resume && !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume first or provide a job ID'
      });
    }

    const job = jobId ? await Job.findById(jobId) : null;

    const skills = req.user.skills || [];
    const jobSkills = job ? job.skills : [];

    const matchedSkills = skills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    const missingSkills = jobSkills.filter(jobSkill =>
      !skills.some(skill =>
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );

    const overallScore = job ? Math.min(100, (matchedSkills.length / Math.max(jobSkills.length, 1)) * 100) : 75;
    const atsScore = Math.max(0, overallScore - 10);

    const analysis = await ResumeAnalysis.create({
      user: req.user._id,
      resume: req.user.resume || 'No resume uploaded',
      job: jobId,
      overallScore,
      sections: {
        summary: {
          score: overallScore,
          feedback: overallScore > 70 ? 'Strong profile match' : 'Consider adding more relevant skills'
        },
        skills: {
          score: overallScore,
          feedback: `${matchedSkills.length} skills matched out of ${jobSkills.length || skills.length}`,
          matchedSkills,
          missingSkills
        },
        experience: {
          score: 80,
          feedback: 'Experience section looks good'
        },
        education: {
          score: 75,
          feedback: 'Education section is present'
        },
        formatting: {
          score: 85,
          feedback: 'Resume formatting is clear'
        }
      },
      recommendations: [
        'Add more quantifiable achievements',
        'Include relevant keywords from job description',
        'Keep summary concise and impactful'
      ],
      atsScore
    });

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant')
      .populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Fetch matching ResumeAnalysis if it exists
    const analysis = await ResumeAnalysis.findOne({
      user: application.applicant._id,
      job: application.job._id
    });

    res.status(200).json({
      success: true,
      application,
      analysis: analysis || null
    });
  } catch (error) {
    next(error);
  }
};

const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    const job = await Job.findById(application.job);
    if (job) {
      job.applicationCount = Math.max(0, job.applicationCount - 1);
      job.applicants = job.applicants.filter(id => id.toString() !== req.params.id);
      await job.save();
    }

    req.user.appliedJobs = req.user.appliedJobs.filter(id => id.toString() !== req.params.id);
    await req.user.save();

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  saveJob,
  unsaveJob,
  getSavedJobs,
  uploadResume,
  analyzeResume,
  getApplicationById,
  withdrawApplication
};
