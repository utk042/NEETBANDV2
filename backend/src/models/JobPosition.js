import mongoose from 'mongoose';

const jobPositionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  jobType: { type: String, default: 'FULL-TIME' },
  description: { type: String, required: true },
  location: { type: String, required: true },
  experience: { type: String, required: true },
  salary: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'closed'], default: 'active' },
  order: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const JobPosition = mongoose.model('JobPosition', jobPositionSchema);

export default JobPosition;
