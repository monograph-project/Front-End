import React from "react";

function TableColumn({ children, className, colSpan }) {
  return (
    <td
      className={`${className ? className : ""} px-5 py-3 text-sm text-primary dark:text-dark-primary align-middle  whitespace-nowrap `}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}

export default TableColumn;
