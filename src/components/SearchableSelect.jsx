// import { useEffect, useState, useRef } from "react";
// import {
//   RiArrowDownSLine,
//   RiArrowLeftSLine,
//   RiArrowRightSLine,
// } from "react-icons/ri";
// import { useClickOutSide } from "../hook/useClickOutSide";

// const PAGE_SIZE = 9; // items per page — pagination appears when total > 9

// function SearchableSelect({
//   label,
//   error,
//   id,
//   options = [],
//   defaultSelected,
//   onChange,
//   value,
//   name,
//   disabled = false,
// }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState(value || defaultSelected || "");
//   const [position, setPosition] = useState("bottom");
//   const [currentPage, setCurrentPage] = useState(1);

//   const containerRef = useClickOutSide(() => setIsOpen(false));
//   const listRef = useRef(null);

//   // ── Filter ────────────────────────────────────────────────────────
//   const filteredOptions = options.filter((opt) => {
//     const lbl = opt?.label || opt?.value || "";
//     return (
//       typeof lbl === "string" &&
//       lbl.toLowerCase().includes(search.toLowerCase())
//     );
//   });

//   // ── Pagination ────────────────────────────────────────────────────
//   const totalPages = Math.ceil(filteredOptions.length / PAGE_SIZE);
//   const showPagination = totalPages > 1;
//   const paginatedOptions = filteredOptions.slice(
//     (currentPage - 1) * PAGE_SIZE,
//     currentPage * PAGE_SIZE,
//   );

//   // ── Effects ───────────────────────────────────────────────────────
//   useEffect(() => {
//     setSelected(value || "");
//   }, [value]);
//   useEffect(() => {
//     if (disabled) setIsOpen(false);
//   }, [disabled]);

//   // Reset on close
//   useEffect(() => {
//     if (!isOpen) {
//       setSearch("");
//       setCurrentPage(1);
//     }
//   }, [isOpen]);

//   // Reset page when search changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search]);

//   // Scroll list to top on page change
//   useEffect(() => {
//     if (listRef.current) listRef.current.scrollTop = 0;
//   }, [currentPage]);

//   // Auto-detect open direction
//   useEffect(() => {
//     if (isOpen && containerRef?.current) {
//       const rect = containerRef.current.getBoundingClientRect();
//       const spaceBelow = window.innerHeight - rect.bottom;
//       const spaceAbove = rect.top;
//       setPosition(spaceBelow < 280 && spaceAbove > 280 ? "top" : "bottom");
//     }
//   }, [isOpen]);

//   // ── Handlers ──────────────────────────────────────────────────────
//   const handleSelect = (optValue) => {
//     setSelected(optValue);
//     setIsOpen(false);
//     if (onChange) {
//       name
//         ? onChange({ target: { name, value: optValue } })
//         : onChange(optValue);
//     }
//   };

//   const handlePage = (p) => {
//     if (p < 1 || p > totalPages) return;
//     setCurrentPage(p);
//   };

//   const getSelectedLabel = () => {
//     if (!selected) return defaultSelected || "انتخاب نکردید";
//     const opt = options.find((o) => o.value === selected);
//     return opt ? opt.label || opt.value : selected;
//   };

//   // Smart page number list with ellipsis
//   const pageNumbers = () => {
//     if (totalPages <= 5)
//       return Array.from({ length: totalPages }, (_, i) => i + 1);
//     const set = new Set([1, totalPages, currentPage]);
//     if (currentPage > 1) set.add(currentPage - 1);
//     if (currentPage < totalPages) set.add(currentPage + 1);
//     return [...set].sort((a, b) => a - b);
//   };

//   // ── Render ────────────────────────────────────────────────────────
//   return (
//     <div className="relative w-full" ref={containerRef}>
//       {label && (
//         <label
//           htmlFor={id}
//           className="block text-[12px] font-medium text-gray-500 dark:text-gray-300 mb-2"
//         >
//           {label}
//         </label>
//       )}

//       {/* Trigger */}
//       <div
//         onClick={() => {
//           if (!disabled) setIsOpen((o) => !o);
//         }}
//         className={`w-full truncate rounded-sm pr-3 pl-4 py-[10px] transition flex justify-between items-center border
//           ${
//             disabled
//               ? "bg-gray-100 dark:bg-transparent cursor-not-allowed text-gray-400 dark:text-gray-200 border-gray-200 dark:border-gray-800"
//               : "bg-transparent cursor-pointer text-slate-700 border-slate-200 dark:border-gray-800 dark:hover:border-gray-700 hover:border-brand-500"
//           }`}
//       >
//         <span className="text-sm font-normal text-slate-600 dark:text-gray-200">
//           {getSelectedLabel()}
//         </span>
//         <RiArrowDownSLine
//           className={`flex-shrink-0 transition-all duration-200 ${isOpen ? "rotate-180" : ""}`}
//         />
//       </div>

