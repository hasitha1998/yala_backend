import express from "express";
import Blog from "../models/Blog.js";
import multer from "multer";
import path from "path";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// ========================================
// MULTER CONFIGURATION
// ========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/blogs/");
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
// PUBLIC ROUTES (No Authentication)
// ========================================

// Get all published blogs (PUBLIC)
router.get("/", async (req, res) => {
  try {
    console.log("📚 Fetching all blogs...");
    
    const { status, category, search } = req.query;
    
    let query = {};
    
    // If no status specified and no auth, only show published
    if (!req.headers['x-auth-token']) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }
    
    if (category) {
      query.categories = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    
    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .select('-__v');
    
    console.log(`✅ Found ${blogs.length} blogs`);
    
    res.json({
      success: true,
      data: blogs,
      count: blogs.length
    });
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
      error: error.message
    });
  }
});

// Get single blog by ID or slug (PUBLIC)
router.get("/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    
    let blog;
    
    // Try finding by ID first, then by slug
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(idOrSlug);
    } else {
      blog = await Blog.findOne({ slug: idOrSlug });
    }
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }
    
    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save();
    
    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error("❌ Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: error.message
    });
  }
});

// ========================================
// ADMIN ROUTES (Authentication Required)
// ========================================

// Create new blog post (ADMIN)
router.post("/", [auth, admin, upload.single("featuredImage")], async (req, res) => {
  try {
    console.log("📝 Creating new blog post...");
    console.log("Body:", req.body);
    console.log("File:", req.file);
    
    const blogData = {
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      categories: JSON.parse(req.body.categories || "[]"),
      tags: JSON.parse(req.body.tags || "[]"),
      status: req.body.status || "draft",
      author: JSON.parse(req.body.author || '{"name":"Yala Safari Admin"}'),
    };
    
    // Add featured image if uploaded
    if (req.file) {
      blogData.featuredImage = {
        url: `/uploads/blogs/${req.file.filename}`,
        alt: req.body.featuredImageAlt || req.body.title,
        caption: req.body.featuredImageCaption || ""
      };
    }
    
    const blog = new Blog(blogData);
    await blog.save();
    
    console.log("✅ Blog created:", blog._id);
    
    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: blog
    });
  } catch (error) {
    console.error("❌ Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create blog post",
      error: error.message
    });
  }
});

// Update blog post (ADMIN)
router.put("/:id", [auth, admin, upload.single("featuredImage")], async (req, res) => {
  try {
    console.log("📝 Updating blog:", req.params.id);
    
    const updateData = {
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      categories: JSON.parse(req.body.categories || "[]"),
      tags: JSON.parse(req.body.tags || "[]"),
      status: req.body.status,
    };
    
    // Add featured image if uploaded
    if (req.file) {
      updateData.featuredImage = {
        url: `/uploads/blogs/${req.file.filename}`,
        alt: req.body.featuredImageAlt || req.body.title,
        caption: req.body.featuredImageCaption || ""
      };
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }
    
    console.log("✅ Blog updated");
    
    res.json({
      success: true,
      message: "Blog post updated successfully",
      data: blog
    });
  } catch (error) {
    console.error("❌ Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update blog post",
      error: error.message
    });
  }
});

// Publish blog (ADMIN)
router.patch("/:id/publish", [auth, admin], async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }
    
    blog.status = "published";
    blog.publishedAt = new Date();
    await blog.save();
    
    res.json({
      success: true,
      message: "Blog published successfully",
      data: blog
    });
  } catch (error) {
    console.error("❌ Error publishing blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to publish blog",
      error: error.message
    });
  }
});

// Unpublish blog (ADMIN)
router.patch("/:id/unpublish", [auth, admin], async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status: "draft" },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }
    
    res.json({
      success: true,
      message: "Blog unpublished successfully",
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to unpublish blog",
      error: error.message
    });
  }
});

// Delete blog post (ADMIN)
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    console.log("🗑️ Deleting blog:", req.params.id);
    
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }
    
    console.log("✅ Blog deleted");
    
    res.json({
      success: true,
      message: "Blog post deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog post",
      error: error.message
    });
  }
});

// Get blog categories (PUBLIC)
router.get("/meta/categories", async (req, res) => {
  try {
    const categories = await Blog.distinct("categories");
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message
    });
  }
});

// Get blog tags (PUBLIC)
router.get("/meta/tags", async (req, res) => {
  try {
    const tags = await Blog.distinct("tags");
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tags",
      error: error.message
    });
  }
});

export default router;