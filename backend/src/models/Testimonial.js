import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['text', 'video'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      required: false,
    },
    quote: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      default: 5,
    },
    category: {
      type: String,
      enum: ['teacher', 'student', 'teachers', 'students'], 
      required: false,
    },
    videoUrl: {
      type: String,
      required: function () {
        return this.type === 'video';
      },
    },
    posterUrl: {
      type: String,
      required: false,
    },
    badge: {
      type: String,
      required: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