//       {/* Dropdown */}
//       {isOpen && (
//         <div
//           className={`absolute z-50 w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-sm shadow-lg p-2
//             ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"}`}
//         >
//           {/* Search */}
//           <input
//             autoFocus
//             type="text"
//             placeholder="جستجو..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full mb-2 px-3 py-1.5 text-sm border border-slate-200 dark:border-gray-800 rounded-sm focus:outline-none focus:border-slate-300 dark:placeholder:text-gray-500 dark:text-white bg-transparent"
//           />

//           {/* Scrollable options list — always shows ~4 rows, scrollable */}
//           <div
//             ref={listRef}
//             className="overflow-y-auto scrollbar-theme"
//             style={{ maxHeight: "9.75rem" }} /* ~4 items × ~2.44rem */
//           >
//             {paginatedOptions.length > 0 ? (
//               paginatedOptions.map((option, index) => (
//                 <div
//                   key={index}
//                   onClick={() => handleSelect(option.value)}
//                   className={`cursor-pointer px-3 py-2 text-sm capitalize rounded-sm dark:text-gray-100 dark:hover:bg-gray-800/90 hover:bg-brand-100 transition-colors
//                     ${selected === option.value ? "bg-slate-100 dark:bg-gray-800/90" : ""}`}
//                 >
//                   {option.label || option.value}
//                 </div>
//               ))
//             ) : (
//               <p className="text-sm text-slate-400 dark:text-gray-500 text-center py-3">
//                 هیچ نتیجه‌ای یافت نشد
//               </p>
//             )}
//           </div>

//           {/* Pagination — only when options > PAGE_SIZE (9) */}
//           {showPagination && (
//             <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-gray-800">
//               {/* Prev */}
//               <button
//                 onClick={() => handlePage(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className="p-1 rounded-sm text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
//               >
//                 <RiArrowRightSLine size={15} />
//               </button>

//               {/* Page numbers */}
//               <div className="flex items-center gap-0.5">
//                 {pageNumbers().map((page, idx, arr) => (
//                   <span key={page} className="flex items-center gap-0.5">
//                     {idx > 0 && arr[idx - 1] !== page - 1 && (
//                       <span className="w-5 text-center text-xs text-slate-300 dark:text-gray-600 select-none">
//                         ···
//                       </span>
//                     )}
//                     <button
//                       onClick={() => handlePage(page)}
//                       className={`min-w-[1.5rem] h-6 px-1 text-xs rounded-sm transition font-medium
//                         ${
//                           currentPage === page
//                             ? "bg-brand-500 text-white dark:bg-brand-600"
//                             : "text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
//                         }`}
//                     >
//                       {page}
//                     </button>
//                   </span>
//                 ))}
//               </div>

//               {/* Next */}
//               <button
//                 onClick={() => handlePage(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className="p-1 rounded-sm text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
//               >
//                 <RiArrowLeftSLine size={15} />
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//     </div>
//   );
// }

