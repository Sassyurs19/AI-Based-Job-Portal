const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
    default: 'full-time'
  },
  salary: {
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  experience: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    name: {
      type: String,
      required: true
    },
    logo: String,
    website: String,
    industry: String,
    size: String,
    description: String
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  deadline: {
    type: Date
  },
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }]
}, {
  timestamps: true
});

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ location: 1, jobType: 1 });
jobSchema.index({ postedBy: 1 });

module.exports = mongoose.model('Job', jobSchema);
