import express from 'express';
import {
  getAllTestimonials,
  getActiveTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonialController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/active', getActiveTestimonials);

// Admin routes
router.get('/', protect, authorize('admin', 'owner'), getAllTestimonials);
router.post('/', protect, authorize('admin', 'owner'), createTestimonial);
router.put('/:id', protect, authorize('admin', 'owner'), updateTestimonial);
router.delete('/:id', protect, authorize('admin', 'owner'), deleteTestimonial);

export default router;
