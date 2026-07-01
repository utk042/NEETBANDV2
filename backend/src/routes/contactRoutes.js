import express from 'express';
import { createMessage, getMessages, markAsRead, deleteMessage } from '../controllers/contactController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route to submit a contact message
router.post('/', createMessage);

// Protected admin routes to manage messages
router.get('/', protect, authorize('admin', 'owner'), getMessages);
router.put('/:id/read', protect, authorize('admin', 'owner'), markAsRead);
router.delete('/:id', protect, authorize('admin', 'owner'), deleteMessage);

export default router;
