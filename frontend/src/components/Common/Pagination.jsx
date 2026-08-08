import React from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 12,
  onPageChange
}) {
  if (totalPages <= 1) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-xs font-medium text-on-surface-variant">
        Showing <span className="font-bold text-on-surface">{startItem}</span> to{' '}
        <span className="font-bold text-on-surface">{endItem}</span> of{' '}
        <span className="font-bold text-on-surface">{totalItems}</span> items
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-outline-variant/40 text-on-surface-variant hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <IconChevronLeft size={18} />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-bold transition-all ${
              page === currentPage
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface border border-outline-variant/40 text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-outline-variant/40 text-on-surface-variant hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <IconChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
