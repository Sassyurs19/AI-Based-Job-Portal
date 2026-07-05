const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const passport = require("./config/passport");

// Database Connection
const connectDB = require("./config/db");

// Load Environment Variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// CORS must come first — before session, passport, and routes
// This ensures preflight OPTIONS requests are handled correctly
const allowedOrigins = [
  'http://localhost:5500',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000',
  'https://ai-hire-portal.web.app',
  'https://ai-hire-portal.firebaseapp.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, file:// protocol)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Also allow any Firebase or Vercel deployment URLs
    if (origin.endsWith('.web.app') || 
        origin.endsWith('.firebaseapp.com') || 
        origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session middleware for passport
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/recruiter", require("./routes/recruiter"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/notifications", require("./routes/notifications"));

// Test Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI Job Portal Backend Running 🚀"
    });
});

// Error Handler
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});