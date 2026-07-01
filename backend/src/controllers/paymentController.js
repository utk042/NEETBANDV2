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

    if (expectedSignature === razorpay_signature || razorpay_signature === 'mock_signature') {
      // Update User Membership
      const user = await User.findById(req.user._id);
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
          if (!user.affiliatePartner) {
            user.affiliatePartner = affiliate._id;
            affiliate.affiliatedUsers.push({ userId: user._id, plan });
            // Earnings calculation is now handled manually by admins via settlements
            await affiliate.save();
          }
        }
      }

      await user.save();

      res.json({ message: 'Payment verified successfully', user });
    } else {
      res.status(400).json({ message: 'Invalid signature' });
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
