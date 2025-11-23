// ========================================
// 1. LOAD ENVIRONMENT VARIABLES FIRST
// ========================================
import dotenv from "dotenv";
dotenv.config();

// ========================================
// 2. CHECK ENVIRONMENT VARIABLES
// ========================================
console.log('\n' + '='.repeat(50));
console.log('🔍 ENVIRONMENT VARIABLES CHECK');
console.log('='.repeat(50));
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ Missing');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Loaded' : '❌ Missing');
console.log('PORT:', process.env.PORT || '5000');
console.log('='.repeat(50) + '\n');

// ========================================
// 3. IMPORT EVERYTHING ELSE
// ========================================
import express from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from 'url';

// Import Routes
import packageRoutes from "./routes/PackageRoutes.js";
import blogRoutes from "./routes/BlogRoutes.js";
import contactRoutes from "./routes/ContactRoutes.js";
import adminRoutes from "./routes/AdminRoutes.js";
import dashboardRoutes from "./routes/DashboardRoutes.js";
import imageRoutes from "./routes/ImageRoutes.js";
import bookingRoutes from "./routes/BookingRoutes.js";
import dateRoutes from "./routes/DateRoutes.js";
import availableDatesRoutes from "./routes/AvailableDatesRoutes.js";

// ========================================
// 4. CONNECT TO DATABASE
// ========================================
connectDB();

const app = express();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// CORS Configuration
// ==========================================
const allowedOrigins = [
  "http://localhost:3000",           // ✅ Local development frontend
  "http://localhost:5173",           // Vite default port
  "http://localhost:5000",           // Backend local
  "https://www.yalasafari.com",     // Production domain
  "https://yalasafari.com",         // Production without www
  "https://yala-safari-hspl.vercel.app",  // ✅ Vercel frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
}));

// ==========================================
// CORS Configuration (DEVELOPMENT MODE)
// ==========================================
// Uncomment this for development if you want to allow all origins
// app.use(cors({
//   origin: true, // ✅ Allow all origins (development only)
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
// }));

// ==========================================
// Middleware
// ==========================================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  next();
});

// Serve static files (uploaded images, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// API Routes
// ==========================================

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "Server is running!",
    timestamp: new Date().toISOString(),
    environment: {
      resendConfigured: !!process.env.RESEND_API_KEY,
      adminEmail: process.env.ADMIN_EMAIL || 'Not configured'
    },
    endpoints: {
      bookings: "/api/bookings",
      packages: "/api/packages",
      admin: "/api/admin",
      blogs: "/api/blogs",
      contact: "/api/contact",
      dashboard: "/api/dashboard",
      images: "/api/images",
      dates: "/api/availability",
      availableDates: "/api/available-dates"
    }
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "API is working",
    timestamp: new Date().toISOString(),
    emailService: process.env.RESEND_API_KEY ? 'Resend configured' : 'No email service configured'
  });
});

// Booking Routes (Most Important - Place First)
app.use("/api/bookings", bookingRoutes);

// Package Routes
app.use("/api/packages", packageRoutes);

// Blog Routes
app.use("/api/blogs", blogRoutes);

// Contact Routes
app.use("/api/contact", contactRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// Dashboard Routes
app.use("/api/dashboard", dashboardRoutes);

// Image Routes
app.use("/api/images", imageRoutes);

// Date Routes
app.use("/api", dateRoutes);

// Available Dates Routes
app.use("/api/available-dates", availableDatesRoutes);

app.use("/api/blogs", blogRoutes);

// ==========================================
// Error Handling Middleware
// ==========================================

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==========================================
// Start Server
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("=".repeat(50));
  console.log("\n📍 Available Endpoints:");
  console.log(`   Health Check:     http://localhost:${PORT}/api/health`);
  console.log(`   Bookings:         http://localhost:${PORT}/api/bookings`);
  console.log(`   Calculate Price:  http://localhost:${PORT}/api/bookings/calculate-price`);
  console.log(`   Packages:         http://localhost:${PORT}/api/packages`);
  console.log(`   Admin Login:      http://localhost:${PORT}/api/admin/login`);
  console.log(`   Contact:          http://localhost:${PORT}/api/contact`);
  console.log(`   Blogs:            http://localhost:${PORT}/api/blogs`);
  console.log(`   Dashboard:        http://localhost:${PORT}/api/dashboard`);
  console.log(`   Images:           http://localhost:${PORT}/api/images`);
  console.log("\n📧 Email Service:");
  console.log(`   Provider:         ${process.env.RESEND_API_KEY ? 'Resend ✅' : 'Not configured ❌'}`);
  console.log(`   Admin Email:      ${process.env.ADMIN_EMAIL || 'Not configured ❌'}`);
  console.log("\n" + "=".repeat(50) + "\n");
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

export default app;