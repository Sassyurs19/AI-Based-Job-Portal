const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  coverLetter: {
    type: String
  },
  resume: {
    type: String,
    required: true
  },
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiScore: {
    type: Number,
    min: 0,
    max: 100
  },
  aiAnalysis: {
    type: String
  },
  interviewSchedule: {
    date: Date,
    time: String,
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person']
    },
    location: String,
    meetingLink: String
  }
}, {
  timestamps: true
});

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ recruiter: 1 });

module.exports = mongoose.model('Application', applicationSchema);
