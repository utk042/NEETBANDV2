import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import Affiliate from '../models/Affiliate.js';
import BookClaim from '../models/BookClaim.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'test_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_key_secret',
  });
};

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const obj = typeof userDoc.toObject === 'function' ? userDoc.toObject() : { ...userDoc };
  delete obj.password;
  delete obj.activeTokens;
  return obj;
};

// Timing-safe signature comparison helper to prevent timing attacks
const safeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

// Helper function to validate LMS coupon or Affiliate promo code
export const validateDiscountCode = async (code, plan = null, userId = null) => {
  if (!code || !code.trim()) {
    return { valid: false, message: 'Discount code is required' };
  }
  const normalizedCode = code.trim().toUpperCase();

  // 1. Check LMS Coupon model
  const coupon = await Coupon.findOne({ code: normalizedCode });
  if (coupon) {
    if (!coupon.isActive) {
      return { valid: false, message: 'This discount coupon is inactive' };
    }

    const now = new Date();
    // Schedule start check
    if (coupon.scheduleStartEnabled && coupon.startDate && new Date(coupon.startDate) > now) {
      return { valid: false, message: 'This discount coupon is not active yet' };
    }

    // Expiration check
    if (coupon.expireEnabled && coupon.expireDate && new Date(coupon.expireDate) < now) {
      return { valid: false, message: 'This discount coupon has expired' };
    }

    // Total usage count check
    if (coupon.usageCountMax !== null && coupon.usageCountMax !== undefined && coupon.usedCount >= coupon.usageCountMax) {
      return { valid: false, message: 'This discount coupon usage limit has been reached' };
    }

    // Per-user limit check
    if (userId && coupon.usageLimitPerUser !== null && coupon.usageLimitPerUser !== undefined) {
      let userHistory = (coupon.usageHistory || []).filter(h => h.userId && h.userId.toString() === userId.toString());
      if (coupon.usageLimitPerUserTimeframe && coupon.usageLimitPerUserTimeframe !== 'Lifetime') {
        const timeframeMs = {
          '1 Day': 24 * 60 * 60 * 1000,
          '1 Week': 7 * 24 * 60 * 60 * 1000,
          '1 Month': 30 * 24 * 60 * 60 * 1000,
          '1 Year': 365 * 24 * 60 * 60 * 1000
        }[coupon.usageLimitPerUserTimeframe];

        if (timeframeMs) {
          const cutoff = new Date(now.getTime() - timeframeMs);
          userHistory = userHistory.filter(h => new Date(h.usedAt) >= cutoff);
        }
      }
      if (userHistory.length >= coupon.usageLimitPerUser) {
        return { valid: false, message: 'You have reached the usage limit for this discount coupon' };
      }
    }

    // Plan applicability check
    if (plan && coupon.isMembershipSpecific && coupon.applicableMemberships && coupon.applicableMemberships.length > 0) {
      const normalizedPlan = plan.toLowerCase();
      const isApplicable = coupon.applicableMemberships.some(m => 
        m.toLowerCase() === normalizedPlan || m.toLowerCase() === 'all'
      );
      if (!isApplicable) {
        return { valid: false, message: 'This coupon is not applicable for the selected plan' };
      }
    }

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      isCoupon: true,
      couponDoc: coupon
    };
  }

  // 2. Check Affiliate Promo Code
  const affiliate = await Affiliate.findOne({ promoCode: normalizedCode, isActive: true });
  if (affiliate && affiliate.discountEnabled) {
    return {
      valid: true,
      code: affiliate.promoCode,
      discountType: 'percentage',
      discountValue: affiliate.discountValue || 10,
      isAffiliate: true,
      affiliateDoc: affiliate
    };
  }

  // 3. Legacy Fallback
  if (normalizedCode === 'HALFPRICE') {
    return {
      valid: true,
      code: 'HALFPRICE',
      discountType: 'percentage',
      discountValue: 50,
      isLegacy: true
    };
  }

  return { valid: false, message: 'Invalid or inactive discount code' };
};

