import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Course from './src/models/Course.js';
import { LessonContent, LessonQuiz, LessonQa } from './src/models/LessonDetails.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neetband';

const migrate = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for migration");

    // 1. Rename itemId to chapterId in LessonContent, LessonQuiz, LessonQa
    console.log("Renaming itemId to chapterId in LessonDetails collections...");
    await LessonContent.updateMany({}, { $rename: { "itemId": "chapterId" } });
    await LessonQuiz.updateMany({}, { $rename: { "itemId": "chapterId" } });
    await LessonQa.updateMany({}, { $rename: { "itemId": "chapterId" } });

    console.log("Fetching courses to migrate...");
    const courses = await Course.find({});

    for (const course of courses) {
      console.log(`Migrating course: ${course.title}`);
    }

    // Let's use raw mongodb collection to avoid schema conflicts during migration
    const db = mongoose.connection.db;
    const coursesCollection = db.collection('courses');
    const rawCourses = await coursesCollection.find({}).toArray();

    for (const rawCourse of rawCourses) {
      if (rawCourse.lessons) {
        console.log(`Migrating raw course: ${rawCourse.title}`);
        
        const newSubjects = rawCourse.lessons.map(lesson => {
          const newChapters = (lesson.items || []).map(item => {
            return {
              _id: item._id, // Preserve the ID so that it links to LessonDetails
              title: item.title,
              duration: item.duration,
              videoUrl: item.videoUrl,
              audioUrl: item.audioUrl,
              fileUrl: item.fileUrl,
              fileType: item.fileType,
              order: item.order || 0,
              isPremium: item.isPremium || false
            };
          });

          return {
            _id: lesson._id,
            title: lesson.title,
            description: lesson.description,
            isPremium: lesson.isPremium || false,
            order: lesson.order || 0,
            chapters: newChapters
          };
        });

        // Update document
        await coursesCollection.updateOne(
          { _id: rawCourse._id },
          {
            $set: { subjects: newSubjects },
            $unset: { lessons: "" }
          }
        );
        console.log(`Successfully migrated course: ${rawCourse.title}`);
      }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
