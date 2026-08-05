import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faq from './src/models/Faq.js';

dotenv.config();

const homepageFaqs = [
  {
    question: "What is NeetBand and how does it help me study?",
    answer: "<p>NeetBand converts complex academic concepts (CBSE Class 3-12 syllabus) into catchy, professionally produced study songs. Auditory learning leverages musical memory, boosting retention and reducing the eye strain associated with reading textbooks for hours.</p>",
    page: "homepage",
    order: 1,
    isActive: true
  },
  {
    question: "Is the content aligned with the CBSE curriculum?",
    answer: "<p>Yes, 100%. All our songs are meticulously written and reviewed by educational experts to align precisely with the CBSE Class 3–12 chapters in Biology, Chemistry, Physics, and Mathematics.</p>",
    page: "homepage",
    order: 2,
    isActive: true
  },
  {
    question: "Can I download songs for offline listening?",
    answer: "<p>Yes! Premium Scholar members can download songs directly on their devices for offline playback. This allows you to study without any internet connections, eliminating social media notifications and other distractions.</p>",
    page: "homepage",
    order: 3,
    isActive: true
  },
  {
    question: "How do the MCQ quizzes help?",
    answer: "<p>Every song in our library is paired with active recall multiple-choice questions. Testing yourself immediately after listening reinforces memory pathways and ensures you have truly understood the concept.</p>",
    page: "homepage",
    order: 4,
    isActive: true
  },
  {
    question: "How do I cancel my subscription?",
    answer: "<p>You can cancel your Premium Scholar subscription at any time. There are no contracts, cancellation fees, or commitments—just cancel from your account billing settings in one click.</p>",
    page: "homepage",
    order: 5,
    isActive: true
  }
];

const pricingFaqs = [
  {
    question: "What is included in the Premium Scholar plan?",
    answer: "<p>Premium Scholar gives you unlimited access to our entire library of NEET audio study songs across subjects. It includes offline PWA downloads, 100% ad-free listening, free eye checkup vouchers, and physical textbook discount coupons.</p>",
    page: "pricing",
    order: 1,
    isActive: true
  },
  {
    question: "How do Institute & Coaching plans work?",
    answer: "<p>Our Institute plans are structured for coaching batches of 20 seats (5% discount) or 50 seats (10% discount). Every enrolled student gets full Premium Scholar access to all study tracks and benefits.</p>",
    page: "pricing",
    order: 2,
    isActive: true
  },
  {
    question: "Can I download tracks and listen offline?",
    answer: "<p>Yes! Premium Scholar members can save tracks directly inside the NeetBand PWA app on mobile or desktop so you can revise anytime without an internet connection.</p>",
    page: "pricing",
    order: 3,
    isActive: true
  },
  {
    question: "What payment methods are supported?",
    answer: "<p>We support all major Indian and international payment options via Razorpay, including UPI (GPay, PhonePe, Paytm, BHIM), Credit Cards, Debit Cards, Net Banking, and Wallets.</p>",
    page: "pricing",
    order: 4,
    isActive: true
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "<p>Absolutely. Subscriptions are billed on an annual (yearly) basis. You can cancel auto-renewal anytime in your dashboard while retaining access for your full 1-year term.</p>",
    page: "pricing",
    order: 5,
    isActive: true
  }
];

const seedFaqs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const count = await Faq.countDocuments();
    if (count === 0) {
      await Faq.insertMany([...homepageFaqs, ...pricingFaqs]);
      console.log('FAQs Seeded Successfully!');
    } else {
      console.log('FAQs already exist in the database, skipping seed.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding FAQs:', error);
    process.exit(1);
  }
};

seedFaqs();
