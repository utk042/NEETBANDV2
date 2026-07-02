# Design Spec: Remove Blue Loading Screen

## Goal
Completely remove the jarring, hardcoded blue loading screen background that flashes when checking authentication on route transitions (such as `/lms` or `/affiliate`).

## Proposed Changes

### Frontend Components

#### [MODIFY] [ProtectedRoute.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/ProtectedRoute.jsx)
- Replace the hardcoded `bg-[#012f9c]` class with the standard responsive/theme-aware `bg-background` class.
- This ensures that during initial authentication loading, the loading screen's background color matches the application's current active theme (light or dark background) rather than flashing a bright solid blue.

```diff
  if (isAuthLoading) {
    return (
-     <div className="min-h-screen flex items-center justify-center bg-[#012f9c]">
+     <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
      </div>
    );
  }
```

## Verification Plan
- Run the local frontend server.
- Navigate to `/lms` or `/affiliate`.
- Confirm that the loading screen matches the dark/light mode background and no longer flashes blue.
