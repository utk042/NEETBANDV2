import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  plan: {
    type: String,
    enum: ['premium_scholar', 'scale_plan', 'book_order', 'inst_20', 'inst_50', 'premium'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'yearly'
  },
  discountCode: {
    type: String
  },
  shippingDetails: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    state: String,
    pinCode: String,
    bookTitle: String
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created'
  },
  fulfilled: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
