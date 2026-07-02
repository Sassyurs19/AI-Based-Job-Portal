const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: String,
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  sections: {
    summary: {
      score: Number,
      feedback: String
    },
    skills: {
      score: Number,
      feedback: String,
      matchedSkills: [String],
      missingSkills: [String]
    },
    experience: {
      score: Number,
      feedback: String
    },
    education: {
      score: Number,
      feedback: String
    },
    formatting: {
      score: Number,
      feedback: String
    }
  },
  recommendations: [{
    type: String
  }],
  keywords: [{
    word: String,
    count: Number
  }],
  atsScore: {
    type: Number,
    min: 0,
    max: 100
  },
  analysisDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

resumeAnalysisSchema.index({ user: 1 });
resumeAnalysisSchema.index({ job: 1 });

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
