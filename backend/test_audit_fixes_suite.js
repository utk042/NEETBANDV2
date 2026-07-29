import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import songRoutes from './src/routes/songRoutes.js';
import adConfigRoutes from './src/routes/adConfigRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import { getAds } from './src/controllers/songController.js';
import { updateAdConfig } from './src/controllers/adConfigController.js';
import Song from './src/models/Song.js';
import AdConfig from './src/models/AdConfig.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/songs', songRoutes);
app.use('/api/ad-config', adConfigRoutes);
app.use('/upload', uploadRoutes);
app.get('/ads', getAds);

const PORT = 5099;
let server;

async function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const reqHeaders = { ...headers };
    let reqBody = '';
    if (body) {
      reqHeaders['Content-Type'] = 'application/json';
      reqBody = JSON.stringify(body);
      reqHeaders['Content-Length'] = Buffer.byteLength(reqBody);
    }
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed = data;
          try {
            parsed = JSON.parse(data);
          } catch (e) {}
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        });
      }
    );
    req.on('error', reject);
    if (reqBody) req.write(reqBody);
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING AUDIO AD AUDIT FIXES VERIFICATION SUITE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  server = app.listen(PORT, async () => {
    try {
      if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
      }

      // Test 1: Issue E — Position array integer validation (400 Bad Request)
      let statusE1 = 0;
      let dataE1 = {};
      const mockResE1 = {
        status: (s) => { statusE1 = s; return mockResE1; },
        json: (d) => { dataE1 = d; return mockResE1; }
      };
      await updateAdConfig({ body: { audioRollPositions: ['abc', 20] } }, mockResE1);
      assert(statusE1 === 400, 'Issue E: Reject non-integer strings in audioRollPositions with 400', `Got status ${statusE1}: ${JSON.stringify(dataE1)}`);

      let statusE2 = 0;
      let dataE2 = {};
      const mockResE2 = {
        status: (s) => { statusE2 = s; return mockResE2; },
        json: (d) => { dataE2 = d; return mockResE2; }
      };
      await updateAdConfig({ body: { popupPositions: [10.5, 40] } }, mockResE2);
      assert(statusE2 === 400, 'Issue E: Reject floats in popupPositions with 400', `Got status ${statusE2}: ${JSON.stringify(dataE2)}`);

      // Test 2: Issue G & J — Analytics idempotency and deleted song 404
      const fakeId = new mongoose.Types.ObjectId().toString();
      const resJ = await request('POST', `/songs/${fakeId}/play`);
      assert(resJ.status === 404, 'Issue J: 404 Not Found on analytics for deleted/nonexistent song', `Got status ${resJ.status}`);

      const resG1 = await request('POST', `/songs/${fakeId}/play`, null, {
        'x-idempotency-key': 'test-key-100',
      });
      const resG2 = await request('POST', `/songs/${fakeId}/play`, null, {
        'x-idempotency-key': 'test-key-100',
      });
      assert(resG2.data?.duplicate === true, 'Issue G: Idempotency key prevents double execution and returns duplicate: true', `Got ${JSON.stringify(resG2.data)}`);

      // Test 3: Issue I — DELETE /upload endpoint validation
      const resI = await request('DELETE', '/upload', { url: '/uploads/nonexistent_file.mp3' });
      assert(resI.status === 404 || resI.status === 400, 'Issue I: DELETE /upload route active and validates path', `Got status ${resI.status}`);

      // Test 4: Issue F & H — Model schema field checks
      const songSchema = Song.schema.paths;
      assert(songSchema.audioRollUrl !== undefined, 'Issue H: Song model schema includes audioRollUrl field');
      assert(songSchema.audioRollPositions !== undefined, 'Issue H: Song model schema includes audioRollPositions field');
      assert(songSchema.watermarkPositions.options.default === undefined, 'Issue F: Song watermarkPositions default is undefined (not hardcoded array)');
      assert(songSchema.popupPositions.options.default === undefined, 'Issue F: Song popupPositions default is undefined (not hardcoded array)');

      console.log(`\n==================================================`);
      console.log(`VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
      console.log(`==================================================\n`);
    } catch (err) {
      console.error('Test runner exception:', err);
    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      server.close();
      process.exit(failed > 0 ? 1 : 0);
    }
  });
}

runTests();
