import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import connectDB from './src/config/db.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import User from './src/models/User.js';
import BookClaim from './src/models/BookClaim.js';
import Order from './src/models/Order.js';
import Affiliate from './src/models/Affiliate.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use('/payments', paymentRoutes);

let server;
let testUser;
let testAffiliate;

async function runRobustSuite() {
  console.log('====================================================');
  console.log('   STARTING ROBUST RAZORPAY AUDIT & FIXES SUITE     ');
  console.log('====================================================');

  await connectDB();
  server = app.listen(0);
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

  // Create temporary test user
  testUser = new User({
    name: 'Robust Tester',
    email: `robust_buyer_${Date.now()}@example.com`,
    password: 'password123',
    role: 'student'
  });
  const userToken = jwt.sign({ id: testUser._id }, jwtSecret, { expiresIn: '30d' });
  testUser.activeTokens = [userToken];
  await testUser.save();

  // Create temporary affiliate
  testAffiliate = new Affiliate({
    name: 'Robust Affiliate',
    email: `robust_aff_${Date.now()}@example.com`,
    password: 'password123',
    promoCode: `ROBUSTPROMO_${Date.now().toString().slice(-4)}`,
    discountEnabled: true,
    discountValue: 20,
    commissionType: 'percentage',
    commissionValue: 15,
    isActive: true
  });
  await testAffiliate.save();

  const makeReq = async (method, path, body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const reqHeaders = { 'Authorization': `Bearer ${userToken}`, ...headers };
      let reqBody = '';
      if (body) {
        reqHeaders['Content-Type'] = 'application/json';
        reqBody = typeof body === 'string' ? body : JSON.stringify(body);
        reqHeaders['Content-Length'] = Buffer.byteLength(reqBody);
      }
      const req = http.request({
        host: 'localhost',
        port,
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
  };

  const results = [];

  try {
    // TEST 1: Minimum Amount Floor (100 paise / ₹1)
    const res1 = await makeReq('POST', '/payments/order', { plan: 'book_order', discountCode: 'HALFPRICE' });
    const pass1 = res1.status === 200 && res1.body.amount >= 100;
    results.push({ name: 'Enforce Razorpay Minimum Amount Floor (>= 100 paise)', passed: pass1 });
    console.log(`[${pass1 ? 'PASS' : 'FAIL'}] Minimum Amount Floor -> HTTP ${res1.status}, Amount: ${res1.body?.amount}`);

    // TEST 2: Structured Shipping Details Saved on Order Creation
    const shippingDetails = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      address: '42 Baker Street',
      state: 'Delhi',
      pinCode: '110001',
      bookTitle: 'NeetBand Mastery Guide'
    };
    const res2 = await makeReq('POST', '/payments/order', { 
      plan: 'book_order', 
      discountCode: testAffiliate.promoCode,
      shippingDetails 
    });
    const orderDb2 = await Order.findOne({ razorpayOrderId: res2.body.id });
    const pass2 = res2.status === 200 && 
                  orderDb2?.shippingDetails?.fullName === 'John Doe' && 
                  orderDb2?.shippingDetails?.state === 'Delhi';
    results.push({ name: 'Structured Shipping Details Preserved in DB Order', passed: pass2 });
    console.log(`[${pass2 ? 'PASS' : 'FAIL'}] Structured Shipping -> Name: ${orderDb2?.shippingDetails?.fullName}, State: ${orderDb2?.shippingDetails?.state}`);

    // TEST 3: Timing-Safe Signature Comparison Rejects Invalid Signature Lengths & Characters
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_key_secret';
    const fakePayId = 'pay_robust_123';
    const fakeSignature = 'a'.repeat(64); // Wrong HMAC
    const res3 = await makeReq('POST', '/payments/verify', {
      razorpay_order_id: res2.body.id,
      razorpay_payment_id: fakePayId,
      razorpay_signature: fakeSignature,
      plan: 'book_order'
    });
    const pass3 = res3.status === 400 && res3.body.message.includes('Invalid payment signature');
    results.push({ name: 'Timing-Safe Signature Comparison Rejects Tampered Signatures', passed: pass3 });
    console.log(`[${pass3 ? 'PASS' : 'FAIL'}] Timing-Safe Signature Verification -> HTTP ${res3.status}`);

    // TEST 4: Book Order Verification Preserves Full Structured Shipping & Fulfills BookClaim
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${res2.body.id}|${fakePayId}`)
      .digest('hex');

    const res4 = await makeReq('POST', '/payments/verify', {
      razorpay_order_id: res2.body.id,
      razorpay_payment_id: fakePayId,
      razorpay_signature: validSignature,
      plan: 'book_order',
      address: shippingDetails,
      phone: '9876543210',
      bookTitle: 'NeetBand Mastery Guide',
      discountCode: testAffiliate.promoCode
    });
    const claimInDb = await BookClaim.findOne({ order: orderDb2._id });
    const pass4 = res4.status === 200 && 
                  claimInDb?.fullName === 'John Doe' && 
                  claimInDb?.email === 'john@example.com' &&
                  claimInDb?.paymentStatus === 'Completed';
    results.push({ name: 'Verify Book Payment with Complete Structured Claim Details', passed: pass4 });
    console.log(`[${pass4 ? 'PASS' : 'FAIL'}] Book Payment & Full Claim -> Claim Name: ${claimInDb?.fullName}, Claim Email: ${claimInDb?.email}`);

    // TEST 5: Affiliate Tagging & Commission Recorded for Book Orders
    const updatedAffiliate = await Affiliate.findById(testAffiliate._id);
    const updatedUser = await User.findById(testUser._id);
    const hasCommission = updatedAffiliate?.walletTransactions?.some(tx => tx.sourceUserId.toString() === testUser._id.toString());
    const pass5 = hasCommission && updatedUser?.affiliatePartner?.toString() === testAffiliate._id.toString();
    results.push({ name: 'Affiliate Tagging & Commission Credited for Book Orders', passed: pass5 });
    console.log(`[${pass5 ? 'PASS' : 'FAIL'}] Affiliate Attribution for Book Orders -> Commission Logged: ${hasCommission}, Partner Tagged: ${!!updatedUser?.affiliatePartner}`);

    // TEST 6: Webhook Security with RAZORPAY_WEBHOOK_SECRET Verification
    process.env.RAZORPAY_WEBHOOK_SECRET = 'secret_robust_999';
    const webhookOrderRes = await makeReq('POST', '/payments/order', { plan: 'premium_scholar' });
    const wOrderId = webhookOrderRes.body.id;
    const wPayId = 'pay_webhook_robust_777';

    const rawPayload = JSON.stringify({
      event: 'order.paid',
      payload: {
        payment: { entity: { id: wPayId, order_id: wOrderId } }
      }
    });

    // Subtest 6A: Missing signature
    const subRes6A = await makeReq('POST', '/payments/webhook', rawPayload);
    const pass6A = subRes6A.status === 400;

    // Subtest 6B: Valid HMAC Signature
    const validWebhookSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawPayload)
      .digest('hex');

    const subRes6B = await makeReq('POST', '/payments/webhook', rawPayload, {
      'x-razorpay-signature': validWebhookSig
    });
    const wOrderInDb = await Order.findOne({ razorpayOrderId: wOrderId });
    const pass6B = subRes6B.status === 200 && wOrderInDb?.status === 'paid' && wOrderInDb?.fulfilled === true;

    const pass6 = pass6A && pass6B;
    results.push({ name: 'Razorpay Webhook Security & Raw Body HMAC Verification', passed: pass6 });
    console.log(`[${pass6 ? 'PASS' : 'FAIL'}] Webhook Security & Fulfillment -> Missing Sig HTTP: ${subRes6A.status}, Valid Webhook HTTP: ${subRes6B.status}`);

  } catch (err) {
    console.error('Error during robust suite execution:', err);
  } finally {
    if (testUser) {
      await User.findByIdAndDelete(testUser._id);
      await BookClaim.deleteMany({ user: testUser._id });
      await Order.deleteMany({ user: testUser._id });
    }
    if (testAffiliate) {
      await Affiliate.findByIdAndDelete(testAffiliate._id);
    }
    server.close();
    await mongoose.disconnect();
  }

  const failedCount = results.filter(r => !r.passed).length;
  console.log(`\n====================================================`);
  console.log(`   ROBUST TEST SUITE SUMMARY: ${results.length - failedCount}/${results.length} PASSED`);
  console.log(`====================================================`);
  process.exit(failedCount > 0 ? 1 : 0);
}

runRobustSuite().catch(err => {
  console.error('Fatal error in robust suite runner:', err);
  process.exit(1);
});
