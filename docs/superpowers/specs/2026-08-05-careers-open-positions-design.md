# Dynamic Open Positions & Applications Management System

## Overview
This design introduces a dynamic **Open Positions** section on the public Careers page (`/careers`), allowing job seekers to browse open positions and submit applications via an interactive modal. It also adds a comprehensive **Careers Management** tab in the LMS Admin Panel to allow administrators to add, edit, toggle, and delete job positions, as well as view and manage candidate job applications.

---

## 1. Visual & UX Requirements (Matching Provided Reference Screenshots)

### 1.1 Careers Page ("Open Positions" Section)
- **Header**: "Open Positions" title with subtitle "Find the role that best fits your skills and aspirations."
- **Position Cards**:
  - **Title**: Prominent bold title (e.g., "Video Editor Job in Kanpur | Reels & Social Media Video Editor Hiring").
  - **Type Badge**: Green pill badge top right (e.g. `FULL-TIME`, `PART-TIME`, `INTERNSHIP`).
  - **Description**: Concise role summary.
  - **Key Details with Icons**:
    - 📍 **Location**: e.g., "Kanpur (Work from Office)"
    - 💼 **Experience**: e.g., "1–2 Years (Freshers with skills can apply) Years"
    - 💳 **Salary / Compensation**: e.g., "₹10,000 – ₹25,000 + Incentives"
  - **CTA**: Centered dark button: `APPLY NOW` with click trigger opening application modal.

### 1.2 Candidate Application Modal
- **Header**: "Apply for: {Job Title}" with top-right close icon (`×`).
- **Form Fields**:
  - `Full Name *` (text input, placeholder: "John Doe")
  - `Email Address *` & `Phone Number *` (side-by-side inputs)
  - `Resume / Portfolio Link *` (URL input, placeholder: "https://drive.google.com/...")
  - `Cover Letter (Optional)` (multiline textarea, placeholder: "Tell us why you are a great fit...")
- **Submit Button**: Vibrant green button ("Submit Application") with loading and success notification state.

---

## 2. LMS Admin Panel ("Careers & Jobs" Tab)

A new sidebar menu item **"Careers & Jobs"** (`IconBriefcase`) will be added to `AdminDashboard.jsx`.

### 2.1 Tab Layout & Features
- **Sub-Tabs / Toggle**:
  1. **Manage Positions**:
     - "Create Position" button opening creation modal/drawer.
     - Table/Grid of all job positions showing Title, Type, Location, Status (`Active` / `Inactive` / `Closed`), Applicant Count, and Action buttons (Edit, Toggle Status, Delete).
  2. **Manage Applications**:
     - Filter dropdown by Position (e.g., "All Positions" or specific job title).
     - Search filter by candidate Name or Email.
     - Candidate List showing Applicant Name, Applied Job, Contact (Email & Phone), Resume Link (clickable), Status badge, and Applied Date.
     - Status selector dropdown (`Pending` | `Reviewed` | `Shortlisted` | `Rejected` | `Hired`).
     - Detail modal to read complete Cover Letter and leave internal admin notes.

---

## 3. Database Schema & Models (Mongoose)

### 3.1 `JobPosition` Schema (`backend/src/models/JobPosition.js`)
```javascript
{
  title: { type: String, required: true },
  jobType: { type: String, default: 'FULL-TIME' }, // FULL-TIME, PART-TIME, INTERNSHIP, CONTRACT
  description: { type: String, required: true },
  location: { type: String, required: true },
  experience: { type: String, required: true },
  salary: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'closed'], default: 'active' },
  order: { type: Number, default: 0 }
}, { timestamps: true }
```

### 3.2 `JobApplication` Schema (`backend/src/models/JobApplication.js`)
```javascript
{
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosition', required: true },
  jobTitle: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resumeUrl: { type: String, required: true },
  coverLetter: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'], default: 'pending' },
  notes: { type: String, default: '' }
}, { timestamps: true }
```

---

## 4. API Specification

### 4.1 Public Endpoints
- `GET /careers/positions` -> Fetch active open positions (for public Careers page).
- `POST /careers/apply` -> Submit application (`{ jobId, fullName, email, phone, resumeUrl, coverLetter }`).

### 4.2 Admin Endpoints (Protected by LMS Admin Middleware)
- `GET /admin/careers/positions` -> Fetch all positions (active & inactive) with applicant count.
- `POST /admin/careers/positions` -> Create job position.
- `PUT /admin/careers/positions/:id` -> Update job position.
- `DELETE /admin/careers/positions/:id` -> Delete job position.
- `PATCH /admin/careers/positions/:id/status` -> Quick toggle position status.
- `GET /admin/careers/applications` -> Fetch job applications (optional `?jobId=` filter).
- `PUT /admin/careers/applications/:id/status` -> Update application status / notes.
- `DELETE /admin/careers/applications/:id` -> Delete application record.

---

## 5. Verification Plan

1. **Backend Integration Tests**:
   - Create seed job positions and test `GET /careers/positions` response.
   - Post candidate application via `POST /careers/apply` and check validation errors for missing fields.
   - Test admin authenticated CRUD operations on positions & applications.
2. **Frontend UI Verification**:
   - Verify dynamic position rendering on Careers page matching image 1.
   - Verify modal opening and submission matching image 2.
   - Verify LMS Admin panel navigation, creation/editing of job positions, status updates, and viewing candidate applications.
