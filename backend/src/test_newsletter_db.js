import dotenv from 'dotenv';
import mongoose from 'mongoose';
import NewsletterSubscriber from './models/NewsletterSubscriber.js';

dotenv.config({ path: './.env' });

async function run() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    // Clean up test emails if they exist
    await NewsletterSubscriber.deleteMany({ email: /test-subscriber/ });

    const testEmail = `test-subscriber-${Date.now()}@example.com`;
    const doc = await NewsletterSubscriber.create({ email: testEmail });
    console.log("Created subscriber:", doc.email);

    // Verify unique constraint
    try {
      await NewsletterSubscriber.create({ email: testEmail });
      console.log("FAIL: Unique constraint did not trigger!");
    } catch (err) {
      console.log("PASS: Unique constraint works (received error).");
    }

    await NewsletterSubscriber.deleteOne({ _id: doc._id });
    console.log("Cleanup complete.");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
