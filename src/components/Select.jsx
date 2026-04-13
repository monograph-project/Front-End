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
        <label className="text-sm text-gray-600 dark:text-gray-300">
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
          className={`inline-flex h-9 items-center justify-between rounded-md px-3 text-sm
          bg-white dark:bg-dark-shell
          border border-default dark:border-dark-default
          text-gray-700 dark:text-gray-200
           outline-none
          data-placeholder:text-gray-400
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDownIcon />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        {/* Dropdown */}
        <RadixSelect.Portal>
          <RadixSelect.Content
            className="overflow-hidden  w-[var(--radix-select-trigger-width)] rounded-md bg-white dark:bg-dark-shell  border border-default dark:border-dark-default"
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
  ({ children, className, ...props }, ref) => {
    return (
      <RadixSelect.Item
        ref={ref}
        {...props}
        className={`relative flex items-center h-8 px-8 text-sm rounded cursor-pointer
        text-gray-700 dark:text-gray-200
        data-highlighted:bg-gray-100 dark:data-highlighted:bg-gray-700
        data-disabled:opacity-50 data-disabled:pointer-events-none
        ${className}
      `}
      >
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>

        <RadixSelect.ItemIndicator className="absolute left-2">
          <CheckIcon />
        </RadixSelect.ItemIndicator>
      </RadixSelect.Item>
    );
  },
);

export default Select;
