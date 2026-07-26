import mongoose from 'mongoose';

const adConfigSchema = new mongoose.Schema({
  audioRollPositions: {
    type: [Number],
    default: [20, 50, 90], // Percentages
  },
  audioRollUrl: {
    type: String, // URL to the uploaded audio ad file
    default: '',
  },
  popupPositions: {
    type: [Number],
    default: [10, 40, 75], // Percentages
  },
  popupHtml: {
    type: String, // HTML content for the popup
    default: '',
  },
  audioRollsEnabled: {
    type: Boolean,
    default: true,
  },
  popupsEnabled: {
    type: Boolean,
    default: true,
  },
  guestAdUrl: {
    type: String,
    // Fallback: the bundled ad file served via backend /uploads static route.
    // Override anytime via Admin panel → Upload a new file → saves to DB.
    // The frontend prefixes API_URL when the value starts with '/' (relative path).
    default: '/uploads/post_roll_ad.mp3',
  },
}, { timestamps: true });

const AdConfig = mongoose.model('AdConfig', adConfigSchema);
export default AdConfig;
