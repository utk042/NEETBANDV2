# Global Dialog & Toast Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a unified Promise-based custom modal/toast system (`DialogContext`) and replace standard `window.confirm` and `alert` calls across the core admin panels.

**Architecture:** Create `DialogContext.jsx` to expose `toast.success`, `toast.error`, `confirm()`, and `alert()` methods. Wrap the application inside `App.jsx` with `<DialogProvider>`. Update components to consume the context.

**Tech Stack:** React, TailwindCSS, @tabler/icons-react

## Global Constraints
- All dialog modals should align with existing app design guidelines (e.g. `bg-surface`, `rounded-3xl`, `z-modal`, etc.).
- Ensure dark mode responsiveness (themes correctly dynamically).

---

### Task 1: Create DialogContext and Integrate into App.jsx

**Files:**
- Create: `frontend/src/contexts/DialogContext.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: `AppContent` in `App.jsx`
- Produces: `<DialogProvider />` wrapping `AppContent`.

- [ ] **Step 1: Create DialogContext.jsx**
  Create the file `frontend/src/contexts/DialogContext.jsx` with toast and modal states, exposed hooks, and rendering overlays.

  Write [DialogContext.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/contexts/DialogContext.jsx):
  ```javascript
  import React, { createContext, useContext, useState, useCallback } from 'react';
  import { IconAlertTriangle, IconCheck, IconInfo, IconX } from '@tabler/icons-react';

  const DialogContext = createContext(null);

  export const DialogProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null); // { title, message, resolve }

    const showToast = useCallback((message, type = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    }, []);

    const toast = {
      success: (msg) => showToast(msg, 'success'),
      error: (msg) => showToast(msg, 'error'),
      info: (msg) => showToast(msg, 'info'),
    };

    const confirm = useCallback((title, message) => {
      return new Promise((resolve) => {
        setConfirmState({ title, message, resolve });
      });
    }, []);

    const alert = useCallback((title, message) => {
      return new Promise((resolve) => {
        setConfirmState({ title, message, resolve, isAlert: true });
      });
    }, []);

    const handleCloseConfirm = (result) => {
      if (confirmState && confirmState.resolve) {
        confirmState.resolve(result);
      }
      setConfirmState(null);
    };

    return (
      <DialogContext.Provider value={{ toast, confirm, alert }}>
        {children}

        {/* Global Confirm/Alert Modal */}
        {confirmState && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
              onClick={() => !confirmState.isAlert && handleCloseConfirm(false)}
            />
            {/* Modal Container */}
            <div className="relative bg-surface rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl border border-outline-variant/30 animate-in zoom-in-95 duration-200 text-center text-on-surface">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                confirmState.isAlert ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'
              }`}>
                {confirmState.isAlert ? <IconInfo size={32} /> : <IconAlertTriangle size={32} />}
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2">{confirmState.title}</h2>
              <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
                {confirmState.message}
              </p>

              <div className="flex justify-center gap-4 w-full">
                {!confirmState.isAlert && (
                  <button
                    type="button"
                    onClick={() => handleCloseConfirm(false)}
                    className="flex-1 py-3 px-6 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-variant transition-colors border border-outline-variant/30"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleCloseConfirm(true)}
                  className={`flex-1 py-3 px-6 font-bold rounded-xl transition-colors shadow-sm text-white ${
                    confirmState.isAlert ? 'bg-primary hover:bg-primary/95' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {confirmState.isAlert ? 'OK' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast Notifications Stack */}
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div 
              key={t.id} 
              className={`flex items-start gap-3 p-4 rounded-2xl shadow-lg border animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto bg-surface text-on-surface ${
                t.type === 'success' ? 'border-green-500/20' : 
                t.type === 'error' ? 'border-red-500/20' : 'border-outline-variant/30'
              }`}
            >
              <div className={`mt-0.5 rounded-full p-1 flex-shrink-0 ${
                t.type === 'success' ? 'bg-green-500/10 text-green-500' :
                t.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
              }`}>
                {t.type === 'success' ? <IconCheck size={18} /> : 
                 t.type === 'error' ? <IconAlertTriangle size={18} /> : <IconInfo size={18} />}
              </div>
              <div className="flex-1 text-sm font-medium pr-2">{t.message}</div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <IconX size={16} />
              </button>
            </div>
          ))}
        </div>
      </DialogContext.Provider>
    );
  };

  export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) throw new Error('useDialog must be used within a DialogProvider');
    return context;
  };
  ```

- [ ] **Step 2: Modify App.jsx to use DialogProvider**
  Import `DialogProvider` and wrap the contents of the exported `App` function.

  Modify [App.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/App.jsx):
  ```javascript
  import React, { Suspense } from 'react';
  import { BrowserRouter as Router, useLocation } from 'react-router-dom';

  import { UserAuthProvider, useUserAuth } from './contexts/UserAuthContext';
  import { LmsAuthProvider } from './contexts/LmsAuthContext';
  import { AffiliateAuthProvider } from './contexts/AffiliateAuthContext';
  import { DialogProvider } from './contexts/DialogContext';
  import { PlayerProvider } from './contexts/PlayerContext';

  import UserRoutes from './routes/UserRoutes';
  import CustomCursor from './components/CustomCursor';
  import { lazyWithRetry } from './utils/lazyWithRetry';
  const LmsRoutes = lazyWithRetry(() => import('./routes/LmsRoutes'));
  const AffiliateRoutes = lazyWithRetry(() => import('./routes/AffiliateRoutes'));

  // ... (AppContent remains same) ...

  export default function App() {
    return (
      <Router>
        <UserAuthProvider>
          <DialogProvider>
            <AppContent />
          </DialogProvider>
        </UserAuthProvider>
      </Router>
    );
  }
  ```

- [ ] **Step 3: Verify route compiles**
  Expected: Build succeeds.

---

### Task 2: Upgrade Logout Confirmation on AdminDashboard and AffiliateDashboard

**Files:**
- Modify: `frontend/src/components/Admin/AdminDashboard.jsx`
- Modify: `frontend/src/components/Affiliate/AffiliateDashboard.jsx`

- [ ] **Step 1: Modify AdminDashboard.jsx**
  Import `useDialog` hook and replace `window.confirm` with custom async `confirm()`.

  Modify [AdminDashboard.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/Admin/AdminDashboard.jsx):
  Add `useDialog` import at the top:
  `import { useDialog } from '../../contexts/DialogContext';`

  In the component body, invoke the hook:
  `const { confirm } = useDialog();`

  Replace `handleLogout` function:
  ```javascript
    const handleLogout = async () => {
      const isConfirmed = await confirm("Confirm Log Out", "Are you sure you want to log out of the LMS Panel?");
      if (isConfirmed) {
        localStorage.removeItem('neetband_lms_user');
        localStorage.removeItem('lms_token');
        navigate('/');
      }
    };
  ```

- [ ] **Step 2: Modify AffiliateDashboard.jsx**
  Refactor the local `isLogoutModalOpen` state we added previously to use the new global `confirm` dialog instead.

  Modify [AffiliateDashboard.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/Affiliate/AffiliateDashboard.jsx):
  Add `useDialog` import:
  `import { useDialog } from '../../contexts/DialogContext';`

  Remove `isLogoutModalOpen` state and `confirmLogoutAction` function.
  Call the hook:
  `const { confirm } = useDialog();`

  Replace `handleLogout` function:
  ```javascript
    const handleLogout = async () => {
      const isConfirmed = await confirm("Confirm Log Out", "Are you sure you want to log out of the Affiliate Portal?");
      if (isConfirmed) {
        localStorage.removeItem('neetband_affiliate_user');
        localStorage.removeItem('affiliate_token');
        navigate('/');
        window.location.reload();
      }
    };
  ```
  Remove the local `isLogoutModalOpen` modal JSX block from the bottom of the file.

- [ ] **Step 3: Compile and Verify**
  Expected: Build succeeds.

---

### Task 3: Upgrade AdminAffiliates.jsx and ManageSongs.jsx

**Files:**
- Modify: `frontend/src/components/Admin/AdminAffiliates.jsx`
- Modify: `frontend/src/components/Admin/ManageSongs.jsx`

- [ ] **Step 1: Modify AdminAffiliates.jsx**
  Replace `window.confirm` and native `alert` calls with `useDialog` hooks (`toast` and `confirm`).

  Modify [AdminAffiliates.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/Admin/AdminAffiliates.jsx):
  Add import:
  `import { useDialog } from '../../contexts/DialogContext';`

  Hook call:
  `const { toast, confirm } = useDialog();`

  Replace alert/confirm calls inside methods (e.g. `fetchAffiliates`, `handleDeleteAffiliate`, errors) to use `toast.error`, `toast.success`, and `await confirm`.

- [ ] **Step 2: Modify ManageSongs.jsx**
  Replace `window.confirm` and native `alert` calls.

  Modify [ManageSongs.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/Admin/ManageSongs.jsx):
  Add import:
  `import { useDialog } from '../../contexts/DialogContext';`

  Hook call:
  `const { toast, confirm } = useDialog();`

  Replace alert/confirm calls (e.g. `handleDelete`, `onUploadFile`, etc.) with `toast` or `confirm`.

---

### Task 4: Upgrade remaining Admin panel pages

**Files:**
- Modify: `frontend/src/components/Admin/AdminBlogs.jsx`
- Modify: `frontend/src/components/Admin/AdminForums.jsx`
- Modify: `frontend/src/components/Admin/ManageContactMessages.jsx`
- Modify: `frontend/src/components/Admin/ManageLMS.jsx`
- Modify: `frontend/src/components/Admin/ManageNewsScroll.jsx`
- Modify: `frontend/src/components/Admin/ManageNewsletter.jsx`

- [ ] **Step 1: Upgrade AdminBlogs.jsx**
  Replace comments delete confirm (`window.confirm`) and alerts.
- [ ] **Step 2: Upgrade AdminForums.jsx**
  Replace delete post/comment confirms (`window.confirm`) and alerts.
- [ ] **Step 3: Upgrade ManageContactMessages.jsx**
  Replace delete message confirm (`window.confirm`).
- [ ] **Step 4: Upgrade ManageLMS.jsx**
  Replace student delete, course delete confirms (`window.confirm`) and alert logs.
- [ ] **Step 5: Upgrade ManageNewsScroll.jsx**
  Replace force reset scroller confirmation (`window.confirm`).
- [ ] **Step 6: Upgrade ManageNewsletter.jsx**
  Replace remove email subscription confirmation.

- [ ] **Step 7: Final verification compilation**
  Run: `npm run build`
  Expected: Success without warning or syntax error.
