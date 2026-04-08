import React from "react";

function TableHeader({ headerData }) {
  return (
    <thead className="bg-gray-50 dark:border-gray-800 dark:hover:border-gray-800 dark:bg-gray-900">
      <tr>
        {headerData?.map((header, index) => (
          <th
            key={index}
            className="px-5  leading-snug py-2.5 text-right text-xs font-medium text-gray-500 dark:text-gray-100 uppercase whitespace-nowrap"
          >
            {header.title}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default TableHeader;
