import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  class: {
    type: String, // e.g., 'Class 10'
  },
  subject: {
    type: String, // e.g., 'Physics'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  audioUrl: {
    type: String, // External link to mp3
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  lyricsUrl: {
    type: String, // External link to .ttml
  },
  duration: {
    type: Number, // In seconds
  },
  isPremium: {
    type: Boolean,
    default: false, // If true, non-premium users will hear ads or can't download
  },
  playCount: { type: Number, default: 0 },
  completionCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  repeatCount: { type: Number, default: 0 },
  // 10 buckets representing each 10% segment of the song (drop-off distribution)
  dropOffDistribution: { type: [Number], default: () => [0,0,0,0,0,0,0,0,0,0] },
}, { timestamps: true });

const Song = mongoose.model('Song', songSchema);
export default Song;
