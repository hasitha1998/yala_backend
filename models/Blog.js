import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  // ❌ REMOVED SLUG FIELD COMPLETELY
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

// Set publishedAt when status changes to published
blogSchema.pre('save', function(next) {
  console.log('💾 Saving blog:', this.title);
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    console.log('✅ Set publishedAt:', this.publishedAt);
  }
  
  next();
});

// Log after successful save
blogSchema.post('save', function(doc, next) {
  console.log('✅ Blog saved successfully!');
  console.log('   - ID:', doc._id);
  console.log('   - Title:', doc.title);
  console.log('   - Status:', doc.status);
  next();
});

// Indexes
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ status: 1 });
blogSchema.index({ publishedAt: -1 });

export default mongoose.model('Blog', blogSchema);