import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Song from './src/models/Song.js';
import { createSong, updateSong } from './src/controllers/songController.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neetband';

async function runTests() {
  console.log('--- Starting Batch Upload & Song Controller Robustness Tests ---');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Test 1: createSong with string numbers or empty strings for duration & chapterNumber
    const mockRes1 = {
      status(code) { this.statusCode = code; return this; },
      json(data) { this.data = data; return this; }
    };

    const req1 = {
      body: {
        title: 'Test Robustness Song 1',
        audioUrl: 'http://example.com/audio1.mp3',
        duration: '', // empty string passed from frontend
        chapterNumber: '', // empty string passed from frontend
        songType: 'Study'
      }
    };

    await createSong(req1, mockRes1);
    console.log('Test 1 (empty string numeric fields) status:', mockRes1.statusCode || 201);
    if (mockRes1.statusCode && mockRes1.statusCode >= 400) {
      console.error('Test 1 FAILED:', mockRes1.data);
    } else {
      console.log('Test 1 PASSED, Created Song ID:', mockRes1.data._id, 'duration:', mockRes1.data.duration, 'chapterNumber:', mockRes1.data.chapterNumber);
      // Clean up
      await Song.findByIdAndDelete(mockRes1.data._id);
    }

    // Test 2: createSong with string formatted numbers e.g. "180" and "5"
    const mockRes2 = {
      status(code) { this.statusCode = code; return this; },
      json(data) { this.data = data; return this; }
    };

    const req2 = {
      body: {
        title: 'Test Robustness Song 2',
        audioUrl: 'http://example.com/audio2.mp3',
        duration: '180',
        chapterNumber: '5',
        songType: 'Study'
      }
    };

    await createSong(req2, mockRes2);
    console.log('Test 2 (numeric strings "180", "5") status:', mockRes2.statusCode || 201);
    if (mockRes2.statusCode && mockRes2.statusCode >= 400) {
      console.error('Test 2 FAILED:', mockRes2.data);
    } else {
      console.log('Test 2 PASSED, Created Song ID:', mockRes2.data._id, 'duration:', mockRes2.data.duration, 'chapterNumber:', mockRes2.data.chapterNumber);
      await Song.findByIdAndDelete(mockRes2.data._id);
    }

    console.log('--- All Robustness Tests Completed ---');
  } catch (err) {
    console.error('Test suite execution error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
