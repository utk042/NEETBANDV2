import React from 'react';
import { IconX, IconCrownFilled } from '@tabler/icons-react';

export default function PremiumModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80" onClick={onClose}></div>
      
      {/* Modal Card */}
      <div className="relative bg-surface p-8 rounded-3xl w-full max-w-md border border-outline/20 shadow-xl text-center transition-all duration-300">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Close modal"
        >
          <IconX size={24} className="block" />
        </button>

        <div className="w-16 h-16 bg-primary/10 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-6">
          <IconCrownFilled size={36} className="text-primary" />
        </div>

        <h3 className="font-headline-md text-2xl text-on-surface mb-3 font-bold">Premium Study Song</h3>
        <p className="font-body-md text-on-surface-variant text-base mb-8 max-w-sm mx-auto">
          Unlock this track and over 2,000+ curriculum-aligned study beats, offline downloads, and mock quizzes with Premium Scholar.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-label-md py-4 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] active:translate-y-[1px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Upgrade to Premium
          </button>
          <button 
            onClick={onClose}
            className="w-full border border-[var(--border-floating-card)] text-on-surface font-label-md py-4 rounded-xl hover:bg-surface-container transition-all active:scale-[0.98] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