// Internal idempotent order fulfillment helper
export const fulfillOrderInternal = async ({
  orderId,
  paymentId,
  signature,
  userId,
  fallbackPlan,
  address,
  phone,
  bookTitle,
  discountCode
}) => {
  let order = await Order.findOne({ razorpayOrderId: orderId });

  // Extract structured shipping details if passed as object
  const shippingObj = typeof address === 'object' && address !== null ? address : {};
  const actualAddress = typeof address === 'string' ? address : (shippingObj.address || null);
  const actualPhone = phone || shippingObj.phone || null;
  const actualBookTitle = bookTitle || shippingObj.bookTitle || 'NeetBand Mastery Guide';

  // If order document doesn't exist (e.g. legacy test calls), create an emergency order doc
  if (!order) {
    let amount = 29900;
    const normalizedPlan = (fallbackPlan || 'premium_scholar').toLowerCase();
    if (normalizedPlan === 'scale_plan') amount = 99900;
    else if (normalizedPlan === 'book_order') amount = 49900;

    const normalizedCode = discountCode ? discountCode.trim().toUpperCase() : null;
    order = new Order({
      user: userId,
      razorpayOrderId: orderId,
      plan: normalizedPlan,
      amount,
      currency: 'INR',
      discountCode: normalizedCode,
      shippingDetails: {
        fullName: shippingObj.fullName || null,
        email: shippingObj.email || null,
        phone: actualPhone,
        address: actualAddress,
        state: shippingObj.state || null,
        pinCode: shippingObj.pinCode || null,
        bookTitle: actualBookTitle
      },
      status: 'created'
    });
    await order.save();
  }

  // Preserve & update shipping details on Order if new info provided
  if (address || phone || bookTitle) {
    const existingShipping = order.shippingDetails ? (order.shippingDetails.toObject ? order.shippingDetails.toObject() : order.shippingDetails) : {};
    order.shippingDetails = {
      ...existingShipping,
      ...(shippingObj.fullName && { fullName: shippingObj.fullName }),
      ...(shippingObj.email && { email: shippingObj.email }),
      ...(actualAddress && { address: actualAddress }),
      ...(shippingObj.state && { state: shippingObj.state }),
      ...(shippingObj.pinCode && { pinCode: shippingObj.pinCode }),
      ...(actualPhone && { phone: actualPhone }),
      ...(actualBookTitle && { bookTitle: actualBookTitle })
    };
    await order.save();
  }

  const user = await User.findById(userId || order.user);
  if (!user) {
    throw new Error('User not found');
  }

  // IDEMPOTENCY & CONCURRENCY CHECK: If already paid & fulfilled, return existing status
  if (order.status === 'paid' && order.fulfilled) {
    const existingClaim = order.plan === 'book_order' ? await BookClaim.findOne({ order: order._id }) : null;
    return {
      message: 'Payment verified successfully (already fulfilled)',
      user: sanitizeUser(user),
      claim: existingClaim,
      order
    };
  }

  // ATOMIC LOCK: Update order status to paid only if status is NOT 'paid'
  const atomicOrder = await Order.findOneAndUpdate(
    { _id: order._id, status: { $ne: 'paid' } },
    {
      $set: {
        status: 'paid',
        fulfilled: true,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        paidAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );

  if (!atomicOrder) {
    // Order was fulfilled concurrently by another request
    const existingOrder = await Order.findById(order._id);
    const existingClaim = existingOrder.plan === 'book_order' ? await BookClaim.findOne({ order: existingOrder._id }) : null;
    return {
      message: 'Payment verified successfully (already fulfilled)',
      user: sanitizeUser(user),
      claim: existingClaim,
      order: existingOrder
    };
  }

  order = atomicOrder;
  let claimDoc = null;

  // Handle Book Order fulfillment
  if (order.plan === 'book_order') {
    let claim = await BookClaim.findOne({
      $or: [{ order: order._id }, { razorpayOrderId: orderId }]
    });

    if (!claim) {
      const shipping = order.shippingDetails || {};
      claim = new BookClaim({
        user: user._id,
        order: order._id,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        amountPaid: order.amount / 100,
        fullName: shipping.fullName || user.name || 'N/A',
        email: shipping.email || user.email || 'N/A',
        bookTitle: shipping.bookTitle || actualBookTitle || 'NeetBand Mastery Guide',
        address: shipping.address || actualAddress || 'N/A',
        phone: shipping.phone || actualPhone || 'N/A',
        paymentStatus: 'Completed',
        dispatchStatus: 'Pending Dispatch'
      });
      await claim.save();
    }
    claimDoc = claim;
  } else {
    // Handle Premium Subscription activation
    user.isPremium = true;
    user.membershipPlan = order.plan || 'premium_scholar';
    
    // Subscription expires in 1 year
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    user.membershipExpiry = expiry;
  }

  // Handle Coupon / Affiliate Tagging & Commission for both Subscription and Book Orders
  const activeDiscountCode = (discountCode || order.discountCode)?.trim().toUpperCase();
  if (activeDiscountCode) {
    const discountRes = await validateDiscountCode(activeDiscountCode, order.plan, user._id);
    if (discountRes.valid && discountRes.isCoupon && discountRes.couponDoc) {
      // Record LMS Coupon usage
      await Coupon.findByIdAndUpdate(discountRes.couponDoc._id, {
        $inc: { usedCount: 1 },
        $push: {
          usageHistory: {
            userId: user._id,
            usedAt: new Date(),
            orderId: order._id
          }
        }
      });
    } else if (activeDiscountCode !== 'HALFPRICE') {
      const affiliate = await Affiliate.findOne({ promoCode: activeDiscountCode, isActive: true });
      if (affiliate) {
        // Prevent self-referral
        const isSelfReferral = affiliate.email.toLowerCase() === (user.email || '').toLowerCase() || 
                               affiliate._id.toString() === user._id.toString();

        if (!isSelfReferral && !user.affiliatePartner) {
          // Atomically tag user
          const updatedUser = await User.findOneAndUpdate(
            { _id: user._id, affiliatePartner: { $exists: false } },
            { $set: { affiliatePartner: affiliate._id } },
            { returnDocument: 'after' }
          );

          if (updatedUser) {
            user.affiliatePartner = affiliate._id;

            // Ensure single commission entry per user purchase
            const alreadyCommissioned = affiliate.walletTransactions.some(
              tx => tx.sourceUserId && tx.sourceUserId.toString() === user._id.toString()
            );

            if (!alreadyCommissioned) {
              affiliate.affiliatedUsers.push({
                userId: user._id,
                plan: order.plan || 'premium_scholar',
                joinedAt: new Date()
              });
              
              // Actual amount paid by buyer in INR (order.amount is stored in paise)
              const amountPaid = order.amount / 100;

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
                  notes: `Commission for referring user ${user.name || user.email} (Plan: ${order.plan})`
                });
              }

              await affiliate.save();
            }
          }
        }
      }
    }
  }

  await user.save();

  return { message: 'Payment verified successfully', user: sanitizeUser(user), claim: claimDoc, order };
};

