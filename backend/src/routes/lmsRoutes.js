import express from 'express';
import { 
  createCourse, getCourses, updateCourse, deleteCourse, getCourseById,
  createQuiz, getQuizByCourse, 
  submitQuiz,
  getLessonContent, updateLessonContent,
  getLessonQuiz, updateLessonQuiz,
  getLessonQa, updateLessonQa
} from '../controllers/lmsController.js';
import { protect, authorize, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Courses
router.route('/courses')
  .get(getCourses)
  .post(protect, authorize('admin', 'owner'), createCourse);

router.route('/courses/:id')
  .get(getCourseById)
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

// Dedicated Lesson Details Endpoints
router.route('/lessons/item/:itemId/content')
  .get(optionalAuth, getLessonContent)
  .put(protect, authorize('admin', 'owner'), updateLessonContent);

router.route('/lessons/item/:itemId/quiz')
  .get(optionalAuth, getLessonQuiz)
  .put(protect, authorize('admin', 'owner'), updateLessonQuiz);

router.route('/lessons/item/:itemId/qa')
  .get(optionalAuth, getLessonQa)
  .put(protect, authorize('admin', 'owner'), updateLessonQa);

export default router;
