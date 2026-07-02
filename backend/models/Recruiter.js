const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  company: {
    name: {
      type: String,
      required: true
    },
    logo: String,
    website: String,
    industry: String,
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    founded: Number,
    description: String,
    location: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    jobPostingsLimit: {
      type: Number,
      default: 5
    },
    jobPostingsUsed: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Recruiter', recruiterSchema);
