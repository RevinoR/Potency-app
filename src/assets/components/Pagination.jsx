// Pagination.jsx
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages.filter((page, index, array) => array.indexOf(page) === index);
  };

  return (
    <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
      <div>
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2 py-1 disabled:opacity-50"
        >
          &lt;
        </button>
        
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`px-2 py-1 ${
              page === currentPage ? 'font-bold text-black' : ''
            }`}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-2 py-1 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
