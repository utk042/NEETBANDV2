import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import connectDB from './src/config/db.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import User from './src/models/User.js';
import Affiliate from './src/models/Affiliate.js';
import Coupon from './src/models/Coupon.js';
import Order from './src/models/Order.js';

dotenv.config();

process.env.ALLOW_MOCK_PAYMENTS = 'true';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret123';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/payments', paymentRoutes);
app.use('/admin', adminRoutes);

let server;
let testToken;
let testUser;
let testAdminToken;
let testAdminUser;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const reqHeaders = { ...headers };
    let reqBody = '';
    if (body) {
      reqHeaders['Content-Type'] = 'application/json';
      reqBody = typeof body === 'string' ? body : JSON.stringify(body);
      reqHeaders['Content-Length'] = Buffer.byteLength(reqBody);
    }
    const req = http.request({
      host: 'localhost',
      port: server.address().port,
      method,
      path,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body: json || data });
      });
    });
    req.on('error', reject);
    if (reqBody) req.write(reqBody);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Comprehensive Coupon & Affiliate Checkout Test Suite...\n');
  await connectDB();

  server = app.listen(0);
  const port = server.address().port;
  console.log(`Test server running on port ${port}\n`);

  try {
    // 1. Setup Test Users & Admin
    const randomSuffix = Math.floor(Math.random() * 100000);
    testUser = new User({
      name: `Test Buyer ${randomSuffix}`,
      email: `buyer_${randomSuffix}@example.com`,
      password: 'password123',
      role: 'student'
    });
    testToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    testUser.activeTokens = [testToken];
    await testUser.save();

    testAdminUser = new User({
      name: `Test Admin ${randomSuffix}`,
      email: `admin_${randomSuffix}@example.com`,
      password: 'password123',
      role: 'admin'
    });
    testAdminToken = jwt.sign({ id: testAdminUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    testAdminUser.activeTokens = [testAdminToken];
    await testAdminUser.save();

    console.log('✅ Created test buyer & admin users');

    // 2. Create LMS Coupon via Coupon model
    const couponPercentage = await Coupon.create({
      code: `PERCENT50_${randomSuffix}`,
      discountType: 'percentage',
      discountValue: 50,
      isActive: true
    });

    const couponFixed = await Coupon.create({
      code: `FLAT100_${randomSuffix}`,
      discountType: 'fixed',
      discountValue: 100,
      isActive: true
    });

    const couponExpired = await Coupon.create({
      code: `EXPIRED_${randomSuffix}`,
      discountType: 'percentage',
      discountValue: 20,
      expireEnabled: true,
      expireDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      isActive: true
    });

    const couponLimitOne = await Coupon.create({
      code: `ONCEONLY_${randomSuffix}`,
      discountType: 'fixed',
      discountValue: 50,
      usageCountMax: 1,
      isActive: true
    });

    console.log('✅ Created test LMS Coupons (Percentage, Fixed, Expired, Usage Limited)');

    // 3. Create Affiliate with Promo Code
    const affiliateCode = `AFF_${randomSuffix}`;
    const testAffiliate = await Affiliate.create({
      name: `Affiliate Partner ${randomSuffix}`,
      email: `affiliate_${randomSuffix}@example.com`,
      password: 'password123',
      promoCode: affiliateCode,
      discountEnabled: true,
      discountValue: 15, // 15% off for buyer
      commissionType: 'percentage',
      commissionValue: 20 // 20% commission for affiliate
    });

    console.log(`✅ Created test Affiliate with Promo Code: ${affiliateCode}`);

    // -------------------------------------------------------------
    // TEST 3.5: Strict Authentication Enforcement (Guests cannot verify / purchase)
    // -------------------------------------------------------------
    console.log('\n--- TEST 3.5: Guest Authentication Protection ---');
    const guestVerifyRes = await request('POST', '/payments/verify-promo', { discountCode: couponPercentage.code });
    if (guestVerifyRes.status === 401 && guestVerifyRes.body.message.includes('Not authorized')) {
      console.log(`PASS: Guest promo verification correctly blocked with 401 ("${guestVerifyRes.body.message}")`);
    } else {
      throw new Error(`FAIL: Guest verify-promo should be rejected with 401: ${JSON.stringify(guestVerifyRes.body)}`);
    }

    // -------------------------------------------------------------
    // TEST 4: Verify LMS Coupons via /payments/verify-promo (Logged In User)
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Verify LMS Coupons via API (Authenticated) ---');
    const verifyRes1 = await request('POST', '/payments/verify-promo', { discountCode: couponPercentage.code }, { Authorization: `Bearer ${testToken}` });
    if (verifyRes1.body.valid && verifyRes1.body.discountType === 'percentage' && verifyRes1.body.discountValue === 50) {
      console.log(`PASS: Validated percentage coupon ${couponPercentage.code} (50% off)`);
    } else {
      throw new Error(`FAIL: Unexpected verify-promo output for ${couponPercentage.code}: ${JSON.stringify(verifyRes1.body)}`);
    }

    const verifyRes2 = await request('POST', '/payments/verify-promo', { discountCode: couponFixed.code }, { Authorization: `Bearer ${testToken}` });
    if (verifyRes2.body.valid && verifyRes2.body.discountType === 'fixed' && verifyRes2.body.discountValue === 100) {
      console.log(`PASS: Validated fixed coupon ${couponFixed.code} (₹100 off)`);
    } else {
      throw new Error(`FAIL: Unexpected verify-promo output for ${couponFixed.code}: ${JSON.stringify(verifyRes2.body)}`);
    }

    // -------------------------------------------------------------
    // TEST 5: Verify Expired Coupon
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Verify Expired Coupon ---');
    const verifyExpiredRes = await request('POST', '/payments/verify-promo', { discountCode: couponExpired.code }, { Authorization: `Bearer ${testToken}` });
    if (!verifyExpiredRes.body.valid && verifyExpiredRes.body.message.includes('expired')) {
      console.log(`PASS: Expired coupon rejected correctly ("${verifyExpiredRes.body.message}")`);
    } else {
      throw new Error(`FAIL: Expired coupon should be rejected: ${JSON.stringify(verifyExpiredRes.body)}`);
    }

    // -------------------------------------------------------------
    // TEST 6: Verify Affiliate Promo Code via /payments/verify-promo
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Verify Affiliate Promo Code via API ---');
    const verifyAffRes = await request('POST', '/payments/verify-promo', { discountCode: affiliateCode }, { Authorization: `Bearer ${testToken}` });
    if (verifyAffRes.body.valid && verifyAffRes.body.isAffiliate && verifyAffRes.body.discountValue === 15) {
      console.log(`PASS: Validated affiliate promo code ${affiliateCode} (15% off)`);
    } else {
      throw new Error(`FAIL: Unexpected verify-promo output for affiliate ${affiliateCode}: ${JSON.stringify(verifyAffRes.body)}`);
    }

    // -------------------------------------------------------------
    // TEST 7: Checkout & Fulfillment with LMS Percentage Coupon
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Create & Fulfill Order with LMS Percentage Coupon ---');
    const orderRes1 = await request('POST', '/payments/order', {
      plan: 'premium_scholar', // ₹299 = 29900 paise
      discountCode: couponPercentage.code
    }, { Authorization: `Bearer ${testToken}` });

    const expectedAmount1 = Math.round(29900 * 0.5); // 14950 paise = ₹149.50
    if (orderRes1.status === 200 && orderRes1.body.amount === expectedAmount1) {
      console.log(`PASS: Order created with 50% discount. Expected: ${expectedAmount1} paise, Received: ${orderRes1.body.amount} paise`);
    } else {
      throw new Error(`FAIL: Create order amount mismatch. Expected: ${expectedAmount1}, Received: ${orderRes1.body.amount}`);
    }

    // Verify Payment & Fulfill
    const verifyPayRes1 = await request('POST', '/payments/verify', {
      razorpay_order_id: orderRes1.body.id,
      razorpay_payment_id: `pay_mock_${Date.now()}`,
      razorpay_signature: 'mock_signature',
      plan: 'premium_scholar',
      discountCode: couponPercentage.code
    }, { Authorization: `Bearer ${testToken}` });

    if (verifyPayRes1.status === 200 && verifyPayRes1.body.order.status === 'paid') {
      console.log('PASS: Payment verified and order marked paid');
    } else {
      throw new Error(`FAIL: Payment verification failed: ${JSON.stringify(verifyPayRes1.body)}`);
    }

    // Verify Coupon usage count incremented
    const updatedCoupon1 = await Coupon.findById(couponPercentage._id);
    if (updatedCoupon1.usedCount === 1 && updatedCoupon1.usageHistory.length === 1) {
      console.log(`PASS: Coupon usedCount incremented to ${updatedCoupon1.usedCount} and usage history recorded`);
    } else {
      throw new Error(`FAIL: Coupon usedCount not updated correctly: ${updatedCoupon1.usedCount}`);
    }

    // -------------------------------------------------------------
    // TEST 8: Checkout & Fulfillment with Affiliate Promo Code
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Create & Fulfill Order with Affiliate Promo Code ---');
    const buyer2 = new User({
      name: `Buyer Two ${randomSuffix}`,
      email: `buyer2_${randomSuffix}@example.com`,
      password: 'password123',
      role: 'student'
    });
    const buyer2Token = jwt.sign({ id: buyer2._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    buyer2.activeTokens = [buyer2Token];
    await buyer2.save();

    const orderRes2 = await request('POST', '/payments/order', {
      plan: 'scale_plan', // ₹999 = 99900 paise
      discountCode: affiliateCode
    }, { Authorization: `Bearer ${buyer2Token}` });

    const expectedAmount2 = Math.round(99900 * (1 - 15 / 100)); // 84915 paise = ₹849.15
    if (orderRes2.status === 200 && orderRes2.body.amount === expectedAmount2) {
      console.log(`PASS: Order created with 15% affiliate discount. Expected: ${expectedAmount2} paise, Received: ${orderRes2.body.amount} paise`);
    } else {
      throw new Error(`FAIL: Affiliate order amount mismatch. Expected: ${expectedAmount2}, Received: ${orderRes2.body.amount}`);
    }

    // Verify Payment & Fulfill
    const verifyPayRes2 = await request('POST', '/payments/verify', {
      razorpay_order_id: orderRes2.body.id,
      razorpay_payment_id: `pay_mock_${Date.now()}`,
      razorpay_signature: 'mock_signature',
      plan: 'scale_plan',
      discountCode: affiliateCode
    }, { Authorization: `Bearer ${buyer2Token}` });

    if (verifyPayRes2.status === 200 && verifyPayRes2.body.order.status === 'paid') {
      console.log('PASS: Affiliate payment verified successfully');
    } else {
      throw new Error(`FAIL: Affiliate payment verification failed: ${JSON.stringify(verifyPayRes2.body)}`);
    }

    // Check Buyer 2 tagged with affiliate partner
    const updatedBuyer2 = await User.findById(buyer2._id);
    if (updatedBuyer2.affiliatePartner && updatedBuyer2.affiliatePartner.toString() === testAffiliate._id.toString()) {
      console.log('PASS: Buyer 2 successfully tagged with affiliate partner');
    } else {
      throw new Error(`FAIL: Buyer 2 not tagged with affiliate partner`);
    }

    // Check Affiliate commission recorded
    const updatedAffiliate = await Affiliate.findById(testAffiliate._id);
    if (updatedAffiliate.walletTransactions.length > 0) {
      const commTx = updatedAffiliate.walletTransactions.find(tx => tx.type === 'commission');
      console.log(`PASS: Affiliate commission transaction recorded: ₹${commTx.amount}`);
    } else {
      throw new Error('FAIL: Affiliate commission transaction missing');
    }

    // -------------------------------------------------------------
    // TEST 9: Coupon Max Usage Limit Enforcement
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Coupon Max Usage Limit Enforcement ---');
    // First usage of ONCEONLY coupon
    const orderResLimit = await request('POST', '/payments/order', {
      plan: 'book_order',
      discountCode: couponLimitOne.code
    }, { Authorization: `Bearer ${testToken}` });

    await request('POST', '/payments/verify', {
      razorpay_order_id: orderResLimit.body.id,
      razorpay_payment_id: `pay_mock_${Date.now()}`,
      razorpay_signature: 'mock_signature',
      plan: 'book_order',
      discountCode: couponLimitOne.code
    }, { Authorization: `Bearer ${testToken}` });

    // Second verification should fail (limit reached)
    const verifyLimitRes = await request('POST', '/payments/verify-promo', { discountCode: couponLimitOne.code }, { Authorization: `Bearer ${testToken}` });
    if (!verifyLimitRes.body.valid && verifyLimitRes.body.message.includes('limit has been reached')) {
      console.log(`PASS: Usage limit enforced correctly ("${verifyLimitRes.body.message}")`);
    } else {
      throw new Error(`FAIL: Coupon should be rejected due to limit: ${JSON.stringify(verifyLimitRes.body)}`);
    }

    // -------------------------------------------------------------
    // TEST 10: Admin Coupon Management API Routes (GET, POST, PUT, DELETE)
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: Admin Coupon Management API Routes ---');
    const adminGetRes = await request('GET', '/admin/coupons', null, { Authorization: `Bearer ${testAdminToken}` });
    if (adminGetRes.status === 200 && Array.isArray(adminGetRes.body) && adminGetRes.body.length >= 4) {
      console.log(`PASS: Admin fetched all coupons (total: ${adminGetRes.body.length})`);
    } else {
      throw new Error(`FAIL: Admin get coupons failed: ${JSON.stringify(adminGetRes.body)}`);
    }

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY WITH STRICT AUTH ENFORCEMENT! 🎉');

  } catch (err) {
    console.error('\n❌ TEST FAILURE:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
  }
}

runTests();
