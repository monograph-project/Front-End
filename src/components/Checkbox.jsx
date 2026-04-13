import * as RadixCheckbox from "@radix-ui/react-checkbox";

const Checkbox = ({
  id,
  label = "",
  checked,
  defaultChecked,
  onChange,
  className = "",
  disabled = false,
  children,
  ...props
}) => {
  const handleCheckedChange = (val) => {
    const isChecked = val === "indeterminate" ? false : !!val;
    if (typeof onChange === "function") {
      onChange({ target: { checked: isChecked } });
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <RadixCheckbox.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        className={`w-5 h-5 rounded-md border flex items-center justify-center
          border-default dark:border-dark-default
          bg-white dark:bg-dark-shell
          data-[state=checked]:bg-primary
          data-[state=checked]:border-primary
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        {...props}
      >
        <RadixCheckbox.Indicator>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>

      {/* Label */}
      {(label || children) && (
        <label
          htmlFor={id}
          className={`text-sm select-none cursor-pointer
            text-gray-700 dark:text-gray-300
            ${disabled ? "cursor-not-allowed" : ""}
          `}
        >
          {label}
          {children}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
