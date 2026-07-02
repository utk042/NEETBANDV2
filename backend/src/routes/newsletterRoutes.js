import express from 'express';
import { 
  subscribeNewsletter, 
  getSubscribers, 
  updateSubscriber, 
  deleteSubscriber 
} from '../controllers/newsletterController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route to subscribe
router.post('/subscribe', subscribeNewsletter);

// Protected admin routes to manage subscriptions
router.get('/subscribers', protect, authorize('admin', 'owner'), getSubscribers);
router.put('/subscribers/:id', protect, authorize('admin', 'owner'), updateSubscriber);
router.delete('/subscribers/:id', protect, authorize('admin', 'owner'), deleteSubscriber);

export default router;
