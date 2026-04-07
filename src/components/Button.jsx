import React from "react";

function Button({ onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className="font-semibold text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary underline underline-offset-2 bg-transparent border-none cursor-pointer text-[11px]"
    >
      <span>{label}</span>
      <span>{icon}</span>
    </button>
  );
}

export default Button;
