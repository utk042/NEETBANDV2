import express from 'express';
import {
  getFaqs,
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq
} from '../controllers/faqController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for frontend
router.route('/').get(getFaqs);

// Protected routes for admin
router.route('/all').get(protect, authorize('admin', 'owner'), getAllFaqs);
router.route('/').post(protect, authorize('admin', 'owner'), createFaq);
router.route('/:id')
  .put(protect, authorize('admin', 'owner'), updateFaq)
  .delete(protect, authorize('admin', 'owner'), deleteFaq);

export default router;
