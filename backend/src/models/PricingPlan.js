import mongoose from 'mongoose';

const pricingPlanSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['individual', 'institutional'],
    required: true
  },
  planId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    default: null
  },
  monthlyPrice: {
    type: Number,
    default: 0
  },
  yearlyPrice: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  yearlyBillingTotal: {
    type: Number,
    default: 0
  },
  originalYearlyBillingTotal: {
    type: Number,
    default: 0
  },
  perUserPriceYearly: {
    type: Number,
    default: 0
  },
  originalPerUserPrice: {
    type: Number,
    default: 0
  },
  seatCount: {
    type: Number,
    default: 0
  },
  subtextLine1: {
    type: String
  },
  subtextLine2: {
    type: String
  },
  description: {
    type: String
  },
  buttonText: {
    type: String,
    required: true
  },
  buttonVariant: {
    type: String,
    default: 'secondary'
  },
  features: [{
    type: String
  }],
  customPrice: {
    type: Boolean,
    default: false
  },
  priceLabel: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);

export default PricingPlan;
