# Remove Blue Loading Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded deep blue background on the route authentication loading screen with the theme's background.

**Architecture:** Update the `ProtectedRoute` component to use the responsive/theme-aware Tailwind `bg-background` class instead of the static `bg-[#012f9c]` color class. This automatically adapts the loading background to the dark or light mode color scheme.

**Tech Stack:** React, Tailwind CSS

## Global Constraints
- Avoid introducing generic placeholder colors.
- Follow existing patterns in React Router and Tailwind configuration.

---

### Task 1: Update ProtectedRoute loading screen background

**Files:**
- Modify: [ProtectedRoute.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/ProtectedRoute.jsx)

- [ ] **Step 1: Replace background color class**
  Modify [ProtectedRoute.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/ProtectedRoute.jsx#L13) to change `bg-[#012f9c]` to `bg-background`.

  Code implementation:
  ```jsx
  import React from 'react';
  import { Navigate } from 'react-router-dom';

  export default function ProtectedRoute({ 
    isAuthLoading, 
    isLoggedIn, 
    children, 
    portalName = 'this area', 
    loginRoute = '/login' 
  }) {
    if (isAuthLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
        </div>
      );
    }

    if (!isLoggedIn) {
      return <Navigate to={loginRoute} replace />;
    }

    return children;
  }
  ```

- [ ] **Step 2: Verify the change**
  Ensure that when compiling/loading, the loading screen's background integrates seamlessly with the active background theme color.

- [ ] **Step 3: Commit the change**
  Run git command:
  ```bash
  git add frontend/src/components/ProtectedRoute.jsx
  git commit -m "feat: change ProtectedRoute loading background to theme bg-background"
  ```
