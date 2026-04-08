import React from "react";

function Table({ children, className }) {
  return (
    <div className="bg-white dark:bg-gray-900 dark:border-gray-800 rounded-lg border border-gray-200/60 overflow-hidden">
      {/* Scroll container (main behavior) - allow wrap and avoid unnecessary horizontal scroll */}
      <div className="overflow-auto no-scrollbar">
        <table
          className={`min-w-full divide-y divide-gray-200/50 table-auto ${className || ""}`}
        >
          {children}
        </table>
      </div>
    </div>
  );
}

export default Table;
