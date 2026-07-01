import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from './models/Course.js';

dotenv.config({ path: './.env' });

async function run() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    // Fetch one course
    const course = await Course.findOne();
    if (!course) {
      console.log("No course found in DB.");
      return;
    }
    console.log("Found course:", course.title, "id:", course._id);

    // Try modifying lessons and saving
    course.lessons = [
      {
        title: "Test Lesson Heading",
        description: "Test description",
        isPremium: false,
        order: 0,
        items: [
          {
            title: "Test Item Notes",
            type: "notes",
            duration: "10 mins",
            order: 0
          }
        ]
      }
    ];

    await course.save();
    console.log("Saved successfully!");
  } catch (err) {
    console.error("Save failed with error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
