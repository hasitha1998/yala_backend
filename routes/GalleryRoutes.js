import express from "express";
import {
  getAllGalleryImages,
  getGalleryImageById,
  getGalleryImagesByCategory,
  getFeaturedGalleryImages,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  toggleFeaturedStatus,
  toggleActiveStatus,
  likeGalleryImage,
  bulkDeleteGalleryImages,
  getGalleryStats
} from "../Controllers/GalleryController.js";
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
// MULTER CONFIGURATION FOR GALLERY UPLOADS
// ==========================================

// Create uploads/gallery directory if it doesn't exist
const galleryUploadDir = path.join(__dirname, '../uploads/gallery');
if (!fs.existsSync(galleryUploadDir)) {
  fs.mkdirSync(galleryUploadDir, { recursive: true });
  console.log('✅ Created gallery uploads directory');
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, galleryUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')
      .toLowerCase();
    cb(null, `gallery-${name}-${uniqueSuffix}${ext}`);
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

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for gallery images
  },
  fileFilter: fileFilter
});

// ==========================================
// PUBLIC ROUTES (Must be before :id routes)
// ==========================================

// Get all gallery images
router.get("/", getAllGalleryImages);

// Get featured gallery images
router.get("/featured", getFeaturedGalleryImages);

// Get gallery stats (admin)
router.get("/stats/overview", [auth, admin], getGalleryStats);

// Get gallery images by category
router.get("/category/:category", getGalleryImagesByCategory);

// Like a gallery image
router.patch("/:id/like", likeGalleryImage);

// Get single gallery image
router.get("/:id", getGalleryImageById);

// ==========================================
// ADMIN ROUTES - Gallery Management
// ==========================================

// Upload new gallery image
router.post("/", [auth, admin, upload.single('image')], uploadGalleryImage);

// Update gallery image (can include new image file)
router.put("/:id", [auth, admin, upload.single('image')], updateGalleryImage);

// Delete gallery image
router.delete("/:id", [auth, admin], deleteGalleryImage);

// Toggle featured status
router.patch("/:id/toggle-featured", [auth, admin], toggleFeaturedStatus);

// Toggle active status
router.patch("/:id/toggle-active", [auth, admin], toggleActiveStatus);

// Bulk delete images
router.post("/bulk-delete", [auth, admin], bulkDeleteGalleryImages);

export default router;