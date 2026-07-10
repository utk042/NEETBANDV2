# Profile Pictures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a profile picture feature across LMS, Affiliate Portal, feeds, blogs, and comments, with local server storage and Mongoose database referencing.

**Architecture:** Upload images to local `/upload` multer endpoint, store the resulting URL in Mongoose models (`User` and `Affiliate`), update mongoose `.populate()` references on blogs/comments/feed, and update frontend React components to enable uploading and display pictures.

**Tech Stack:** React, TailwindCSS, Mongoose, Express, Multer

---

### Task 1: Database Model Fields

**Files:**
- Modify: `backend/src/models/User.js:70-73`
- Modify: `backend/src/models/Affiliate.js:66-69`

- [ ] **Step 1: Update User.js schema**
  Add `profilePicture` field to `userSchema`:
  ```javascript
  profilePicture: {
    type: String,
    default: ''
  }
  ```
- [ ] **Step 2: Update Affiliate.js schema**
  Add `profilePicture` field to `affiliateSchema`:
  ```javascript
  profilePicture: {
    type: String,
    default: ''
  }
  ```
- [ ] **Step 3: Commit changes**
  Run:
  ```bash
  git add backend/src/models/User.js backend/src/models/Affiliate.js
  git commit -m "feat: add profilePicture field to User and Affiliate schemas"
  ```

---

### Task 2: Backend Controllers & Routes

**Files:**
- Modify: `backend/src/controllers/authController.js:102-126`
- Modify: `backend/src/controllers/affiliateController.js:76-100`
- Modify: `backend/src/routes/blogRoutes.js`
- Modify: `backend/src/routes/forumRoutes.js`

- [ ] **Step 1: Update authController.js**
  Update `updateUserProfile` to accept and save `profilePicture`:
  ```javascript
  const { name, password, profilePicture } = req.body;
  // ...
  if (name) user.name = name;
  if (password) user.password = password;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;
  // ...
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    membershipPlan: updatedUser.membershipPlan,
    isPremium: updatedUser.isPremium,
    streak: updatedUser.streak,
    profilePicture: updatedUser.profilePicture,
  });
  ```
- [ ] **Step 2: Update affiliateController.js**
  Update `updateAffiliateProfile` to accept and save `profilePicture`:
  ```javascript
  const { name, password, profilePicture } = req.body;
  // ...
  if (name) affiliate.name = name;
  if (password) affiliate.password = password;
  if (profilePicture !== undefined) affiliate.profilePicture = profilePicture;
  // ...
  res.json({
    _id: updatedAffiliate._id,
    name: updatedAffiliate.name,
    email: updatedAffiliate.email,
    promoCode: updatedAffiliate.promoCode,
    earnings: updatedAffiliate.earnings,
    affiliatedUsers: updatedAffiliate.affiliatedUsers,
    settlements: updatedAffiliate.settlements,
    profilePicture: updatedAffiliate.profilePicture,
  });
  ```
- [ ] **Step 3: Update blogRoutes.js populates**
  Include `profilePicture` in `.populate('author', ...)` and `.populate('comments.user', ...)`:
  - Line 15: `.populate('author', 'name email profilePicture')`
  - Line 25: `.populate('author', 'name email profilePicture')`
  - Line 39: `.populate('author', 'name email profilePicture').populate('comments.user', 'name profilePicture')`
  - Line 44: `.populate('author', 'name email profilePicture').populate('comments.user', 'name profilePicture')`
  - Line 175: `.populate('comments.user', 'name profilePicture')`
  - Line 191: `.populate('comments.user', 'name profilePicture')`
- [ ] **Step 4: Update forumRoutes.js populates**
  Include `profilePicture` in `.populate('author', ...)` and `.populate('comments.author', ...)`:
  - Line 59: `.populate('author', 'name role profilePicture')`
  - Line 71: `.populate('author', 'name role profilePicture')`
  - Line 83-84: `.populate('author', 'name role profilePicture').populate('comments.author', 'name role profilePicture')`
  - Line 218: `.populate('comments.author', 'name role profilePicture')`
  - Line 257-258: `.populate('author', 'name role profilePicture').populate('comments.author', 'name role profilePicture')`
