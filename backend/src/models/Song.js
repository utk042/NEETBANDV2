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
  }
}, { timestamps: true });

const Song = mongoose.model('Song', songSchema);
export default Song;
