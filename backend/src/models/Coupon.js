import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  isMembershipSpecific: {
    type: Boolean,
    default: false
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  discountMode: {
    type: String,
    enum: ['Standard', 'First Payment Only', 'Recurring'],
    default: 'Standard'
  },
  usageCountMax: {
    type: Number, // null or number, null means infinity
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  usageLimitPerUser: {
    type: Number, // null or number, null means infinity
    default: null
  },
  usageLimitPerUserTimeframe: {
    type: String,
    enum: ['Lifetime', '1 Day', '1 Week', '1 Month', '1 Year'],
    default: 'Lifetime'
  },
  allowOnUpgradesDowngrades: {
    type: String,
    enum: ['No', 'Yes', 'Unset'],
    default: 'No'
  },
  allowOnlyIfCustomerAlreadyUsed: {
    type: String,
    enum: ['Unset', 'Yes', 'No'],
    default: 'Unset'
  },
  scheduleStartEnabled: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: null
  },
  expireEnabled: {
    type: Boolean,
    default: false
  },
  expireDate: {
    type: Date,
    default: null
  },
  applicableMemberships: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  usageHistory: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
  }]
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
