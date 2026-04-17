import React from "react";

function Table({ children, className }) {
  return (
    <div className="bg-white dark:bg-dark-shell border  rounded-lg border-default dark:border-dark-default  overflow-hidden">
      {/* Scroll container (main behavior) - allow wrap and avoid unnecessary horizontal scroll */}
      <div className="overflow-auto no-scrollbar">
        <table className={`min-w-full  table-auto ${className || ""}`}>
          {children}
        </table>
      </div>
    </div>
  );
}

export default Table;
