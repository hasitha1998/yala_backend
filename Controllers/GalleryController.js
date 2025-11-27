import Gallery from "../models/Gallery.js";
import asyncHandler from "express-async-handler";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc Get all gallery images
// @route GET /api/gallery
// @access Public
export const getAllGalleryImages = asyncHandler(async (req, res) => {
  try {
    const { category, featured, isActive, tags, search, limit, page } = req.query;
    
    // Build query
    let query = {};
    
    // Filter by active status (default to active images only for public)
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    } else {
      query.isActive = true; // Default: only show active images
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by featured
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count for pagination
    const total = await Gallery.countDocuments(query);
    
    // Fetch images
    const images = await Gallery.find(query)
      .sort({ featured: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');
    
    res.json({
      success: true,
      count: images.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      images
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery images',
      error: error.message
    });
  }
});

// @desc Get single gallery image by ID
// @route GET /api/gallery/:id
// @access Public
export const getGalleryImageById = asyncHandler(async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      res.status(404);
      throw new Error('Gallery image not found');
    }
    
    // Increment views
    image.views = (image.views || 0) + 1;
    await image.save();
    
    res.json({
      success: true,
      image
    });
  } catch (error) {
    console.error('Error fetching gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery image',
      error: error.message
    });
  }
});

// @desc Get gallery images by category
// @route GET /api/gallery/category/:category
// @access Public
export const getGalleryImagesByCategory = asyncHandler(async (req, res) => {
  try {
    const { category } = req.params;
    const { limit, page } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    
    const query = { 
      category, 
      isActive: true 
    };
    
    const total = await Gallery.countDocuments(query);
    
    const images = await Gallery.find(query)
      .sort({ featured: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    res.json({
      success: true,
      category,
      count: images.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      images
    });
  } catch (error) {
    console.error('Error fetching category images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category images',
      error: error.message
    });
  }
});

// @desc Get featured gallery images
// @route GET /api/gallery/featured
// @access Public
export const getFeaturedGalleryImages = asyncHandler(async (req, res) => {
  try {
    const { limit } = req.query;
    const limitNum = parseInt(limit) || 10;
    
    const images = await Gallery.find({ 
      featured: true, 
      isActive: true 
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limitNum);
    
    res.json({
      success: true,
      count: images.length,
      images
    });
  } catch (error) {
    console.error('Error fetching featured images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured images',
      error: error.message
    });
  }
});

// @desc Upload new gallery image
// @route POST /api/gallery
// @access Private/Admin
export const uploadGalleryImage = asyncHandler(async (req, res) => {
  try {
    console.log('📤 Uploading gallery image...');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image file');
    }
    
    const {
      title,
      description,
      category,
      tags,
      photographer,
      location,
      captureDate,
      featured,
      displayOrder,
      isActive
    } = req.body;
    
    // Validate required fields
    if (!title || !category) {
      res.status(400);
      throw new Error('Title and category are required');
    }
    
    // Parse tags if provided
    let tagsArray = [];
    if (tags) {
      tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }
    
    // Get file metadata
    const fileSize = req.file.size;
    const imageUrl = `/uploads/gallery/${req.file.filename}`;
    
    // Create gallery image record
    const galleryImage = await Gallery.create({
      title,
      description: description || '',
      imageUrl,
      category,
      tags: tagsArray,
      photographer: photographer || 'Yala Safari Tours',
      location: location || '',
      captureDate: captureDate ? new Date(captureDate) : null,
      featured: featured === 'true' || featured === true,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
      uploadedBy: req.admin?._id, // If admin middleware sets req.admin
      fileSize
    });
    
    console.log('✅ Gallery image uploaded:', galleryImage._id);
    
    res.status(201).json({
      success: true,
      message: 'Gallery image uploaded successfully',
      image: galleryImage
    });
  } catch (error) {
    console.error('❌ Error uploading gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload gallery image',
      error: error.message
    });
  }
});

// @desc Update gallery image
// @route PUT /api/gallery/:id
// @access Private/Admin
export const updateGalleryImage = asyncHandler(async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      res.status(404);
      throw new Error('Gallery image not found');
    }
    
    const {
      title,
      description,
      category,
      tags,
      photographer,
      location,
      captureDate,
      featured,
      displayOrder,
      isActive
    } = req.body;
    
    // Update fields
    if (title) image.title = title;
    if (description !== undefined) image.description = description;
    if (category) image.category = category;
    if (tags) image.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (photographer) image.photographer = photographer;
    if (location !== undefined) image.location = location;
    if (captureDate) image.captureDate = new Date(captureDate);
    if (featured !== undefined) image.featured = featured === 'true' || featured === true;
    if (displayOrder !== undefined) image.displayOrder = parseInt(displayOrder);
    if (isActive !== undefined) image.isActive = isActive === 'true' || isActive === true;
    
    // If new image file is uploaded, replace old one
    if (req.file) {
      // Delete old image file
      const oldImagePath = path.join(__dirname, '..', image.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log('🗑️ Deleted old image file');
      }
      
      // Update with new image
      image.imageUrl = `/uploads/gallery/${req.file.filename}`;
      image.fileSize = req.file.size;
    }
    
    const updatedImage = await image.save();
    
    console.log('✅ Gallery image updated:', updatedImage._id);
    
    res.json({
      success: true,
      message: 'Gallery image updated successfully',
      image: updatedImage
    });
  } catch (error) {
    console.error('❌ Error updating gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gallery image',
      error: error.message
    });
  }
});

