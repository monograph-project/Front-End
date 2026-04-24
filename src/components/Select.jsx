import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";

const Select = ({
  value,
  defaultValue,
  onChange,
  placeholder = "Select...",
  options = [],
  label,
  className = "",
  disabled = false,
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-[11px] font-semibold text-primary dark:text-dark-primary">
          {label}
        </label>
      )}

      <RadixSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onChange}
        disabled={disabled}
      >
        <RadixSelect.Trigger
          className={`
            inline-flex h-8 items-center justify-between rounded-lg px-3 text-xs
            bg-input dark:bg-dark-input
            border border-default dark:border-dark-default
            focus:border-accent dark:focus:border-dark-accent
            transition-colors
            data-[placeholder]:text-muted dark:data-[placeholder]:text-dark-muted
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDownIcon />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
className="overflow-hidden w-[var(--radix-select-trigger-width)] rounded-md bg-input dark:bg-dark-input border border-default dark:border-dark-default z-[10001] shadow-2xl border-2"
            position="popper"
          >
            <RadixSelect.ScrollUpButton className="flex items-center justify-center h-6">
              <ChevronUpIcon />
            </RadixSelect.ScrollUpButton>

            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </RadixSelect.Viewport>

            <RadixSelect.ScrollDownButton className="flex items-center justify-center h-6">
              <ChevronDownIcon />
            </RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
};

const SelectItem = React.forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <RadixSelect.Item
        ref={ref}
        {...props}
        className="relative flex items-center h-8 px-8 text-xs rounded cursor-pointer text-primary dark:text-dark-primary data-highlighted:bg-primary/5 dark:data-highlighted:bg-dark-primary/10 data-disabled:opacity-50 data-disabled:pointer-events-none"
      >
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>

        <RadixSelect.ItemIndicator className="absolute left-2">
          <CheckIcon />
        </RadixSelect.ItemIndicator>
      </RadixSelect.Item>
    );
  },
);

SelectItem.displayName = "SelectItem";

export default Select;
