import React from "react";

function TableBody({ children }) {
  return (
    <tbody className="bg-white dark:bg-dark-shell divide-y divide-default  dark:divide-dark-default ">
      {children}
    </tbody>
  );
}

export default TableBody;
