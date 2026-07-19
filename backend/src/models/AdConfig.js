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
    default: [20, 50, 90], // Percentages
  },
  popupHtml: {
    type: String, // HTML content for the popup
    default: '',
  },
}, { timestamps: true });

const AdConfig = mongoose.model('AdConfig', adConfigSchema);
export default AdConfig;
