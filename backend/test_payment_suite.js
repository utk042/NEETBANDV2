import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import mongoose from 'mongoose';

import connectDB from './src/config/db.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import User from './src/models/User.js';
import BookClaim from './src/models/BookClaim.js';
import Order from './src/models/Order.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use('/payments', paymentRoutes);

const PORT = 5098;
let server;
let testToken;
let testUser;

async function request(method, path, body = null, headers = {}) {
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

async function runPaymentSuite() {
  console.log('--- STARTING RAZORPAY PAYMENT TEST SUITE ---');
  await connectDB();

  server = app.listen(0);
  const port = server.address().port;
  console.log(`Payment test server running on port ${port}`);

  // Create temporary test user
  const email = `test_pay_${Date.now()}@example.com`;
  testUser = new User({
    name: 'Razorpay Tester',
    email,
    password: 'password123',
    role: 'student'
  });
  
  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
  testToken = jwt.sign({ id: testUser._id }, jwtSecret, { expiresIn: '30d' });
  testUser.activeTokens = [testToken];
  await testUser.save();

  const results = [];
  let currentToken = testToken;

  const makeReq = async (method, path, body, headers = {}) => {
    const res = await new Promise((resolve, reject) => {
      const reqHeaders = { 'Authorization': `Bearer ${currentToken}`, ...headers };
      let reqBody = '';
      if (body) {
        reqHeaders['Content-Type'] = 'application/json';
        reqBody = typeof body === 'string' ? body : JSON.stringify(body);
        reqHeaders['Content-Length'] = Buffer.byteLength(reqBody);
      }
      const req = http.request({
        host: 'localhost',
        port: port,
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

    if (res.headers && res.headers['x-new-token']) {
      currentToken = res.headers['x-new-token'];
    }
    return res;
  };

  try {
    // Test 1: Create Premium Scholar Order & verify DB persistence
    const res1 = await makeReq('POST', '/payments/order', { plan: 'premium_scholar' });
    const orderInDb1 = await Order.findOne({ razorpayOrderId: res1.body?.id });
    const pass1 = res1.status === 200 && res1.body.amount === 29900 && !!res1.body.id && !!orderInDb1;
    results.push({ name: 'Create Premium Order (29900 paise & Order DB)', passed: pass1, body: res1.body });
    console.log(`[${pass1 ? 'PASS' : 'FAIL'}] Create Premium Order -> HTTP ${res1.status}, OrderId: ${res1.body?.id}, DB Status: ${orderInDb1?.status}`);

    // Test 2: Create Book Order & verify DB persistence
    const res2 = await makeReq('POST', '/payments/order', { plan: 'book_order' });
    const orderInDb2 = await Order.findOne({ razorpayOrderId: res2.body?.id });
    const pass2 = res2.status === 200 && res2.body.amount === 49900 && !!res2.body.id && !!orderInDb2;
    results.push({ name: 'Create Book Order (49900 paise & Order DB)', passed: pass2, body: res2.body });
    console.log(`[${pass2 ? 'PASS' : 'FAIL'}] Create Book Order -> HTTP ${res2.status}, Amount: ${res2.body?.amount}`);

    // Test 3: Create Order with case-insensitive promo code 'halfprice'
    const res3 = await makeReq('POST', '/payments/order', { plan: 'premium_scholar', discountCode: 'halfprice' });
    const pass3 = res3.status === 200 && res3.body.amount === 14950;
    results.push({ name: 'Create Order with Case-Insensitive HALFPRICE Discount', passed: pass3, body: res3.body });
    console.log(`[${pass3 ? 'PASS' : 'FAIL'}] Create Order halfprice -> HTTP ${res3.status}, Amount: ${res3.body?.amount}`);

    // Test 4: Reject Payment Verification with Invalid Signature
    const res4 = await makeReq('POST', '/payments/verify', {
      razorpay_order_id: 'order_test_123',
      razorpay_payment_id: 'pay_test_456',
      razorpay_signature: 'invalid_signature_string',
      plan: 'premium_scholar'
    });
    const pass4 = res4.status === 400;
    results.push({ name: 'Reject Invalid Payment Signature', passed: pass4 });
    console.log(`[${pass4 ? 'PASS' : 'FAIL'}] Reject Invalid Signature -> HTTP ${res4.status}`);

    // Test 5: Verify Payment Signature with Valid HMAC & Password Sanitization
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_key_secret';
    const mockOrderId = res1.body.id; // Use previously created order
    const mockPayId = 'pay_test_valid_888';
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${mockOrderId}|${mockPayId}`)
      .digest('hex');

    const res5 = await makeReq('POST', '/payments/verify', {
      razorpay_order_id: mockOrderId,
      razorpay_payment_id: mockPayId,
      razorpay_signature: validSignature,
      plan: 'premium_scholar'
    });
    const updatedOrder1 = await Order.findOne({ razorpayOrderId: mockOrderId });
    const noPasswordLeaked = res5.body.user && res5.body.user.password === undefined;
    const pass5 = res5.status === 200 && res5.body.user?.isPremium === true && updatedOrder1?.status === 'paid' && noPasswordLeaked;
    results.push({ name: 'Verify Valid Signature, Upgrade Premium & Sanitize Password in Response', passed: pass5 });
    console.log(`[${pass5 ? 'PASS' : 'FAIL'}] Verify Signature, Upgrade & Sanitize User -> HTTP ${res5.status}, Password Leaked: ${!noPasswordLeaked}`);

    // Test 6: Verify Book Order Payment & Claim Recording
    const bookOrderId = res2.body.id; // Use previously created book order
    const bookPayId = 'pay_book_valid_222';
    const bookSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${bookOrderId}|${bookPayId}`)
      .digest('hex');

    const res6 = await makeReq('POST', '/payments/verify', {
      razorpay_order_id: bookOrderId,
      razorpay_payment_id: bookPayId,
      razorpay_signature: bookSignature,
      plan: 'book_order',
      address: '123 Test Street, New Delhi - 110001',
      phone: '9876543210',
      bookTitle: 'NeetBand Mastery Guide'
    });

    const claimInDb = await BookClaim.findOne({ user: testUser._id });
    const pass6 = res6.status === 200 && !!claimInDb && claimInDb.paymentStatus === 'Completed' && claimInDb.razorpayOrderId === bookOrderId;
    results.push({ name: 'Verify Book Payment & Save Detailed BookClaim in DB', passed: pass6 });
    console.log(`[${pass6 ? 'PASS' : 'FAIL'}] Book Payment & DB Claim -> HTTP ${res6.status}, ClaimID: ${claimInDb?._id}, RazorpayOrderID: ${claimInDb?.razorpayOrderId}`);

    // Test 7: Idempotency Check - Replaying signature does NOT duplicate BookClaim
    const initialClaimsCount = await BookClaim.countDocuments({ user: testUser._id });
    const replayRes = await makeReq('POST', '/payments/verify', {
      razorpay_order_id: bookOrderId,
      razorpay_payment_id: bookPayId,
      razorpay_signature: bookSignature,
      plan: 'book_order',
      address: '123 Test Street, New Delhi - 110001',
      phone: '9876543210',
      bookTitle: 'NeetBand Mastery Guide'
    });
    const finalClaimsCount = await BookClaim.countDocuments({ user: testUser._id });
    const pass7 = replayRes.status === 200 && initialClaimsCount === finalClaimsCount;
    results.push({ name: 'Replay Protection (Idempotent verification, no duplicate claims)', passed: pass7 });
    console.log(`[${pass7 ? 'PASS' : 'FAIL'}] Replay Protection -> HTTP ${replayRes.status}, Claims count unchanged: ${initialClaimsCount} === ${finalClaimsCount}`);

    // Test 8: Razorpay Webhook Raw Body Signature Verification & Automated Order Fulfillment
    const webhookSecret = 'test_webhook_secret_123';
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

    const webhookOrderRes = await makeReq('POST', '/payments/order', { plan: 'premium_scholar' });
    const webhookOrderId = webhookOrderRes.body.id;
    const webhookPayId = 'pay_webhook_test_999';

    const rawWebhookPayload = JSON.stringify({
      event: 'order.paid',
      payload: {
        payment: {
          entity: {
            id: webhookPayId,
            order_id: webhookOrderId
          }
        }
      }
    });

    const webhookSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawWebhookPayload)
      .digest('hex');

    const webhookRes = await request('POST', '/payments/webhook', rawWebhookPayload, {
      'x-razorpay-signature': webhookSignature
    });

    const webhookOrderInDb = await Order.findOne({ razorpayOrderId: webhookOrderId });
    const pass8 = webhookRes.status === 200 && webhookOrderInDb?.status === 'paid' && webhookOrderInDb?.fulfilled === true;
    results.push({ name: 'Razorpay Webhook Raw Body HMAC Verification & Auto-Fulfillment', passed: pass8 });
    console.log(`[${pass8 ? 'PASS' : 'FAIL'}] Webhook Raw Body Signature & Fulfillment -> HTTP ${webhookRes.status}, Order Status: ${webhookOrderInDb?.status}`);

  } catch (err) {
    console.error('Error executing payment test cases:', err);
  } finally {
    // Cleanup
    if (testUser) {
      await User.findByIdAndDelete(testUser._id);
      await BookClaim.deleteMany({ user: testUser._id });
      await Order.deleteMany({ user: testUser._id });
    }
    server.close();
    await mongoose.disconnect();
  }

  const failedCount = results.filter(r => !r.passed).length;
  console.log(`\n--- PAYMENT TEST RESULTS SUMMARY ---`);
  console.log(`Total: ${results.length} | Passed: ${results.length - failedCount} | Failed: ${failedCount}`);

  process.exit(failedCount > 0 ? 1 : 0);
}

runPaymentSuite().catch(err => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
