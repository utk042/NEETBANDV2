import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import Affiliate from '../models/Affiliate.js';
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'test_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_key_secret',
});

// @desc    Create a Razorpay order
// @route   POST /api/payments/order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { plan, discountCode } = req.body;
    let amount = plan === 'scale_plan' ? 99900 : 29900; // Amount in paise (₹299 default)

    // Apply Coupon/Discount Logic
    if (discountCode === 'HALFPRICE') {
      amount = amount / 2;
    } else if (discountCode) {
      const affiliate = await Affiliate.findOne({ promoCode: discountCode.toUpperCase(), isActive: true });
      if (affiliate && affiliate.discountEnabled) {
        const discountVal = affiliate.discountValue || 10;
        amount = Math.floor(amount * (1 - discountVal / 100));
      }
    }

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${req.user._id}_${Date.now()}`,
    };

    // If using dummy test keys, mock the Razorpay response to prevent crashes
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    if (keyId.includes('test_key_id') || !keyId) {
      return res.json({
        id: `order_mock_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: 'created'
      });
    }

    const order = await razorpay.orders.create(options);
    res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ message: error.message || error.toString(), error, stack: error.stack });
  }
};

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_key_secret')
      .update(body.toString())
      .digest('hex');

    const isMockAllowed = process.env.ALLOW_MOCK_PAYMENTS === 'true' || process.env.NODE_ENV === 'test';
    const isValidSignature = expectedSignature === razorpay_signature || (isMockAllowed && razorpay_signature === 'mock_signature');

    if (isValidSignature) {
      // Fetch user atomically to prevent race condition attribution
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.isPremium = true;
      user.membershipPlan = plan;
      
      // Expire in 1 year
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      user.membershipExpiry = expiry;
      
      const { discountCode } = req.body;
      if (discountCode && discountCode !== 'HALFPRICE') {
        const affiliate = await Affiliate.findOne({ promoCode: discountCode.toUpperCase(), isActive: true });
        if (affiliate) {
          // Block self-referral (affiliate using their own email/ID or promo code)
          const isSelfReferral = affiliate.email.toLowerCase() === user.email.toLowerCase() || 
                                 affiliate._id.toString() === user._id.toString();

          if (!isSelfReferral && !user.affiliatePartner) {
            // Atomically tag user to prevent parallel race conditions
            const updatedUser = await User.findOneAndUpdate(
              { _id: user._id, affiliatePartner: { $exists: false } },
              { $set: { affiliatePartner: affiliate._id } },
              { new: true }
            );

            if (updatedUser) {
              affiliate.affiliatedUsers.push({ userId: user._id, plan, joinedAt: new Date() });
              
              // Auto-calculate commission based on net price paid
              let amountPaid = plan === 'scale_plan' ? 999 : 299;
              if (affiliate.discountEnabled) {
                const discountVal = affiliate.discountValue || 10;
                amountPaid = amountPaid * (1 - discountVal / 100);
              }

              let commissionAmount = 0;
              if (affiliate.commissionType === 'percentage') {
                commissionAmount = (amountPaid * (affiliate.commissionValue || 0)) / 100;
              } else {
                commissionAmount = affiliate.commissionValue || 0;
              }

              if (commissionAmount > 0) {
                affiliate.walletTransactions.push({
                  type: 'commission',
                  amount: Math.round(commissionAmount),
                  sourceUserId: user._id,
                  date: new Date(),
                  notes: `Commission for referring user ${user.name || user.email} (Plan: ${plan})`
                });
              }

              await affiliate.save();
            }
          }
        }
      }

      await user.save();

      res.json({ message: 'Payment verified successfully', user });
    } else {
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify promo code
// @route   POST /api/payments/verify-promo
// @access  Private
export const verifyPromo = async (req, res) => {
  try {
    const { discountCode } = req.body;
    if (!discountCode) {
      return res.json({ valid: false });
    }
    
    if (discountCode === 'HALFPRICE') {
      return res.json({ valid: true, discountType: 'percentage', discountValue: 50 });
    }

    const affiliate = await Affiliate.findOne({ promoCode: discountCode.toUpperCase(), isActive: true });
    if (affiliate && affiliate.discountEnabled) {
      return res.json({ valid: true, discountType: 'percentage', discountValue: affiliate.discountValue || 10 });
    }
    
    return res.json({ valid: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
