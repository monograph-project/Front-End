import React from "react";
import Icon from "./Icon";
import IC from "./IC";

function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  totalItems = 0,
  showPageSize = true,
  className = "",
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Page size selector */}
      {showPageSize && (
        <div className="flex items-center gap-2 text-xs text-muted dark:text-dark-muted">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageChange(1, parseInt(e.target.value))}
            className="h-7 px-2 py-1 bg-input dark:bg-dark-input border border-default dark:border-dark-default rounded-md text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-muted dark:text-dark-muted px-2">
        Page {currentPage} of {totalPages} • {totalItems} total items
      </div>

      {/* Pages */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1, pageSize)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-default dark:border-dark-default hover:bg-card hover:dark:bg-dark-card disabled:opacity-40 disabled:hover:bg-transparent transition-all text-muted dark:text-dark-muted hover:text-primary dark:hover:text-dark-primary"
        >
          <Icon d={IC.chevLeft} className="w-4 h-4 stroke-current" />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="flex items-center justify-center w-8 h-8 text-xs text-muted dark:text-dark-muted">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page, pageSize)}
                className={`flex items-center justify-center w-8 h-8 rounded-md font-medium transition-all ${
                  currentPage === page
                    ? "bg-primary text-primary-light dark:bg-dark-primary dark:text-primary-light border border-primary dark:border-dark-primary shadow-sm"
                    : "border border-default dark:border-dark-default hover:bg-card hover:dark:bg-dark-card text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary"
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1, pageSize)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-default dark:border-dark-default hover:bg-card hover:dark:bg-dark-card disabled:opacity-40 disabled:hover:bg-transparent transition-all text-muted dark:text-dark-muted hover:text-primary dark:hover:text-dark-primary"
        >
          <Icon d={IC.chevRight} className="w-4 h-4 stroke-current" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;

