import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    lowercase: true,
    // NO required: true here!
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

// ========================================
// PRE-VALIDATE HOOK (Runs BEFORE validation)
// ========================================
blogSchema.pre('validate', function(next) {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 PRE-VALIDATE HOOK TRIGGERED');
  console.log('='.repeat(60));
  console.log('📋 Document state:');
  console.log('   - Title:', this.title);
  console.log('   - Current slug:', this.slug);
  console.log('   - Is new document:', this.isNew);
  console.log('   - Is title modified:', this.isModified('title'));
  console.log('   - Has slug:', !!this.slug);
  
  try {
    // Generate slug if title exists and slug is empty or title was modified
    if (this.title && (!this.slug || this.isModified('title'))) {
      console.log('✅ Conditions met - Generating slug...');
      
      const originalTitle = this.title;
      console.log('   Original title:', originalTitle);
      
      // Step 1: Convert to lowercase
      let slug = this.title.toLowerCase();
      console.log('   After lowercase:', slug);
      
      // Step 2: Remove special characters
      slug = slug.replace(/[^\w\s-]/g, '');
      console.log('   After removing special chars:', slug);
      
      // Step 3: Replace spaces with hyphens
      slug = slug.replace(/\s+/g, '-');
      console.log('   After replacing spaces:', slug);
      
      // Step 4: Remove multiple hyphens
      slug = slug.replace(/-+/g, '-');
      console.log('   After removing multiple hyphens:', slug);
      
      // Step 5: Trim hyphens from start and end
      slug = slug.trim();
      console.log('   After trim:', slug);
      
      // Set the slug
      this.slug = slug;
      console.log('✅ SLUG GENERATED SUCCESSFULLY:', this.slug);
    } else {
      console.log('⚠️ Slug generation skipped:');
      if (!this.title) console.log('   - No title provided');
      if (this.slug && !this.isModified('title')) console.log('   - Slug already exists and title not modified');
    }
  } catch (error) {
    console.error('❌ ERROR in pre-validate hook:', error);
  }
  
  console.log('📤 Final slug before validation:', this.slug);
  console.log('='.repeat(60) + '\n');
  next();
});

// ========================================
// PRE-SAVE HOOK (Runs BEFORE saving to DB)
// ========================================
blogSchema.pre('save', function(next) {
  console.log('\n' + '='.repeat(60));
  console.log('💾 PRE-SAVE HOOK TRIGGERED');
  console.log('='.repeat(60));
  console.log('📋 Document state before save:');
  console.log('   - Title:', this.title);
  console.log('   - Slug:', this.slug);
  console.log('   - Status:', this.status);
  console.log('   - Status modified:', this.isModified('status'));
  console.log('   - Published at:', this.publishedAt);
  
  try {
    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
      console.log('✅ Set publishedAt:', this.publishedAt);
    }
  } catch (error) {
    console.error('❌ ERROR in pre-save hook:', error);
  }
  
  console.log('='.repeat(60) + '\n');
  next();
});

// ========================================
// POST-SAVE HOOK (Runs AFTER saving to DB)
// ========================================
blogSchema.post('save', function(doc, next) {
  console.log('\n' + '='.repeat(60));
  console.log('✅ POST-SAVE HOOK - Blog saved successfully!');
  console.log('='.repeat(60));
  console.log('📋 Saved document:');
  console.log('   - ID:', doc._id);
  console.log('   - Title:', doc.title);
  console.log('   - Slug:', doc.slug);
  console.log('   - Status:', doc.status);
  console.log('   - Created at:', doc.createdAt);
  console.log('='.repeat(60) + '\n');
  next();
});

// ========================================
// ERROR HANDLER
// ========================================
blogSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ERROR SAVING BLOG');
    console.error('='.repeat(60));
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Document that failed:', doc);
    console.error('='.repeat(60) + '\n');
  }
  next(error);
});

// ========================================
// INDEXES
// ========================================
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ publishedAt: -1 });

// Log when model is initialized
console.log('\n' + '='.repeat(60));
console.log('📚 Blog Model Initialized');
console.log('='.repeat(60));
console.log('Schema fields:');
console.log('   - title: required');
console.log('   - slug: NOT required (auto-generated)');
console.log('   - excerpt: required');
console.log('   - content: required');
console.log('='.repeat(60) + '\n');

export default mongoose.model('Blog', blogSchema);