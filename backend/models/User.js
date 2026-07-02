const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter', 'admin'],
    default: 'candidate'
  },
  phone: {
    type: String,
    trim: true
  },
  dob: {
    type: Date
  },
  location: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  resume: {
    type: String,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  softSkills: [{
    type: String,
    trim: true
  }],
  experience: [{
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    startDate: Date,
    endDate: Date,
    field: String
  }],
  projects: [{
    title: String,
    description: String
  }],
  certifications: [{
    type: String,
    trim: true
  }],
  languages: [{
    name: String,
    proficiency: String
  }],
  bio: {
    type: String,
    maxlength: 500
  },
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  appliedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationOTP: {
    type: String,
    select: false
  },
  verificationOTPExpiry: {
    type: Date,
    select: false
  },
  refreshToken: {
    type: String,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateRefreshToken = function() {
  const crypto = require('crypto');
  const refreshToken = crypto.randomBytes(32).toString('hex');
  this.refreshToken = refreshToken;
  return refreshToken;
};

module.exports = mongoose.model('User', userSchema);
