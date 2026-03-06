import { forwardRef, useEffect, useState, useCallback } from "react";

const Dropdown = forwardRef(({ children, className = "" }, ref) => {
  const [direction, setDirection] = useState(
    () => document.documentElement.dir || "ltr",
  );

  const updateDirection = useCallback(() => {
    setDirection(document.documentElement.dir || "ltr");
  }, []);

  useEffect(() => {
    // Listen for direction changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "dir") {
          updateDirection();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
    });

    return () => observer.disconnect();
  }, [updateDirection]);

  return (
    <div
      ref={ref}
      className={`
        dark:bg-dark-sidebar
        bg-sidebar
        absolute ${direction === "rtl" ? "left-0" : "right-0"} top-full mt-2 z-50
        bg-bg-shell 
        border border-default dark:border-dark-default
        rounded-2xl shadow-lg shadow-black/8 dark:shadow-black/30
        animate-in fade-in slide-in-from-top-2 duration-150
        ${className}
      `}
    >
      {children}
    </div>
  );
});

Dropdown.displayName = "Dropdown";

export default Dropdown;