// @desc Delete gallery image
// @route DELETE /api/gallery/:id
// @access Private/Admin
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      res.status(404);
      throw new Error('Gallery image not found');
    }
    
    // Delete image file from server
    const imagePath = path.join(__dirname, '..', image.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log('🗑️ Deleted image file:', imagePath);
    }
    
    // Delete database record
    await image.deleteOne();
    
    console.log('✅ Gallery image deleted:', req.params.id);
    
    res.json({
      success: true,
      message: 'Gallery image deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gallery image',
      error: error.message
    });
  }
});

// @desc Toggle featured status
// @route PATCH /api/gallery/:id/toggle-featured
// @access Private/Admin
export const toggleFeaturedStatus = asyncHandler(async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      res.status(404);
      throw new Error('Gallery image not found');
    }
    
    image.featured = !image.featured;
    const updatedImage = await image.save();
    
    res.json({
      success: true,
      message: `Image ${updatedImage.featured ? 'featured' : 'unfeatured'} successfully`,
      image: updatedImage
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
      error: error.message
    });
  }
});

// @desc Toggle active status
// @route PATCH /api/gallery/:id/toggle-active
// @access Private/Admin
export const toggleActiveStatus = asyncHandler(async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      res.status(404);
      throw new Error('Gallery image not found');
    }
    
    image.isActive = !image.isActive;
    const updatedImage = await image.save();
    
    res.json({
      success: true,
      message: `Image ${updatedImage.isActive ? 'activated' : 'deactivated'} successfully`,
      image: updatedImage
    });
  } catch (error) {
    console.error('Error toggling active status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle active status',
      error: error.message
    });
  }
});

// @desc Increment likes
// @route PATCH /api/gallery/:id/like
// @access Public
export const likeGalleryImage = asyncHandler(async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      res.status(404);
      throw new Error('Gallery image not found');
    }
    
    image.likes = (image.likes || 0) + 1;
    const updatedImage = await image.save();
    
    res.json({
      success: true,
      likes: updatedImage.likes
    });
  } catch (error) {
    console.error('Error liking image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like image',
      error: error.message
    });
  }
});

// @desc Bulk delete gallery images
// @route POST /api/gallery/bulk-delete
// @access Private/Admin
export const bulkDeleteGalleryImages = asyncHandler(async (req, res) => {
  try {
    const { imageIds } = req.body;
    
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      res.status(400);
      throw new Error('Please provide an array of image IDs');
    }
    
    // Get all images to delete files
    const images = await Gallery.find({ _id: { $in: imageIds } });
    
    // Delete files from server
    images.forEach(image => {
      const imagePath = path.join(__dirname, '..', image.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('🗑️ Deleted file:', imagePath);
      }
    });
    
    // Delete from database
    const result = await Gallery.deleteMany({ _id: { $in: imageIds } });
    
    res.json({
      success: true,
      message: `${result.deletedCount} images deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk delete images',
      error: error.message
    });
  }
});

// @desc Get gallery statistics
// @route GET /api/gallery/stats/overview
// @access Private/Admin
export const getGalleryStats = asyncHandler(async (req, res) => {
  try {
    const totalImages = await Gallery.countDocuments();
    const activeImages = await Gallery.countDocuments({ isActive: true });
    const featuredImages = await Gallery.countDocuments({ featured: true });
    
    // Count by category
    const categoryStats = await Gallery.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Total views and likes
    const totalStats = await Gallery.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' }
        }
      }
    ]);
    
    // Most viewed images
    const mostViewed = await Gallery.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title imageUrl views category');
    
    // Most liked images
    const mostLiked = await Gallery.find()
      .sort({ likes: -1 })
      .limit(5)
      .select('title imageUrl likes category');
    
    res.json({
      success: true,
      stats: {
        totalImages,
        activeImages,
        featuredImages,
        inactiveImages: totalImages - activeImages,
        totalViews: totalStats[0]?.totalViews || 0,
        totalLikes: totalStats[0]?.totalLikes || 0,
        categoryBreakdown: categoryStats,
        mostViewed,
        mostLiked
      }
    });
  } catch (error) {
    console.error('Error fetching gallery stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery stats',
      error: error.message
    });
  }
});

export default {
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
};