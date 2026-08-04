import express from 'express';
import { authAffiliate, getAffiliateDashboard, updateAffiliateProfile, logoutAffiliate, requestWithdrawal } from '../controllers/affiliateController.js';
import jwt from 'jsonwebtoken';
import Affiliate from '../models/Affiliate.js';
import { TOKEN_REFRESH_WINDOW_SECONDS } from '../config/constants.js';
import { isTokenActive, replaceActiveTokenAtomic } from '../utils/tokenUtils.js';

const router = express.Router();

const protectAffiliate = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const affiliate = await Affiliate.findById(decoded.id).select('-password +activeTokens');
      if (!affiliate) {
         return res.status(401).json({ message: 'Not authorized, affiliate not found' });
      }

      // Check if token is active in DB or in recent grace window
      if (!isTokenActive(affiliate.activeTokens, token)) {
        return res.status(401).json({ message: 'Not authorized, session expired or logged in from another device' });
      }

      req.user = affiliate;

      // Sliding token refresh: if token has less than 6 days remaining, refresh it atomically
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && (decoded.exp - now < TOKEN_REFRESH_WINDOW_SECONDS)) {
        const newToken = jwt.sign({ id: affiliate._id }, process.env.JWT_SECRET || 'fallback_secret', {
          expiresIn: '7d',
        });
        await replaceActiveTokenAtomic(Affiliate, affiliate._id, token, newToken);
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
router.post('/logout', protectAffiliate, logoutAffiliate);
router.get('/dashboard', protectAffiliate, getAffiliateDashboard);
router.get('/profile', protectAffiliate, (req, res) => {
  res.json(req.user);
});
router.put('/profile', protectAffiliate, updateAffiliateProfile);
router.post('/withdrawals', protectAffiliate, requestWithdrawal);

export default router;
