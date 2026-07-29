import express from 'express';
import rateLimit from 'express-rate-limit';
import { createMessage, getMessages, markAsRead, deleteMessage } from '../controllers/contactController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Define rate limiter for contact form
const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});

// Public route to submit a contact message
router.post('/', contactRateLimiter, createMessage);

// Protected admin routes to manage messages
router.get('/', protect, authorize('admin', 'owner'), getMessages);
router.put('/:id/read', protect, authorize('admin', 'owner'), markAsRead);
router.delete('/:id', protect, authorize('admin', 'owner'), deleteMessage);

export default router;
