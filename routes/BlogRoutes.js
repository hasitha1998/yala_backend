import express from "express";
import Blog from "../models/Blog.js";
import multer from "multer";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Get all blogs (requires authentication)
router.get("/", auth, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// Create a new blog (admin only)
router.post("/", [auth, admin], async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

// Update a blog (admin only)
router.patch("/:id", [auth, admin], async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

// Delete a blog (admin only)
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

export default router;
