import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/neetband')
.then(async () => {
  const users = await User.find({});
  users.forEach(u => console.log(u.email, u.role, u._id));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
