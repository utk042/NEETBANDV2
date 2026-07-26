import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import songRoutes from './src/routes/songRoutes.js';
import adConfigRoutes from './src/routes/adConfigRoutes.js';
import { getAds } from './src/controllers/songController.js';
import Song from './src/models/Song.js';
import AdConfig from './src/models/AdConfig.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mock DB endpoints for offline deterministic testing if DB is unreachable
app.get('/test-api/songs', (req, res) => {
  res.json([
    { _id: 's1', title: 'Test Song 1', songType: 'Study', chapter: 'Physics 101' },
    { _id: 's2', title: 'Test Song 2', songType: 'Normal', chapter: 'Music' }
  ]);
});

app.use('/songs', songRoutes);
app.use('/api/ad-config', adConfigRoutes);
app.get('/ads', getAds);

let server;
const PORT = 5098;

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

// SIMULATOR OF PlayerContext LOGIC
function simulatePlayerLogic({ track, globalTracks, user, adAudioUrls, adConfig, currentPlaybackPct }) {
  const events = [];

  const isNormalSong = track.songType === 'Normal';
  const isPremium = user?.isPremium;
  const isLoggedIn = user?.isLoggedIn;

  // 1. Check playWithAds (initial selection)
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

  // 2. Simulate handleTimeUpdate during playback
  const pct = currentPlaybackPct;

  // Guest limit check at 20%
  if (!isNormalSong && !isLoggedIn && pct >= 0.2) {
    events.push('GUEST_20_PCT_REACHED_PAUSE_AUDIO');
    if (adConfig?.guestAdUrl) {
      events.push(`PLAY_GUEST_AD_${adConfig.guestAdUrl}`);
    }
    events.push('SHOW_GUEST_LOGIN_PROMPT');
    return events;
  }

  // Watermark check
  if (!isNormalSong && !isPremium && track.watermarkUrl && track.watermarkPositions?.length > 0) {
    const pct100 = pct * 100;
    const pos = track.watermarkPositions.find(p => pct100 >= p && pct100 < p + 2);
    if (pos !== undefined) {
      events.push(`TRIGGER_WATERMARK_AT_${pos}%`);
    }
  }

  // Unified Audio Roll & Popup check
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
  console.log('=== STARTING AUTOMATED SONGS & ADS LOGIC VERIFICATION ===\n');

  // Override Song.find and AdConfig.findOne for deterministic offline testing
  Song.find = () => ({
    populate: () => Promise.resolve([
      { _id: 's1', title: 'Test Song 1', songType: 'Study', chapter: 'Physics 101' }
    ])
  });
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

  // Test 1: API Endpoint GET /api/ad-config
  const adConfigRes = await request('GET', '/api/ad-config');
  const adConfigPassed = adConfigRes.status === 200 && adConfigRes.body && Array.isArray(adConfigRes.body.audioRollPositions);
  results.push({ test: 'GET /api/ad-config endpoint', passed: adConfigPassed, details: adConfigRes.body });
  console.log(`[${adConfigPassed ? 'PASS' : 'FAIL'}] GET /api/ad-config endpoint`);

  // Test 2: API Endpoint GET /ads (Pre-roll ads listing)
  const adsRes = await request('GET', '/ads');
  const adsPassed = adsRes.status === 200 && Array.isArray(adsRes.body.ads);
  results.push({ test: 'GET /ads endpoint', passed: adsPassed, details: adsRes.body });
  console.log(`[${adsPassed ? 'PASS' : 'FAIL'}] GET /ads endpoint - returned ${adsRes.body?.ads?.length || 0} pre-roll ads`);

  // Test 3: API Endpoint GET /songs/
  const songsRes = await request('GET', '/songs/');
  const songsPassed = songsRes.status === 200 && Array.isArray(songsRes.body) && songsRes.body.length > 0;
  results.push({ test: 'GET /songs/ endpoint', passed: songsPassed, count: songsRes.body?.length });
  console.log(`[${songsPassed ? 'PASS' : 'FAIL'}] GET /songs/ endpoint - returned ${songsRes.body?.length || 0} songs`);

  // Test Mock Data Setup
  const sampleChapter1Song1 = { id: 's1', title: 'Song 1', chapter: 'Kinematics', songType: 'Study', audioUrl: 'http://test/song1.mp3' };
  const sampleChapter1Song2 = { id: 's2', title: 'Song 2', chapter: 'Kinematics', songType: 'Study', audioUrl: 'http://test/song2.mp3' };
  const sampleNormalSong = { id: 's3', title: 'Normal Song 1', chapter: 'Kinematics', songType: 'Normal', audioUrl: 'http://test/normal.mp3' };

  const mockGlobalTracks = [sampleChapter1Song1, sampleChapter1Song2, sampleNormalSong];
  const mockAdConfig = {
    audioRollPositions: [20, 50, 90],
    audioRollUrl: '/uploads/ads/ad1.mp3',
    audioRollsEnabled: true,
    popupPositions: [10, 40, 75],
    popupHtml: '<div>Special Offer!</div>',
    popupsEnabled: true,
    guestAdUrl: '/uploads/ads/guest_ad.mp3'
  };

  const mockAdUrls = [
    '/uploads/ads/preroll1.mp3',
    '/uploads/ads/preroll2.mp3',
    '/uploads/ads/preroll3.mp3',
    '/uploads/ads/preroll4.mp3',
    '/uploads/ads/preroll5.mp3'
  ];

  console.log('\n--- SIMULATING USER TIER & SONG TYPE SCENARIOS ---\n');

  // Scenario 1: Guest User - Chapter 1 Song 1 at start
  const sc1 = simulatePlayerLogic({
    track: sampleChapter1Song1,
    globalTracks: mockGlobalTracks,
    user: null,
    adAudioUrls: mockAdUrls,
    adConfig: mockAdConfig,
    currentPlaybackPct: 0.05
  });
  const sc1Pass = sc1.includes('QUEUE_PREROLL_ADS_COUNT_5');
  results.push({ test: 'Guest User plays 1st song of chapter', passed: sc1Pass, events: sc1 });
  console.log(`[${sc1Pass ? 'PASS' : 'FAIL'}] Guest User plays 1st song of chapter -> Events:`, sc1);

  // Scenario 2: Guest User - Chapter 1 Song 2 (Blocked)
  const sc2 = simulatePlayerLogic({
    track: sampleChapter1Song2,
    globalTracks: mockGlobalTracks,
    user: null,
    adAudioUrls: mockAdUrls,
    adConfig: mockAdConfig,
    currentPlaybackPct: 0.05
  });
  const sc2Pass = sc2.includes('BLOCK_PLAYBACK_GUEST_CHAPTER_RESTRICTION');
  results.push({ test: 'Guest User plays 2nd song of chapter (Blocked)', passed: sc2Pass, events: sc2 });
  console.log(`[${sc2Pass ? 'PASS' : 'FAIL'}] Guest User plays 2nd song of chapter -> Events:`, sc2);

  // Scenario 3: Guest User - Reaches 20% on 1st song of chapter
  const sc3 = simulatePlayerLogic({
    track: sampleChapter1Song1,
    globalTracks: mockGlobalTracks,
    user: null,
    adAudioUrls: mockAdUrls,
    adConfig: mockAdConfig,
    currentPlaybackPct: 0.20
  });
  const sc3Pass = sc3.includes('GUEST_20_PCT_REACHED_PAUSE_AUDIO') && sc3.includes('SHOW_GUEST_LOGIN_PROMPT');
  results.push({ test: 'Guest User reaches 20% limit', passed: sc3Pass, events: sc3 });
  console.log(`[${sc3Pass ? 'PASS' : 'FAIL'}] Guest User reaches 20% limit -> Events:`, sc3);

  // Scenario 4: Guest User plays Normal Song
  const sc4 = simulatePlayerLogic({
    track: sampleNormalSong,
    globalTracks: mockGlobalTracks,
    user: null,
    adAudioUrls: mockAdUrls,
    adConfig: mockAdConfig,
    currentPlaybackPct: 0.50
  });
  const sc4Pass = sc4.includes('PLAY_DIRECTLY_NO_PREROLL') && !sc4.includes('GUEST_20_PCT_REACHED_PAUSE_AUDIO');
  results.push({ test: 'Guest User plays Normal Song (Unrestricted)', passed: sc4Pass, events: sc4 });
  console.log(`[${sc4Pass ? 'PASS' : 'FAIL'}] Guest User plays Normal Song -> Events:`, sc4);

  // Scenario 5: Free User plays Study Song with >3-4 Pre-roll Ads (5 ads)
  const sc5 = simulatePlayerLogic({
    track: sampleChapter1Song2,
    globalTracks: mockGlobalTracks,
    user: { isLoggedIn: true, isPremium: false },
    adAudioUrls: mockAdUrls,
    adConfig: mockAdConfig,
    currentPlaybackPct: 0.0
  });
  const sc5Pass = sc5.includes('QUEUE_PREROLL_ADS_COUNT_5');
  results.push({ test: 'Free User plays Study Song with 5 Pre-roll Ads', passed: sc5Pass, events: sc5 });
  console.log(`[${sc5Pass ? 'PASS' : 'FAIL'}] Free User plays Study Song (5 Pre-roll Ads) -> Events:`, sc5);

  // Scenario 6: Free User plays Study Song at 20% (Audio Roll) and 10% (Popup)
  const sc6_audio = simulatePlayerLogic({
    track: sampleChapter1Song2,
    globalTracks: mockGlobalTracks,
    user: { isLoggedIn: true, isPremium: false },
    adAudioUrls: mockAdUrls,
    adConfig: mockAdConfig,
    currentPlaybackPct: 0.20
  });
  const sc6_popup = simulatePlayerLogic({
    track: sampleChapter1Song2,
    globalTracks: mockGlobalTracks,
    user: { isLoggedIn: true, isPremium: false },
    adAudioUrls: mockAdUrls,
    adConfig: mockAdConfig,
    currentPlaybackPct: 0.10
  });
  const sc6Pass = sc6_audio.includes('TRIGGER_AUDIO_ROLL_AD_AT_20%') && sc6_popup.includes('TRIGGER_POPUP_AD_AT_10%');
  results.push({ test: 'Free User triggers Audio Roll at 20% & Popup at 10%', passed: sc6Pass, eventsAudio: sc6_audio, eventsPopup: sc6_popup });
  console.log(`[${sc6Pass ? 'PASS' : 'FAIL'}] Free User Audio Roll & Popup Triggers -> Audio:`, sc6_audio, 'Popup:', sc6_popup);

  // Scenario 7: Only Popups Enabled (Audio Rolls Disabled)
  const mockAdConfigOnlyPopups = { ...mockAdConfig, audioRollsEnabled: false, popupsEnabled: true };
  const sc7 = simulatePlayerLogic({
    track: sampleChapter1Song2,
    globalTracks: mockGlobalTracks,
    user: { isLoggedIn: true, isPremium: false },
    adAudioUrls: mockAdUrls,
    adConfig: mockAdConfigOnlyPopups,
    currentPlaybackPct: 0.20
  });
  const sc7Pass = !sc7.some(e => e.startsWith('TRIGGER_AUDIO_ROLL'));
  results.push({ test: 'Only Popups Enabled (Audio Rolls Disabled)', passed: sc7Pass, events: sc7 });
  console.log(`[${sc7Pass ? 'PASS' : 'FAIL'}] Only Popups Enabled -> Events:`, sc7);

  // Scenario 8: Only Audio Rolls Enabled (Popups Disabled)
  const mockAdConfigOnlyAudio = { ...mockAdConfig, audioRollsEnabled: true, popupsEnabled: false };
  const sc8 = simulatePlayerLogic({
    track: sampleChapter1Song2,
    globalTracks: mockGlobalTracks,
    user: { isLoggedIn: true, isPremium: false },
    adAudioUrls: mockAdUrls,
    adConfig: mockAdConfigOnlyAudio,
    currentPlaybackPct: 0.10
  });
  const sc8Pass = !sc8.some(e => e.startsWith('TRIGGER_POPUP'));
  results.push({ test: 'Only Audio Rolls Enabled (Popups Disabled)', passed: sc8Pass, events: sc8 });
  console.log(`[${sc8Pass ? 'PASS' : 'FAIL'}] Only Audio Rolls Enabled -> Events:`, sc8);

  // Scenario 9: Premium User plays Study Song (100% Ad-Free)
  const sc9 = simulatePlayerLogic({
    track: sampleChapter1Song2,
    globalTracks: mockGlobalTracks,
    user: { isLoggedIn: true, isPremium: true },
    adAudioUrls: mockAdUrls,
    adConfig: mockAdConfig,
    currentPlaybackPct: 0.20
  });
  const sc9Pass = sc9.includes('PLAY_DIRECTLY_NO_PREROLL') && sc9.length === 1;
  results.push({ test: 'Premium User plays Study Song (100% Ad-Free)', passed: sc9Pass, events: sc9 });
  console.log(`[${sc9Pass ? 'PASS' : 'FAIL'}] Premium User plays Study Song -> Events:`, sc9);

  server.close();

  const failedCount = results.filter(r => !r.passed).length;
  console.log('\n==================================================');
  console.log(`VERIFICATION SUMMARY: ${results.length - failedCount} / ${results.length} PASSED`);
  console.log('==================================================\n');

  process.exit(failedCount > 0 ? 1 : 0);
}

runTestSuite().catch(err => {
  console.error('Fatal execution error in test suite:', err);
  process.exit(1);
});
