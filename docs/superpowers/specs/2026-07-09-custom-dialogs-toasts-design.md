# Global Dialog & Toast Context Redesign

Replace the browser's native `window.alert` and `window.confirm` dialogs with premium Tailwind CSS-styled toast notifications and promise-based confirm/alert modal overlays.

## Proposed Design

### 1. DialogContext & DialogProvider
- **Location:** `frontend/src/contexts/DialogContext.jsx` [NEW]
- **API Expose:**
  - `toast.success(message)`: Success notification toast.
  - `toast.error(message)`: Error notification toast.
  - `toast.info(message)`: Informational notification toast.
  - `confirm(title, message)`: Promise-based confirm modal returning `true`/`false`.
  - `alert(title, message)`: Promise-based alert modal returning on close.
- **Styling:**
  - Toasts are stacked in the bottom-right corner, feature fade-in/fade-out animations, and have icons corresponding to their alert type (Check, Warning, Info).
  - Modals use absolute overlay alignment, backdrop blur (`backdrop-blur-sm`), custom borders, rounded corners (`rounded-3xl`), and responsive padding.

### 2. Provider Integration
- **Location:** `frontend/src/App.jsx`
- Wrap `AppContent` inside `DialogProvider` so the notification hooks can be called globally.

### 3. Upgrading Files
Update the following components to replace native window alerts/confirms with `useDialog`:
- `AdminAffiliates.jsx`
- `AdminBlogs.jsx`
- `AdminDashboard.jsx`
- `AdminForums.jsx`
- `ManageContactMessages.jsx`
- `ManageLMS.jsx`
- `ManageNewsScroll.jsx`
- `ManageNewsletter.jsx`
- `ManageSongs.jsx`
- `AffiliateDashboard.jsx`
