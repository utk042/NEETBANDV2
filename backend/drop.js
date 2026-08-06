import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import PricingPlan from './src/models/PricingPlan.js';

dotenv.config();

const drop = async () => {
  try {
    await connectDB();
    console.log('Connected. Dropping PricingPlans...');
    await PricingPlan.deleteMany({});
    console.log('Dropped successfully.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

drop();
