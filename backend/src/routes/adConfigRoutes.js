import express from 'express';
import { getAdConfig, updateAdConfig } from '../controllers/adConfigController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAdConfig);
router.put('/', protect, authorize('admin', 'owner'), updateAdConfig);

export default router;
