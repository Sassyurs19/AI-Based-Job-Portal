const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/auth');
const { registerValidation, loginValidation, profileValidation } = require('../middlewares/validator');
const { uploadSingle } = require('../middlewares/upload');
const passport = require('../config/passport');

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, uploadSingle('avatar'), profileValidation, authController.updateProfile);
router.post('/profile/avatar', protect, uploadSingle('avatar'), authController.updateProfile);
router.get('/users/:id', protect, authorize('recruiter', 'admin'), authController.getUserById);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/signup', (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'], state: 'new_user' })(req, res, next);
});
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }), authController.googleAuthSuccess);
router.get('/google/failure', authController.googleAuthFailure);

// OTP verification routes
router.post('/verify-otp', authController.verifyEmailOTP);
router.post('/resend-otp', authController.resendOTP);

module.exports = router;