// export default SearchableSelect;
import { useEffect, useState, useRef } from "react";
import {
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import { useClickOutSide } from "../hook/useClickOutSide";

const PAGE_SIZE = 9;

/**
 * SearchableSelect
 *
 * ─── Client-only (no pagination props) ──────────────────────────────
 *   <SearchableSelect options={options} onChange={handleChange} />
 *   → Filters locally, pagination activates automatically if items > 9
 *
 * ─── Server-side (pagination from API) ──────────────────────────────
 *   <SearchableSelect
 *     options={data}           ← current page items from API
 *     totalPages={totalPages}  ← e.g. Math.ceil(total / limit)
 *     currentPage={page}       ← controlled by parent
 *     onPageChange={setPage}   ← parent updates page & re-fetches
 *     onSearch={setSearch}     ← parent updates search & re-fetches
 *     onChange={handleChange}
 *   />
 *
 * Props
 * ───────────────────────────────────────────────────────────────────
 * label            string
 * error            string
 * id               string
 * name             string
 * disabled         bool
 * defaultSelected  string
 * value            string
 * onChange         fn(value) | fn({ target: { name, value } })
 * options          { value, label }[]
 * totalPages       number   (server) total pages
 * currentPage      number   (server) active page — controlled by parent
 * onPageChange     fn       (server) called with new page number
 * onSearch         fn       (server) called with search string on change
 */
function SearchableSelect({
  label,
  error,
  id,
  options = [],
  defaultSelected,
  onChange,
  value,
  name,
  disabled = false,
  // ── server-side pagination props ──
  totalPages: externalTotalPages,
  currentPage: externalPage,
  onPageChange,
  onSearch,
}) {
  // If all three server props are supplied → server mode
  const isServerMode = !!(externalTotalPages && externalPage && onPageChange);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(value || defaultSelected || "");
  const [position, setPosition] = useState("bottom");
  const [clientPage, setClientPage] = useState(1);

  const containerRef = useClickOutSide(() => setIsOpen(false));
  const listRef = useRef(null);

  // ── Derived (client mode only) ────────────────────────────────────
  const filteredOptions = isServerMode
    ? options
    : options.filter((opt) => {
        const lbl = opt?.label || opt?.value || "";
        return (
          typeof lbl === "string" &&
          lbl.toLowerCase().includes(search.toLowerCase())
        );
      });

  const clientTotalPages = Math.ceil(filteredOptions.length / PAGE_SIZE);
  const useClientPagination =
    !isServerMode && filteredOptions.length > PAGE_SIZE;

  // Unified values regardless of mode
  const activePage = isServerMode ? externalPage : clientPage;
  const totalPages = isServerMode ? externalTotalPages : clientTotalPages;
  const showPagination =
    (isServerMode && externalTotalPages > 1) ||
    (useClientPagination && clientTotalPages > 1);

  const visibleOptions = useClientPagination
    ? filteredOptions.slice(
        (clientPage - 1) * PAGE_SIZE,
        clientPage * PAGE_SIZE,
      )
    : filteredOptions;

  // ── Effects ───────────────────────────────────────────────────────
  useEffect(() => {
    setSelected(value || "");
  }, [value]);
  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setClientPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isServerMode) setClientPage(1);
  }, [search]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [activePage]);

  useEffect(() => {
    if (isOpen && containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setPosition(spaceBelow < 280 && spaceAbove > 280 ? "top" : "bottom");
    }
  }, [isOpen]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (isServerMode && onSearch) onSearch(val);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    isServerMode ? onPageChange(page) : setClientPage(page);
  };

  const handleSelect = (optValue) => {
    setSelected(optValue);
    setIsOpen(false);
    if (onChange) {
      name
        ? onChange({ target: { name, value: optValue } })
        : onChange(optValue);
    }
  };

  const getSelectedLabel = () => {
    if (!selected) return defaultSelected || "انتخاب نکردید";
    const opt = options.find((o) => o.value === selected);
    return opt ? opt.label || opt.value : selected;
  };

  // Smart page list — first, last, active ±1, with ellipsis gaps
  const getPageNumbers = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, totalPages, activePage]);
    if (activePage > 1) set.add(activePage - 1);
    if (activePage < totalPages) set.add(activePage + 1);
    return [...set].sort((a, b) => a - b);
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[12px] font-medium text-gray-500 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen((o) => !o);
        }}
        className={`w-full truncate rounded-sm pr-3 pl-4 py-[8px] transition flex justify-between items-center border
          ${
            disabled
              ? "bg-gray-100 dark:bg-transparent cursor-not-allowed text-gray-400 dark:text-gray-200 border-gray-200 dark:border-gray-800"
              : "bg-transparent cursor-pointer text-slate-700 border-slate-200 dark:border-gray-800 dark:hover:border-gray-700 hover:border-brand-500"
          }`}
      >
        <span className="font-normal text-sm text-slate-600 dark:text-gray-200">
          {getSelectedLabel()}
        </span>
        <RiArrowDownSLine
          className={`flex-shrink-0 transition-all duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-50 w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-sm shadow-lg p-2
            ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          {/* Search */}
          <input
            autoFocus
            type="text"
            placeholder="جستجو..."
            value={search}
            onChange={handleSearchChange}
            className="w-full mb-2 px-3 py-1.5 text-sm border border-slate-200 dark:border-gray-800 rounded-sm focus:outline-none focus:border-slate-200 dark:focus:border-gray-700 dark:placeholder:text-gray-500 dark:text-white bg-transparent"
          />

          {/* Scrollable options — ~4 rows visible */}
          <div
            ref={listRef}
            className="overflow-y-auto scrollbar-theme"
            style={{ maxHeight: "9.75rem" }}
          >
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(option.value)}
                  className={`cursor-pointer px-3 py-2 text-sm capitalize rounded-sm dark:text-gray-100 dark:hover:bg-gray-800/90 hover:bg-brand-100 transition-colors
                    ${selected === option.value ? "bg-slate-100 dark:bg-gray-800/90" : ""}`}
                >
                  {option.label || option.value}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 dark:text-gray-500 text-center py-3">
                هیچ نتیجه‌ای یافت نشد
              </p>
            )}
          </div>

          {/* Pagination — only appears when totalPages > 1 */}
          {showPagination && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => handlePageChange(activePage - 1)}
                disabled={activePage === 1}
                className="p-1 rounded-sm text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <RiArrowRightSLine size={15} />
              </button>

              <div className="flex items-center gap-0.5">
                {getPageNumbers().map((page, idx, arr) => (
                  <span key={page} className="flex items-center gap-0.5">
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="w-5 text-center text-xs text-slate-300 dark:text-gray-600 select-none">
                        ···
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[1.5rem] h-6 px-1 text-xs rounded-sm transition font-medium
                        ${
                          activePage === page
                            ? "bg-brand-500 text-white dark:bg-brand-600"
                            : "text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
                        }`}
                    >
                      {page}
                    </button>
                  </span>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(activePage + 1)}
                disabled={activePage === totalPages}
                className="p-1 rounded-sm text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <RiArrowLeftSLine size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default SearchableSelect;
