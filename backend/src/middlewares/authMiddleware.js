import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check if token is in activeTokens array
      if (user.activeTokens && user.activeTokens.length > 0 && !user.activeTokens.includes(token)) {
        return res.status(401).json({ message: 'Not authorized, session expired or logged in from another device' });
      }

      req.user = user;

      // Sliding token refresh: if token has less than 6 days remaining, refresh it
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && (decoded.exp - now < 6 * 24 * 60 * 60)) {
        const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '7d',
        });
        if (!user.activeTokens) user.activeTokens = [];
        user.activeTokens.push(newToken);
        if (user.activeTokens.length > 3) {
          user.activeTokens = user.activeTokens.slice(-3);
        }
        await user.save();
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
      const user = await User.findById(decoded.id).select('-password');
      if (user && (!user.activeTokens || user.activeTokens.length === 0 || user.activeTokens.includes(token))) {
        req.user = user;

        // Sliding token refresh: if token has less than 6 days remaining, refresh it
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && (decoded.exp - now < 6 * 24 * 60 * 60)) {
          const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
          });
          if (!user.activeTokens) user.activeTokens = [];
          user.activeTokens.push(newToken);
          if (user.activeTokens.length > 3) {
            user.activeTokens = user.activeTokens.slice(-3);
          }
          await user.save();
          res.setHeader('x-new-token', newToken);
        }
      }
    } catch (error) {
      // Ignore invalid token, just leave req.user undefined
    }
  }
  next();
};

export const premiumOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, login required' });
  }
  if (!req.user.isPremium && req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Premium subscription required' });
  }
  next();
};
