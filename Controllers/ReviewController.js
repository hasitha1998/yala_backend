import Review from "../models/ReviewModel.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Generate unique review ID
const generateReviewId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `REV-${timestamp}-${random}`;
};

// Helper to delete uploaded files
const deleteUploadedFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ Deleted file:', filePath);
    }
  } catch (error) {
    console.error('❌ Error deleting file:', error);
  }
};

// ==========================================
// CREATE REVIEW
// ==========================================
export const createReview = async (req, res) => {
  try {
    console.log('📝 Creating new review...');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const {
      customerName,
      customerEmail,
      customerPhone,
      rating,
      reviewMessage,
      bookingReference,
      serviceType
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !rating || !reviewMessage) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        if (req.files.customerPhoto) {
          deleteUploadedFile(req.files.customerPhoto[0].path);
        }
        if (req.files.customerSignature) {
          deleteUploadedFile(req.files.customerSignature[0].path);
        }
      }

      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: customerName, customerEmail, rating, and reviewMessage"
      });
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Validate review message length
    if (reviewMessage.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Review message must be at least 10 characters long"
      });
    }

    // Handle file uploads (optional)
    let customerPhoto = null;
    let customerSignature = null;

    if (req.files) {
      if (req.files.customerPhoto && req.files.customerPhoto[0]) {
        customerPhoto = req.files.customerPhoto[0].path.replace(/\\/g, '/');
      }
      if (req.files.customerSignature && req.files.customerSignature[0]) {
        customerSignature = req.files.customerSignature[0].path.replace(/\\/g, '/');
      }
    }

    // Create new review
    const review = new Review({
      reviewId: generateReviewId(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim(),
      customerPhoto,
      customerSignature,
      rating: ratingNum,
      reviewMessage: reviewMessage.trim(),
      bookingReference: bookingReference?.trim(),
      serviceType: serviceType || 'overall',
      status: 'pending', // All reviews start as pending
      isPublished: false
    });

    await review.save();

    console.log('✅ Review created successfully:', review.reviewId);

    res.status(201).json({
      success: true,
      message: "Thank you for your review! It will be published after admin approval.",
      data: {
        reviewId: review.reviewId,
        customerName: review.customerName,
        rating: review.rating,
        status: review.status
      }
    });

  } catch (error) {
    console.error('❌ Error creating review:', error);

    // Clean up uploaded files on error
    if (req.files) {
      if (req.files.customerPhoto) {
        deleteUploadedFile(req.files.customerPhoto[0].path);
      }
      if (req.files.customerSignature) {
        deleteUploadedFile(req.files.customerSignature[0].path);
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message
    });
  }
};

// ==========================================
// GET ALL PUBLISHED REVIEWS (PUBLIC)
// ==========================================
export const getPublishedReviews = async (req, res) => {
  try {
    const { serviceType, rating, featured, limit = 50, page = 1 } = req.query;

    let query = { status: 'approved', isPublished: true };

    // Filter by service type
    if (serviceType) {
      query.serviceType = serviceType;
    }

    // Filter by rating
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Filter by featured
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reviews with sorting
    let sortOptions = {};
    if (featured === 'true') {
      sortOptions = { featuredOrder: 1, createdAt: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const reviews = await Review.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-adminNotes -__v');

    const total = await Review.countDocuments(query);

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { status: 'approved', isPublished: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      stats: ratingStats[0] || null,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};

// ==========================================
// GET ALL REVIEWS (ADMIN)
// ==========================================
export const getAllReviews = async (req, res) => {
  try {
    const { status, serviceType, rating, search } = req.query;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by service type
    if (serviceType) {
      query.serviceType = serviceType;
    }

    // Filter by rating
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Search by customer name or email
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { reviewId: { $regex: search, $options: 'i' } }
      ];
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .populate('respondedBy', 'name email');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    console.error('❌ Error fetching all reviews:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};

// ==========================================
// GET REVIEW BY ID
// ==========================================
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('respondedBy', 'name email');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Increment views
    review.views += 1;
    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('❌ Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch review",
      error: error.message
    });
  }
};

// ==========================================
// APPROVE REVIEW (ADMIN)
// ==========================================
export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { publish = true } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    review.status = 'approved';
    review.isPublished = publish;
    review.verifiedAt = new Date();
    review.isVerified = true;

    await review.save();

    console.log('✅ Review approved:', review.reviewId);

    res.status(200).json({
      success: true,
      message: "Review approved successfully",
      data: review
    });

  } catch (error) {
    console.error('❌ Error approving review:', error);
    res.status(500).json({
      success: false,
      message: "Failed to approve review",
      error: error.message
    });
  }
};

// ==========================================
// REJECT REVIEW (ADMIN)
// ==========================================
export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    review.status = 'rejected';
    review.isPublished = false;
    review.adminNotes = reason || 'Review rejected by admin';

    await review.save();

    console.log('❌ Review rejected:', review.reviewId);

    res.status(200).json({
      success: true,
      message: "Review rejected successfully",
      data: review
    });

  } catch (error) {
    console.error('❌ Error rejecting review:', error);
    res.status(500).json({
      success: false,
      message: "Failed to reject review",
      error: error.message
    });
  }
};

// ==========================================
// UPDATE REVIEW (ADMIN)
// ==========================================
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review
    });

  } catch (error) {
    console.error('❌ Error updating review:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message
    });
  }
};

// ==========================================
// TOGGLE FEATURED (ADMIN)
// ==========================================
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { featuredOrder } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    review.isFeatured = !review.isFeatured;
    if (review.isFeatured && featuredOrder) {
      review.featuredOrder = featuredOrder;
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${review.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: review
    });

  } catch (error) {
    console.error('❌ Error toggling featured:', error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle featured status",
      error: error.message
    });
  }
};

// ==========================================
// ADD ADMIN RESPONSE (ADMIN)
// ==========================================
export const addAdminResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, adminId } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: "Response message is required"
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    review.adminResponse = response;
    review.respondedBy = adminId;
    review.respondedAt = new Date();

    await review.save();

    res.status(200).json({
      success: true,
      message: "Admin response added successfully",
      data: review
    });

  } catch (error) {
    console.error('❌ Error adding admin response:', error);
    res.status(500).json({
      success: false,
      message: "Failed to add admin response",
      error: error.message
    });
  }
};

// ==========================================
// DELETE REVIEW (ADMIN)
// ==========================================
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Delete associated files
    if (review.customerPhoto) {
      deleteUploadedFile(review.customerPhoto);
    }
    if (review.customerSignature) {
      deleteUploadedFile(review.customerSignature);
    }

    await Review.findByIdAndDelete(id);

    console.log('🗑️ Review deleted:', review.reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error('❌ Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message
    });
  }
};

// ==========================================
// GET REVIEW STATISTICS (ADMIN)
// ==========================================
export const getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $facet: {
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          ratingBreakdown: [
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
          ],
          serviceTypeBreakdown: [
            { $group: { _id: '$serviceType', count: { $sum: 1 } } }
          ],
          overallStats: [
            {
              $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                averageRating: { $avg: '$rating' },
                totalViews: { $sum: '$views' },
                featuredCount: { $sum: { $cond: ['$isFeatured', 1, 0] } }
              }
            }
          ],
          recentReviews: [
            { $match: { status: 'pending' } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                reviewId: 1,
                customerName: 1,
                rating: 1,
                reviewMessage: 1,
                createdAt: 1
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0]
    });

  } catch (error) {
    console.error('❌ Error fetching review stats:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch review statistics",
      error: error.message
    });
  }
};