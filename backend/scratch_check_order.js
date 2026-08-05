import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/neetband')
.then(async () => {
  const orderId = '6a7221744295378e18503b9d';
  console.log('Connected to DB, checking order:', orderId);
  const order = await Order.findOne({ 
    $or: [{ _id: orderId }, { razorpayOrderId: orderId }] 
  });
  console.log('Order found:', order);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
