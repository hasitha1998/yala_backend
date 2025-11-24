import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

// Import controller functions
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  publishBlog,
  deleteBlog
} from "../controllers/BlogController.js";

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// ENSURE UPLOAD DIRECTORY EXISTS
// ========================================
const uploadDir = path.join(__dirname, '../uploads/blogs');
if (!fs.existsSync(uploadDir)) {
  console.log('📁 Creating uploads/blogs directory...');
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Directory created');
}

// ========================================
// MULTER CONFIGURATION
// ========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "blog-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only image files are allowed!"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ========================================
// PUBLIC ROUTES
// ========================================
router.get("/", getAllBlogs);
router.get("/:idOrSlug", getBlogById);

// ========================================
// ADMIN ROUTES
// ========================================
router.post("/", auth, admin, upload.single("featuredImage"), createBlog);
router.put("/:id", auth, admin, upload.single("featuredImage"), updateBlog);
router.patch("/:id/publish", auth, admin, publishBlog);
router.delete("/:id", auth, admin, deleteBlog);

export default router;