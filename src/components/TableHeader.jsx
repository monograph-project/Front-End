import React from "react";

function TableHeader({ headerData }) {
  return (
    <thead className=" bg-shell dark:bg-dark-shell border-default dark:border-dark-default dark:hover:border-dark-default">
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
