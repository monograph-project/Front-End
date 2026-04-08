import React from "react";

function TextArea({
  className,
  id,
  label,
  required,
  register,
  placeholder,
  error,
  row,
}) {
  return (
    <div className={`${className ? className : ""}`}>
      <div className="w-full flex  flex-col gap-y-2 relative py-1">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-gray-600 dark:text-gray-300"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          rows={row}
          id={id}
          {...register}
          placeholder={placeholder}
          className=" pr-4  w-full  border-gray-200/60 dark:border-gray-800 dark:hover:border-gray-700 dark:placeholder:text-gray-500 dark:text-gray-100 bg-transparent capitalize  placeholder:text-slate-400 text-slate-700 text-sm border rounded-sm  pl-4 py-[10px] transition duration-300 ease focus:outline-none hover:border-brand-500   cursor-pointer flex justify-between items-center"
        />
      </div>
      {error && <p className=" text-red-600 text-[10px] ">{error}</p>}
    </div>
  );
}

export default TextArea;
