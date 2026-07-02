const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const sendEmail = require('../utils/email');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otp');
const { 
  getWelcomeEmail, 
  getEmailVerificationOTP, 
  getForgotPasswordOTP, 
  getPasswordResetConfirmation 
} = require('../utils/emailTemplates');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Check if user signed up with Google
      if (existingUser.provider === 'google') {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered with Google. Please use Google login or set a password.',
          requiresPassword: true
        });
      }
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate',
      provider: 'local'
    });

    // Generate and send OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.verificationOTP = hashedOTP;
    user.verificationOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP email with template
    const html = getEmailVerificationOTP(name || 'User', otp);

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - AI Hire',
      html
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      requiresVerification: true,
      userId: user._id
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user has a password set (for Google users who haven't set password yet)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'No password set for this account. Please use Google login or set a password via forgot password.',
        requiresPassword: true
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const token = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP email with template
    const html = getForgotPasswordOTP(user.name || 'User', otp);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset Your Password - AI Hire',
        html
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Return success anyway to prevent email enumeration
      // But log the error for debugging
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent.',
        warning: 'Email service unavailable. Please contact support if you do not receive the code.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordOTPExpiry');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    await user.save();

    // Send password reset confirmation email
    const html = getPasswordResetConfirmation(user.name || 'User');

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Successful - AI Hire',
      html
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

const verifyPasswordResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordOTPExpiry');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP expired
    if (Date.now() > user.resetPasswordOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (!verifyOTP(otp, user.resetPasswordOTP)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

const setPassword = async (req, res, next) => {
  try {
    const { userId, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password set successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location, bio, skills, softSkills, experience, education, projects, certifications, languages } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = skills;
    if (softSkills) user.softSkills = softSkills;
    if (experience) user.experience = experience;
    if (education) user.education = education;
    if (projects) user.projects = projects;
    if (certifications) user.certifications = certifications;
    if (languages) user.languages = languages;

    if (req.file) {
      user.avatar = req.file.path.replace(/\\/g, '/');
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        skills: user.skills,
        softSkills: user.softSkills,
        experience: user.experience,
        education: user.education,
        projects: user.projects,
        certifications: user.certifications,
        languages: user.languages,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

const googleAuthSuccess = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if this was a signup attempt with existing email
    if (req.session && req.session.googleSignupError === 'EMAIL_EXISTS') {
      req.session.googleSignupError = null;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
      res.redirect(`${frontendUrl}/login.html?error=email_exists_use_google_login`);
      return;
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    // Send welcome email for new Google users (created within last 5 minutes)
    const isNewUser = user.createdAt && (Date.now() - new Date(user.createdAt).getTime()) < 5 * 60 * 1000;
    if (isNewUser && user.provider === 'google') {
      const html = getWelcomeEmail(user.name || 'User', user.role);
      await sendEmail({
        email: user.email,
        subject: 'Welcome to AI Hire!',
        html
      });
    }

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
    
    // Check if user needs to complete profile (new Google user with minimal info)
    const needsProfileCompletion = user.provider === 'google' && 
      (!user.phone || !user.location || !user.skills || user.skills.length === 0);
    
    if (needsProfileCompletion) {
      res.redirect(`${frontendUrl}/auth-callback.html?token=${token}&refreshToken=${refreshToken}&role=${user.role}&completeProfile=true`);
    } else {
      res.redirect(`${frontendUrl}/auth-callback.html?token=${token}&refreshToken=${refreshToken}&role=${user.role}`);
    }
  } catch (error) {
    next(error);
  }
};

const googleAuthFailure = (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
  res.redirect(`${frontendUrl}/login.html?error=google_auth_failed`);
};

const verifyEmailOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select('+verificationOTP +verificationOTPExpiry');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP expired
    if (Date.now() > user.verificationOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (!verifyOTP(otp, user.verificationOTP)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpiry = undefined;
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.verificationOTP = hashedOTP;
    user.verificationOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const html = `
      <h1>Email Verification</h1>
      <p>Your new verification code is: <strong style="font-size: 24px; color: #4F46E5;">${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - AI Job Portal',
      html
    });

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyPasswordResetOTP,
  setPassword,
  getMe,
  updateProfile,
  getUserById,
  googleAuthSuccess,
  googleAuthFailure,
  verifyEmailOTP,
  resendOTP
};
