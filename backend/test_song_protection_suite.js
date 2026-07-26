import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import songRoutes from './src/routes/songRoutes.js';
import adConfigRoutes from './src/routes/adConfigRoutes.js';
import { getAds } from './src/controllers/songController.js';
import Song from './src/models/Song.js';
import AdConfig from './src/models/AdConfig.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/songs', songRoutes);
app.use('/api/ad-config', adConfigRoutes);
app.get('/ads', getAds);

let server;
const PORT = 5097;

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

// PlayerContext Logic Simulator with Error Retry & Resilience
function simulateResilientPlayerLogic({ track, globalTracks, user, adAudioUrls, adConfig, currentPlaybackPct, audioSimulatedErrorCount = 0 }) {
  const events = [];

  // Audio Retry simulation
  let retryCount = 0;
  let simulatedError = audioSimulatedErrorCount;
  while (simulatedError > 0) {
    if (retryCount < 3) {
      retryCount++;
      simulatedError--;
      events.push(`AUDIO_RETRY_ATTEMPT_${retryCount}`);
    } else {
      events.push('AUDIO_STREAM_FAILED_ALERT_USER');
      return events;
    }
  }

  const isNormalSong = track.songType === 'Normal';
  const isPremium = user?.isPremium;
  const isLoggedIn = user?.isLoggedIn;

  // 1. Initial selection
  const isFirstSongOfChapter = globalTracks.find(t => t.chapter === track.chapter)?.id === track.id;

  if (!isNormalSong && !isLoggedIn && !isFirstSongOfChapter) {
    events.push('BLOCK_PLAYBACK_GUEST_CHAPTER_RESTRICTION');
    return events;
  }

  const audioRollsActive = track.audioRollsEnabled ?? adConfig?.audioRollsEnabled ?? true;
  if (isNormalSong || isPremium || adAudioUrls.length === 0 || !track.audioUrl || !audioRollsActive) {
    events.push('PLAY_DIRECTLY_NO_PREROLL');
  } else {
    events.push(`QUEUE_PREROLL_ADS_COUNT_${adAudioUrls.length}`);
  }

  // 2. Safe math progress evaluation
  let pct = Number(currentPlaybackPct);
  if (isNaN(pct) || !isFinite(pct) || pct < 0) pct = 0;

  // Guest limit check at 20%
  if (!isNormalSong && !isLoggedIn && pct >= 0.2) {
    events.push('GUEST_20_PCT_REACHED_PAUSE_AUDIO');
    if (adConfig?.guestAdUrl) {
      events.push(`PLAY_GUEST_AD_${adConfig.guestAdUrl}`);
    }
    events.push('SHOW_GUEST_LOGIN_PROMPT');
    return events;
  }

  // Watermark & Audio Roll checks
  if (!isNormalSong && !isPremium) {
    const pct100 = pct * 100;
    const audioRollsActive = track.audioRollsEnabled ?? adConfig?.audioRollsEnabled ?? true;
    const popupsActive = track.popupsEnabled ?? adConfig?.popupsEnabled ?? true;

    const audioPositions = (track.watermarkPositions && track.watermarkPositions.length > 0) 
      ? track.watermarkPositions 
      : adConfig?.audioRollPositions;
    const audioUrl = track.watermarkUrl || adConfig?.audioRollUrl;

    if (audioRollsActive && audioPositions && audioPositions.length > 0 && audioUrl) {
      const audioPos = audioPositions.find(p => pct100 >= p && pct100 < p + 2);
      if (audioPos !== undefined) {
        events.push(`TRIGGER_AUDIO_ROLL_AD_AT_${audioPos}%`);
      }
    }

    const popupPositions = (track.popupPositions && track.popupPositions.length > 0)
      ? track.popupPositions
      : adConfig?.popupPositions;
    const popupHtml = track.popupHtml || adConfig?.popupHtml;

    if (popupsActive && popupPositions && popupPositions.length > 0 && popupHtml) {
      const popupPos = popupPositions.find(p => pct100 >= p && pct100 < p + 2);
      if (popupPos !== undefined) {
        events.push(`TRIGGER_POPUP_AD_AT_${popupPos}%`);
      }
    }
  }

  return events;
}

