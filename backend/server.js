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
app.use(cors());
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