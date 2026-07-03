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
router.post('/verify-password-reset-otp', authController.verifyPasswordResetOTP);
router.put('/reset-password', authController.resetPassword);
router.post('/set-password', authController.setPassword);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, uploadSingle('avatar'), profileValidation, authController.updateProfile);
router.post('/profile/avatar', protect, uploadSingle('avatar'), authController.updateProfile);
router.get('/users/:id', protect, authorize('recruiter', 'admin'), authController.getUserById);

// Google OAuth routes
router.get('/google', (req, res, next) => {
  const frontendUrl = req.query.frontend_url || '';
  const stateId = req.query.state_id || '';
  const state = `login:candidate:${Buffer.from(frontendUrl).toString('base64')}:${stateId}`;
  passport.authenticate('google', { scope: ['profile', 'email'], state })(req, res, next);
});
router.get('/google/signup', (req, res, next) => {
  const role = req.query.role || 'candidate';
  const frontendUrl = req.query.frontend_url || '';
  const stateId = req.query.state_id || '';
  const state = `new_user:${role}:${Buffer.from(frontendUrl).toString('base64')}:${stateId}`;
  passport.authenticate('google', { scope: ['profile', 'email'], state })(req, res, next);
});
router.get('/google/status/:stateId', authController.getGoogleAuthStatus);
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    // Decode frontendUrl from state to use in redirects
    const state = req.query.state || '';
    const parts = state.split(':');
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
    if (parts[2]) {
      try {
        frontendUrl = Buffer.from(parts[2], 'base64').toString('utf8');
      } catch (err) {
        console.error('Error decoding frontend_url from state:', err);
      }
    }
    
    // Remove trailing slash if exists to ensure clean path building
    if (frontendUrl.endsWith('/')) {
      frontendUrl = frontendUrl.slice(0, -1);
    }

    if (!user) {
      const message = info && info.message;
      
      if (frontendUrl.startsWith('file:')) {
        let errType = 'google_auth_failed';
        let errMsg = 'Google authentication failed. Please try again.';
        if (message === 'EMAIL_EXISTS') {
          errType = 'email_exists_use_google_login';
          errMsg = 'An account already exists with this email. Please sign in with Google.';
        } else if (message === 'ACCOUNT_NOT_FOUND') {
          errType = 'account_not_found';
          errMsg = 'No account found with this email. Please register first.';
        }
        
        // Also set stateId cache if present
        const stateId = parts[3] || '';
        if (stateId) {
          global.oauthCache = global.oauthCache || new Map();
          global.oauthCache.set(stateId, { error: errType });
        }
        
        res.send(`
          <!DOCTYPE html>
          <html>
          <head><title>Authentication Failed</title></head>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background: #0f172a; color: white;">
            <h2>Authentication Failed</h2>
            <p>${errMsg}</p>
            <p>This window will close automatically.</p>
            <script>
              setTimeout(() => {
                window.open('', '_self', '');
                window.close();
              }, 2500);
            </script>
          </body>
          </html>
        `);
        return;
      }

      if (message === 'EMAIL_EXISTS') {
        return res.redirect(`${frontendUrl}/login.html?error=email_exists_use_google_login`);
      } else if (message === 'ACCOUNT_NOT_FOUND') {
        return res.redirect(`${frontendUrl}/candidate-register.html?error=account_not_found`);
      }
      return res.redirect(`${frontendUrl}/login.html?error=google_auth_failed`);
    }
    
    req.user = user;
    req.frontendUrl = frontendUrl; // Attach decoded frontendUrl to req
    authController.googleAuthSuccess(req, res, next);
  })(req, res, next);
});
router.get('/google/failure', authController.googleAuthFailure);

// OTP verification routes
router.post('/verify-otp', authController.verifyEmailOTP);
router.post('/resend-otp', authController.resendOTP);

module.exports = router;
