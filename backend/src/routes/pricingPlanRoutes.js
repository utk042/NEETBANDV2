import express from 'express';
import {
  getActivePricingPlans,
  getAllPricingPlans,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan
} from '../controllers/pricingPlanController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getActivePricingPlans);
router.get('/admin', protect, authorize('admin', 'owner'), getAllPricingPlans);
router.post('/', protect, authorize('admin', 'owner'), createPricingPlan);
router.put('/:id', protect, authorize('admin', 'owner'), updatePricingPlan);
router.delete('/:id', protect, authorize('admin', 'owner'), deletePricingPlan);

export default router;
