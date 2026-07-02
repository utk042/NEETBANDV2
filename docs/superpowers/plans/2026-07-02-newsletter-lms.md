# Newsletter LMS Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a newsletter subscription system on the landing page, save emails in a MongoDB database, display and manage them in a new Newsletter tab on the LMS Admin Dashboard, and support CSV/TXT exports.

**Architecture:** We will create a Mongoose model `NewsletterSubscriber` and corresponding public/private Express endpoints. On the frontend, we will integrate the API with the existing footer subscription form, add a new "Newsletter" tab in the LMS Admin sidebar, and build a dedicated component `ManageNewsletter.jsx` to list, search, inline edit, delete, and export subscribers as CSV/TXT using client-side JavaScript Blobs.

**Tech Stack:** Node.js, Express, MongoDB (Mongoose), React, Tailwind CSS, Tabler Icons.

## Global Constraints
- Database Model: Save email, createdAt
- Routes: POST /newsletter/subscribe (public), GET /newsletter/subscribers (admin), PUT /newsletter/subscribers/:id (admin), DELETE /newsletter/subscribers/:id (admin)
- Frontend: Add "Newsletter" tab in LMS sidebar, support CSV and TXT exports.

---

### Task 1: Backend Newsletter Subscriber Model

**Files:**
- Create: `backend/src/models/NewsletterSubscriber.js`
- Create: `backend/src/test_newsletter_db.js`

**Interfaces:**
- Consumes: None
- Produces: `NewsletterSubscriber` mongoose model.

- [ ] **Step 1: Create the Mongoose model**
  Create the file `backend/src/models/NewsletterSubscriber.js` with the following content:
  ```javascript
  import mongoose from 'mongoose';

  const newsletterSubscriberSchema = new mongoose.Schema({
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
  export default NewsletterSubscriber;
  ```

- [ ] **Step 2: Create a db verification script**
  Create the file `backend/src/test_newsletter_db.js` to test saving:
  ```javascript
  import dotenv from 'dotenv';
  import mongoose from 'mongoose';
  import NewsletterSubscriber from './models/NewsletterSubscriber.js';

  dotenv.config({ path: './.env' });

  async function run() {
    try {
      console.log("Connecting to:", process.env.MONGO_URI);
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected.");

      // Clean up test emails if they exist
      await NewsletterSubscriber.deleteMany({ email: /test-subscriber/ });

      const testEmail = `test-subscriber-${Date.now()}@example.com`;
      const doc = await NewsletterSubscriber.create({ email: testEmail });
      console.log("Created subscriber:", doc.email);

      // Verify unique constraint
      try {
        await NewsletterSubscriber.create({ email: testEmail });
        console.log("FAIL: Unique constraint did not trigger!");
      } catch (err) {
        console.log("PASS: Unique constraint works (received error).");
      }

      await NewsletterSubscriber.deleteOne({ _id: doc._id });
      console.log("Cleanup complete.");
    } catch (err) {
      console.error("Test failed:", err);
    } finally {
      await mongoose.disconnect();
    }
  }

  run();
  ```

- [ ] **Step 3: Run the database verification script**
  In the `backend` folder, run the script to make sure connection and schema works.
  Run command in `backend` directory:
  `node src/test_newsletter_db.js`
  Expected output:
  - "Connected."
  - "Created subscriber: test-subscriber-...@example.com"
  - "PASS: Unique constraint works (received error)."
  - "Cleanup complete."

- [ ] **Step 4: Commit the changes**
  Add files and commit.
  ```bash
  git add backend/src/models/NewsletterSubscriber.js backend/src/test_newsletter_db.js
  git commit -m "feat: add NewsletterSubscriber database model and test"
  ```

---

### Task 2: Backend Routes and Controller

**Files:**
- Create: `backend/src/controllers/newsletterController.js`
- Create: `backend/src/routes/newsletterRoutes.js`
- Modify: `backend/src/index.js`
- Create: `backend/src/test_newsletter_api.js`

