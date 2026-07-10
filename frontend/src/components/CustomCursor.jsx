import React from 'react';

export default function CustomCursor() {
  return (
    <style>{`
      body, 
      a, 
      button, 
      input, 
      textarea, 
      select, 
      label, 
      iframe,
      .cursor-pointer,
      [role="button"] {
        cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cpath d='M3,3 L3,20 L8,15 L12,24 L14.5,23 L10.5,14 L16,14 Z' fill='white' stroke='black' stroke-width='1.5' stroke-linejoin='round'/%3E%3Ccircle cx='3' cy='3' r='3.5' fill='red'/%3E%3C/svg%3E") 3 3, default !important;
      }
    `}</style>
  );
}
