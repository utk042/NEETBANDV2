import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String
  },
  content: {
    type: String, // Rich text content from editor
    required: true
  },
  timeDuration: String,
  imageText: String,
  authorName: String,
  authorQuote: String,
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  customCSS: String,
  isCustomCSSEnabled: {
    type: Boolean,
    default: false
  },
  coverImage: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema]
}, {
  timestamps: true
});

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
