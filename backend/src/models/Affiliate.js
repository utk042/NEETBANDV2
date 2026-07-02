import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const affiliateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  promoCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  earnings: {
    type: Number,
    default: 0,
  },
  discountEnabled: {
    type: Boolean,
    default: false,
  },
  discountValue: {
    type: Number,
    default: 10,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  affiliatedUsers: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      plan: String
    }
  ],
  settlements: [
    {
      amount: Number,
      date: {
        type: Date,
        default: Date.now,
      },
      notes: String,
    }
  ],
  activeTokens: {
    type: [String],
    default: []
  }
}, { timestamps: true });

// Password hash middleware
affiliateSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password verification
affiliateSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Affiliate = mongoose.model('Affiliate', affiliateSchema);
export default Affiliate;
