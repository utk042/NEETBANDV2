import express from 'express';
import { authAffiliate, getAffiliateDashboard } from '../controllers/affiliateController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Affiliate protect middleware since it uses a different model?
// Or we can modify protect to check Affiliate if it fails User.
// Actually, it's easier to create a specific middleware for Affiliate or just use the same JWT pattern
// Let's create an `affiliateProtect` middleware in authMiddleware.js or here.
// Let's put it here for simplicity.
import jwt from 'jsonwebtoken';
import Affiliate from '../models/Affiliate.js';

const protectAffiliate = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = await Affiliate.findById(decoded.id).select('-password');
      if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, affiliate not found' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

router.post('/login', authAffiliate);
router.get('/dashboard', protectAffiliate, getAffiliateDashboard);

export default router;
