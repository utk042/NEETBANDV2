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
    type: Number, // e.g., 1 (useful for 1st chapter free logic)
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
  isPremium: {
    type: Boolean,
    default: false, // If true, non-premium users will hear ads or can't download
  },
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
  watermarkUrl: { type: String }, // External link to mp3 for ad/watermark
  watermarkPositions: { type: [Number], default: [20, 50, 90] }, // Percentages where watermark plays
  audioRollsEnabled: { type: Boolean, default: true },
  popupsEnabled: { type: Boolean, default: true },
  popupPositions: { type: [Number], default: [10, 40, 75] },
  popupHtml: { type: String, default: '' },
  // 10 buckets representing each 10% segment of the song (drop-off distribution)
  dropOffDistribution: { type: [Number], default: () => [0,0,0,0,0,0,0,0,0,0] },
}, { timestamps: true });

const Song = mongoose.model('Song', songSchema);
export default Song;
