# Heart Icon Bounce Animation Design Spec

## Overview
Enhance the user experience across NEETBANDV2 track views by adding a smooth, tactile CSS spring-elastic bounce animation whenever a user clicks the heart (favorite/unfavorite) icon.

## Animation Specifications

### 1. Keyframe Definitions
Added to global styles (`frontend/src/index.css` or `frontend/src/styles/`):

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

### 2. Component Integration & State Triggering
Create a reusable `<HeartButton />` component in `frontend/src/components/Common/HeartButton.jsx` (or reusable handler/component):
- Receives `isFavorited`, `onToggle`, `size`, `className`, `ariaLabel`.
- Maintains a brief `isAnimating` trigger state on click so the animation runs smoothly every time the user clicks to favorite or unfavorite.
- Replaces raw `<IconHeart>` buttons in:
  - `frontend/src/components/StickyPlayer.jsx`
  - `frontend/src/components/FullPlayerModal.jsx`
  - `frontend/src/components/LibraryPage.jsx`
  - `frontend/src/components/SyllabusLibrary.jsx`
  - `frontend/src/components/MobilePlayer.jsx`
  - `frontend/src/components/Dashboard.jsx`
  - `frontend/src/components/Favourites.jsx`

## Testing & Verification
- Verify animation plays smoothly on clicking heart icons across all player views.
- Ensure no layout shifts occur during scale animations (using `transform` property).
- Confirm state accessibility (`aria-label`) is preserved.
