import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  CheckIcon,
  DotFilledIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { cn } from "../lib/utils";

/* ─────────────────────────────────────────────── */
/* Root */
export const DropdownMenuRoot = DropdownMenu.Root;

/* ─────────────────────────────────────────────── */
/* Trigger */
export const DropdownTrigger = React.forwardRef(
  ({ children, icon, showArrow = true, className, ...props }, ref) => (
    <DropdownMenu.Trigger asChild>
      <button
        ref={ref}
        className={cn(
          `flex ${icon || showArrow ? "w-full px-3 py-2" : "w-fit rounded-full flex items-center cursor-pointer justify-center"} group items-center  gap-2 rounded-md border  text-sm font-medium transition-colors`,
          " bg-transparent dark:focus:outline-none dark:bg-transparent dark:border-dark-light border-transparent  text-secondary dark:text-white",
          "hover:bg-card-2   dark:hover:bg-dark-card hover:text-primary",
          "",

          className,
        )}
        {...props}
      >
        {icon && (
          <span className="text-muted  dark:text-white group-hover:dark:text-white">
            {icon}
          </span>
        )}
        {children && (
          <span className="flex-1 truncate text-left text-gray-600 dark:text-gray-200 dark:group-hover:text-white">
            {children}
          </span>
        )}

        {showArrow && (
          <ChevronRightIcon className="h-4 w-4 dark:group-hover:text-white group-hover:rotate-90 transition-transform data-[state=open]:rotate-90" />
        )}
      </button>
    </DropdownMenu.Trigger>
  ),
);
DropdownTrigger.displayName = "DropdownTrigger";

/* ─────────────────────────────────────────────── */
/* Content */
export const DropdownContent = React.forwardRef(
  ({ children, className, sideOffset = 4, align = "start", ...props }, ref) => (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn(
"z-[10001] min-w-56 overflow-hidden rounded-md border p-1 shadow-2xl border-2",
          "bg-card dark:bg-dark-card dark:border-none border-default text-primary dark:tex-white",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  ),
);
DropdownContent.displayName = "DropdownContent";

/* ─────────────────────────────────────────────── */
/* Item */
const itemVariants = {
  default: "text-primary dark:text-white",
  danger: "text-error dark:text-red-700",
  success: "text-success dark:text-green-700",
  warning: "text-warning dark:text-orange-700",
};

export const DropdownItem = React.forwardRef(
  ({ children, icon, variant = "default", data, className, ...props }, ref) => (
    <DropdownMenu.Item
      ref={ref}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
        "cursor-pointer select-none   outline-none transition-colors",
        "hover:bg-accent-light  dark:hover:bg-dark-accent-light  data-highlighted:bg-accent-light",

        itemVariants[variant],
        className,
      )}
      {...props}
    >
      {icon && (
        <span className="h-4 w-4 text-muted dark:text-white">{icon}</span>
      )}
      <span className="flex-1">{children}</span>
      {data && <span className="text-dark-accent-light">{data}</span>}
    </DropdownMenu.Item>
  ),
);
DropdownItem.displayName = "DropdownItem";

/* ─────────────────────────────────────────────── */
/* Checkbox */
export const DropdownCheckboxItem = React.forwardRef(
  ({ children, checked, className, ...props }, ref) => (
    <DropdownMenu.CheckboxItem
      ref={ref}
      checked={checked}
      className={cn(
        "relative flex w-full items-center rounded-md py-2 pl-8 pr-2 text-sm",
        "cursor-pointer select-none outline-none transition-colors",
        "text-primary",
        "hover:bg-accent-light data-highlighted:bg-accent-light",
        "data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <DropdownMenu.ItemIndicator className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <CheckIcon className="h-4 w-4" />
      </DropdownMenu.ItemIndicator>
      {children}
    </DropdownMenu.CheckboxItem>
  ),
);
DropdownCheckboxItem.displayName = "DropdownCheckboxItem";

/* ─────────────────────────────────────────────── */
/* Radio */
export const DropdownRadioGroup = DropdownMenu.RadioGroup;

export const DropdownRadioItem = React.forwardRef(
  ({ children, className, ...props }, ref) => (
    <DropdownMenu.RadioItem
      ref={ref}
      className={cn(
        "relative flex w-full items-center transition-all dark:text-dark-primary dark:hover:bg-dark-accent-light rounded-md py-2 pl-8 pr-2 text-sm",
        "cursor-pointer select-none outline-none transition-colors",
        "text-primary",
        "hover:bg-accent-light data-highlighted:bg-accent-light dark:data-highlighted:bg-dark-card-2",
        className,
      )}
      {...props}
    >
      <DropdownMenu.ItemIndicator className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <DotFilledIcon className="h-3.5 w-3.5" />
      </DropdownMenu.ItemIndicator>
      {children}
    </DropdownMenu.RadioItem>
  ),
);
DropdownRadioItem.displayName = "DropdownRadioItem";

/* ─────────────────────────────────────────────── */
/* Submenu */
export const DropdownSub = DropdownMenu.Sub;

export const DropdownSubTrigger = React.forwardRef(
  ({ children, icon, className, ...props }, ref) => (
    <DropdownMenu.SubTrigger
      ref={ref}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
        "cursor-pointer select-none outline-none transition-colors",
        "text-primary",
        " group  dark:text-white  dark:data-highlighted:bg-dark-accent-light dark:hover:text-white   data-highlighted:bg-accent-light",
        className,
      )}
      {...props}
    >
      {icon && <span className="h-4 w-4 text-muted">{icon}</span>}
      <span className="flex-1">{children}</span>
      <ChevronRightIcon className="h-4 w-4 group-hover:rotate-90" />
    </DropdownMenu.SubTrigger>
  ),
);
DropdownSubTrigger.displayName = "DropdownSubTrigger";

export const DropdownSubContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenu.Portal>
      <DropdownMenu.SubContent
        ref={ref}
        className={cn(
"z-[10001] min-w-48 rounded-md border p-1 shadow-card shadow-2xl border-2",
          "bg-card dark:bg-dark-card dark:border-none border-default text-primary",
          className,
        )}
        {...props}
      />
    </DropdownMenu.Portal>
  ),
);
DropdownSubContent.displayName = "DropdownSubContent";

/* ─────────────────────────────────────────────── */
/* Label */
export const DropdownLabel = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <DropdownMenu.Label
      ref={ref}
      className={cn(
        "px-3 py-1 text-xs font-semibold uppercase text-muted dark:text-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </DropdownMenu.Label>
  ),
);
DropdownLabel.displayName = "DropdownLabel";

/* ─────────────────────────────────────────────── */
/* Separator */
export const DropdownSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenu.Separator
      ref={ref}
      className={cn("my-1 h-px bg-default dark:bg-dark-badge", className)}
      {...props}
    />
  ),
);
DropdownSeparator.displayName = "DropdownSeparator";
export const DropdownShortcut = ({ className, ...props }) => (
  <span
    className={cn(
      "ml-auto text-xs tracking-widest dark:text-primary text-dark-primary",
      className,
    )}
    {...props}
  />
);
DropdownShortcut.displayName = "DropdownShortcut";
