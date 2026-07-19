import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['student', 'admin', 'owner'],
    default: 'student',
  },
  membershipPlan: {
    type: String,
    default: 'none', // e.g., 'none', 'scale_plan', 'xyz', 'abc'
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  membershipExpiry: {
    type: Date,
  },
  progress: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      completed: {
        type: Boolean,
        default: false,
      },
      score: {
        type: Number,
        default: 0,
      },
      completedItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
      }]
    }
  ],
  favoriteSongs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
    }
  ],
  streak: {
    type: Number,
    default: 0,
  },
  lastLoginDate: {
    type: Date,
  },
  affiliatePartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  activeTokens: {
    type: [String],
    default: []
  }
}, { timestamps: true });

// Password hash middleware
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password verification
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
