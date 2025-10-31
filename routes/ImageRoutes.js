import express from "express";
import multer from "multer";
import path from "path";
import Image from "../models/Image.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Get all images (requires authentication)
router.get("/", auth, async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// Upload a new image (admin only)
router.post("/", [auth, admin], upload.single("image"), async (req, res) => {
  try {
    const { title, category } = req.body;
    const url = req.file ? `/uploads/${req.file.filename}` : req.body.url;
    const image = new Image({
      title,
      url,
      category,
      featured: false,
    });
    await image.save();
    res.status(201).json(image);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an image (admin only)
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Toggle featured (admin only)
router.patch("/:id/featured", [auth, admin], async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Image not found" });
    image.featured = !image.featured;
    await image.save();
    res.json(image);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
