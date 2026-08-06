import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PricingPlan from './src/models/PricingPlan.js';
import connectDB from './src/config/db.js';

dotenv.config();

const seedPlans = [
  {
    category: 'individual',
    planId: 'free',
    name: 'Free Access',
    badge: null,
    monthlyPrice: 0,
    yearlyPrice: 0,
    originalPrice: 0,
    subtextLine1: 'Forever Free for students',
    subtextLine2: 'No credit card required',
    description: 'Essential access to sample audio study songs, formulas & preview notes.',
    buttonText: 'Free Access',
    buttonVariant: 'secondary',
    features: [
      'Free sample audio study tracks & formulas',
      'Standard audio player with speed controls',
      'Subject syllabus preview & basic notes',
      'Audio ads enabled during playback'
    ],
    order: 1
  },
  {
    category: 'individual',
    planId: 'premium',
    name: 'Premium Scholar',
    badge: 'Most Popular',
    originalPrice: 599,
    monthlyPrice: 299,
    yearlyPrice: 299,
    yearlyBillingTotal: 2508,
    originalYearlyBillingTotal: 7188,
    subtextLine1: 'Billed ₹2,508 yearly (Save 50%)',
    subtextLine2: 'Annual subscription • Cancel anytime',
    description: 'Full unrestricted access for medical & competitive exam aspirants.',
    buttonText: 'Get Premium Access',
    buttonVariant: 'primary',
    features: [
      'Unrestricted access to all NEET Audio Songs',
      '100% Ad-Free uninterrupted playback',
      'Offline PWA downloads for mobile & desktop',
      'Full access to Student Hub & syllabus library'
    ],
    order: 2
  },
  {
    category: 'institutional',
    planId: 'inst_20',
    name: '20-User Batch',
    badge: '5% OFF',
    seatCount: 20,
    originalPrice: 5681,
    monthlyPrice: 3971,
    yearlyPrice: 3971,
    yearlyBillingTotal: 47652,
    originalYearlyBillingTotal: 68172,
    perUserPriceYearly: 199,
    originalPerUserPrice: 284,
    subtextLine1: '₹199 per student / mo',
    subtextLine2: 'Billed ₹47,652 yearly',
    description: 'Designed for small coaching batches & study groups up to 20 students.',
    buttonText: 'Enroll 20-Seat Batch',
    buttonVariant: 'secondary',
    features: [
      '20 Full Premium Student Access Accounts',
      'Full access to Physics, Chemistry & Biology songs',
      'Offline PWA downloads for enrolled students'
    ],
    order: 1
  },
  {
    category: 'institutional',
    planId: 'inst_50',
    name: '50-User Batch',
    badge: 'Recommended • 10% OFF',
    seatCount: 50,
    originalPrice: 13455,
    monthlyPrice: 9405,
    yearlyPrice: 9405,
    yearlyBillingTotal: 112860,
    originalYearlyBillingTotal: 161460,
    perUserPriceYearly: 188,
    originalPerUserPrice: 269,
    subtextLine1: '₹188 per student / mo',
    subtextLine2: 'Billed ₹1,12,860 yearly',
    description: 'For established coaching centers & medium institute batches up to 50 students.',
    buttonText: 'Enroll 50-Seat Batch',
    buttonVariant: 'primary',
    features: [
      '50 Full Premium Student Access Accounts',
      'Full access to Physics, Chemistry & Biology songs',
      'Offline PWA downloads for enrolled students'
    ],
    order: 2
  },
  {
    category: 'institutional',
    planId: 'inst_custom',
    name: 'Custom Enterprise',
    badge: null,
    customPrice: true,
    priceLabel: 'Custom',
    subtextLine1: 'Tailored pricing for large batches',
    subtextLine2: 'Flexible billing & setup',
    description: 'For large colleges, university campuses, and coaching networks (>50 Seats).',
    buttonText: 'Contact Us',
    buttonVariant: 'secondary',
    features: [
      'Custom student seat allocation (>50 seats)',
      'Direct institute batch onboarding & setup',
      'Discounted per-student batch pricing',
      'All Premium Scholar features for all students',
      'Dedicated email & phone support'
    ],
    order: 3
  }
];

const runSeed = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    // Check if plans already exist
    const count = await PricingPlan.countDocuments();
    if (count > 0) {
      console.log('Pricing plans already exist, skipping seed. (Delete them from DB to re-seed)');
      process.exit(0);
    }

    await PricingPlan.insertMany(seedPlans);
    console.log('Pricing plans seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

runSeed();
