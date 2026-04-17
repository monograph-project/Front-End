import React from "react";

function Tasks() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-[14px] bg-shell dark:bg-dark-shell">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary dark:text-dark-primary">
          Tasks
        </h1>
      </div>
      <div className="text-muted dark:text-dark-muted">
        Personal task manager for assignments, deadlines, and study schedules.
      </div>
    </div>
  );
}

export default Tasks;
