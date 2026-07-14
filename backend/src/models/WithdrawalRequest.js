import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  affiliateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Affiliate', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  paymentMode: { 
    type: String, 
    enum: ['Bank Transfer', 'UPI'], 
    required: true 
  },
  paymentDetails: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'rejected'], 
    default: 'pending' 
  },
  rejectReason: {
    type: String
  },
  requestedAt: { 
    type: Date, 
    default: Date.now 
  },
  processedAt: { 
    type: Date 
  },
  notes: { 
    type: String 
  }
}, { timestamps: true });

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalSchema);
export default WithdrawalRequest;
