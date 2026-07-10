import express from 'express';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import { protect, authorize, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Multer config removed as we use uploadRoutes.js for file uploads now

// Get all blogs (Public/Student)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).populate('author', 'name email profilePicture').sort('-createdAt');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all blogs (Admin - including unpublished)
router.get('/admin', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate('author', 'name email profilePicture').sort('-createdAt');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single blog (by ID or Slug)
router.get('/:idOrSlug', async (req, res) => {
  try {
    let blog;
    
    // Check if the param is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(req.params.idOrSlug)) {
      blog = await Blog.findById(req.params.idOrSlug).populate('author', 'name email profilePicture').populate('comments.user', 'name profilePicture');
    }
    
    // Fallback to checking by slug if not found or not an ObjectId
    if (!blog) {
      blog = await Blog.findOne({ slug: req.params.idOrSlug }).populate('author', 'name email profilePicture').populate('comments.user', 'name profilePicture');
    }

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Update views count
    blog.views = (blog.views || 0) + 1;
    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create blog (Admin)
router.post('/', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const { 
      title, shortDescription, content, timeDuration, 
      imageText, authorName, authorQuote, slug, 
      metaTitle, metaDescription, metaKeywords, 
      customCSS, isCustomCSSEnabled, isPublished, coverImage
    } = req.body;

    const blog = new Blog({
      title,
      shortDescription,
      content,
      timeDuration,
      imageText,
      authorName,
      authorQuote,
      slug,
      metaTitle,
      metaDescription,
      metaKeywords,
      customCSS,
      isCustomCSSEnabled: isCustomCSSEnabled === 'true',
      isPublished: isPublished !== 'false', // Default to true if not specified
      coverImage,
      author: req.user._id
    });
    
    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update blog (Admin)
router.put('/:id', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const fieldsToUpdate = [
      'title', 'shortDescription', 'content', 'timeDuration', 
      'imageText', 'authorName', 'authorQuote', 'slug', 
      'metaTitle', 'metaDescription', 'metaKeywords', 'customCSS', 'coverImage'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        blog[field] = req.body[field];
      }
    });

    if (req.body.isCustomCSSEnabled !== undefined) {
      blog.isCustomCSSEnabled = req.body.isCustomCSSEnabled === 'true';
    }
    
    if (req.body.isPublished !== undefined) {
      blog.isPublished = req.body.isPublished === 'true' || req.body.isPublished === true;
    }

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete blog (Admin)
router.delete('/:id', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    
    await blog.deleteOne();
    res.json({ message: 'Blog removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike blog
router.post('/:id/like', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const alreadyLiked = blog.likes.includes(req.user._id);
    if (alreadyLiked) {
      blog.likes = blog.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      blog.likes.push(req.user._id);
    }
    await blog.save();
    res.json({ likes: blog.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const comment = {
      user: req.user._id,
      content: req.body.content
    };

    blog.comments.push(comment);
    await blog.save();
    
    const updatedBlog = await Blog.findById(req.params.id).populate('comments.user', 'name profilePicture');
    res.status(201).json(updatedBlog.comments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete comment (Admin/Owner)
router.delete('/:id/comments/:commentId', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    blog.comments.pull(req.params.commentId);
    await blog.save();

    const updatedBlog = await Blog.findById(req.params.id).populate('comments.user', 'name profilePicture');
    res.json(updatedBlog.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
