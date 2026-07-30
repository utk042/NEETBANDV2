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

    let quiz = await Quiz.findById(quizId).catch(() => null);
    let courseId = quiz?.courseId;
    let questions = quiz?.questions;

    if (!quiz) {
      const lQuiz = await LessonQuiz.findOne({ $or: [{ _id: quizId }, { itemId: quizId }] }).catch(() => null);
      if (lQuiz) {
        questions = lQuiz.questions;
        const course = await Course.findOne({ "subjects.chapters.items._id": lQuiz.itemId }).catch(() => null);
        if (course) courseId = course._id;
      }
    }

    if (!quiz && !questions) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    const processedAnswers = (answers || []).map((ans) => {
      let question = null;
      if (quiz && quiz.questions?.id) {
        question = quiz.questions.id(ans.questionId);
      } else if (questions) {
        question = questions.find(q => String(q._id) === String(ans.questionId)) || questions[ans.questionId];
      }
      
      let isCorrect = false;
      if (question) {
        const qType = question.questionType || question.type;
        const correctAns = question.correctAnswer !== undefined ? question.correctAnswer : (question.correctIndex !== undefined ? question.correctIndex : question.correctText);

        if (qType === 'mcq' || qType === 'true_false' || !qType) {
          isCorrect = String(correctAns) === String(ans.userAnswer);
        } else if (qType === 'fill_in_the_blanks') {
          const userAnsStr = String(ans.userAnswer || '').trim().toLowerCase();
          const targetStr = String(question.correctText || correctAns || '').trim().toLowerCase();
          const targetArr = targetStr.split('/').map(s => s.trim()).filter(Boolean);
          isCorrect = targetArr.includes(userAnsStr);
        }
        if (isCorrect) score += 1;
      }
      return { ...ans, isCorrect };
    });

    const submission = await Submission.create({
      userId,
      quizId,
      answers: processedAnswers,
      score,
    });

    if (courseId) {
      const user = await User.findById(userId);
      if (user) {
        let existingProgress = user.progress.find(p => p.courseId.toString() === courseId.toString());

        if (existingProgress) {
          if (score > (existingProgress.score || 0)) {
            existingProgress.score = score;
          }
          existingProgress.completed = true;
        } else {
          user.progress.push({
            courseId: courseId,
            completed: true,
            score,
          });
        }
        await user.save();
      }
    }

    res.status(201).json({ submission, message: 'Quiz submitted successfully', score });
  } catch (error) {
    console.error("submitQuiz Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- DEDICATED LESSON DETAILS ENDPOINTS ---

export const getLessonContent = async (req, res) => {
  try {
    const course = await Course.findOne({ "subjects.chapters.items._id": req.params.itemId });
    if (course) {
      let foundSubject = null;
      let foundChapter = null;
      let foundItem = null;

      course.subjects?.forEach(s => {
        s.chapters?.forEach(c => {
          const item = c.items?.id ? c.items.id(req.params.itemId) : c.items?.find(i => String(i._id) === String(req.params.itemId));
          if (item) {
            foundSubject = s;
            foundChapter = c;
            foundItem = item;
          }
        });
      });

      const isPremiumContent = !!(course.isPremium || foundSubject?.isPremium || foundChapter?.isPremium || foundItem?.isPremium);
      if (isPremiumContent) {
        if (!req.user) {
          return res.status(401).json({ message: 'Login required for premium content.', isPremium: true });
        }
        if (!req.user.isPremium && req.user.role !== 'admin' && req.user.role !== 'owner') {
          return res.status(403).json({ message: 'Premium content. Upgrade required.', isPremium: true });
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
      let foundSubject = null;
      let foundChapter = null;
      let foundItem = null;

      course.subjects?.forEach(s => {
        s.chapters?.forEach(c => {
          const item = c.items?.id ? c.items.id(req.params.itemId) : c.items?.find(i => String(i._id) === String(req.params.itemId));
          if (item) {
            foundSubject = s;
            foundChapter = c;
            foundItem = item;
          }
        });
      });

      const isPremiumContent = !!(course.isPremium || foundSubject?.isPremium || foundChapter?.isPremium || foundItem?.isPremium);
      if (isPremiumContent) {
        if (!req.user) {
          return res.status(401).json({ message: 'Login required for premium content.', isPremium: true });
        }
        if (!req.user.isPremium && req.user.role !== 'admin' && req.user.role !== 'owner') {
          return res.status(403).json({ message: 'Premium content. Upgrade required.', isPremium: true });
        }
      }
    }

    const doc = await LessonQuiz.findOne({ itemId: req.params.itemId });
    const durVal = doc?.duration || doc?.timeLimit || 60;
    res.json({
      questions: doc ? doc.questions : [],
      duration: durVal,
      timeLimit: durVal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLessonQuiz = async (req, res) => {
  try {
    const { questions, duration, timeLimit } = req.body;
    const questionsArray = Array.isArray(questions) ? questions : (req.body.questions || []);
    const durVal = Number(duration || timeLimit) || 60;

    const doc = await LessonQuiz.findOneAndUpdate(
      { itemId: req.params.itemId },
      { questions: questionsArray, duration: durVal, timeLimit: durVal },
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
      let foundSubject = null;
      let foundChapter = null;
      let foundItem = null;

      course.subjects?.forEach(s => {
        s.chapters?.forEach(c => {
          const item = c.items?.id ? c.items.id(req.params.itemId) : c.items?.find(i => String(i._id) === String(req.params.itemId));
          if (item) {
            foundSubject = s;
            foundChapter = c;
            foundItem = item;
          }
        });
      });

      const isPremiumContent = !!(course.isPremium || foundSubject?.isPremium || foundChapter?.isPremium || foundItem?.isPremium);
      if (isPremiumContent) {
        if (!req.user) {
          return res.status(401).json({ message: 'Login required for premium content.', isPremium: true });
        }
        if (!req.user.isPremium && req.user.role !== 'admin' && req.user.role !== 'owner') {
          return res.status(403).json({ message: 'Premium content. Upgrade required.', isPremium: true });
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

    // Try to atomically add the itemId to completedItems if the course progress exists
    let user = await User.findOneAndUpdate(
      { _id: userId, 'progress.courseId': courseId },
      { $addToSet: { 'progress.$.completedItems': itemId } },
      { new: true }
    );

    if (!user) {
      // If course progress doesn't exist, atomically push a new progress entry
      user = await User.findOneAndUpdate(
        { _id: userId, 'progress.courseId': { $ne: courseId } },
        {
          $push: {
            progress: {
              courseId: courseId,
              completed: false,
              score: 0,
              completedItems: [itemId]
            }
          }
        },
        { new: true }
      );
      
      // If still not found, check if user exists at all
      if (!user) {
        const userExists = await User.findById(userId);
        if (!userExists) return res.status(404).json({ message: 'User not found' });
      }
    }

    res.json({ message: 'Item marked as complete' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
