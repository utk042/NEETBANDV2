import mongoose from 'mongoose';

const eyeCheckupClaimSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  preferredDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Completed'],
    default: 'Pending'
  }
}, { timestamps: true });

const EyeCheckupClaim = mongoose.model('EyeCheckupClaim', eyeCheckupClaimSchema);
export default EyeCheckupClaim;
