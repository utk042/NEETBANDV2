import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userAnswer: {
      type: mongoose.Schema.Types.Mixed,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    }
  }],
  score: {
    type: Number,
    required: true,
    default: 0,
  }
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
