import { forwardRef } from "react";

// Read direction once — `dir` changes at runtime are extremely rare
// and don't justify a MutationObserver on every mounted dropdown.
const isRTL = () => document.documentElement.dir === "rtl";

const Dropdown = forwardRef(({ children, className = "" }, ref) => (
  <div
    ref={ref}
    className={`
      bg-sidebar dark:bg-dark-sidebar
      absolute ${isRTL() ? "left-0" : "right-0"} top-full mt-2 z-50
      border border-default dark:border-dark-default
      rounded-2xl shadow-lg shadow-black/8 dark:shadow-black/30
      animate-in fade-in slide-in-from-top-2 duration-150
      ${className}
    `}
  >
    {children}
  </div>
));

Dropdown.displayName = "Dropdown";
export default Dropdown;
