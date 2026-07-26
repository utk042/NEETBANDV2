import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import songRoutes from './src/routes/songRoutes.js';
import lmsRoutes from './src/routes/lmsRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import blogRoutes from './src/routes/blogRoutes.js';
import forumRoutes from './src/routes/forumRoutes.js';
import affiliateRoutes from './src/routes/affiliateRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import newsletterRoutes from './src/routes/newsletterRoutes.js';
import offerRoutes from './src/routes/offerRoutes.js';
import adConfigRoutes from './src/routes/adConfigRoutes.js';
import { getAds } from './src/controllers/songController.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/songs', songRoutes);
app.use('/lms', lmsRoutes);
app.use('/payments', paymentRoutes);
app.use('/admin', adminRoutes);
app.use('/blogs', blogRoutes);
app.use('/forums', forumRoutes);
app.use('/affiliates', affiliateRoutes);
app.use('/contact', contactRoutes);
app.use('/upload', uploadRoutes);
app.use('/newsletter', newsletterRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/ad-config', adConfigRoutes);
app.get('/ads', getAds);
app.get('/', (req, res) => res.send('NeetBand API is running...'));

let server;
const PORT = 5099;

async function request(method, path, body = null, headers = {}) {
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

async function runSuite() {
  console.log('--- STARTING AUTOMATED BACKEND API TEST SUITE ---');
  await connectDB();
  
  server = app.listen(PORT);
  console.log(`Test server running on port ${PORT}`);

  const results = [];

  const testCases = [
    { name: 'Root Endpoint GET /', method: 'GET', path: '/', expectedStatus: [200] },
    { name: 'Ads Endpoint GET /ads', method: 'GET', path: '/ads', expectedStatus: [200] },
    { name: 'Ad Config GET /api/ad-config', method: 'GET', path: '/api/ad-config', expectedStatus: [200] },
    { name: 'Offers GET /api/offers', method: 'GET', path: '/api/offers', expectedStatus: [200] },
    { name: 'Blogs GET /blogs', method: 'GET', path: '/blogs', expectedStatus: [200] },
    { name: 'Forums GET /forums', method: 'GET', path: '/forums', expectedStatus: [200] },
    { name: 'LMS Courses GET /lms/courses', method: 'GET', path: '/lms/courses', expectedStatus: [200] },
    { name: 'Auth Login validation POST /auth/login (missing fields)', method: 'POST', path: '/auth/login', body: {}, expectedStatus: [400, 401] },
    { name: 'Auth Register validation POST /auth/register (missing fields)', method: 'POST', path: '/auth/register', body: {}, expectedStatus: [400] },
    { name: 'Admin Protected Route GET /admin/students (unauthorized)', method: 'GET', path: '/admin/students', expectedStatus: [401] },
    { name: 'Non-existent route GET /random-xyz', method: 'GET', path: '/random-xyz', expectedStatus: [404] }
  ];

  for (const tc of testCases) {
    try {
      const res = await request(tc.method, tc.path, tc.body);
      const passed = tc.expectedStatus.includes(res.status);
      results.push({
        name: tc.name,
        passed,
        status: res.status,
        expected: tc.expectedStatus
      });
      console.log(`[${passed ? 'PASS' : 'FAIL'}] ${tc.name} -> HTTP ${res.status}`);
    } catch (err) {
      results.push({ name: tc.name, passed: false, error: err.message });
      console.log(`[FAIL] ${tc.name} -> Error: ${err.message}`);
    }
  }

  server.close();
  await mongoose.disconnect();

  const failedCount = results.filter(r => !r.passed).length;
  console.log(`\n--- TEST RESULTS SUMMARY ---`);
  console.log(`Total: ${results.length} | Passed: ${results.length - failedCount} | Failed: ${failedCount}`);

  process.exit(failedCount > 0 ? 1 : 0);
}

runSuite().catch(err => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
