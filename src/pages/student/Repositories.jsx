import React from "react";

function Repositories() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-[14px] bg-shell dark:bg-dark-shell">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary dark:text-dark-primary">
          Repositories
        </h1>
      </div>
      <div className="text-muted dark:text-dark-muted">
        Your code repositories and version control integration for academic
        projects.
      </div>
    </div>
  );
}

export default Repositories;
