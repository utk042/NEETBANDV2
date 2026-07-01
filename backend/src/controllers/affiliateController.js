import Affiliate from '../models/Affiliate.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Auth affiliate & get token
// @route   POST /api/affiliates/login
// @access  Public
export const authAffiliate = async (req, res) => {
  try {
    const { email, password } = req.body;
    const affiliate = await Affiliate.findOne({ email });

    if (affiliate && (await affiliate.comparePassword(password))) {
      if (!affiliate.isActive) {
        return res.status(401).json({ message: 'Affiliate account is inactive' });
      }

      res.json({
        _id: affiliate._id,
        name: affiliate.name,
        email: affiliate.email,
        promoCode: affiliate.promoCode,
        token: generateToken(affiliate._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get affiliate dashboard data
// @route   GET /api/affiliates/dashboard
// @access  Private (Affiliate)
export const getAffiliateDashboard = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.user._id).populate({
      path: 'affiliatedUsers.userId',
      select: 'name email',
    });

    if (affiliate) {
      res.json({
        _id: affiliate._id,
        name: affiliate.name,
        email: affiliate.email,
        promoCode: affiliate.promoCode,
        earnings: affiliate.earnings,
        affiliatedUsers: affiliate.affiliatedUsers,
        settlements: affiliate.settlements,
      });
    } else {
      res.status(404).json({ message: 'Affiliate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