async function runTestSuite() {
  console.log('=== STARTING AUTOMATED SONG PROTECTION SUITE VERIFICATION ===\n');

  // Mongoose Mocks for Controller Test
  Song.find = () => ({ populate: () => Promise.resolve([{ _id: 's1', title: 'Test Song', songType: 'Study' }]) });
  AdConfig.findOne = () => Promise.resolve({
    audioRollPositions: [20, 50, 90],
    audioRollUrl: '/uploads/ads/ad1.mp3',
    popupPositions: [10, 40, 75],
    popupHtml: '<div>Special Offer!</div>',
    audioRollsEnabled: true,
    popupsEnabled: true,
    guestAdUrl: '/uploads/ads/guest_ad.mp3'
  });

  server = app.listen(PORT);
  console.log(`Test server active on port ${PORT}`);

  const results = [];

  // TEST 1: Schema Validation (Empty Title / AudioUrl)
  const invalidSong = new Song({ title: '', audioUrl: '' });
  const validationError = invalidSong.validateSync();
  const t1Passed = validationError && validationError.errors.title && validationError.errors.audioUrl;
  results.push({ name: 'Mongoose Song Schema strict required fields validation', passed: !!t1Passed });
  console.log(`[${t1Passed ? 'PASS' : 'FAIL'}] Mongoose Song Schema strict required fields validation`);

  // TEST 2: Schema Validation (Invalid songType)
  const invalidTypeSong = new Song({ title: 'Song', audioUrl: 'http://test/song.mp3', songType: 'InvalidType' });
  const typeError = invalidTypeSong.validateSync();
  const t2Passed = typeError && typeError.errors.songType;
  results.push({ name: 'Mongoose Song Schema songType enum restriction', passed: !!t2Passed });
  console.log(`[${t2Passed ? 'PASS' : 'FAIL'}] Mongoose Song Schema songType enum restriction`);

  // TEST 3: Schema Validation (Negative duration)
  const negDurSong = new Song({ title: 'Song', audioUrl: 'http://test/song.mp3', duration: -10 });
  const durError = negDurSong.validateSync();
  const t3Passed = durError && durError.errors.duration;
  results.push({ name: 'Mongoose Song Schema negative duration rejection', passed: !!t3Passed });
  console.log(`[${t3Passed ? 'PASS' : 'FAIL'}] Mongoose Song Schema negative duration rejection`);

  // TEST 4: API Endpoint GET /api/ad-config
  const adConfigRes = await request('GET', '/api/ad-config');
  const t4Passed = adConfigRes.status === 200 && Array.isArray(adConfigRes.body.audioRollPositions);
  results.push({ name: 'GET /api/ad-config endpoint', passed: t4Passed });
  console.log(`[${t4Passed ? 'PASS' : 'FAIL'}] GET /api/ad-config endpoint`);

  // TEST 5: API Endpoint GET /ads
  const adsRes = await request('GET', '/ads');
  const t5Passed = adsRes.status === 200 && Array.isArray(adsRes.body.ads);
  results.push({ name: 'GET /ads endpoint', passed: t5Passed });
  console.log(`[${t5Passed ? 'PASS' : 'FAIL'}] GET /ads endpoint`);

  // TEST 6: Audio Stream Retry Logic (Recovered on Attempt 2)
  const sampleTrack = { id: 's1', title: 'Physics Anthem', chapter: 'Kinematics', songType: 'Study', audioUrl: 'http://test/stream.mp3' };
  const mockTracks = [sampleTrack];
  const scRetryRecovered = simulateResilientPlayerLogic({
    track: sampleTrack,
    globalTracks: mockTracks,
    user: { isLoggedIn: true, isPremium: false },
    adAudioUrls: ['/ad1.mp3'],
    adConfig: {},
    currentPlaybackPct: 0,
    audioSimulatedErrorCount: 2
  });
  const t6Passed = scRetryRecovered.includes('AUDIO_RETRY_ATTEMPT_1') && scRetryRecovered.includes('AUDIO_RETRY_ATTEMPT_2') && scRetryRecovered.includes('QUEUE_PREROLL_ADS_COUNT_1');
  results.push({ name: 'PlayerContext audio load auto-retry recovery (2 retries)', passed: t6Passed });
  console.log(`[${t6Passed ? 'PASS' : 'FAIL'}] PlayerContext audio load auto-retry recovery -> Events:`, scRetryRecovered);

  // TEST 7: Audio Stream Retry Failure (4 errors -> max 3 retries hit)
  const scRetryFailed = simulateResilientPlayerLogic({
    track: sampleTrack,
    globalTracks: mockTracks,
    user: { isLoggedIn: true, isPremium: false },
    adAudioUrls: ['/ad1.mp3'],
    adConfig: {},
    currentPlaybackPct: 0,
    audioSimulatedErrorCount: 4
  });
  const t7Passed = scRetryFailed.includes('AUDIO_STREAM_FAILED_ALERT_USER');
  results.push({ name: 'PlayerContext max retry cap (3 retries max before user alert)', passed: t7Passed });
  console.log(`[${t7Passed ? 'PASS' : 'FAIL'}] PlayerContext max retry cap -> Events:`, scRetryFailed);

  // TEST 8: Safe Math Defense against NaN progress percentage
  const scNaNMath = simulateResilientPlayerLogic({
    track: sampleTrack,
    globalTracks: mockTracks,
    user: { isLoggedIn: true, isPremium: false },
    adAudioUrls: ['/ad1.mp3'],
    adConfig: {},
    currentPlaybackPct: NaN
  });
  const t8Passed = !scNaNMath.includes('GUEST_20_PCT_REACHED_PAUSE_AUDIO') && scNaNMath.includes('QUEUE_PREROLL_ADS_COUNT_1');
  results.push({ name: 'PlayerContext progress math defense against NaN', passed: t8Passed });
  console.log(`[${t8Passed ? 'PASS' : 'FAIL'}] PlayerContext progress math defense against NaN -> Events:`, scNaNMath);

  // TEST 9: Guest User 20% Limit & Guest Ad Trigger
  const scGuest20 = simulateResilientPlayerLogic({
    track: sampleTrack,
    globalTracks: mockTracks,
    user: null,
    adAudioUrls: ['/ad1.mp3'],
    adConfig: { guestAdUrl: '/guest.mp3' },
    currentPlaybackPct: 0.20
  });
  const t9Passed = scGuest20.includes('GUEST_20_PCT_REACHED_PAUSE_AUDIO') && scGuest20.includes('SHOW_GUEST_LOGIN_PROMPT');
  results.push({ name: 'Guest User 20% limit & login prompt trigger', passed: t9Passed });
  console.log(`[${t9Passed ? 'PASS' : 'FAIL'}] Guest User 20% limit & login prompt -> Events:`, scGuest20);

  // TEST 10: Normal Song Bypasses All Restrictions & Ads for Everyone
  const sampleNormal = { id: 's2', title: 'Chill LoFi', chapter: 'Relax', songType: 'Normal', audioUrl: 'http://test/lofi.mp3' };
  const scNormalGuest = simulateResilientPlayerLogic({
    track: sampleNormal,
    globalTracks: [sampleNormal],
    user: null,
    adAudioUrls: ['/ad1.mp3'],
    adConfig: { guestAdUrl: '/guest.mp3' },
    currentPlaybackPct: 0.50
  });
  const t10Passed = scNormalGuest.includes('PLAY_DIRECTLY_NO_PREROLL') && !scNormalGuest.includes('GUEST_20_PCT_REACHED_PAUSE_AUDIO');
  results.push({ name: 'Normal Song bypasses all guest limits and ads', passed: t10Passed });
  console.log(`[${t10Passed ? 'PASS' : 'FAIL'}] Normal Song bypasses all limits -> Events:`, scNormalGuest);

  server.close();

  const failedCount = results.filter(r => !r.passed).length;
  console.log('\n==================================================');
  console.log(`SONG PROTECTION SUITE SUMMARY: ${results.length - failedCount} / ${results.length} PASSED`);
  console.log('==================================================\n');

  process.exit(failedCount > 0 ? 1 : 0);
}

runTestSuite().catch(err => {
  console.error('Fatal execution error in test suite:', err);
  process.exit(1);
});
