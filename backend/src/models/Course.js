import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  type:     { type: String, enum: ['notes', 'quiz', 'qa', 'song', 'video', 'lesson', 'reading'], default: 'notes' },
  duration: { type: String },
  videoUrl: { type: String },
  audioUrl: { type: String },
  fileUrl:  { type: String },
  fileType: { type: String },
  order:    { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
}, { _id: true });

const chapterSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  icon:      { type: String },
  duration:  { type: String },
  videoUrl:  { type: String },
  audioUrl:  { type: String },
  fileUrl:   { type: String },
  fileType:  { type: String },
  order:     { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  items:     [itemSchema],
}, { _id: true });

const subjectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  icon:        { type: String },
  isPremium:   { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
  chapters:    [chapterSchema],
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  class:       { type: String, required: true },
  subject:     { type: String, required: true },
  summary:     { type: String },
  order:       { type: Number, default: 0 },
  coverColor:  { type: String, default: '#ecc246' },
  thumbnail:   { type: String },
  subjects:    [subjectSchema],
  isPublished: { type: Boolean, default: false },
  isPremium:   { type: Boolean, default: false },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;
