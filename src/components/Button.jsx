import React from "react";

function Button({
  onClick,
  children,
  icon,
  type = "button",
  className = "",
  disabled = false,
  variant = "primary",
  fullWidth = false,
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold min-h-9 transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 " +
    "dark:focus-visible:ring-blue-400/20 disabled:pointer-events-none disabled:opacity-55 disabled:cursor-not-allowed";

  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    tertiary: "btn-tertiary",
    ghost: "btn-ghost",
    danger:
      "rounded-xl px-5 py-2.5 text-white bg-(--color-light-error-text) hover:opacity-95 active:opacity-90 " +
      "dark:bg-(--color-dark-error-border)",
  };

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={[
        base,
        variants[variant] ?? variants.primary,
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default Button;