- [ ] **Step 5: Commit changes**
  Run:
  ```bash
  git add backend/src/controllers/authController.js backend/src/controllers/affiliateController.js backend/src/routes/blogRoutes.js backend/src/routes/forumRoutes.js
  git commit -m "feat: handle profilePicture updates and population in backend"
  ```

---

### Task 3: Frontend Services Setup

**Files:**
- Modify: `frontend/src/services/api.js`

- [ ] **Step 1: Add updateUserProfile API**
  Add student profile update helper in `api.js`:
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
- [ ] **Step 2: Update updateLmsUserProfile and updateAffiliateProfile mapping**
  Ensure returned objects from APIs include `profilePicture`:
  - In `updateLmsUserProfile` (returns data):
    Ensure the caller gets `profilePicture` inside `data` response.
- [ ] **Step 3: Commit changes**
  Run:
  ```bash
  git add frontend/src/services/api.js
  git commit -m "feat: add updateUserProfile and handle profilePicture in API service"
  ```

---

### Task 4: Common Profile Picture Upload UI

**Files:**
- Modify: `frontend/src/components/Common/EditProfileModal.jsx`

- [ ] **Step 1: Integrate File Uploader into EditProfileModal**
  - Add state for profile image preview and file choice:
    ```javascript
    const [profileFile, setProfileFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    ```
  - Sync preview Url when modal opens:
    ```javascript
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    useEffect(() => {
      if (isOpen && currentUser) {
        // ...
        setPreviewUrl(currentUser.profilePicture ? (currentUser.profilePicture.startsWith('http') ? currentUser.profilePicture : `${API_URL}${currentUser.profilePicture}`) : '');
        setProfileFile(null);
      }
    }, [isOpen, currentUser]);
    ```
  - Render circular preview and clean file upload input in the form:
    ```jsx
    {/* Profile Picture Uploader */}
    <div className="flex flex-col items-center gap-3 mb-6">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-variant flex items-center justify-center text-on-surface-variant shadow-md">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-extrabold uppercase">{name.charAt(0) || '?'}</span>
          )}
        </div>
        <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
          Change
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setProfileFile(file);
                setPreviewUrl(URL.createObjectURL(file));
              }
            }}
          />
        </label>
      </div>
      <p className="text-xs text-on-surface-variant/60">Upload JPG, PNG, or GIF. Max 5MB.</p>
    </div>
    ```
  - In `handleSubmit`, perform the upload if `profileFile` exists:
    ```javascript
    import { uploadFile } from '../../services/api';
    // Inside handleSubmit:
    let uploadedUrl = currentUser.profilePicture || '';
    if (profileFile) {
      const uploadRes = await uploadFile(profileFile, 'profile_pictures');
      uploadedUrl = uploadRes.url;
    }
    const updatedUser = {
      name: name.trim(),
      profilePicture: uploadedUrl,
    };
    ```
- [ ] **Step 2: Update AffiliateRoutes.jsx to map profile picture**
  In `AffiliateRoutes.jsx` at line 34:
  ```javascript
  const fullUpdatedUser = {
    ...activeUser,
    name: data.name || updatedUser.name,
    email: data.email || activeUser.email,
    promoCode: data.promoCode || activeUser.promoCode,
    profilePicture: data.profilePicture || activeUser.profilePicture,
    token: activeUser.token,
    isLoggedIn: true
  };
  ```
- [ ] **Step 3: Commit changes**
  Run:
  ```bash
  git add frontend/src/components/Common/EditProfileModal.jsx frontend/src/routes/AffiliateRoutes.jsx
  git commit -m "feat: support image uploads in EditProfileModal and sync Affiliate routes"
  ```

