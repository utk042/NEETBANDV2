import mongoose from 'mongoose';

const newsScrollSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: true
  },
  items: {
    type: [String],
    default: [
      'New: Class 12 Crash Course is now live!',
      'Get 50% off on Premium Subscription this week!',
      'Added 50+ new mnemonics for Biology.',
      'Start listening to the Periodic Table Melody now.'
    ]
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const NewsScroll = mongoose.model('NewsScroll', newsScrollSchema);
export default NewsScroll;
