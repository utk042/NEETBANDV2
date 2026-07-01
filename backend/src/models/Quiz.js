import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ['mcq', 'true_false', 'fill_in_the_blanks'],
    required: true,
  },
  options: [{
    type: String, // For MCQs
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // String for fill in blanks, index/string for MCQ
    required: true,
  },
  explanation: {
    type: String, // Correct/wrong answer explanation
  }
});

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  questions: [questionSchema]
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
