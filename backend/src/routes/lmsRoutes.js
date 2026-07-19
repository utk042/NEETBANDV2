import express from 'express';
import { 
  createCourse, getCourses, updateCourse, deleteCourse, getCourseById,
  createQuiz, getQuizByCourse, 
  submitQuiz,
  getLessonContent, updateLessonContent,
  getLessonQuiz, updateLessonQuiz,
  getLessonQa, updateLessonQa,
  getUserCourseProgress, markItemComplete
} from '../controllers/lmsController.js';
import { protect, authorize, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Courses
router.route('/courses')
  .get(optionalAuth, getCourses)
  .post(protect, authorize('admin', 'owner'), createCourse);

router.route('/courses/:id')
  .get(optionalAuth, getCourseById)
  .put(protect, authorize('admin', 'owner'), updateCourse)
  .delete(protect, authorize('admin', 'owner'), deleteCourse);

// Quizzes
router.route('/quizzes')
  .post(protect, authorize('admin', 'owner'), createQuiz);

router.route('/quizzes/course/:courseId')
  .get(protect, getQuizByCourse);

// Submissions
router.route('/quizzes/submit')
  .post(protect, submitQuiz);

// --- DEDICATED LESSON DETAILS (Notes, Quiz, QA) ---
// We use itemId to fetch the specific notes/quiz/qa associated with that item.

router.route('/items/:itemId/content')
  .get(optionalAuth, getLessonContent)
  .put(protect, authorize('admin', 'owner'), updateLessonContent);

router.route('/items/:itemId/quiz')
  .get(optionalAuth, getLessonQuiz)
  .put(protect, authorize('admin', 'owner'), updateLessonQuiz);

router.route('/items/:itemId/qa')
  .get(optionalAuth, getLessonQa)
  .put(protect, authorize('admin', 'owner'), updateLessonQa);

// --- PROGRESS TRACKING ---
router.route('/courses/:courseId/progress')
  .get(protect, getUserCourseProgress);

router.route('/courses/:courseId/items/:itemId/complete')
  .post(protect, markItemComplete);

export default router;
