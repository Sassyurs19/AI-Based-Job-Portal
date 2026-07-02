require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const isNewUser = req.query.state === 'new_user';

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return them
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          if (isNewUser) {
            // User trying to sign up with Google but email already exists
            // Return error to redirect to login
            return done(null, false, { message: 'EMAIL_EXISTS' });
          }
          // Link Google account to existing user
          user.googleId = profile.id;
          user.provider = 'google';
          user.avatar = profile.photos[0]?.value || user.avatar;
          user.isVerified = true; // Google accounts are pre-verified
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          provider: 'google',
          avatar: profile.photos[0]?.value || '',
          password: Math.random().toString(36).slice(-8), // Random password for OAuth users
          role: 'candidate', // Default role for OAuth users
          isVerified: true // Google accounts are pre-verified
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
