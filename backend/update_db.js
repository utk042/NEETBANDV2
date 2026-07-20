import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const AdConfigSchema = new mongoose.Schema({
  audioRollPositions: { type: [Number], default: [20, 50, 90] },
  audioRollUrl: { type: String, default: '' },
  popupPositions: { type: [Number], default: [20, 50, 90] },
  popupHtml: { type: String, default: '' },
  guestAdUrl: { type: String, default: '' }
}, { timestamps: true });

const AdConfig = mongoose.model('AdConfig', AdConfigSchema);

async function updateDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  let config = await AdConfig.findOne();
  if (config) {
    config.guestAdUrl = '/uploads/guest_ad.mp3';
    await config.save();
    console.log('Updated existing config');
  } else {
    console.log('No config found');
  }
  mongoose.disconnect();
}
updateDB().catch(console.error);
