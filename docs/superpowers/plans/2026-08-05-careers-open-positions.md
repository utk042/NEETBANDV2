# Open Positions & LMS Careers Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a dynamic Open Positions section on the Careers page with an application modal, and build a full Careers & Jobs management suite in the LMS admin dashboard to manage job positions and candidate applications.

**Architecture:** Mongoose models for `JobPosition` and `JobApplication`, Express API routes under `/careers` (public) and `/admin/careers` (authenticated), React components for public Careers page listing & modal, and an LMS Admin sub-module `ManageCareers.jsx` integrated into `AdminDashboard.jsx`.

**Tech Stack:** React, Tailwind CSS, Tabler Icons, Node.js, Express, Mongoose, Vitest/Jest (for backend tests).

## Global Constraints
- Must follow established UI/UX patterns (dark surface cards, Tabler icons, dialog context toasts).
- Admin routes must use `getLmsHeaders()` and verify admin token/role.
- All candidate inputs (Full Name, Email, Phone, Resume link) must be validated.

---

### Task 1: Backend JobPosition & JobApplication Models & Routes

**Files:**
- Create: `backend/src/models/JobPosition.js`
- Create: `backend/src/models/JobApplication.js`
- Create: `backend/src/routes/careerRoutes.js`
- Modify: `backend/src/index.js`
- Create: `backend/test_careers_api.js`

**Interfaces:**
- Consumes: Mongoose connection, Express app, `getLmsHeaders` / LMS auth middleware.
- Produces: API routes `/careers/positions`, `/careers/apply`, `/admin/careers/positions`, `/admin/careers/applications`.

- [ ] **Step 1: Create `JobPosition` Mongoose Model**

```javascript
// backend/src/models/JobPosition.js
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
}, { timestamps: true });

const JobPosition = mongoose.model('JobPosition', jobPositionSchema);
export default JobPosition;
```

- [ ] **Step 2: Create `JobApplication` Mongoose Model**

```javascript
// backend/src/models/JobApplication.js
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
}, { timestamps: true });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
export default JobApplication;
```

- [ ] **Step 3: Create Express Routes in `careerRoutes.js`**

```javascript
// backend/src/routes/careerRoutes.js
import express from 'express';
import JobPosition from '../models/JobPosition.js';
import JobApplication from '../models/JobApplication.js';
import { verifyLmsToken } from '../middlewares/authMiddleware.js'; // or lms admin middleware

const router = express.Router();

// Public: Get active job positions
router.get('/positions', async (req, res) => {
  try {
    const positions = await JobPosition.find({ status: 'active' }).sort({ order: 1, createdAt: -1 });
    res.json(positions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: Submit job application
router.post('/apply', async (req, res) => {
  try {
    const { jobId, fullName, email, phone, resumeUrl, coverLetter } = req.body;
    if (!jobId || !fullName || !email || !phone || !resumeUrl) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }
    const position = await JobPosition.findById(jobId);
    if (!position || position.status !== 'active') {
      return res.status(404).json({ message: 'Job position not found or no longer active.' });
    }

    const application = new JobApplication({
      jobId,
      jobTitle: position.title,
      fullName,
      email,
      phone,
      resumeUrl,
      coverLetter: coverLetter || ''
    });

    await application.save();
    res.status(201).json({ message: 'Application submitted successfully!', application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all positions with applicant count
router.get('/admin/positions', verifyLmsToken, async (req, res) => {
  try {
    const positions = await JobPosition.find().sort({ createdAt: -1 }).lean();
    const positionsWithCount = await Promise.all(positions.map(async (pos) => {
      const applicantCount = await JobApplication.countDocuments({ jobId: pos._id });
      return { ...pos, applicantCount };
    }));
    res.json(positionsWithCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Create job position
router.post('/admin/positions', verifyLmsToken, async (req, res) => {
  try {
    const { title, jobType, description, location, experience, salary, status } = req.body;
    const position = new JobPosition({ title, jobType, description, location, experience, salary, status });
    await position.save();
    res.status(201).json(position);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update job position
router.put('/admin/positions/:id', verifyLmsToken, async (req, res) => {
  try {
    const updated = await JobPosition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Delete job position
router.delete('/admin/positions/:id', verifyLmsToken, async (req, res) => {
  try {
    await JobPosition.findByIdAndDelete(req.params.id);
    res.json({ message: 'Position deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get applications
router.get('/admin/applications', verifyLmsToken, async (req, res) => {
  try {
    const { jobId } = req.query;
    const query = jobId ? { jobId } : {};
    const applications = await JobApplication.find(query).sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update application status / notes
router.put('/admin/applications/:id/status', verifyLmsToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = await JobApplication.findByIdAndUpdate(req.params.id, { status, notes }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Delete application
router.delete('/admin/applications/:id', verifyLmsToken, async (req, res) => {
  try {
    await JobApplication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
```

