import express from 'express';
import { createSong, getSongs, getSongById, updateSong, deleteSong } from '../controllers/songController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSongs)
  .post(protect, authorize('admin', 'owner'), createSong);

router.route('/:id')
  .get(getSongById)
  .put(protect, authorize('admin', 'owner'), updateSong)
  .delete(protect, authorize('admin', 'owner'), deleteSong);

export default router;
