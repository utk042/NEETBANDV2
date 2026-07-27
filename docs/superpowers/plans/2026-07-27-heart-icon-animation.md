# Heart Icon Bounce Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add smooth elastic bounce keyframe animations when users click heart icons across all player & track views.

**Architecture:** Define global CSS `@keyframes` in `frontend/src/styles/main.css` for heart bounce/recoil animations, build a reusable `<HeartButton />` component in `frontend/src/components/Common/HeartButton.jsx` that manages a transient trigger state, and integrate this component into all track lists and audio player screens.

**Tech Stack:** React, Tailwind CSS / Custom CSS Keyframe Animations, `@tabler/icons-react` / `lucide-react`.

## Global Constraints
- Must not cause layout shift (animations strictly mutate `transform: scale(...)`).
- Must handle both favorited (active) and unfavorited (inactive) states seamlessly.
- Preserve all existing props and event propagation behaviors (`e.stopPropagation()`).

---

### Task 1: Define CSS Keyframe Animations in `main.css`

**Files:**
- Modify: `frontend/src/styles/main.css:500-506`

**Interfaces:**
- Produces: CSS utility classes `.animate-heart-bounce` and `.animate-heart-recoil`.

- [ ] **Step 1: Add keyframes and animation utility classes to `main.css`**

Add the following CSS rules to `frontend/src/styles/main.css`:

```css
@keyframes heartBounce {
  0% { transform: scale(1); }
  25% { transform: scale(0.82); }
  50% { transform: scale(1.35); }
  75% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

@keyframes heartRecoil {
  0% { transform: scale(1); }
  40% { transform: scale(0.85); }
  100% { transform: scale(1); }
}

.animate-heart-bounce {
  animation: heartBounce 350ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.animate-heart-recoil {
  animation: heartRecoil 200ms ease-out;
}
```

- [ ] **Step 2: Commit changes**

```bash
git add frontend/src/styles/main.css
git commit -m "style: add heart bounce and recoil keyframe animations"
```

---

### Task 2: Create Reusable `HeartButton` Component

**Files:**
- Create: `frontend/src/components/Common/HeartButton.jsx`

**Interfaces:**
- Produces: `HeartButton` component accepting `isFavorited`, `onToggle`, `size` (default 20), `className`, `activeColorClass` (default `'text-primary'`), `inactiveColorClass` (default `'text-on-surface-variant'`).

- [ ] **Step 1: Write `HeartButton.jsx`**

Create `frontend/src/components/Common/HeartButton.jsx`:

```jsx
import React, { useState } from 'react';
import { IconHeart } from '@tabler/icons-react';

export default function HeartButton({
  isFavorited = false,
  onToggle,
  size = 20,
  className = '',
  activeColorClass = 'text-primary',
  inactiveColorClass = 'text-on-surface-variant hover:text-primary',
  ariaLabel,
}) {
  const [animatingState, setAnimatingState] = useState(null); // 'bounce' | 'recoil' | null

  const handleClick = (e) => {
    e.stopPropagation();
    
    // Trigger bounce if turning on, recoil if turning off
    setAnimatingState(isFavorited ? 'recoil' : 'bounce');

    if (onToggle) {
      onToggle(e);
    }
  };

  const handleAnimationEnd = () => {
    setAnimatingState(null);
  };

  const animationClass = animatingState === 'bounce' 
    ? 'animate-heart-bounce' 
    : animatingState === 'recoil' 
      ? 'animate-heart-recoil' 
      : '';

  const colorClass = isFavorited ? activeColorClass : inactiveColorClass;

  return (
    <button
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
      aria-label={ariaLabel || (isFavorited ? 'Remove from favorites' : 'Add to favorites')}
      className={`inline-flex items-center justify-center rounded-full p-1.5 transition-colors focus-visible:outline-none ${colorClass} ${className}`}
    >
      <IconHeart
        size={size}
        className={`transition-transform transform-gpu ${isFavorited ? 'fill-current' : ''} ${animationClass}`}
      />
    </button>
  );
}
```

- [ ] **Step 2: Commit changes**

```bash
git add frontend/src/components/Common/HeartButton.jsx
git commit -m "feat: create reusable animated HeartButton component"
```

---

### Task 3: Integrate `HeartButton` into Audio Players (`StickyPlayer` & `FullPlayerModal`)

**Files:**
- Modify: `frontend/src/components/StickyPlayer.jsx`
- Modify: `frontend/src/components/FullPlayerModal.jsx`

**Interfaces:**
- Consumes: `HeartButton` component from `frontend/src/components/Common/HeartButton.jsx`.

- [ ] **Step 1: Replace Heart icon button in `StickyPlayer.jsx`**

Import `HeartButton` and replace lines 350-356 in `frontend/src/components/StickyPlayer.jsx` with `<HeartButton isFavorited={isFav} onToggle={() => toggleFavorite?.(displayTrack.id || displayTrack._id)} size={18} />`.

- [ ] **Step 2: Replace Heart icon button in `FullPlayerModal.jsx`**

Import `HeartButton` and replace lines 462-467 in `frontend/src/components/FullPlayerModal.jsx` with `<HeartButton isFavorited={favoritedTrackIds?.includes(displayTrack.id || displayTrack._id)} onToggle={() => onToggleFavorite?.(displayTrack.id || displayTrack._id)} size={32} p-3 />`.

- [ ] **Step 3: Commit changes**

```bash
git add frontend/src/components/StickyPlayer.jsx frontend/src/components/FullPlayerModal.jsx
git commit -m "feat: integrate animated HeartButton into audio players"
```

---

### Task 4: Integrate `HeartButton` into Track Libraries (`LibraryPage`, `SyllabusLibrary`, `MobilePlayer`, `Dashboard`, `Favourites`)

**Files:**
- Modify: `frontend/src/components/LibraryPage.jsx`
- Modify: `frontend/src/components/SyllabusLibrary.jsx`
- Modify: `frontend/src/components/MobilePlayer.jsx`
- Modify: `frontend/src/components/Dashboard.jsx`
- Modify: `frontend/src/components/Favourites.jsx`

- [ ] **Step 1: Update `LibraryPage.jsx` & `SyllabusLibrary.jsx`**

Replace raw heart button in track rows with `<HeartButton />`.

- [ ] **Step 2: Update `MobilePlayer.jsx`, `Dashboard.jsx`, and `Favourites.jsx`**

Replace raw heart icon buttons with `<HeartButton />`.

- [ ] **Step 3: Commit changes**

```bash
git add frontend/src/components/LibraryPage.jsx frontend/src/components/SyllabusLibrary.jsx frontend/src/components/MobilePlayer.jsx frontend/src/components/Dashboard.jsx frontend/src/components/Favourites.jsx
git commit -m "feat: apply animated HeartButton across all library and dashboard surfaces"
```