- [ ] **Step 4: Mount routes in `backend/src/index.js`**

```javascript
import careerRoutes from './routes/careerRoutes.js';
// ...
app.use('/careers', careerRoutes);
app.use('/api/careers', careerRoutes);
```

- [ ] **Step 5: Test API with `test_careers_api.js` script**

Run: `node backend/test_careers_api.js`
Expected: Success response for public position list and submission.

---

### Task 2: Frontend API Helpers & Public Careers Page UI

**Files:**
- Modify: `frontend/src/services/api.js`
- Create: `frontend/src/components/ApplyJobModal.jsx`
- Modify: `frontend/src/components/Careers.jsx`

- [ ] **Step 1: Add API helper functions in `api.js`**
Add `getPublicJobPositions`, `submitJobApplication`, `getAdminJobPositions`, `createJobPosition`, `updateJobPosition`, `deleteJobPosition`, `getJobApplications`, `updateJobApplicationStatus`, `deleteJobApplication`.

- [ ] **Step 2: Build `ApplyJobModal.jsx` component matching Image 2**
Component containing modal overlay, title "Apply for: {position.title}", form inputs (Full Name, Email, Phone, Resume / Portfolio Link, Cover Letter), submit button with loading state, and error/success dialog toast.

- [ ] **Step 3: Update `Careers.jsx` to render "Open Positions" section matching Image 1**
Render dynamic open position cards with badge (`FULL-TIME`), location pin, briefcase experience, card salary icons, and "APPLY NOW" button opening `ApplyJobModal`.

---

### Task 3: LMS Admin Panel "Careers & Jobs" Management

**Files:**
- Create: `frontend/src/components/Admin/ManageCareers.jsx`
- Modify: `frontend/src/components/Admin/AdminDashboard.jsx`

- [ ] **Step 1: Create `ManageCareers.jsx` component**
Sub-tabs:
1. **Manage Positions**:
   - Positions table/card list with applicant count badge.
   - Add/Edit position modal/form.
   - Action buttons: Edit, Toggle Active/Inactive status, Delete.
2. **Manage Applications**:
   - Filter dropdown by job position.
   - Candidate application list with Name, Email, Phone, Resume link button, Applied date.
   - Interactive Status Dropdown (`Pending`, `Reviewed`, `Shortlisted`, `Rejected`, `Hired`).
   - View full cover letter modal & delete application.

- [ ] **Step 2: Register "Careers & Jobs" in `AdminDashboard.jsx` sidebar & active tab view**
Add `IconBriefcase` tab button ("Careers & Jobs") in sidebar and render `<ManageCareers />` when `activeTab === 'careers'`.

---

### Task 4: Verification & E2E Testing

- [ ] **Step 1: Automated API suite verification**
- [ ] **Step 2: Manual browser test verification of Careers page open positions and application submission modal**
- [ ] **Step 3: Manual test of LMS Admin panel position creation, status toggles, and candidate application review**
