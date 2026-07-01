import mongoose from 'mongoose';

const forumCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  icon: {
    type: String, // Tabler icon name
    default: 'IconMessageCircle'
  }
}, {
  timestamps: true
});

const ForumCategory = mongoose.model('ForumCategory', forumCategorySchema);
export default ForumCategory;
