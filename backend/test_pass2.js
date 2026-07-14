import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/neetbanbv2');
  let user = await User.findOne({ email: 'test12@test.com' });
  user.password = 'updated_password';
  await user.save();
  console.log('Updated Password:', user.password);
  console.log('Compare:', await user.comparePassword('updated_password'));
  process.exit(0);
}
test();