**Interfaces:**
- Consumes: `NewsletterSubscriber` model
- Produces: API endpoints under `/newsletter/*`

- [ ] **Step 1: Create the controller**
  Create the file `backend/src/controllers/newsletterController.js` with the following contents:
  ```javascript
  import NewsletterSubscriber from '../models/NewsletterSubscriber.js';

  export const subscribeNewsletter = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValid) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
      }
      const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({ message: 'This email is already subscribed.' });
      }
      const newSubscriber = await NewsletterSubscriber.create({ email });
      res.status(201).json(newSubscriber);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const getSubscribers = async (req, res) => {
    try {
      const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
      res.status(200).json(subscribers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const updateSubscriber = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValid) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
      }
      
      const existing = await NewsletterSubscriber.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({ message: 'This email is already subscribed.' });
      }

      const subscriber = await NewsletterSubscriber.findById(req.params.id);
      if (!subscriber) {
        return res.status(404).json({ message: 'Subscriber not found.' });
      }
      subscriber.email = email;
      await subscriber.save();
      res.status(200).json(subscriber);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const deleteSubscriber = async (req, res) => {
    try {
      const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
      if (!subscriber) {
        return res.status(404).json({ message: 'Subscriber not found.' });
      }
      res.status(200).json({ message: 'Subscriber deleted successfully.' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  ```

- [ ] **Step 2: Create the routes file**
  Create the file `backend/src/routes/newsletterRoutes.js` with the following content:
  ```javascript
  import express from 'express';
  import { 
    subscribeNewsletter, 
    getSubscribers, 
    updateSubscriber, 
    deleteSubscriber 
  } from '../controllers/newsletterController.js';
  import { protect, authorize } from '../middlewares/authMiddleware.js';

  const router = express.Router();

  // Public route to subscribe
  router.post('/subscribe', subscribeNewsletter);

  // Protected admin routes to manage subscriptions
  router.get('/subscribers', protect, authorize('admin', 'owner'), getSubscribers);
  router.put('/subscribers/:id', protect, authorize('admin', 'owner'), updateSubscriber);
  router.delete('/subscribers/:id', protect, authorize('admin', 'owner'), deleteSubscriber);

  export default router;
  ```

- [ ] **Step 3: Mount routes in index.js**
  Modify `backend/src/index.js` to mount the new route.
  Import line:
  ```javascript
  import newsletterRoutes from './routes/newsletterRoutes.js';
  ```
  Mount line (after other routes, e.g. around line 67):
  ```javascript
  app.use('/newsletter', newsletterRoutes);
  ```

