import React, { useState, useEffect, useRef } from 'react';
import { IconChevronDown, IconCheck } from '@tabler/icons-react';

/**
 * CustomSelect Component
 * Elegant, custom-styled popover dropdown menu that replaces native HTML select boxes.
 * Eliminates browser native double arrow glitches and provides smooth theme integration.
 */
export default function CustomSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option...',
  name,
  id,
  disabled = false,
  required = false,
  className = '',
  dropdownClassName = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options array into [{ label, value, disabled }]
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        label: opt.label !== undefined ? opt.label : opt.value,
        value: opt.value !== undefined ? opt.value : opt.label,
        disabled: !!opt.disabled
      };
    }
    return { label: String(opt), value: opt, disabled: false };
  });

  const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation support
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (optValue) => {
    if (onChange) {
      const syntheticEvent = {
        target: { name: name || id || 'select', id, value: optValue },
        value: optValue
      };
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Hidden input for HTML form submission */}
      {name && (
        <input 
          type="hidden" 
          name={name} 
          id={id} 
          value={value || ''} 
          required={required} 
        />
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={id ? `${id}-button` : undefined}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full px-4 py-3 rounded-xl bg-surface-container border border-[var(--border-floating-card)] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body-md flex items-center justify-between gap-2 cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
        } ${className}`}
      >
        <span className={`truncate text-left ${selectedOption ? 'text-on-surface font-medium' : 'text-on-surface-variant/70'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <IconChevronDown 
          size={18} 
          className={`transition-transform duration-200 shrink-0 text-on-surface-variant/70 ${isOpen ? 'rotate-180 text-primary' : ''}`} 
        />
      </button>

      {/* Options Menu */}
      {isOpen && (
        <ul
          role="listbox"
          className={`absolute top-full left-0 right-0 mt-2 bg-surface-container border border-[var(--border-floating-card)] rounded-xl shadow-xl z-50 py-1.5 outline-none max-h-60 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-150 ${dropdownClassName}`}
        >
          {normalizedOptions.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-on-surface-variant/60 text-center">
              No options available
            </li>
          ) : (
            normalizedOptions.map((opt, idx) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <li
                  key={idx}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={opt.disabled ? -1 : 0}
                  onClick={() => !opt.disabled && handleSelect(opt.value)}
                  onKeyDown={(e) => {
                    if (!opt.disabled && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSelect(opt.value);
                    }
                  }}
                  className={`px-4 py-2.5 text-sm font-body-md flex items-center justify-between cursor-pointer transition-colors outline-none truncate ${
                    opt.disabled 
                      ? 'opacity-40 cursor-not-allowed' 
                      : isSelected 
                        ? 'bg-primary/10 text-primary font-bold' 
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-primary/5 focus-visible:bg-primary/5'
                  }`}
                  title={opt.label}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <IconCheck size={16} className="text-primary shrink-0 ml-2" />}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
