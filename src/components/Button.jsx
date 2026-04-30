import React from "react";

function Button({
  onClick,
  children,
  icon,
  type = "button",
  className = "",
  disabled = false,
  ...rest
}) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`flex items-center justify-center cursor-pointer gap-2 px-2 py-1 bg-primary text-white rounded-md font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default Button;
