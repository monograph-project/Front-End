import React from "react";

function TableRow({ children, onClick }) {
  return (
    <tr
      onClick={onClick}
      className=" bg-white dark:hover:border-gray-800 dark:bg-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-800/90 cursor-pointer align-top"
    >
      {children}
    </tr>
  );
}

export default TableRow;
