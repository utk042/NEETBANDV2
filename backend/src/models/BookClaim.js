import mongoose from 'mongoose';

const bookClaimSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  amountPaid: {
    type: Number
  },
  fullName: {
    type: String
  },
  email: {
    type: String
  },
  bookTitle: {
    type: String,
    default: "NeetBand Mastery Guide"
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Completed'
  },
  dispatchStatus: {
    type: String,
    enum: ['Pending Dispatch', 'Shipped', 'Delivered'],
    default: 'Pending Dispatch'
  }
}, { timestamps: true });

const BookClaim = mongoose.model('BookClaim', bookClaimSchema);
export default BookClaim;
