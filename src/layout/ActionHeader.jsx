import IC from "../components/IC";
import Icon from "../components/Icon";

export default function ActionHeader() {
  return (
    <div className="flex items-center shrink-0 border-b border-default dark:border-dark-default gap-2 bg-card dark:bg-dark-card px-2 sm:px-3 md:px-5 py-2">
      {/* Status indicator - always visible */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon
          d={IC.check}
          className="dark:stroke-success-dark stroke-success stroke-[2.5] size-3 sm:size-[13px] shrink-0"
        />
        <span className="text-[10px] sm:text-xs dark:text-success-dark text-success font-medium truncate">
          Last updated now
        </span>
      </div>

      {/* Action buttons - hidden on mobile, show as icons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Customize Widget - hidden on small screens */}
        <button className="hidden sm:flex items-center text-secondary dark:text-dark-secondary gap-1.5 rounded-lg border dark:border-dark-default border-default text-[10px] sm:text-xs cursor-pointer px-2 sm:px-3 py-1.5">
          <Icon
            d={IC.customize}
            className="size-3 sm:size-[12px] stroke-[1.5]"
          />
          <span className="hidden md:inline">Customize Widget</span>
        </button>

        {/* Imports */}
        <button className="hidden sm:flex items-center text-secondary dark:text-dark-secondary gap-1.5 rounded-lg border dark:border-dark-default border-default text-[10px] sm:text-xs cursor-pointer px-2 sm:px-3 py-1.5">
          <Icon d={IC.import} className="size-3 sm:size-[12px] stroke-[1.5]" />
          <span className="hidden lg:inline">Imports</span>
          <Icon
            d={IC.chevDown}
            className="stroke-2 stroke-muted dark:stroke-dark-muted size-2.5 sm:size-[11px]"
          />
        </button>

        {/* Mobile action buttons */}
        <button
          className="sm:hidden p-1.5 rounded-lg flex items-center cursor-pointer text-secondary dark:text-dark-secondary hover:bg-hover dark:hover:bg-dark-hover"
          aria-label="Customize"
        >
          <Icon d={IC.customize} className="size-4 stroke-[1.5]" />
        </button>
        <button
          className="sm:hidden p-1.5 rounded-lg flex items-center cursor-pointer text-secondary dark:text-dark-secondary hover:bg-hover dark:hover:bg-dark-hover"
          aria-label="Imports"
        >
          <Icon d={IC.import} className="size-4 stroke-[1.5]" />
        </button>

        {/* Exports - primary button */}
        <button className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-purple-800 text-white text-[10px] sm:text-xs cursor-pointer px-2 sm:px-3 py-1.5 border-none">
          <Icon
            d={IC.export}
            size={10}
            stroke="#fff"
            strokeWidth={2}
            className="shrink-0"
          />
          <span className="hidden sm:inline">Exports</span>
          <Icon
            d={IC.chevDown}
            size={9}
            stroke="#fff"
            strokeWidth={2}
            className="hidden sm:inline"
          />
        </button>
      </div>
    </div>
  );
}