- [ ] **Step 4: Create api verification script**
  Create `backend/src/test_newsletter_api.js` to verify routing:
  ```javascript
  import dotenv from 'dotenv';
  import mongoose from 'mongoose';
  import NewsletterSubscriber from './models/NewsletterSubscriber.js';
  import User from './models/User.js';
  import jwt from 'jsonwebtoken';

  dotenv.config({ path: './.env' });

  async function run() {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Database connected.");

      // Find an admin user to generate a token
      const admin = await User.findOne({ role: { $in: ['admin', 'owner'] } });
      if (!admin) {
        console.log("No admin/owner found. Cannot run protected route test.");
        return;
      }
      
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
      console.log("Generated Admin JWT Token:", token);

      // Clean up previous test subscriptions
      await NewsletterSubscriber.deleteMany({ email: /api-test/ });

      // Test subscription via POST (Public)
      const PORT = process.env.PORT || 5000;
      const testEmail = `api-test-${Date.now()}@example.com`;

      console.log("Testing POST /newsletter/subscribe...");
      let res = await fetch(`http://localhost:${PORT}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });
      console.log("Subscribe status:", res.status);
      const subDoc = await res.json();
      console.log("Subscribe response:", subDoc);

      if (res.status !== 201) throw new Error("Subscribe failed");

      // Test duplicate subscription
      console.log("Testing duplicate POST /newsletter/subscribe...");
      res = await fetch(`http://localhost:${PORT}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });
      console.log("Duplicate subscribe status:", res.status);
      const duplicateRes = await res.json();
      console.log("Duplicate response:", duplicateRes);

      // Test GET /newsletter/subscribers (Admin protected)
      console.log("Testing GET /newsletter/subscribers with auth...");
      res = await fetch(`http://localhost:${PORT}/newsletter/subscribers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log("GET subscribers status:", res.status);
      const list = await res.json();
      console.log("Subscribers count:", list.length);

      // Test PUT /newsletter/subscribers/:id
      console.log("Testing PUT /newsletter/subscribers/:id...");
      const updatedEmail = `api-test-updated-${Date.now()}@example.com`;
      res = await fetch(`http://localhost:${PORT}/newsletter/subscribers/${subDoc._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: updatedEmail }),
      });
      console.log("Update status:", res.status);
      console.log("Update response:", await res.json());

      // Test DELETE /newsletter/subscribers/:id
      console.log("Testing DELETE /newsletter/subscribers/:id...");
      res = await fetch(`http://localhost:${PORT}/newsletter/subscribers/${subDoc._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log("Delete status:", res.status);
      console.log("Delete response:", await res.json());

      console.log("API TESTS PASSED.");
    } catch (err) {
      console.error("API test failed:", err);
    } finally {
      await mongoose.disconnect();
    }
  }

  run();
  ```

- [ ] **Step 5: Run the API tests**
  Start backend server in background or verify it's running. In backend directory:
  Run command: `node src/test_newsletter_api.js`
  Expected output:
  - "Database connected."
  - "Subscribe status: 201"
  - "Duplicate subscribe status: 400"
  - "GET subscribers status: 200"
  - "Update status: 200"
  - "Delete status: 200"
  - "API TESTS PASSED."

- [ ] **Step 6: Commit the changes**
  Add files and commit.
  ```bash
  git add backend/src/controllers/newsletterController.js backend/src/routes/newsletterRoutes.js backend/src/index.js backend/src/test_newsletter_api.js
  git commit -m "feat: add newsletter routing and controller endpoints"
  ```

---

### Task 3: Frontend API Service Integration & Footer Integration

**Files:**
- Modify: `frontend/src/services/api.js`
- Modify: `frontend/src/components/Footer.jsx`

**Interfaces:**
- Consumes: Backend endpoints `/newsletter/*`
- Produces: API methods and updated newsletter footer.

- [ ] **Step 1: Add frontend API methods in api.js**
  Modify `frontend/src/services/api.js` by appending the following methods at the end (before `export default api;` on line 486):
  ```javascript
  // --- NEWSLETTER ---
  export const subscribeNewsletter = async (email) => {
    const res = await fetch(`${API_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const errText = await res.text();
      try {
        const parsed = JSON.parse(errText);
        throw new Error(parsed.message || 'Subscription failed');
      } catch {
        throw new Error(errText || 'Subscription failed');
      }
    }
    return res.json();
  };

  export const getNewsletterSubscribers = async () => {
    const res = await fetch(`${API_URL}/newsletter/subscribers`, {
      headers: getLmsHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  export const updateNewsletterSubscriber = async (id, email) => {
    const res = await fetch(`${API_URL}/newsletter/subscribers/${id}`, {
      method: 'PUT',
      headers: getLmsHeaders(),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const errText = await res.text();
      try {
        const parsed = JSON.parse(errText);
        throw new Error(parsed.message || 'Update failed');
      } catch {
        throw new Error(errText || 'Update failed');
      }
    }
    return res.json();
  };

  export const deleteNewsletterSubscriber = async (id) => {
    const res = await fetch(`${API_URL}/newsletter/subscribers/${id}`, {
      method: 'DELETE',
      headers: getLmsHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };
  ```

- [ ] **Step 2: Connect the Footer subscription form**
  Modify `frontend/src/components/Footer.jsx` to call `subscribeNewsletter`.
  Import `subscribeNewsletter` from API:
  ```javascript
  import { subscribeNewsletter } from '../services/api';
  ```
  Update `handleSubscribe`:
  ```javascript
    const handleSubscribe = async (e) => {
      e.preventDefault();
      if (!email) {
        setError('Email is required');
        return;
      }
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValid) {
        setError('Please enter a valid email address');
        return;
      }
      try {
        await subscribeNewsletter(email);
        setSubscribed(true);
        setError('');
        setEmail('');
      } catch (err) {
        setError(err.message || 'Subscription failed. Please try again.');
      }
    };
  ```

- [ ] **Step 3: Commit changes**
  Add files and commit.
  ```bash
  git add frontend/src/services/api.js frontend/src/components/Footer.jsx
  git commit -m "feat: hook up footer newsletter subscription to backend API"
  ```

---

### Task 4: Newsletter LMS Tab and Management Component

**Files:**
- Modify: `frontend/src/components/Admin/AdminDashboard.jsx`
- Create: `frontend/src/components/Admin/ManageNewsletter.jsx`

**Interfaces:**
- Consumes: API functions (`getNewsletterSubscribers`, `updateNewsletterSubscriber`, `deleteNewsletterSubscriber`, `subscribeNewsletter`)
- Produces: Newsletter tab in Admin LMS Dashboard.

- [ ] **Step 1: Add new Sidebar button in AdminDashboard.jsx**
  Modify `frontend/src/components/Admin/AdminDashboard.jsx`.
  Import `IconMailOpened` at the top:
  ```javascript
  import { 
    IconMusic, 
    IconBook, 
    IconLayoutDashboard, 
    IconLogout, 
    IconUser, 
    IconCash,
    IconUsers,
    IconFileText,
    IconClock,
    IconShieldLock,
    IconCrown,
    IconPencil,
    IconArrowRight,
    IconSun,
    IconMoon,
    IconMenu2,
    IconX,
    IconChevronDown,
    IconSettings,
    IconSchool,
    IconBrandBlogger,
    IconMessageCircle,
    IconAffiliate,
    IconMail,
    IconChartBar,
    IconMailOpened // Added
  } from '@tabler/icons-react';
  ```
  Import `ManageNewsletter` at top:
  ```javascript
  import ManageNewsletter from './ManageNewsletter';
  ```
  Add sidebar navigation button (around line 260):
  ```javascript
            <button
              onClick={() => changeTab('newsletter')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
                activeTab === 'newsletter' 
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                  : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
              }`}
            >
              <IconMailOpened size={20} stroke={2.5} /> Newsletter
            </button>
  ```
  Render `ManageNewsletter` under main content (around line 520, after contacts/feed):
  ```javascript
            {activeTab === 'newsletter' && (
              <div className="max-w-6xl mx-auto pb-8">
                <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 md:p-8 transition-colors duration-300">
                  <ManageNewsletter />
                </div>
              </div>
            )}
  ```

- [ ] **Step 2: Create the ManageNewsletter component**
  Create `frontend/src/components/Admin/ManageNewsletter.jsx` with full functionality:
  ```javascript
  import React, { useState, useEffect } from 'react';
  import { 
    getNewsletterSubscribers, 
    updateNewsletterSubscriber, 
    deleteNewsletterSubscriber,
    subscribeNewsletter 
  } from '../../services/api';
  import { 
    IconTrash, 
    IconPencil, 
    IconCheck, 
    IconX, 
    IconDownload, 
    IconSearch, 
    IconPlus 
  } from '@tabler/icons-react';

  export default function ManageNewsletter() {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [adding, setAdding] = useState(false);
    
    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editingEmail, setEditingEmail] = useState('');

    useEffect(() => {
      fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
      try {
        setLoading(true);
        const data = await getNewsletterSubscribers();
        setSubscribers(data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to fetch subscribers');
      } finally {
        setLoading(false);
      }
    };

    const handleAddSubscriber = async (e) => {
      e.preventDefault();
      if (!newEmail) return;
      try {
        setAdding(true);
        await subscribeNewsletter(newEmail);
        setNewEmail('');
        await fetchSubscribers();
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to add subscriber');
      } finally {
        setAdding(false);
      }
    };

    const handleStartEdit = (sub) => {
      setEditingId(sub._id);
      setEditingEmail(sub.email);
    };

    const handleCancelEdit = () => {
      setEditingId(null);
      setEditingEmail('');
    };

    const handleSaveEdit = async (id) => {
      if (!editingEmail) return;
      try {
        await updateNewsletterSubscriber(id, editingEmail);
        setEditingId(null);
        setEditingEmail('');
        await fetchSubscribers();
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to update subscriber');
      }
    };

    const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to remove this email subscription?')) {
        return;
      }
      try {
        await deleteNewsletterSubscriber(id);
        await fetchSubscribers();
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to delete subscriber');
      }
    };

    // Filter subscribers
    const filteredSubscribers = subscribers.filter(sub => 
      sub.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Export functions
    const exportToCSV = () => {
      if (filteredSubscribers.length === 0) return;
      let csvContent = 'Email,Subscribed At\n';
      filteredSubscribers.forEach(sub => {
        const date = new Date(sub.createdAt).toLocaleString();
        csvContent += `"${sub.email}","${date}"\n`;
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const exportToTXT = () => {
      if (filteredSubscribers.length === 0) return;
      let txtContent = '';
      filteredSubscribers.forEach(sub => {
        txtContent += `${sub.email}\n`;
      });
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().slice(0,10)}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-on-surface">Newsletter Subscribers</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full">
                {subscribers.length} total
              </span>
            </div>
            <p className="text-on-surface-variant text-sm mt-1">
              View, search, edit, delete, and export registered newsletter emails.
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              disabled={filteredSubscribers.length === 0}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-semibold text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <IconDownload size={18} /> Export Excel (CSV)
            </button>
            <button
              onClick={exportToTXT}
              disabled={filteredSubscribers.length === 0}
              className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant hover:bg-surface-variant text-on-surface font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <IconDownload size={18} /> Export TXT
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search bar */}
          <div className="md:col-span-6 relative">
            <IconSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
            <input
              type="text"
              placeholder="Search subscriber emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all"
            />
          </div>

          {/* Add Manual Form */}
          <form onSubmit={handleAddSubscriber} className="md:col-span-6 flex gap-2 w-full">
            <input
              type="email"
              placeholder="Add subscriber email manually..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all"
            />
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-semibold text-sm transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <IconPlus size={18} /> Add
            </button>
          </form>
        </div>

        {/* Subscribers Table */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-on-surface-variant text-sm font-semibold">
              Loading subscribers...
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant text-sm font-semibold">
              {searchQuery ? 'No subscribers match your search.' : 'No subscribers found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant text-xs uppercase tracking-wider font-bold bg-surface-container-high/50">
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Subscribed At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub._id} className="hover:bg-surface-container-high/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-on-surface">
                        {editingId === sub._id ? (
                          <input
                            type="email"
                            value={editingEmail}
                            onChange={(e) => setEditingEmail(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-surface border border-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-md"
                          />
                        ) : (
                          sub.email
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {new Date(sub.createdAt).toLocaleString(undefined, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {editingId === sub._id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(sub._id)}
                                className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/20 transition-colors"
                                title="Save"
                              >
                                <IconCheck size={18} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="w-8 h-8 rounded-lg bg-error/10 hover:bg-error/20 text-error flex items-center justify-center border border-error/20 transition-colors"
                                title="Cancel"
                              >
                                <IconX size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(sub)}
                                className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center border border-primary/20 transition-colors"
                                title="Edit"
                              >
                                <IconPencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(sub._id)}
                                className="w-8 h-8 rounded-lg bg-error/10 hover:bg-error/20 text-error flex items-center justify-center border border-error/20 transition-colors"
                                title="Delete"
                              >
                                <IconTrash size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Commit changes**
  Add files and commit.
  ```bash
  git add frontend/src/components/Admin/AdminDashboard.jsx frontend/src/components/Admin/ManageNewsletter.jsx
  git commit -m "feat: add newsletter tab and management view component"
  ```
