import express from 'express';
import {
  createSong, getSongs, getSongById, updateSong, deleteSong,
  recordPlay, recordCompletion, recordShare, recordRepeat, recordDropOff,
  getSongAnalytics, getAllSongAnalytics, getSongStreamUrl
} from '../controllers/songController.js';
import { protect, authorize, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Analytics overview — must come BEFORE /:id routes
router.get('/analytics', protect, authorize('admin', 'owner'), getAllSongAnalytics);

router.route('/')
  .get(optionalAuth, getSongs)
  .post(protect, authorize('admin', 'owner'), createSong);

router.route('/:id')
  .get(optionalAuth, getSongById)
  .put(protect, authorize('admin', 'owner'), updateSong)
  .delete(protect, authorize('admin', 'owner'), deleteSong);

// Protected: returns the audioUrl for authenticated users only (used for just-in-time playback)
router.get('/:id/stream', protect, getSongStreamUrl);

// Analytics per-song
router.get('/:id/analytics', protect, authorize('admin', 'owner'), getSongAnalytics);

// Tracking (public — no auth, fire-and-forget style)
router.post('/:id/play', recordPlay);
router.post('/:id/complete', recordCompletion);
router.post('/:id/share', recordShare);
router.post('/:id/repeat', recordRepeat);
router.post('/:id/dropoff', recordDropOff);

export default router;
