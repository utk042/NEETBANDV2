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
  iconClassName = '',
}) {
  const [animatingState, setAnimatingState] = useState(null); // 'bounce' | 'recoil' | null

  const handleClick = (e) => {
    e.stopPropagation();
    
    // Trigger bounce if turning on (or currently unfavorited), recoil if turning off
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
      className={`inline-flex items-center justify-center rounded-full p-1.5 transition-colors focus-visible:outline-none cursor-pointer ${colorClass} ${className}`}
    >
      <IconHeart
        size={size}
        className={`transition-transform transform-gpu ${isFavorited ? 'fill-current' : ''} ${animationClass} ${iconClassName}`}
      />
    </button>
  );
}
