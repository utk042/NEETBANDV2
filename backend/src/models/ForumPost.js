import mongoose from 'mongoose';

const forumCommentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  votes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const forumPostSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumCategory',
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    url: String,
    type: { type: String, enum: ['image', 'pdf', 'other'] },
    name: String
  }],
  poll: {
    question: String,
    options: [pollOptionSchema],
    active: { type: Boolean, default: true }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [forumCommentSchema],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const ForumPost = mongoose.model('ForumPost', forumPostSchema);
export default ForumPost;
