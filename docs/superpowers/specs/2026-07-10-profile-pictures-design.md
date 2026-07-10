# Technical Design: Profile Pictures Across LMS, Affiliate Portal, Feeds, Blogs, and Comments

This document outlines the design and implementation details for adding profile picture support to all user roles (Students, LMS Admins/Owners, and Affiliate Partners). It details how profile pictures will be uploaded, stored, and displayed across dashboards, blogs, community feeds, and comments.

## 1. Database Schema Changes

We will add a `profilePicture` field to both the student (`User`) and affiliate (`Affiliate`) models.

### User Schema (`backend/src/models/User.js`)
```javascript
profilePicture: {
  type: String,
  default: ''
}
```

### Affiliate Schema (`backend/src/models/Affiliate.js`)
```javascript
profilePicture: {
  type: String,
  default: ''
}
```

---

## 2. Backend API Changes

### A. Profile Update Endpoints
We will ensure both profile update controllers process and save the `profilePicture` field.

* **User/LMS Profile Update (`backend/src/controllers/authController.js` - `updateUserProfile`)**
  Update the payload destructuring and validation to allow `profilePicture`:
  ```javascript
  const { name, password, profilePicture } = req.body;
  // ...
  if (profilePicture !== undefined) {
    user.profilePicture = profilePicture;
  }
  ```
  Ensure `profilePicture` is returned in the response object.

* **Affiliate Profile Update (`backend/src/controllers/affiliateController.js` - `updateAffiliateProfile`)**
  Update the payload destructuring and validation to allow `profilePicture`:
  ```javascript
  const { name, password, profilePicture } = req.body;
  // ...
  if (profilePicture !== undefined) {
    affiliate.profilePicture = profilePicture;
  }
  ```
  Ensure `profilePicture` is returned in the response object.

### B. Mongoose Population Updates
To display the profile pictures on feeds, blogs, and comments, we must include `profilePicture` in all mongoose `.populate()` queries.

* **Blog & Blog Comments (`backend/src/routes/blogRoutes.js`)**
  - Update blog author population: `.populate('author', 'name email profilePicture')`
  - Update blog comment user population: `.populate('comments.user', 'name profilePicture')`
  
* **Forum Post & Forum Comments (`backend/src/routes/forumRoutes.js`)**
  - Update post author population: `.populate('author', 'name role profilePicture')`
  - Update comment author population: `.populate('comments.author', 'name role profilePicture')`

---

## 3. Frontend Implementation Details

### A. API Service (`frontend/src/services/api.js`)
* Create a new student-specific `updateUserProfile` function:
  ```javascript
  export const updateUserProfile = async (userData) => {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };
  ```

### B. Common Edit Profile Modal (`EditProfileModal.jsx`)
Used by LMS Admin and Affiliate dashboards.
* Add an image upload input with preview.
* When saving, if a new image file is chosen:
  1. Call `uploadFile(file, 'profile_pictures')` to upload the image to the local server.
  2. Call `onSave` with `{ name, profilePicture: data.url }`.

### C. Student Dashboard Profile Modal (`Dashboard.jsx`)
* Integrate image upload picker and preview.
* On form submission:
  1. If a new image is chosen, upload it using `uploadFile(file, 'profile_pictures')`.
  2. Call `updateUserProfile({ name: editName, profilePicture: uploadedUrl })` to save the details to the database.
  3. Sync the state locally using `setUser` and update the local academic settings as before.

### D. Rendering Fallbacks
If a user hasn't set a profile picture, we will fall back to initials or a generic styled avatar:
```javascript
const getAvatarUrl = (userObj) => {
  if (userObj?.profilePicture) {
    // If it's a relative path from our backend, prefix with API_URL
    return userObj.profilePicture.startsWith('http') 
      ? userObj.profilePicture 
      : `${API_URL}${userObj.profilePicture}`;
  }
  return `https://api.dicebear.com/9.x/initials/svg?seed=${userObj?.name || 'User'}&backgroundColor=b6e3f4`;
};
```

---

## 4. Verification Plan

### Automated/Manual Verification Steps
1. **LMS Admin Profile Picture:** Edit profile on LMS, upload a profile picture, save. Verify profile picture updates in the sidebar.
2. **Affiliate Profile Picture:** Edit profile on Affiliate Portal, upload a picture, save. Verify it shows in the sidebar.
3. **Student Profile Picture:** Edit profile on Student Dashboard, upload a picture, save. Verify it updates in the dashboard.
4. **Feeds, Blogs, and Comments:**
   - Create a comment on a blog post. Verify commenter's profile picture displays correctly next to the comment.
   - Create a post on the community forum. Verify the author's profile picture displays correctly on the feed.
   - Comment on the forum post. Verify the comment author's profile picture displays.
