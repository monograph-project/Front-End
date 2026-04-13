import React from "react";

function TableRow({ children, onClick }) {
  return (
    <tr
      onClick={onClick}
      className=" bg-white dark:hover:border-gray-800 dark:bg-dark-shell hover:dark:bg-dark-app  hover:bg-gray-50/50 cursor-pointer align-top"
    >
      {children}
    </tr>
  );
}

export default TableRow;
