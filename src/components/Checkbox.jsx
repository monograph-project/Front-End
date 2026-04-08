const Checkbox = ({
  id,
  label = "Checkbox",
  checked,
  onChange,
  className = "",
  disabled = false,
}) => {
  

  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        type="checkbox"
        disabled={disabled}
        className="peer hidden"
        checked={checked}
        onChange={onChange}
      />

      <label
        htmlFor={id}
        className={`flex items-center cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <svg viewBox="0 0 200 200" className="w-6 h-6" fill="none">
          <rect
            width="200"
            height="200"
            className="
              fill-gray-200/40 dark:fill-gray-700
              stroke-purple-600
              stroke-[20]
              [stroke-dasharray:800]
              [stroke-dashoffset:800]
              transition-all duration-500
              peer-checked:[stroke-dashoffset:0]
            "
          />

          <path
            d="M52 111.018L76.9867 136L149 64"
            className="
              stroke-purple-600
              stroke-[15]
              fill-none
              [stroke-dasharray:172]
              [stroke-dashoffset:172]
              transition-all duration-500
              peer-checked:[stroke-dashoffset:0]
            "
          />
        </svg>

        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 select-none">
          {label}
        </span>
      </label>
    </div>
  );
};

export default Checkbox;
