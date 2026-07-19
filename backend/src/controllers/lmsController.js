import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { LessonContent, LessonQuiz, LessonQa } from '../models/LessonDetails.js';

// --- COURSES ---

export const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const { class: className, subject } = req.query;
    let query = {};
    if (className) query.class = className;
    if (subject) query.subject = subject;

    // Only admins/owners can see draft courses
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'owner');
    if (!isAdmin) {
      query.isPublished = true;
    }

    const courses = await Course.find(query).sort('order');
    res.json(courses);
  } catch (error) {
    console.error("getCourses Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only admins/owners can see draft courses
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'owner');
    if (!isAdmin && !course.isPublished) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// --- QUIZZES ---

export const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getQuizByCourse = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ courseId: req.params.courseId });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found for this course' });
    res.json(quiz);
  } catch (error) {
    console.error("getQuizByCourse Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- RESULT TRACKING ---

export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    const processedAnswers = answers.map((ans) => {
      const question = quiz.questions.id(ans.questionId);
      let isCorrect = false;

      if (question) {
        if (question.questionType === 'mcq' || question.questionType === 'true_false') {
          isCorrect = String(question.correctAnswer) === String(ans.userAnswer);
        } else if (question.questionType === 'fill_in_the_blanks') {
          isCorrect = String(question.correctAnswer).toLowerCase() === String(ans.userAnswer).toLowerCase();
        }
        if (isCorrect) score += 1;
      }
      return { ...ans, isCorrect };
    });

    // Save Submission
    const submission = await Submission.create({
      userId,
      quizId,
      answers: processedAnswers,
      score,
    });

    // Update User Progress
    const user = await User.findById(userId);
    const existingProgress = user.progress.find(p => p.courseId.toString() === quiz.courseId.toString());

    if (existingProgress) {
      if (score > existingProgress.score) {
        existingProgress.score = score;
      }
      existingProgress.completed = true;
    } else {
      user.progress.push({
        courseId: quiz.courseId,
        completed: true,
        score,
      });
    }
    await user.save();

    res.status(201).json({ submission, message: 'Quiz submitted successfully', score });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- DEDICATED LESSON DETAILS ENDPOINTS ---

export const getLessonContent = async (req, res) => {
  try {
    const course = await Course.findOne({ "subjects.chapters.items._id": req.params.itemId });
    if (course) {
      let foundItem = null;
      course.subjects.forEach(s => {
        s.chapters.forEach(c => {
          const item = c.items.id(req.params.itemId);
          if (item) foundItem = item;
        });
      });
      if (foundItem?.isPremium) {
        if (!req.user || !req.user.isPremium) {
          return res.status(403).json({ message: 'Premium content. Upgrade required.' });
        }
      }
    }

    const doc = await LessonContent.findOne({ itemId: req.params.itemId });
    res.json({ content: doc ? doc.content : '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLessonContent = async (req, res) => {
  try {
    const { content } = req.body;
    const doc = await LessonContent.findOneAndUpdate(
      { itemId: req.params.itemId },
      { content },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLessonQuiz = async (req, res) => {
  try {
    const course = await Course.findOne({ "subjects.chapters.items._id": req.params.itemId });
    if (course) {
      let foundItem = null;
      course.subjects.forEach(s => {
        s.chapters.forEach(c => {
          const item = c.items.id(req.params.itemId);
          if (item) foundItem = item;
        });
      });
      if (foundItem?.isPremium) {
        if (!req.user || !req.user.isPremium) {
          return res.status(403).json({ message: 'Premium content. Upgrade required.' });
        }
      }
    }

    const doc = await LessonQuiz.findOne({ itemId: req.params.itemId });
    res.json({ questions: doc ? doc.questions : [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLessonQuiz = async (req, res) => {
  try {
    const { questions } = req.body;
    const doc = await LessonQuiz.findOneAndUpdate(
      { itemId: req.params.itemId },
      { questions },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLessonQa = async (req, res) => {
  try {
    const course = await Course.findOne({ "subjects.chapters.items._id": req.params.itemId });
    if (course) {
      let foundItem = null;
      course.subjects.forEach(s => {
        s.chapters.forEach(c => {
          const item = c.items.id(req.params.itemId);
          if (item) foundItem = item;
        });
      });
      if (foundItem?.isPremium) {
        if (!req.user || !req.user.isPremium) {
          return res.status(403).json({ message: 'Premium content. Upgrade required.' });
        }
      }
    }

    const doc = await LessonQa.findOne({ itemId: req.params.itemId });
    res.json({ qas: doc ? doc.qas : [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLessonQa = async (req, res) => {
  try {
    const { qas } = req.body;
    const doc = await LessonQa.findOneAndUpdate(
      { itemId: req.params.itemId },
      { qas },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- PROGRESS TRACKING ---

export const getUserCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const courseProgress = user.progress.find(p => p.courseId.toString() === courseId);
    
    if (!courseProgress) {
      return res.json({ completedItems: [] });
    }

    res.json({ completedItems: courseProgress.completedItems || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markItemComplete = async (req, res) => {
  try {
    const { courseId, itemId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let courseProgress = user.progress.find(p => p.courseId.toString() === courseId);
    
    if (!courseProgress) {
      // Create progress entry if it doesn't exist
      user.progress.push({
        courseId: courseId,
        completed: false,
        score: 0,
        completedItems: [itemId]
      });
    } else {
      // Add to completedItems if not already there
      if (!courseProgress.completedItems) {
        courseProgress.completedItems = [];
      }
      const itemExists = courseProgress.completedItems.some(id => id.toString() === itemId);
      if (!itemExists) {
        courseProgress.completedItems.push(itemId);
      }
    }

    await user.save();

    res.json({ message: 'Item marked as complete' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
