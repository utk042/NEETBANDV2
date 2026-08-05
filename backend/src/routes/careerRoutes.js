import express from 'express';
import JobPosition from '../models/JobPosition.js';
import JobApplication from '../models/JobApplication.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// =====================================
// PUBLIC ROUTES
// =====================================

// Get active open positions
router.get('/positions', async (req, res) => {
  try {
    const positions = await JobPosition.find({ status: 'active' }).sort({ order: 1, createdAt: -1 });
    res.json(positions);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching job positions' });
  }
});

// Submit job application
router.post('/apply', async (req, res) => {
  try {
    const { jobId, fullName, email, phone, resumeUrl, coverLetter } = req.body;

    if (!jobId || !fullName || !email || !phone || !resumeUrl) {
      return res.status(400).json({ message: 'Full name, email, phone, and resume/portfolio link are required.' });
    }

    const position = await JobPosition.findById(jobId);
    if (!position || position.status !== 'active') {
      return res.status(404).json({ message: 'Selected position is no longer active or does not exist.' });
    }

    const application = new JobApplication({
      jobId: position._id,
      jobTitle: position.title,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      resumeUrl: resumeUrl.trim(),
      coverLetter: coverLetter ? coverLetter.trim() : '',
    });

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully!',
      application,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error submitting application' });
  }
});


// =====================================
// PROTECTED ADMIN ROUTES (LMS ADMIN)
// =====================================

// Get all positions with applicant counts
router.get('/admin/positions', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const positions = await JobPosition.find().sort({ createdAt: -1 }).lean();
    const positionsWithCount = await Promise.all(
      positions.map(async (pos) => {
        const applicantCount = await JobApplication.countDocuments({ jobId: pos._id });
        return { ...pos, applicantCount };
      })
    );
    res.json(positionsWithCount);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching admin positions' });
  }
});

// Create new position
router.post('/admin/positions', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const { title, jobType, description, location, experience, salary, status, order } = req.body;
    if (!title || !description || !location || !experience || !salary) {
      return res.status(400).json({ message: 'Title, description, location, experience, and salary are required.' });
    }

    const position = new JobPosition({
      title: title.trim(),
      jobType: jobType || 'FULL-TIME',
      description: description.trim(),
      location: location.trim(),
      experience: experience.trim(),
      salary: salary.trim(),
      status: status || 'active',
      order: order !== undefined ? Number(order) : 0,
    });

    await position.save();
    res.status(201).json(position);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error creating position' });
  }
});

// Update position
router.put('/admin/positions/:id', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const updated = await JobPosition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Position not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error updating position' });
  }
});

// Delete position
router.delete('/admin/positions/:id', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const deleted = await JobPosition.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Position not found' });
    }
    // Delete related applications
    await JobApplication.deleteMany({ jobId: req.params.id });
    res.json({ message: 'Position and associated applications deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error deleting position' });
  }
});

// Get all candidate applications (optional jobId query)
router.get('/admin/applications', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const { jobId } = req.query;
    const query = jobId ? { jobId } : {};
    const applications = await JobApplication.find(query).sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching applications' });
  }
});

// Update application status / notes
router.put('/admin/applications/:id/status', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updateFields = {};
    if (status) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    const updated = await JobApplication.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error updating application' });
  }
});

// Delete candidate application
router.delete('/admin/applications/:id', protect, authorize('admin', 'owner'), async (req, res) => {
  try {
    const deleted = await JobApplication.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error deleting application' });
  }
});

export default router;
