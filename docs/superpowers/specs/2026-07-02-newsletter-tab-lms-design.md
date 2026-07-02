# Specification: Newsletter Subscription & LMS Admin Tab

This specification outlines the design and technical approach to implement a Newsletter subscription system for NeetBand, including a database collection, public and protected APIs, a dedicated "Newsletter" tab within the LMS Admin Dashboard, and tools to edit, delete, and export subscribers to CSV/TXT formats.

---

## 1. Overview & Objectives

### Goal
Allow visitors to subscribe to the newsletter from the website footer, and allow administrators to view, edit, delete, and export the subscriber emails from a new tab in the LMS Admin Dashboard.

### Objectives
1. **Database Persistence**: Store subscriber emails in a new MongoDB collection.
2. **Subscription Flow**: Connect the footer input form to the database via a public backend endpoint, providing validation feedback.
3. **LMS Tab**: Add a new "Newsletter" tab in the LMS sidebar.
4. **Subscriber Management**: Add options for admins to search, edit, and delete subscriber records.
5. **Data Export**: Implement client-side export functionality to download the subscriber list as Excel-compatible CSV and plain-text TXT files.

---

## 2. Technical Design

### A. Database Layer (Backend)

We will define a new model at [NewsletterSubscriber.js](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/backend/src/models/NewsletterSubscriber.js).

**Fields**:
- `email`: String, required, unique, lowercase, trimmed, with built-in regex format validation.
- `createdAt`: Date, defaults to `Date.now`.

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

---

### B. Routing & Controller Layer (Backend)

We will define new routes in [newsletterRoutes.js](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/backend/src/routes/newsletterRoutes.js) and mount them in `index.js` at `/newsletter`.

#### Endpoints:
1. `POST /newsletter/subscribe` (Public)
   - Checks if the email already exists in the database.
   - If it exists: returns status `400` with JSON `{ message: "This email is already subscribed." }`.
   - If not: creates a new subscriber and returns status `201`.
2. `GET /newsletter/subscribers` (Admin Only)
   - Fetches all newsletter subscribers sorted by `createdAt` in descending order.
3. `PUT /newsletter/subscribers/:id` (Admin Only)
   - Validates the new email format, checks for duplicates, and updates the subscriber.
4. `DELETE /newsletter/subscribers/:id` (Admin Only)
   - Deletes the subscriber from the database.

---

### C. API Service Layer (Frontend)

We will append the new endpoints to [api.js](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/services/api.js):

- `subscribeNewsletter(email)`: Public POST request to subscribe.
- `getNewsletterSubscribers()`: Admin GET request (requires LMS authorization header).
- `updateNewsletterSubscriber(id, email)`: Admin PUT request to edit an email.
- `deleteNewsletterSubscriber(id)`: Admin DELETE request to remove an email.

---

### E. User Interface & Export Logic (Frontend)

#### 1. Footer Updates (`Footer.jsx`)
- Integrate `subscribeNewsletter` into `handleSubscribe`.
- Catch errors (e.g. duplicate subscription 400 error) and display the error message in the validation span.
- Transition state to show the success checkmark upon successful subscription.

#### 2. LMS Admin Sidebar Navigation (`AdminDashboard.jsx`)
- Import `IconMailOpened` from `@tabler/icons-react`.
- Add a new button in the navigation menu mapping `activeTab === 'newsletter'`.
- Render the new `ManageNewsletter` component when the tab is active.

#### 3. Manage Newsletter Component (`ManageNewsletter.jsx`)
- Render a table showing:
  - Email (with click-to-edit inline toggle)
  - Date Subscribed (formatted as `DD MMM YYYY, HH:MM`)
  - Actions: Edit/Save and Delete
- Render a search filter to refine the list of subscribers dynamically.
- Render export actions:
  - **Export CSV**: Triggers a download of a `.csv` file containing the table's current list of emails and sign-up dates.
  - **Export TXT**: Triggers a download of a `.txt` file listing all emails one per line.
  - **Add Subscriber Manually**: A simple input bar to quickly add email addresses from the dashboard.

---

## 3. Verification Plan

### Manual Verification
1. Open the website footer and attempt to subscribe using a new email address. Verify the success message appears.
2. Attempt to subscribe with the same email address again. Verify that the system displays a "This email is already subscribed." message.
3. Log in to the LMS Admin Panel.
4. Navigate to the new "Newsletter" tab.
5. Verify the subscriber list displays the email registered in Step 1.
6. Test search filtering by searching a specific prefix/domain.
7. Test the "Edit" action to update an email address. Verify changes are updated.
8. Test the "Export CSV" and "Export TXT" actions. Verify the downloaded files contain correct, formatted data.
9. Test the "Delete" action. Verify the subscriber is removed.
