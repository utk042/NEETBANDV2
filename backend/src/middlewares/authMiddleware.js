import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { TOKEN_REFRESH_WINDOW_SECONDS } from '../config/constants.js';
import { isTokenActive, replaceActiveTokenAtomic } from '../utils/tokenUtils.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('-password +activeTokens');
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check if token is active in DB or in recent grace window
      if (!isTokenActive(user.activeTokens, token)) {
        return res.status(401).json({ message: 'Not authorized, session expired or logged in from another device' });
      }

      req.user = user;

      // Sliding token refresh: if token has less than 6 days remaining, refresh it atomically
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && (decoded.exp - now < TOKEN_REFRESH_WINDOW_SECONDS)) {
        const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '7d',
        });
        await replaceActiveTokenAtomic(User, user._id, token, newToken);
        res.setHeader('x-new-token', newToken);
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to access this route' });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password +activeTokens');
      if (user && isTokenActive(user.activeTokens, token)) {
        req.user = user;

        // Sliding token refresh: if token has less than 6 days remaining, refresh it atomically
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && (decoded.exp - now < TOKEN_REFRESH_WINDOW_SECONDS)) {
          const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
          });
          await replaceActiveTokenAtomic(User, user._id, token, newToken);
          res.setHeader('x-new-token', newToken);
        }
      }
    } catch (error) {
      // Ignore invalid token, just leave req.user undefined
    }
  }
  next();
};

export const premiumOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, login required' });
  }
  // Admins/owners bypass premium check
  if (req.user.role === 'admin' || req.user.role === 'owner') {
    return next();
  }
  // Check if membership has expired
  if (req.user.isPremium && req.user.membershipExpiry && new Date(req.user.membershipExpiry) < new Date()) {
    // Revoke premium access on expiry
    req.user.isPremium = false;
    await req.user.save();
    return res.status(403).json({ message: 'Your premium subscription has expired. Please renew to continue.' });
  }
  if (!req.user.isPremium) {
    return res.status(403).json({ message: 'Premium subscription required' });
  }
  next();
};
