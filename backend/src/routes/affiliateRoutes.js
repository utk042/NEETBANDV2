import express from 'express';
import { authAffiliate, getAffiliateDashboard, updateAffiliateProfile } from '../controllers/affiliateController.js';
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
      const affiliate = await Affiliate.findById(decoded.id).select('-password');
      if (!affiliate) {
         return res.status(401).json({ message: 'Not authorized, affiliate not found' });
      }

      // Check if token is in activeTokens array (if activeTokens exists)
      if (affiliate.activeTokens && affiliate.activeTokens.length > 0 && !affiliate.activeTokens.includes(token)) {
        return res.status(401).json({ message: 'Not authorized, session expired or logged in from another device' });
      }

      req.user = affiliate;

      // Sliding token refresh: if token has less than 6 days remaining, refresh it
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && (decoded.exp - now < 6 * 24 * 60 * 60)) {
        const newToken = jwt.sign({ id: affiliate._id }, process.env.JWT_SECRET || 'fallback_secret', {
          expiresIn: '7d',
        });
        if (!affiliate.activeTokens) affiliate.activeTokens = [];
        affiliate.activeTokens.push(newToken);
        if (affiliate.activeTokens.length > 3) {
          affiliate.activeTokens = affiliate.activeTokens.slice(-3);
        }
        await affiliate.save();
        res.setHeader('x-new-token', newToken);
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
router.get('/profile', protectAffiliate, (req, res) => {
  res.json(req.user);
});
router.put('/profile', protectAffiliate, updateAffiliateProfile);

export default router;
