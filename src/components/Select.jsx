import { useState, useEffect } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import { useClickOutSide } from "../hook/useClickOutSide";

function Select({
  label,
  error,
  id,
  options,
  register,
  name,
  defaultSelected,
  onChange,
  value,
  setValue,
  showIcon = false,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value || defaultSelected || "");
  const [position, setPosition] = useState("bottom");

  const ref = useClickOutSide(() => setIsOpen(false));

  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) return;
    if (!ref?.current) return;

    const rect = ref.current.getBoundingClientRect();
    const dropdownHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setPosition("top");
    } else {
      setPosition("bottom");
    }
  }, [isOpen, ref]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const handleSelect = (selectedValue) => {
    setSelected(selectedValue);
    setIsOpen(false);
    if (setValue) setValue(name, selectedValue);
    if (onChange) {
      if (name) onChange({ target: { name, value: selectedValue } });
      else onChange(selectedValue);
    }
  };

  const getSelectedLabel = () => {
    if (!selected) return defaultSelected || "نه دی انتخاب شوی";
    const option = options?.find((opt) => opt.value === selected);
    return option ? option.label || option.value : selected;
  };

  return (
    <div className="relative w-full" ref={ref}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-gray-500 dark:text-gray-300"
        >
          {label}
        </label>
      )}

      {/* Select Box */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((v) => !v);
          }
        }}
        className={`w-full mt-1 capitalize text-sm border rounded-sm pr-3 pl-4 py-2 transition duration-300 ease cursor-pointer flex justify-between items-center
          ${
            disabled
              ? "bg-gray-100 dark:bg-transparent dark:border-gray-800 text-gray-400 border-gray-200 cursor-not-allowed"
              : "border-gray-200/60 dark:bg-transparent dark:border-gray-800 bg-transparent text-slate-700 dark:text-slate-200 hover:border-brand-500 dark:hover:border-gray-700"
          }`}
      >
        <div className="flex items-center gap-2 truncate">
          {showIcon && (
            <span className="text-slate-500">
              {options?.find((opt) => opt.value === selected)?.icon || ""}
            </span>
          )}
          <span className="">{getSelectedLabel()}</span>
        </div>

        <RiArrowDownSLine
          className={`${isOpen ? "rotate-180" : ""} transition-all duration-200`}
        />
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div
          className={`absolute scrollbar-theme z-50 w-full bg-white dark:border-gray-800 dark:bg-gray-900 border border-slate-200 rounded-sm shadow-lg py-2
            ${position === "top" ? "bottom-full mb-1" : "top-full mt-1"}
          `}
        >
          <div className="max-h-40 px-2 overflow-y-auto">
            {options?.length > 0 ? (
              options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(option.value)}
                  className={`group cursor-pointer px-2 py-2 dark:text-slate-200  text-sm capitalize hover:bg-brand-100 dark:hover:bg-gray-800
                    ${selected === option.value ? "bg-slate-100 dark:bg-gray-900" : ""}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {showIcon && (
                      <span className="text-slate-500 group-hover:text-brand-700">
                        {option.icon || ""}
                      </span>
                    )}
                    {option.label || option.value}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-slate-400 dark:text-slate-200 text-center py-2">
                هیچ گزینه‌ای موجود نیست
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hidden select for form registration */}
      {register ? (
        <select
          {...register}
          name={name}
          value={selected}
          style={{ display: "none" }}
        >
          {options?.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label || option.value}
            </option>
          ))}
        </select>
      ) : null}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default Select;
