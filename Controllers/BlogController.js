import Blog from "../models/Blog.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    console.log("📚 Fetching blogs...");
    console.log("Auth header:", req.headers['x-auth-token'] ? 'Present' : 'None');
    
    const { status, category, search } = req.query;
    let query = {};
    
    // Only show published blogs to public
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
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    console.log("📖 Fetching blog:", req.params.id);
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }
    
    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save();
    
    console.log("✅ Blog found:", blog.title);
    
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
};

// Create blog
export const createBlog = async (req, res) => {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("📝 CREATING NEW BLOG POST");
    console.log("=".repeat(60));
    console.log("Request body:", req.body);
    console.log("Request file:", req.file ? req.file.filename : "No file");
    
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
      console.log("🖼️ Featured image:", blogData.featuredImage.url);
    }
    
    console.log("📦 Blog data:", blogData);
    
    const blog = new Blog(blogData);
    await blog.save();
    
    console.log("✅ Blog created successfully!");
    console.log("   - ID:", blog._id);
    console.log("   - Title:", blog.title);
    console.log("   - Status:", blog.status);
    console.log("=".repeat(60) + "\n");
    
    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: blog
    });
  } catch (error) {
    console.error("\n❌ ERROR CREATING BLOG:");
    console.error("   Message:", error.message);
    console.error("   Stack:", error.stack);
    console.error("=".repeat(60) + "\n");
    
    res.status(500).json({
      success: false,
      message: "Failed to create blog post",
      error: error.message
    });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
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
    
    console.log("✅ Blog updated:", blog.title);
    
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
};

// Publish blog
export const publishBlog = async (req, res) => {
  try {
    console.log("📢 Publishing blog:", req.params.id);
    
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
    
    console.log("✅ Blog published:", blog.title);
    
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
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    console.log("🗑️ Deleting blog:", req.params.id);
    
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }
    
    // Delete featured image file if exists
    if (blog.featuredImage?.url) {
      const imagePath = path.join(__dirname, '..', blog.featuredImage.url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("🗑️ Deleted image file");
      }
    }
    
    console.log("✅ Blog deleted:", blog.title);
    
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
};