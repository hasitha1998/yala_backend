import express from "express";
import {
  createReview,
  getPublishedReviews,
  getAllReviews,
  getReviewById,
  approveReview,
  rejectReview,
  updateReview,
  toggleFeatured,
  addAdminResponse,
  deleteReview,
  getReviewStats
} from "../Controllers/ReviewController.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ==========================================
// MULTER CONFIGURATION FOR REVIEW UPLOADS
// ==========================================

// Create uploads/reviews directory if it doesn't exist
const reviewUploadDir = path.join(__dirname, '../uploads/reviews');
if (!fs.existsSync(reviewUploadDir)) {
  fs.mkdirSync(reviewUploadDir, { recursive: true });
  console.log('✅ Created reviews uploads directory');
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, reviewUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const fieldName = file.fieldname; // 'customerPhoto' or 'customerSignature'
    cb(null, `${fieldName}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed! (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer for multiple fields
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: fileFilter
});

// Middleware for review file uploads (customerPhoto and customerSignature)
const uploadReviewFiles = upload.fields([
  { name: 'customerPhoto', maxCount: 1 },
  { name: 'customerSignature', maxCount: 1 }
]);

// ==========================================
// PUBLIC ROUTES (MUST BE BEFORE :id ROUTES)
// ==========================================

// Get all published reviews (public)
router.get("/published", getPublishedReviews);

// Create a new review (WITH OPTIONAL FILE UPLOADS)
router.post("/", uploadReviewFiles, createReview);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all reviews (Admin)
router.get("/admin/all", [auth, admin], getAllReviews);

// Get review statistics (Admin)
router.get("/admin/stats", [auth, admin], getReviewStats);

// Approve review (Admin)
router.patch("/:id/approve", [auth, admin], approveReview);

// Reject review (Admin)
router.patch("/:id/reject", [auth, admin], rejectReview);

// Toggle featured status (Admin)
router.patch("/:id/toggle-featured", [auth, admin], toggleFeatured);

// Add admin response (Admin)
router.post("/:id/response", [auth, admin], addAdminResponse);

// Update review (Admin)
router.put("/:id", [auth, admin], updateReview);

// Delete review (Admin)
router.delete("/:id", [auth, admin], deleteReview);

// ==========================================
// DYNAMIC ROUTES (MUST BE LAST)
// ==========================================

// Get review by ID
router.get("/:id", getReviewById);

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size is too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
  }
  
  if (error.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

export default router;