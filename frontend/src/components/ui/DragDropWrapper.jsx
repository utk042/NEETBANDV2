import React, { useState, useCallback } from 'react';

export default function DragDropWrapper({ onFileDrop, children, className = "" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter - 1 === 0) {
      setIsDragging(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
       setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileDrop(file);
      e.dataTransfer.clearData();
    }
  }, [onFileDrop]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative transition-all duration-200 ${isDragging ? 'ring-2 ring-primary bg-primary/5 rounded-xl scale-[1.01]' : ''} ${className}`}
    >
      {children}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-surface/60 backdrop-blur-[2px] border-2 border-dashed border-primary pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <span className="text-primary font-bold text-sm bg-surface px-4 py-2 rounded-full shadow-lg border border-primary/20">Drop file here to upload</span>
          </div>
        </div>
      )}
    </div>
  );
}
