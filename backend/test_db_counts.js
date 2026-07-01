import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Song from './src/models/Song.js';
import Course from './src/models/Course.js';
import Quiz from './src/models/Quiz.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neetband';

const checkDb = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const admins = await User.countDocuments({ role: 'admin' });
    const owners = await User.countDocuments({ role: 'owner' });
    const songs = await Song.countDocuments();
    const courses = await Course.countDocuments();
    const quizzes = await Quiz.countDocuments();

    console.log(`TOTAL USERS: ${totalUsers}`);
    console.log(`- Students: ${students}`);
    console.log(`- Admins: ${admins}`);
    console.log(`- Owners: ${owners}`);
    console.log(`TOTAL SONGS: ${songs}`);
    console.log(`TOTAL COURSES: ${courses}`);
    console.log(`TOTAL QUIZZES: ${quizzes}`);

    // Print details of students to see if there is any progress
    const allStudents = await User.find({ role: 'student' });
    allStudents.forEach((student, idx) => {
      console.log(`Student ${idx + 1}: ${student.name} (${student.email})`);
      console.log(`- Progress:`, student.progress);
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error("Error:", err);
  }
};

checkDb();
