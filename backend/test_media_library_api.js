import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './src/routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
const testDir = path.join(uploadsDir, 'test_media_library');

// Ensure test directory exists and populate test files
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

const testImg1 = path.join(testDir, 'test_sample_1.png');
const testImg2 = path.join(testDir, 'test_sample_2.jpg');
const testDoc = path.join(testDir, 'test_doc.txt');

fs.writeFileSync(testImg1, 'dummy png content');
// Set mtime to ensure testImg2 is newer than testImg1
fs.writeFileSync(testImg2, 'dummy jpg content');
const now = new Date();
const past = new Date(now.getTime() - 10000);
fs.utimesSync(testImg1, past, past);
fs.utimesSync(testImg2, now, now);
fs.writeFileSync(testDoc, 'dummy text content');

const app = express();
app.use(express.json());
app.use('/upload', uploadRoutes);

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    // 1. Fetch images
    const res = await fetch(`http://localhost:${port}/upload/files?fileType=image`);
    if (res.status === 404) {
      throw new Error('Endpoint returned 404 Not Found');
    }

    const data = await res.json();
    console.log('GET /upload/files response:', JSON.stringify(data, null, 2));

    if (!data.success || !Array.isArray(data.files)) {
      throw new Error('Response success is false or files is not an array');
    }

    // Check image filtering
    const img1Found = data.files.find(f => f.filename === 'test_sample_1.png');
    const img2Found = data.files.find(f => f.filename === 'test_sample_2.jpg');
    const docFound = data.files.find(f => f.filename === 'test_doc.txt');

    if (!img1Found || !img2Found) {
      throw new Error('Expected image files were not returned in media library');
    }
    if (docFound) {
      throw new Error('Non-image file was returned when fileType=image');
    }

    // Check category property
    if (img1Found.category !== 'test_media_library') {
      throw new Error(`Expected category to be "test_media_library", got "${img1Found.category}"`);
    }

    // Check sorting (descending mtime: img2 should come before img1)
    const img1Idx = data.files.findIndex(f => f.filename === 'test_sample_1.png');
    const img2Idx = data.files.findIndex(f => f.filename === 'test_sample_2.jpg');
    if (img2Idx > img1Idx) {
      throw new Error('Files are not sorted by mtime descending');
    }

    // 2. Search filter test
    const searchRes = await fetch(`http://localhost:${port}/upload/files?fileType=image&search=sample_1`);
    const searchData = await searchRes.json();
    if (!searchData.files.some(f => f.filename === 'test_sample_1.png') || searchData.files.some(f => f.filename === 'test_sample_2.jpg')) {
      throw new Error('Search filter failed');
    }

    console.log('SUCCESS: All media library tests passed!');
    cleanup();
    if (server.closeAllConnections) server.closeAllConnections();
    server.close();
  } catch (err) {
    console.error('TEST FAILED:', err.message);
    cleanup();
    if (server.closeAllConnections) server.closeAllConnections();
    server.close(() => {
      process.exit(1);
    });
  }
});


function cleanup() {
  try {
    if (fs.existsSync(testImg1)) fs.unlinkSync(testImg1);
    if (fs.existsSync(testImg2)) fs.unlinkSync(testImg2);
    if (fs.existsSync(testDoc)) fs.unlinkSync(testDoc);
    if (fs.existsSync(testDir)) fs.rmdirSync(testDir);
  } catch (e) {
    console.error('Cleanup error:', e);
  }
}
