import http from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import express from 'express';
import dotenv from 'dotenv';
import paymentRoutes from './src/routes/paymentRoutes.js';
import User from './src/models/User.js';
import Order from './src/models/Order.js';
import { formatPlanName, isInstitutePlan, sendOrderReceiptEmail } from './src/utils/emailService.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/payments', paymentRoutes);

const runReceiptSuite = async () => {
  console.log('--- STARTING RECEIPT AND EMAIL TEST SUITE ---');

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  const testUser = new User({
    name: 'Receipt Test Student',
    email: `receipt_test_${Date.now()}@example.com`,
    password: 'password123',
    role: 'student'
  });
  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
  const testToken = jwt.sign({ id: testUser._id }, jwtSecret, { expiresIn: '30d' });
  testUser.activeTokens = [testToken];
  await testUser.save();

  const makeReq = async (method, path, body = null) => {
    return new Promise((resolve, reject) => {
      const reqHeaders = { 'Authorization': `Bearer ${testToken}` };
      let reqBody = '';
      if (body) {
        reqHeaders['Content-Type'] = 'application/json';
        reqBody = JSON.stringify(body);
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
          resolve({ status: res.statusCode, body: json || data });
        });
      });
      req.on('error', reject);
      if (reqBody) req.write(reqBody);
      req.end();
    });
  };

  try {
    // 1. Verify formatPlanName & isInstitutePlan helpers
    const passHelpers = isInstitutePlan('inst_20') && 
                        isInstitutePlan('inst_50') && 
                        isInstitutePlan('scale_plan') && 
                        !isInstitutePlan('premium_scholar') &&
                        formatPlanName('inst_20') === '20-User Institute Batch Access';
    console.log(`[${passHelpers ? 'PASS' : 'FAIL'}] Plan helper utilities format & recognize institute plans`);

    // 2. Create paid orders in DB for testing receipt APIs
    const normalOrder = await Order.create({
      user: testUser._id,
      razorpayOrderId: `order_receipt_normal_${Date.now()}`,
      razorpayPaymentId: `pay_normal_${Date.now()}`,
      plan: 'premium_scholar',
      amount: 250800,
      billingCycle: 'yearly',
      status: 'paid',
      fulfilled: true,
      paidAt: new Date()
    });

    const instOrder = await Order.create({
      user: testUser._id,
      razorpayOrderId: `order_receipt_inst_${Date.now()}`,
      razorpayPaymentId: `pay_inst_${Date.now()}`,
      plan: 'inst_20',
      amount: 4765200,
      billingCycle: 'yearly',
      status: 'paid',
      fulfilled: true,
      paidAt: new Date()
    });

    // 3. Test Email sending logic
    const emailResult = await sendOrderReceiptEmail({ user: testUser, order: instOrder });
    const passEmail = emailResult !== undefined;
    console.log(`[${passEmail ? 'PASS' : 'FAIL'}] sendOrderReceiptEmail executed successfully`);

    // 4. Test GET /payments/orders
    const ordersRes = await makeReq('GET', '/payments/orders');
    const passOrders = ordersRes.status === 200 && Array.isArray(ordersRes.body) && ordersRes.body.length >= 2;
    console.log(`[${passOrders ? 'PASS' : 'FAIL'}] GET /payments/orders returned ${ordersRes.body?.length} orders`);

    // 5. Test GET /payments/receipt/:orderId
    const receiptRes = await makeReq('GET', `/payments/receipt/${normalOrder._id}`);
    const passReceipt = receiptRes.status === 200 && receiptRes.body?.order?._id === normalOrder._id.toString();
    console.log(`[${passReceipt ? 'PASS' : 'FAIL'}] GET /payments/receipt/:orderId returned receipt data`);

    console.log('\n--- ALL RECEIPT & EMAIL TESTS COMPLETE ---');
  } catch (err) {
    console.error('Test Suite Error:', err);
  } finally {
    await mongoose.connection.close();
    server.close();
    process.exit(0);
  }
};

runReceiptSuite();
