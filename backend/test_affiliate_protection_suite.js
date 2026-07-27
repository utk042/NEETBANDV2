import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'backend/.env') });
dotenv.config();

process.env.NODE_ENV = 'test';

import http from 'http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Affiliate from './src/models/Affiliate.js';
import WithdrawalRequest from './src/models/WithdrawalRequest.js';
import Order from './src/models/Order.js';

import paymentRoutes from './src/routes/paymentRoutes.js';
import affiliateRoutes from './src/routes/affiliateRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/payments', paymentRoutes);
app.use('/affiliates', affiliateRoutes);
app.use('/admin', adminRoutes);

let server;
const PORT = 5105;

async function httpRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const reqHeaders = { ...headers };
    let reqBody = '';
    if (body) {
      reqHeaders['Content-Type'] = 'application/json';
      reqBody = JSON.stringify(body);
      reqHeaders['Content-Length'] = Buffer.byteLength(reqBody);
    }
    const req = http.request({
      host: 'localhost',
      port: PORT,
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

async function runAffiliateTestSuite() {
  console.log('====================================================');
  console.log('  STARTING AFFILIATE & PAYMENT PROTECTION TEST SUITE ');
  console.log('====================================================\n');

  await connectDB();
  server = app.listen(PORT);
  console.log(`Test server running on port ${PORT}\n`);

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      testPassed++;
    } else {
      console.error(`[FAIL] ${message}`);
      testFailed++;
    }
  }

  try {
    // Clean up test collections
    const testSuffix = `_test_${Date.now()}`;
    
    // 1. Create Test Affiliate
    const affiliateEmail = `affiliate${testSuffix}@test.com`;
    const affiliate = await Affiliate.create({
      name: 'Test Affiliate Partner',
      email: affiliateEmail,
      password: 'password123',
      promoCode: `PROMO${Date.now()}`,
      discountEnabled: true,
      discountValue: 10,
      commissionType: 'fixed',
      commissionValue: 100,
      walletTransactions: [
        {
          type: 'manual_addition',
          amount: 500,
          date: new Date(),
          notes: 'Initial test wallet balance'
        }
      ]
    });
    console.log(`Created Test Affiliate: ${affiliate.email} | Promo: ${affiliate.promoCode}`);

    // Login Affiliate to get JWT token
    const affLoginRes = await httpRequest('POST', '/affiliates/login', {
      email: affiliateEmail,
      password: 'password123'
    });
    const affiliateToken = affLoginRes.body.token;
    assert(affLoginRes.status === 200 && affiliateToken, 'Affiliate Login successful');

    // 2. Create Test Student User
    const userEmail = `student${testSuffix}@test.com`;
    const user = await User.create({
      name: 'Test Student User',
      email: userEmail,
      password: 'password123'
    });

    // Login User to get JWT
    const userLoginRes = await httpRequest('POST', '/auth/login', {
      email: userEmail,
      password: 'password123'
    });
    const userToken = userLoginRes.body.token;
    assert(userLoginRes.status === 200 && userToken, 'Student Login successful');

    // ----------------------------------------------------
    // TEST CASE 1: Production Signature Hardening Check
    // ----------------------------------------------------
    console.log('\n--- TEST CASE 1: Signature Verification & Hardening ---');
    const invalidSigRes = await httpRequest('POST', '/payments/verify', {
      razorpay_order_id: 'order_12345',
      razorpay_payment_id: 'pay_12345',
      razorpay_signature: 'completely_invalid_signature',
      plan: 'scale_plan'
    }, { Authorization: `Bearer ${userToken}` });

    assert(invalidSigRes.status === 400, 'Invalid signature rejected with HTTP 400');

    // ----------------------------------------------------
    // TEST CASE 2: Self-Referral Prevention Check
    // ----------------------------------------------------
    console.log('\n--- TEST CASE 2: Self-Referral Prevention ---');
    // Create an affiliate user account with matching email
    const selfAffiliateUser = await User.create({
      name: 'Test Self Affiliate',
      email: affiliateEmail,
      password: 'password123'
    });
    const selfUserLoginRes = await httpRequest('POST', '/auth/login', {
      email: affiliateEmail,
      password: 'password123'
    });

    const selfPayRes = await httpRequest('POST', '/payments/verify', {
      razorpay_order_id: 'order_self_1',
      razorpay_payment_id: 'pay_self_1',
      razorpay_signature: 'mock_signature',
      plan: 'scale_plan',
      discountCode: affiliate.promoCode
    }, { Authorization: `Bearer ${selfUserLoginRes.body.token}` });

    assert(selfPayRes.status === 200, 'Self payment verified membership');
    const updatedSelfUser = await User.findById(selfAffiliateUser._id);
    assert(!updatedSelfUser.affiliatePartner, 'Self-referral blocked: User not tagged with own affiliate code');

    // Clean up self user
    await User.findByIdAndDelete(selfAffiliateUser._id);

    // ----------------------------------------------------
    // TEST CASE 3: Legitimate Promo Payment & Single Attribution
    // ----------------------------------------------------
    console.log('\n--- TEST CASE 3: Valid Referral Attribution ---');
    const validPayRes = await httpRequest('POST', '/payments/verify', {
      razorpay_order_id: 'order_valid_1',
      razorpay_payment_id: 'pay_valid_1',
      razorpay_signature: 'mock_signature',
      plan: 'scale_plan',
      discountCode: affiliate.promoCode
    }, { Authorization: `Bearer ${userToken}` });

    assert(validPayRes.status === 200, 'Legitimate payment verified successfully');
    const updatedUser = await User.findById(user._id);
    assert(updatedUser.affiliatePartner?.toString() === affiliate._id.toString(), 'User correctly attributed to affiliate partner');

    // Retry verification to ensure idempotency (no double commission)
    const retryPayRes = await httpRequest('POST', '/payments/verify', {
      razorpay_order_id: 'order_valid_1',
      razorpay_payment_id: 'pay_valid_1',
      razorpay_signature: 'mock_signature',
      plan: 'scale_plan',
      discountCode: affiliate.promoCode
    }, { Authorization: `Bearer ${userToken}` });

    const refetchedAffiliate = await Affiliate.findById(affiliate._id);
    assert(refetchedAffiliate.walletTransactions.filter(tx => tx.sourceUserId?.toString() === user._id.toString()).length === 1, 'Idempotency verified: Exactly 1 commission added to wallet');

    // ----------------------------------------------------
    // TEST CASE 4: Withdrawal Amount & Boundary Validation
    // ----------------------------------------------------
    console.log('\n--- TEST CASE 4: Withdrawal Boundary Validation ---');

    // Try requesting withdrawal higher than available balance (available = 500)
    const excessiveWithdrawRes = await httpRequest('POST', '/affiliates/withdrawals', {
      amount: 99999,
      paymentMode: 'UPI',
      paymentDetails: 'test@upi'
    }, { Authorization: `Bearer ${affiliateToken}` });

    assert(excessiveWithdrawRes.status === 400, 'Excessive withdrawal rejected with HTTP 400');

    // Try invalid payment mode
    const invalidModeRes = await httpRequest('POST', '/affiliates/withdrawals', {
      amount: 100,
      paymentMode: 'Crypto',
      paymentDetails: '0x12345'
    }, { Authorization: `Bearer ${affiliateToken}` });

    assert(invalidModeRes.status === 400, 'Invalid payment mode rejected');

    // Valid withdrawal request
    const validWithdrawRes = await httpRequest('POST', '/affiliates/withdrawals', {
      amount: 200,
      paymentMode: 'UPI',
      paymentDetails: 'test@upi'
    }, { Authorization: `Bearer ${affiliateToken}` });

    assert(validWithdrawRes.status === 201, 'Valid withdrawal created successfully (HTTP 201)');

    // ----------------------------------------------------
    // TEST CASE 5: Concurrent Withdrawal Double-Spend Prevention
    // ----------------------------------------------------
    console.log('\n--- TEST CASE 5: Concurrent Double-Spend Prevention ---');
    
    // Withdrawable balance was 500, subtracted 200 pending = 300 remaining balance.
    // Parallel requests attempting to withdraw 250 twice simultaneously (total 500 > 300 balance)
    const [req1, req2] = await Promise.all([
      httpRequest('POST', '/affiliates/withdrawals', {
        amount: 250,
        paymentMode: 'UPI',
        paymentDetails: 'concurrent1@upi'
      }, { Authorization: `Bearer ${affiliateToken}` }),
      httpRequest('POST', '/affiliates/withdrawals', {
        amount: 250,
        paymentMode: 'UPI',
        paymentDetails: 'concurrent2@upi'
      }, { Authorization: `Bearer ${affiliateToken}` })
    ]);

    const successCount = [req1, req2].filter(r => r.status === 201).length;
    const rejectedCount = [req1, req2].filter(r => r.status === 400).length;

    assert(successCount <= 1, `Concurrent race condition prevented: Only ${successCount} out of 2 concurrent withdrawals succeeded (Rejected: ${rejectedCount})`);

    // Clean up created entities
    await Affiliate.findByIdAndDelete(affiliate._id);
    await User.findByIdAndDelete(user._id);
    await Order.deleteMany({ user: user._id });
    await WithdrawalRequest.deleteMany({ affiliateId: affiliate._id });

  } catch (err) {
    console.error('Test Suite Error:', err);
    testFailed++;
  } finally {
    server.close();
    await mongoose.disconnect();

    console.log('\n====================================================');
    console.log(`  TEST RESULTS: ${testPassed} PASSED | ${testFailed} FAILED`);
    console.log('====================================================\n');
    process.exit(testFailed > 0 ? 1 : 0);
  }
}

runAffiliateTestSuite();
