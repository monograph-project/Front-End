import React from "react";

function Button({ onClick, children, icon, type }) {
  return (
    <button
      onClick={onClick}
      type={type}
      className="flex items-center gap-2 px-2 py-1 bg-primary cursor-pointer text-white rounded-md font-semibold hover:opacity-90"
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default Button;
