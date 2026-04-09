import SearchableSelectDemo from "../components/SearchableSelect.jsx";

export default function Deals() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-[14px] bg-shell dark:bg-dark-shell">
      <SearchableSelectDemo />
    </div>
  );
}
