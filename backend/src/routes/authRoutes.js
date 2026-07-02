import express from 'express';
import { registerUser, loginUser, getUserProfile, supabaseLoginUser } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/supabase-login', supabaseLoginUser);
router.get('/profile', protect, getUserProfile);

export default router;