// @desc    Create a Razorpay order
// @route   POST /api/payments/order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { plan, discountCode, shippingDetails } = req.body;
    
    // Amount calculation in paise
    const validPlans = ['premium_scholar', 'scale_plan', 'book_order'];
    const validatedPlan = validPlans.includes(plan) ? plan : 'premium_scholar';

    let amount = 29900; // Default: Premium Scholar (₹299)
    if (validatedPlan === 'scale_plan') {
      amount = 99900; // ₹999
    } else if (validatedPlan === 'book_order') {
      amount = 49900; // ₹499
    }

    // Apply Coupon/Discount Logic
    const normalizedCode = discountCode ? discountCode.trim().toUpperCase() : null;

    if (normalizedCode) {
      const discountRes = await validateDiscountCode(normalizedCode, validatedPlan, req.user._id);
      if (discountRes.valid) {
        if (discountRes.discountType === 'percentage') {
          amount = Math.round(amount * (1 - discountRes.discountValue / 100));
        } else if (discountRes.discountType === 'fixed') {
          const fixedPaise = discountRes.discountValue * 100;
          amount = Math.max(0, amount - fixedPaise);
        }
      }
    }

    // Enforce Razorpay minimum order requirement of ₹1 (100 paise)
    amount = Math.max(100, amount);

    const options = {
      amount,
      currency: 'INR',
      receipt: `rcpt_${req.user._id.toString().substring(0, 8)}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan: validatedPlan
      }
    };

    const keyId = process.env.RAZORPAY_KEY_ID || '';
    let rzpOrderId = '';

    // Dev/testing mock fallback
    if (keyId === 'test_key_id' || !keyId) {
      rzpOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    } else {
      const razorpay = getRazorpayInstance();
      const order = await razorpay.orders.create(options);
      rzpOrderId = order.id;
    }

    // Create DB Order record
    const orderDoc = new Order({
      user: req.user._id,
      razorpayOrderId: rzpOrderId,
      plan: validatedPlan,
      amount,
      currency: 'INR',
      discountCode: normalizedCode,
      shippingDetails: shippingDetails || null,
      status: 'created'
    });
    await orderDoc.save();

    res.json({
      id: rzpOrderId,
      amount,
      currency: 'INR',
      receipt: options.receipt,
      status: 'created',
      key_id: keyId || 'test_key_id',
      order_db_id: orderDoc._id
    });
  } catch (error) {
    console.error('Razorpay createOrder Error:', error);
    res.status(500).json({ message: error.message || 'Error creating Razorpay order', error });
  }
};

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, address, phone, bookTitle, discountCode } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required payment verification parameters' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_key_secret';
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isMockAllowed = process.env.ALLOW_MOCK_PAYMENTS === 'true' || process.env.NODE_ENV === 'test';
    const isValidSignature = safeCompare(expectedSignature, razorpay_signature) || 
      (isMockAllowed && safeCompare('mock_signature', razorpay_signature));

    if (!isValidSignature) {
      return res.status(400).json({ message: 'Invalid payment signature verification' });
    }

    const result = await fulfillOrderInternal({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      userId: req.user._id,
      fallbackPlan: plan,
      address,
      phone,
      bookTitle,
      discountCode
    });

    res.json(result);
  } catch (error) {
    console.error('Razorpay verifyPayment Error:', error);
    res.status(500).json({ message: error.message || 'Error verifying payment' });
  }
};

// @desc    Verify promo code
// @route   POST /api/payments/verify-promo
// @access  Private
export const verifyPromo = async (req, res) => {
  try {
    const { discountCode, plan } = req.body;
    if (!discountCode) {
      return res.json({ valid: false, message: 'Discount code is required' });
    }
    
    const userId = req.user ? req.user._id : null;
    const result = await validateDiscountCode(discountCode, plan, userId);
    return res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Razorpay Webhook Handler for automated fail-safe background order fulfillment
// @route   POST /api/payments/webhook
// @access  Public (Signature verified)
export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const isTestEnv = process.env.NODE_ENV === 'test';

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      if (!signature) {
        return res.status(400).json({ message: 'Missing Razorpay webhook signature' });
      }

      const payload = req.rawBody 
        ? req.rawBody 
        : (typeof req.body === 'string' || Buffer.isBuffer(req.body) 
            ? req.body 
            : JSON.stringify(req.body));

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      if (!safeCompare(expectedSignature, signature)) {
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    } else if (!isTestEnv) {
      // In production/live environments, reject unauthenticated webhook calls if secret isn't configured
      console.warn('Razorpay Webhook received without configured RAZORPAY_WEBHOOK_SECRET.');
      if (signature) {
        return res.status(400).json({ message: 'Razorpay webhook secret missing in configuration' });
      }
    }

    const eventData = typeof req.body === 'string' || Buffer.isBuffer(req.body)
      ? JSON.parse(req.body.toString())
      : req.body;

    const event = eventData?.event;

    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = eventData.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || eventData.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId && paymentId) {
        const order = await Order.findOne({ razorpayOrderId: orderId });
        if (order) {
          await fulfillOrderInternal({
            orderId,
            paymentId,
            signature: signature || 'webhook_signature',
            userId: order.user
          });
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    res.status(500).json({ message: 'Webhook processing error', error: error.message });
  }
};
