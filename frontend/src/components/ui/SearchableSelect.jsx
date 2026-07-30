import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function SearchableSelect({ options, value, onChange, placeholder, className, creatable = false, hideClearOption = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({});
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Compute fixed position from trigger's bounding rect
  const updateDropdownPosition = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const dropdownHeight = 260;
    const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;

    setDropdownStyle({
      position: 'fixed',
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 99999,
      ...(openUpward
        ? { bottom: `${viewportHeight - rect.top}px`, top: 'auto' }
        : { top: `${rect.bottom + 4}px`, bottom: 'auto' }),
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideWrapper = wrapperRef.current && !wrapperRef.current.contains(event.target);
      const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
      
      if (clickedOutsideWrapper && clickedOutsideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  // Recompute on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    const handler = () => updateDropdownPosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value) || (creatable && value ? { value, label: value } : null);
  const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
  const exactMatch = options.find(opt => opt.label.toLowerCase() === searchTerm.trim().toLowerCase());
  const showCreateOption = creatable && searchTerm.trim() !== '' && !exactMatch;

  const handleToggle = () => {
    setSearchTerm('');
    setIsOpen(prev => !prev);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger */}
      <div
        className={`${className} cursor-pointer flex justify-between items-center`}
        onClick={handleToggle}
      >
        <span className={selectedOption ? 'text-on-surface' : 'text-on-surface-variant/40 line-clamp-1'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown — use portal to completely escape any CSS containing blocks (like transform from animate-in) */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-surface border border-outline-variant/40 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Search */}
          <div className="p-2 border-b border-outline-variant/20 bg-surface">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full px-3 py-2 bg-surface-variant/20 border border-outline-variant/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface placeholder:text-on-surface-variant/40"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options */}
          <div className="overflow-y-auto max-h-48 no-scrollbar">
            {/* Clear / placeholder option */}
            {!hideClearOption && (
              <div
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/10 ${!value ? 'bg-primary/5 text-primary font-medium' : 'text-on-surface'}`}
                onMouseDown={(e) => { e.preventDefault(); onChange(''); setIsOpen(false); }}
              >
                {placeholder}
              </div>
            )}

            {/* Create new option */}
            {showCreateOption && (
              <div
                className="px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/10 text-primary font-medium flex items-center gap-2"
                onMouseDown={(e) => { e.preventDefault(); onChange(searchTerm.trim()); setIsOpen(false); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14m-7-7h14" />
                </svg>
                Create "{searchTerm.trim()}"
              </div>
            )}

            {/* Matched options */}
            {filteredOptions.length > 0
              ? filteredOptions.map(opt => (
                  <div
                    key={opt.value}
                    className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/10 ${value === opt.value ? 'bg-primary/5 text-primary font-medium' : 'text-on-surface'}`}
                    onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }}
                  >
                    {opt.label}
                  </div>
                ))
              : !showCreateOption && (
                  <div className="px-4 py-3 text-sm text-on-surface-variant text-center">
                    No results found
                  </div>
                )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
