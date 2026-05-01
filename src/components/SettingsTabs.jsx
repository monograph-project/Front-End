import { cn } from "../lib/utils";

export default function SettingsTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-primary text-white dark:bg-dark-primary dark:text-dark-shell"
                : "border border-default bg-shell text-primary hover:bg-card-2 dark:border-dark-default dark:bg-dark-shell dark:text-dark-primary dark:hover:bg-dark-card-2",
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