---

### Task 5: Student Profile Modal Picture Upload

**Files:**
- Modify: `frontend/src/components/Dashboard.jsx`

- [ ] **Step 1: Integrate Uploader and API Update inside Dashboard.jsx**
  - Add state variables inside `Dashboard` component:
    ```javascript
    const [profileFile, setProfileFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    ```
  - Sync when `isProfileModalOpen` opens or `user` changes:
    ```javascript
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    useEffect(() => {
      if (isProfileModalOpen && user) {
        setProfileFile(null);
        setPreviewUrl(user.profilePicture ? (user.profilePicture.startsWith('http') ? user.profilePicture : `${API_URL}${user.profilePicture}`) : '');
      }
    }, [isProfileModalOpen, user]);
    ```
  - Update `handleSaveProfile` to upload the image and call `updateUserProfile`:
    ```javascript
    import { uploadFile, updateUserProfile } from '../services/api';
    // Inside handleSaveProfile:
    let uploadedUrl = user.profilePicture || '';
    if (profileFile) {
      try {
        const uploadRes = await uploadFile(profileFile, 'profile_pictures');
        uploadedUrl = uploadRes.url;
      } catch (err) {
        setErrorMsg('Failed to upload profile picture');
        return;
      }
    }
    
    let dbUpdated;
    try {
      dbUpdated = await updateUserProfile({
        name: editName,
        profilePicture: uploadedUrl
      });
    } catch (err) {
      setErrorMsg('Failed to save profile to database');
      return;
    }

    const updatedUser = {
      ...user,
      name: editName,
      profilePicture: dbUpdated.profilePicture || uploadedUrl,
      class: editClass,
      preferences: editPrefs,
      studyGoal: editGoal
    };
    ```
  - Render uploader UI at the top of the form in the profile edit modal:
    ```jsx
    {/* Profile Picture Uploader */}
    <div className="flex flex-col items-center gap-3 mb-6">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-surface flex items-center justify-center text-on-surface shadow-md">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-extrabold uppercase">{editName.charAt(0) || '?'}</span>
          )}
        </div>
        <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
          Change
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setProfileFile(file);
                setPreviewUrl(URL.createObjectURL(file));
              }
            }}
          />
        </label>
      </div>
    </div>
    ```
  - Update top-right dashboard profile avatar displaying:
    Change line 154 Dicebear avatar to show `user.profilePicture` if available:
    ```javascript
    const avatarUrl = user?.profilePicture 
      ? (user.profilePicture.startsWith('http') ? user.profilePicture : `${API_URL}${user.profilePicture}`)
      : `https://api.dicebear.com/9.x/avataaars/svg?seed=${profileName || 'Student'}&backgroundColor=b6e3f4`;
    ```
- [ ] **Step 2: Commit changes**
  Run:
  ```bash
  git add frontend/src/components/Dashboard.jsx
  git commit -m "feat: add image uploading to student profile modal on dashboard"
  ```

---

### Task 6: Dashboard Sidebars & Feed Profile Rendering

**Files:**
- Modify: `frontend/src/components/Admin/AdminDashboard.jsx`
- Modify: `frontend/src/components/Affiliate/AffiliateDashboard.jsx`
- Modify: `frontend/src/components/Blog.jsx`
- Modify: `frontend/src/components/CommunityForum.jsx`

- [ ] **Step 1: Update AdminDashboard.jsx sidebar**
  Display profile image instead of `IconUser`:
  ```javascript
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const profilePicUrl = currentUser.profilePicture 
    ? (currentUser.profilePicture.startsWith('http') ? currentUser.profilePicture : `${API_URL}${currentUser.profilePicture}`)
    : '';
  ```
  Render:
  ```jsx
  <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/50 flex items-center justify-center bg-surface-variant text-on-surface flex-shrink-0 shadow-sm">
    {profilePicUrl ? (
      <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
    ) : (
      <IconUser size={24} />
    )}
  </div>
  ```
- [ ] **Step 2: Update AffiliateDashboard.jsx sidebar**
  Display profile image instead of `IconUsers`:
  ```javascript
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const profilePicUrl = user.profilePicture 
    ? (user.profilePicture.startsWith('http') ? user.profilePicture : `${API_URL}${user.profilePicture}`)
    : '';
  ```
  Render:
  ```jsx
  <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/50 flex items-center justify-center bg-surface-variant text-on-surface flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
    {profilePicUrl ? (
      <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
    ) : (
      <IconUsers size={24} />
    )}
  </div>
  ```
- [ ] **Step 3: Update Blog.jsx comments and authors**
  - Render blog author profile picture in detail view (if `selectedBlog.author.profilePicture` exists):
    ```jsx
    {selectedBlog.author?.profilePicture ? (
      <img 
        src={selectedBlog.author.profilePicture.startsWith('http') ? selectedBlog.author.profilePicture : `${API_URL}${selectedBlog.author.profilePicture}`} 
        alt="Author" 
        className="w-5 h-5 rounded-full object-cover" 
      />
    ) : (
      <IconUser size={16} />
    )}
    ```
  - Render commenter's profile picture in the list (lines 233-235):
    ```jsx
    <div className="w-10 h-10 overflow-hidden rounded-full flex-shrink-0 bg-primary/10 text-primary flex items-center justify-center font-bold">
      {comment.user?.profilePicture ? (
        <img 
          src={comment.user.profilePicture.startsWith('http') ? comment.user.profilePicture : `${API_URL}${comment.user.profilePicture}`} 
          alt="Commenter" 
          className="w-full h-full object-cover" 
        />
      ) : (
        <span>{comment.user?.name?.charAt(0) || 'U'}</span>
      )}
    </div>
    ```
- [ ] **Step 4: Update CommunityForum.jsx posts, comments, and post forms**
  - Fix comment author rendering using `comment.author` (backend populated key):
    ```jsx
    const commentUser = comment.author || comment.user;
    ```
  - In post list (lines 162-164):
    ```jsx
    <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary font-bold">
      {post.author?.profilePicture ? (
        <img 
          src={post.author.profilePicture.startsWith('http') ? post.author.profilePicture : `${API_URL}${post.author.profilePicture}`} 
          alt="Author" 
          className="w-full h-full object-cover" 
        />
      ) : (
        <span>{post.author?.name?.charAt(0) || 'U'}</span>
      )}
    </div>
    ```
  - In comment list (lines 230-232):
    ```jsx
    <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0 mt-1">
      {commentUser?.profilePicture ? (
        <img 
          src={commentUser.profilePicture.startsWith('http') ? commentUser.profilePicture : `${API_URL}${commentUser.profilePicture}`} 
          alt="Commenter" 
          className="w-full h-full object-cover" 
        />
      ) : (
        <span>{commentUser?.name?.charAt(0) || <IconUser size={16} />}</span>
      )}
    </div>
    ```
    Change comment list author display name to `commentUser?.name || 'Unknown'`.
  - In add comment input avatar (lines 247-249):
    ```jsx
    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
      {user.profilePicture ? (
        <img 
          src={user.profilePicture.startsWith('http') ? user.profilePicture : `${API_URL}${user.profilePicture}`} 
          alt="User" 
          className="w-full h-full object-cover" 
        />
      ) : (
        <span>{user.name?.charAt(0) || <IconUser size={16} />}</span>
      )}
    </div>
    ```
- [ ] **Step 5: Commit changes**
  Run:
  ```bash
  git add frontend/src/components/Admin/AdminDashboard.jsx frontend/src/components/Affiliate/AffiliateDashboard.jsx frontend/src/components/Blog.jsx frontend/src/components/CommunityForum.jsx
  git commit -m "feat: render profile pictures in sidebars, feeds, blogs, and comments"
  ```
