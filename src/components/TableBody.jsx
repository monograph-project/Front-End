import React from "react";

function TableBody({ children }) {
  return (
    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200/50  dark:divide-gray-800 ">
      {children}
    </tbody>
  );
}

export default TableBody;
