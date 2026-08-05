import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosition', required: true },
  jobTitle: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resumeUrl: { type: String, required: true },
  coverLetter: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'], default: 'pending' },
  notes: { type: String, default: '' },
}, {
  timestamps: true,
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;
