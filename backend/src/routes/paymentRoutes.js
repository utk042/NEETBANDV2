import express from 'express';
import { createOrder, verifyPayment, verifyPromo } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/verify-promo', protect, verifyPromo);

export default router;
