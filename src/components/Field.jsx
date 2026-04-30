import { Fragment, useState } from "react";
import Icon from "./Icon";
function Field({
  register,
  id,
  label,
  type = "text",
  placeholder,
  error,
  required,
  onChange,
  value,
  iconD,
  autoComplete,
  children,
  ...rest
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPw ? "text" : "password") : type;
  return (
    <Fragment>
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-[11px] font-semibold text-primary dark:text-dark-primary">
            {label}
          </label>
        )}
        <div className="relative">
          {iconD && (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
              <Icon
                d={iconD}
                className="size-3 stroke-muted dark:stroke-dark-muted stroke-[1.5]"
              />
            </span>
          )}
          {children ? (
            children
          ) : (
            <input
              id={id}
              required={required}
              type={resolvedType}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              autoComplete={autoComplete}
              {...register}
              {...rest}
              className={`
                w-full h-8 text-xs rounded-lg outline-none
                pl-3 pr-3 py-1.5
                text-primary dark:text-dark-primary
                placeholder:text-muted dark:placeholder:text-dark-muted
                bg-input dark:bg-transparent
                border border-default dark:border-dark-default
                focus:border-accent 
                dark:focus:border-white
                transition-colors
                ${iconD ? "pl-7" : ""}
                ${isPassword ? "!pr-8" : ""}
              `}
            />
          )}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-muted dark:text-dark-muted hover:text-secondary dark:hover:text-dark-secondary transition-colors"
            >
              <Icon
                d={
                  showPw
                    ? "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z"
                    : "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                }
                className="size-3.5 stroke-[1.5]"
              />
            </button>
          )}
        </div>
        {error && (
          <span className="text-[10px] font-medium text-error leading-none">
            {error}
          </span>
        )}
      </div>
    </Fragment>
  );
}
export default Field;
