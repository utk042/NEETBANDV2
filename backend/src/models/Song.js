import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty'],
  },
  class: {
    type: String, // e.g., 'Class 10'
  },
  subject: {
    type: String, // e.g., 'Physics'
  },
  chapter: {
    type: String, // e.g., 'Kinematics'
  },
  chapterNumber: {
    type: Number, // e.g., 1 (chapter ordering)
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  audioUrl: {
    type: String, // External link to mp3
    required: [true, 'Audio URL is required'],
    trim: true,
  },
  thumbnailUrl: {
    type: String,
  },
  lyricsUrl: {
    type: String, // External link to .ttml
  },
  duration: {
    type: Number, // In seconds
    min: [0, 'Duration cannot be negative'],
  },
  // NOTE: Study songs are NOT categorised as Free/Premium.
  // All Study songs behave the same — playback behaviour (ads, watermarks, restrictions)
  // is determined solely by the user's subscription tier: Guest, Basic, or Premium.
  songType: {
    type: String,
    enum: {
      values: ['Normal', 'Study'],
      message: '{VALUE} is not a valid songType',
    },
    default: 'Study',
  },
  playCount: { type: Number, default: 0 },
  completionCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  repeatCount: { type: Number, default: 0 },
  overrideGlobalAds: { type: Boolean, default: false },
  audioRollUrl: { type: String }, // Per-song audio roll url override
  audioRollPositions: { type: [Number] }, // Per-song audio roll positions override
  audioRollsEnabled: { type: Boolean, default: true },
  popupsEnabled: { type: Boolean, default: true },
  popupPositions: { type: [Number] },
  popupHtml: { type: String, default: '' },
  // 10 buckets representing each 10% segment of the song (drop-off distribution)
  dropOffDistribution: { type: [Number], default: () => [0,0,0,0,0,0,0,0,0,0] },
}, { timestamps: true });

const Song = mongoose.model('Song', songSchema);
export default Song;
