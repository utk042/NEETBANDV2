import express from 'express';
import ForumCategory from '../models/ForumCategory.js';
import ForumPost from '../models/ForumPost.js';
import { protect, authorize, premiumOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// === CATEGORIES ===

// Get all categories
router.get('/categories', protect, premiumOnly, async (req, res) => {
  try {
    const categories = await ForumCategory.find().sort('order');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category (Admin)
router.post('/categories', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const category = new ForumCategory(req.body);
    const created = await category.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update category (Admin)
router.put('/categories/:id', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const category = await ForumCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete category (Admin)
router.delete('/categories/:id', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    await ForumCategory.findByIdAndDelete(req.params.id);
    await ForumPost.deleteMany({ category: req.params.id }); // delete all posts in category
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// === POSTS ===

// Get posts for category
router.get('/categories/:categoryId/posts', protect, premiumOnly, async (req, res) => {
  try {
    const posts = await ForumPost.find({ category: req.params.categoryId })
      .populate('author', 'name role')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all posts
router.get('/posts', protect, premiumOnly, async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('author', 'name role')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single post
router.get('/posts/:id', protect, premiumOnly, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name role')
      .populate('comments.author', 'name role');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post
router.post('/posts', protect, premiumOnly, async (req, res) => {
  try {
    const { category, title, content, attachments, poll } = req.body;
    
    // Only admins can pin/lock on creation, normally handled via put request
    const post = new ForumPost({
      category,
      title,
      content,
      attachments,
      poll,
      author: req.user._id,
      isPinned: (req.user.role === 'admin' || req.user.role === 'owner') ? req.body.isPinned : false,
      isLocked: (req.user.role === 'admin' || req.user.role === 'owner') ? req.body.isLocked : false
    });
    
    const created = await post.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update post (Admin or Author)
router.put('/posts/:id', protect, premiumOnly, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'admin' || req.user.role === 'owner') {
      post.isPinned = req.body.isPinned !== undefined ? req.body.isPinned : post.isPinned;
      post.isLocked = req.body.isLocked !== undefined ? req.body.isLocked : post.isLocked;
    }
    
    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    if (req.body.attachments !== undefined) post.attachments = req.body.attachments;
    if (req.body.poll !== undefined) post.poll = req.body.poll;

    const updated = await post.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete post
router.delete('/posts/:id', protect, premiumOnly, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike post
router.post('/posts/:id/like', protect, premiumOnly, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user._id);
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote in poll
router.post('/posts/:id/vote', protect, premiumOnly, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await ForumPost.findById(req.params.id);
    if (!post || !post.poll || !post.poll.active) return res.status(400).json({ message: 'Invalid poll' });

    // Remove existing vote if any
    post.poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(id => id.toString() !== req.user._id.toString());
    });
    
    // Add new vote
    if (post.poll.options[optionIndex]) {
       post.poll.options[optionIndex].votes.push(req.user._id);
    }
    
    await post.save();
    res.json({ poll: post.poll });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment
router.post('/posts/:id/comments', protect, premiumOnly, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.isLocked) return res.status(400).json({ message: 'Post is locked' });

    const comment = {
      author: req.user._id,
      content: req.body.content
    };

    post.comments.push(comment);
    await post.save();
    
    const updatedPost = await ForumPost.findById(req.params.id).populate('comments.author', 'name role');
    res.status(201).json(updatedPost.comments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Like/Unlike comment
router.post('/posts/:id/comments/:commentId/like', protect, premiumOnly, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const alreadyLiked = comment.likes.includes(req.user._id);
    if (alreadyLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      comment.likes.push(req.user._id);
    }
    await post.save();
    res.json({ likes: comment.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete comment (Admin/Owner)
router.delete('/posts/:id/comments/:commentId', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.pull(req.params.commentId);
    await post.save();

    const updatedPost = await ForumPost.findById(req.params.id)
      .populate('author', 'name role')
      .populate('comments.author', 'name role');
    res.json(updatedPost.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
