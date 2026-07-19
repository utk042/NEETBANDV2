import React, { useState, useEffect, useRef } from 'react';

export default function SearchableSelect({ options, value, onChange, placeholder, className, creatable = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value) || (creatable && value ? { value, label: value } : null);
  const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const exactMatch = options.find(opt => opt.label.toLowerCase() === searchTerm.trim().toLowerCase());
  const showCreateOption = creatable && searchTerm.trim() !== '' && !exactMatch;

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        className={`${className} cursor-pointer flex justify-between items-center`}
        onClick={() => { setIsOpen(!isOpen); setSearchTerm(''); }}
      >
        <span className={selectedOption ? "text-on-surface" : "text-on-surface-variant/40 line-clamp-1"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-outline-variant/40 rounded-xl shadow-lg flex flex-col overflow-hidden">
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
          <div className="overflow-y-auto max-h-48">
            <div 
              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/10 ${!value ? 'bg-primary/5 text-primary font-medium' : 'text-on-surface'}`}
              onClick={() => { onChange(''); setIsOpen(false); }}
            >
              {placeholder}
            </div>
            
            {showCreateOption && (
              <div
                className="px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/10 text-primary font-medium flex items-center gap-2"
                onClick={() => { onChange(searchTerm.trim()); setIsOpen(false); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
                Create "{searchTerm.trim()}"
              </div>
            )}

            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
              <div
                key={opt.value}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/10 ${value === opt.value ? 'bg-primary/5 text-primary font-medium' : 'text-on-surface'}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            )) : !showCreateOption && (
              <div className="px-4 py-3 text-sm text-on-surface-variant text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
