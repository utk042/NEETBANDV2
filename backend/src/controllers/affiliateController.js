import Affiliate from '../models/Affiliate.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
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

      const token = generateToken(affiliate._id);
      if (!affiliate.activeTokens) affiliate.activeTokens = [];
      affiliate.activeTokens.push(token);
      if (affiliate.activeTokens.length > 2) {
        affiliate.activeTokens = affiliate.activeTokens.slice(-2);
      }
      await affiliate.save();

      res.json({
        _id: affiliate._id,
        name: affiliate.name,
        email: affiliate.email,
        promoCode: affiliate.promoCode,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import WithdrawalRequest from '../models/WithdrawalRequest.js';

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
      // Calculate balances
      let totalEarned = 0;
      let availableCommissions = 0;
      let pendingBalance = 0;
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      if (affiliate.walletTransactions && affiliate.walletTransactions.length > 0) {
        affiliate.walletTransactions.forEach(tx => {
          if (tx.type === 'commission' || tx.type === 'manual_addition') {
            totalEarned += tx.amount;
            if (new Date(tx.date) <= sevenDaysAgo || tx.type === 'manual_addition') {
              availableCommissions += tx.amount;
            } else {
              pendingBalance += tx.amount;
            }
          } else if (tx.type === 'manual_deduction') {
            totalEarned -= tx.amount;
            availableCommissions -= tx.amount;
          }
        });
      }

      // Calculate withdrawals
      const withdrawals = await WithdrawalRequest.find({ affiliateId: affiliate._id });
      let totalWithdrawn = 0;
      let pendingWithdrawals = 0;

      withdrawals.forEach(w => {
        if (w.status === 'completed') {
          totalWithdrawn += w.amount;
        } else if (w.status === 'pending') {
          pendingWithdrawals += w.amount;
        }
      });

      const withdrawableBalance = availableCommissions - totalWithdrawn - pendingWithdrawals;

      res.json({
        _id: affiliate._id,
        name: affiliate.name,
        email: affiliate.email,
        promoCode: affiliate.promoCode,
        commissionType: affiliate.commissionType,
        commissionValue: affiliate.commissionValue,
        walletTransactions: affiliate.walletTransactions,
        withdrawals,
        stats: {
          totalEarned,
          pendingBalance,
          withdrawableBalance: Math.max(0, withdrawableBalance),
          totalWithdrawn
        },
        affiliatedUsers: affiliate.affiliatedUsers,
      });
    } else {
      res.status(404).json({ message: 'Affiliate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAffiliateProfile = async (req, res) => {
  const { name, password, profilePicture } = req.body;
  try {
    const affiliate = await Affiliate.findById(req.user._id);

    if (affiliate) {
      if (name) {
        affiliate.name = name;
      }
      if (password) {
        affiliate.password = password;
      }
      if (profilePicture !== undefined) {
        affiliate.profilePicture = profilePicture;
      }

      const updatedAffiliate = await affiliate.save();

      res.json({
        _id: updatedAffiliate._id,
        name: updatedAffiliate.name,
        email: updatedAffiliate.email,
        promoCode: updatedAffiliate.promoCode,
        profilePicture: updatedAffiliate.profilePicture,
      });
    } else {
      res.status(404).json({ message: 'Affiliate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request a withdrawal
// @route   POST /api/affiliates/withdrawals
// @access  Private (Affiliate)
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, paymentMode, paymentDetails } = req.body;

    if (!amount || amount <= 0 || !paymentMode || !paymentDetails) {
      return res.status(400).json({ message: 'Please provide valid amount, payment mode, and details' });
    }

    if (!['Bank Transfer', 'UPI'].includes(paymentMode)) {
      return res.status(400).json({ message: 'Invalid payment mode. Only Bank Transfer and UPI are supported.' });
    }

    const affiliate = await Affiliate.findById(req.user._id);
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    // Recalculate withdrawable balance securely
    let availableCommissions = 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (affiliate.walletTransactions && affiliate.walletTransactions.length > 0) {
      affiliate.walletTransactions.forEach(tx => {
        if (tx.type === 'commission' || tx.type === 'manual_addition') {
          if (new Date(tx.date) <= sevenDaysAgo || tx.type === 'manual_addition') {
            availableCommissions += tx.amount;
          }
        } else if (tx.type === 'manual_deduction') {
          availableCommissions -= tx.amount;
        }
      });
    }

    const withdrawals = await WithdrawalRequest.find({ affiliateId: affiliate._id });
    let totalDeductions = 0;
    withdrawals.forEach(w => {
      if (w.status === 'completed' || w.status === 'pending') {
        totalDeductions += w.amount;
      }
    });

    const withdrawableBalance = availableCommissions - totalDeductions;

    if (amount > withdrawableBalance) {
      return res.status(400).json({ message: 'Requested amount exceeds withdrawable balance' });
    }

    const withdrawalRequest = await WithdrawalRequest.create({
      affiliateId: affiliate._id,
      amount,
      paymentMode,
      paymentDetails
    });

    res.status(201).json(withdrawalRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

