import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'true_false', 'fill_in_the_blanks'], default: 'mcq' },
  options:  [{ type: String }],
  correctIndex: { type: Number, default: 0 },
  correctText: { type: String }, // For fill in the blanks
  explanation: { type: String },
}, { _id: true });

const qaSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer:   { type: String, required: true },
}, { _id: true });

// Model for Item Text/Notes
const lessonContentSchema = new mongoose.Schema({
  itemId:  { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
  content: { type: String, default: '' }
}, { timestamps: true });

// Model for Item Quizzes
const lessonQuizSchema = new mongoose.Schema({
  itemId:    { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
  questions: [questionSchema]
}, { timestamps: true });

// Model for Item Q&A Lists
const lessonQaSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
  qas:    [qaSchema]
}, { timestamps: true });

export const LessonContent = mongoose.model('LessonContent', lessonContentSchema);
export const LessonQuiz = mongoose.model('LessonQuiz', lessonQuizSchema);
export const LessonQa = mongoose.model('LessonQa', lessonQaSchema);
