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
import galleryRoutes from "./routes/GalleryRoutes.js"; // ✅ NEW

import roomRoutes from './routes/RoomRoutes.js';
import roomBookingRoutes from './routes/RoomBookingRoutes.js';
import taxiRoutes from './routes/TaxiRoutes.js';
import taxiBookingRoutes from './routes/TaxiBookingRoutes.js';

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
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000",
  "https://www.yalasafari.com",
  "https://yalasafari.com",
  "https://yala-safari-hspl.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
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
      // Safari Bookings
      safariBookings: "/api/bookings",
      packages: "/api/packages",
      
      // Room Management
      rooms: "/api/rooms",
      roomBookings: "/api/room-bookings",
      
      // Taxi Management
      taxis: "/api/taxis",
      taxiBookings: "/api/taxi-bookings",
      
      // Gallery
      gallery: "/api/gallery",
      
      // General
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

// ==========================================
// BOOKING ROUTES
// ==========================================

// Safari Booking Routes
app.use("/api/bookings", bookingRoutes);

// Room Routes
app.use("/api/rooms", roomRoutes);
app.use("/api/room-bookings", roomBookingRoutes);

// Taxi Routes
app.use("/api/taxis", taxiRoutes);
app.use("/api/taxi-bookings", taxiBookingRoutes);

// ==========================================
// OTHER ROUTES
// ==========================================

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

// ✅ Gallery Routes (NEW)
app.use("/api/gallery", galleryRoutes);

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
  console.log("\n🏨 ROOM MANAGEMENT:");
  console.log(`   All Rooms:          http://localhost:${PORT}/api/rooms`);
  console.log(`   Check Availability: http://localhost:${PORT}/api/rooms/availability/check`);
  console.log(`   Room Bookings:      http://localhost:${PORT}/api/room-bookings`);
  console.log(`   Calculate Price:    http://localhost:${PORT}/api/room-bookings/calculate-price`);
  
  console.log("\n🚕 TAXI MANAGEMENT:");
  console.log(`   All Taxis:          http://localhost:${PORT}/api/taxis`);
  console.log(`   Check Availability: http://localhost:${PORT}/api/taxis/availability/check`);
  console.log(`   Taxi Bookings:      http://localhost:${PORT}/api/taxi-bookings`);
  
  console.log("\n🦁 SAFARI MANAGEMENT:");
  console.log(`   Safari Bookings:    http://localhost:${PORT}/api/bookings`);
  console.log(`   Calculate Price:    http://localhost:${PORT}/api/bookings/calculate-price`);
  console.log(`   Packages:           http://localhost:${PORT}/api/packages`);
  
  console.log("\n🖼️  GALLERY:");
  console.log(`   All Images:         http://localhost:${PORT}/api/gallery`);
  console.log(`   Featured Images:    http://localhost:${PORT}/api/gallery/featured`);
  console.log(`   By Category:        http://localhost:${PORT}/api/gallery/category/:category`);
  console.log(`   Upload Image:       POST http://localhost:${PORT}/api/gallery`);
  
  console.log("\n⚙️  GENERAL:");
  console.log(`   Health Check:       http://localhost:${PORT}/api/health`);
  console.log(`   Admin Login:        http://localhost:${PORT}/api/admin/login`);
  console.log(`   Contact:            http://localhost:${PORT}/api/contact`);
  console.log(`   Blogs:              http://localhost:${PORT}/api/blogs`);
  console.log(`   Dashboard:          http://localhost:${PORT}/api/dashboard`);
  console.log(`   Images:             http://localhost:${PORT}/api/images`);
  
  console.log("\n📧 Email Service:");
  console.log(`   Provider:           ${process.env.RESEND_API_KEY ? 'Resend ✅' : 'Not configured ❌'}`);
  console.log(`   Admin Email:        ${process.env.ADMIN_EMAIL || 'Not configured ❌'}`);
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