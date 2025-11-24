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

// Get single blog
export const getBlogById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let blog;
    
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
};

// Create blog
export const createBlog = async (req, res) => {
  try {
    console.log("📝 Creating new blog post...");
    console.log("Body:", req.body);
    console.log("File:", req.file);
    
    // Generate slug manually
    const slug = req.body.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const blogData = {
      title: req.body.title,
      slug: slug, // ← Add this line
      excerpt: req.body.excerpt,
      content: req.body.content,
      categories: JSON.parse(req.body.categories || "[]"),
      tags: JSON.parse(req.body.tags || "[]"),
      status: req.body.status || "draft",
      author: JSON.parse(req.body.author || '{"name":"Yala Safari Admin"}'),
    };
    
    if (req.file) {
      blogData.featuredImage = {
        url: `/uploads/blogs/${req.file.filename}`,
        alt: req.body.featuredImageAlt || req.body.title,
        caption: req.body.featuredImageCaption || ""
      };
    }
    
    console.log("📦 Blog data with slug:", blogData);
    
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
};

// Publish blog
export const publishBlog = async (req, res) => {
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
    
    if (blog.featuredImage?.url) {
      const imagePath = path.join(__dirname, '..', blog.featuredImage.url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("🗑️ Deleted image file");
      }
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
};
