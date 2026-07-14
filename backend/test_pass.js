import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/neetbanbv2');
  const user = await User.create({ name: 'Test', email: 'test12@test.com', password: 'password123' });
  console.log('Stored Password:', user.password);
  console.log('Compare:', await user.comparePassword('password123'));
  process.exit(0);
}
test();
