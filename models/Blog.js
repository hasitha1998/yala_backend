import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    lowercase: true
    // NO "required: true" here!
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true
  },
  author: {
    name: {
      type: String,
      default: 'Yala Safari Admin'
    },
    bio: String
  },
  featuredImage: {
    url: String,
    caption: String,
    alt: String
  },
  images: [{
    url: String,
    caption: String,
    alt: String
  }],
  categories: [{
    type: String,
    enum: ['Wildlife', 'Safari Tips', 'Destinations', 'Conservation', 'Travel Guide', 'News', 'Other']
  }],
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate slug BEFORE validation runs
blogSchema.pre('validate', function(next) {
  console.log('🔧 Pre-validate hook running...');
  console.log('Title:', this.title);
  console.log('Current slug:', this.slug);
  
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    console.log('Generated slug:', this.slug);
  }
  next();
});

// Set publishedAt when status changes
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Indexes
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ slug: 1 });

export default mongoose.model('Blog', blogSchema);