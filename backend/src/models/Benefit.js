import mongoose from 'mongoose';

const benefitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  provider: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Health', 'Learning', 'Lifestyle'],
    default: 'Health',
  },
  offerType: {
    type: String,
    default: 'Free Service', // e.g. Free Service, Discount, Cashback, Perk
  },
  timing: {
    type: String,
    default: 'Ongoing', // e.g. Biannual, Ongoing, Limited Time
  },
  description: {
    type: String,
    required: true,
  },
  memberValue: {
    type: String,
    default: 'Free', // e.g. Free, 25% off, 40% off, ₹1,500 Saved
  },
  imageUrl: {
    type: String,
    default: '',
  },
  code: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: '', // Route or URL, e.g. /offers/eye-checkup, /offers/book
  },
  badgeText: {
    type: String,
    default: 'Member-exclusive',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Benefit = mongoose.model('Benefit', benefitSchema);
export default Benefit;
