import { cn } from "../lib/utils";

export default function SettingsSectionCard({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}) {
  return (
    <section
      className={cn(
        "rounded-md border border-default bg-shell dark:border-dark-default dark:bg-dark-shell",
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-default px-5 py-4 dark:border-dark-default md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-default bg-shell text-primary dark:border-dark-default dark:bg-dark-shell dark:text-dark-primary">
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
          <div>
            <h2 className="text-base font-semibold text-primary dark:text-dark-primary">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-secondary dark:text-dark-secondary">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action}
      </div>

      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  );
}
