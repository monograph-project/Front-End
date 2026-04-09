import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  CheckIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import { cn } from "../lib/utils"; // adjust path to your cn utility

/** Normalise flat options OR grouped options into always-grouped shape */
function normaliseOptions(options) {
  if (!options?.length) return [];
  if ("options" in options[0]) return options; // already grouped
  return [{ label: "", options }]; // wrap flat in one unnamed group
}

/** Flatten all options from groups */
function flattenOptions(groups) {
  return groups.flatMap((g) => g.options);
}

/** Highlight matching substring in label */
function Highlighted({ text = "", query = "" }) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-accent-light dark:bg-dark-accent-light text-primary dark:text-white rounded-[2px] px-[1px]">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
}

// ─── Chip (multi-select tag) ──────────────────────────────────────────────────
function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-default dark:border-dark-light bg-accent-light dark:bg-dark-accent-light px-2 py-0.5 text-xs font-medium text-primary dark:text-white max-w-[120px]">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="flex-shrink-0 rounded-sm text-muted dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors"
        aria-label={`Remove ${label}`}
      >
        <Cross2Icon className="h-3 w-3" />
      </button>
    </span>
  );
}
export default function SearchableSelect({
  options = [],
  value: controlledValue,
  defaultValue,
  onChange,
  multiple = false,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  clearable = true,
  disabled = false,
  loading = false,
  renderOption,
  className,
  contentClassName,
  name,
  maxHeight = 300,
}) {
  // ── State ──────────────────────────────────────────────────────────────
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? (multiple ? [] : null),
  );
  const selected = isControlled ? controlledValue : internalValue;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const searchRef = React.useRef(null);
  const listRef = React.useRef(null);

  // ── Derived ─────────────────────────────────────────────────────────────
  const groups = React.useMemo(() => normaliseOptions(options), [options]);
  const allFlat = React.useMemo(() => flattenOptions(groups), [groups]);

  const filteredGroups = React.useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        options: g.options.filter(
          (o) =>
            o.label.toLowerCase().includes(q) ||
            o.description?.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.options.length > 0);
  }, [groups, query]);

  const filteredFlat = React.useMemo(
    () => flattenOptions(filteredGroups),
    [filteredGroups],
  );

  const isSelected = (val) =>
    multiple
      ? Array.isArray(selected) && selected.includes(val)
      : selected === val;

  // label shown in trigger (single mode)
  const triggerLabel =
    !multiple && selected
      ? allFlat.find((o) => o.value === selected)?.label
      : null;

  // ── Handlers ────────────────────────────────────────────────────────────
  function commit(val) {
    let next;
    if (multiple) {
      const arr = Array.isArray(selected) ? selected : [];
      next = arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
    } else {
      next = val;
      setOpen(false);
    }
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }

  function removeValue(val) {
    if (multiple) {
      const next = (Array.isArray(selected) ? selected : []).filter(
        (v) => v !== val,
      );
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    } else {
      if (!isControlled) setInternalValue(null);
      onChange?.(null);
    }
  }

  function clearAll(e) {
    e.stopPropagation();
    const next = multiple ? [] : null;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }

  // ── Keyboard ────────────────────────────────────────────────────────────
  function handleSearchKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, filteredFlat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && filteredFlat[focusedIndex]) {
        const opt = filteredFlat[focusedIndex];
        if (!opt.disabled) commit(opt.value);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // reset focus & search when opening
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setFocusedIndex(-1);
      // autofocus search after portal mounts
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  }, [open]);

  // scroll focused item into view
  React.useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-option]");
      items[focusedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  // hasValue
  const hasValue = multiple
    ? Array.isArray(selected) && selected.length > 0
    : !!selected;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
      {/* ── Hidden form input ── */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={multiple ? JSON.stringify(selected ?? []) : (selected ?? "")}
          readOnly
        />
      )}

      {/* ────────────────────────── TRIGGER ────────────────────────────── */}
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={placeholder}
          className={cn(
            // base layout
            "group relative flex w-full min-h-[38px] items-center gap-2",
            "rounded-md border px-3 py-1.5 text-sm font-medium",
            "transition-colors duration-150 outline-none",
            // light
            "bg-card border-default text-secondary",
            "hover:bg-card-2 hover:text-primary",
            // dark
            "dark:bg-dark-accent-light dark:border-dark-light dark:text-white",
            "dark:hover:bg-dark-card",
            // open state
            "data-[state=open]:bg-accent-light data-[state=open]:border-primary/30",
            "dark:data-[state=open]:bg-dark-card dark:data-[state=open]:text-white",
            // disabled
            "disabled:opacity-50 disabled:cursor-not-allowed",
            // focus ring
            "focus-visible:ring-2 focus-visible:ring-primary/30",
            className,
          )}
        >
          {/* Left content: chips (multi) or label (single) */}
          <span className="flex min-w-0 flex-1 flex-wrap gap-1">
            {multiple && Array.isArray(selected) && selected.length > 0 ? (
              selected.map((val) => {
                const opt = allFlat.find((o) => o.value === val);
                return opt ? (
                  <Chip
                    key={val}
                    label={opt.label}
                    onRemove={() => removeValue(val)}
                  />
                ) : null;
              })
            ) : triggerLabel ? (
              <span className="truncate text-primary dark:text-white">
                {triggerLabel}
              </span>
            ) : (
              <span className="truncate text-muted dark:text-gray-400">
                {placeholder}
              </span>
            )}
          </span>

          {/* Right side: clear button + chevron */}
          <span className="ml-auto flex flex-shrink-0 items-center gap-1">
            {clearable && hasValue && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                onClick={clearAll}
                className="flex h-4 w-4 items-center justify-center rounded-sm text-muted dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors"
                aria-label="Clear selection"
              >
                <Cross2Icon className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 text-muted dark:text-gray-400 transition-transform duration-200",
                "group-data-[state=open]:rotate-180",
              )}
            />
          </span>
        </button>
      </DropdownMenu.Trigger>

      {/* ────────────────────────── DROPDOWN ───────────────────────────── */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          // width matches trigger
          style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
          onCloseAutoFocus={(e) => e.preventDefault()}
          // prevent closing when clicking inside the search input
          onPointerDownOutside={(e) => {
            if (e.target === searchRef.current) e.preventDefault();
          }}
          className={cn(
            "z-50 overflow-hidden rounded-md border p-1",
            "bg-card dark:bg-dark-card dark:border-none border-default",
            "shadow-card",
            // entrance animation
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
            contentClassName,
          )}
        >
          {/* ── Search input ── */}
          <div className="flex items-center gap-2 border-b border-default dark:border-dark-light px-2 pb-1 pt-0.5 mb-1">
            <MagnifyingGlassIcon className="h-3.5 w-3.5 flex-shrink-0 text-muted dark:text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setFocusedIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              className={cn(
                "w-full bg-transparent text-sm outline-none",
                "placeholder:text-muted dark:placeholder:text-gray-500",
                "text-primary dark:text-white",
                "py-1",
              )}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                className="flex-shrink-0 text-muted dark:text-gray-400 hover:text-primary dark:hover:text-white"
                aria-label="Clear search"
              >
                <Cross2Icon className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* ── Options list ── */}
          <div
            ref={listRef}
            role="listbox"
            aria-multiselectable={multiple}
            style={{ maxHeight, overflowY: "auto" }}
            className="overflow-y-auto scrollbar-thin"
          >
            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted dark:text-gray-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Loading…
              </div>
            )}

            {/* Empty state */}
            {!loading && filteredFlat.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-1 py-6 text-center">
                <span className="text-sm font-medium text-secondary dark:text-gray-300">
                  No results
                </span>
                {query && (
                  <span className="text-xs text-muted dark:text-gray-500">
                    No match for &ldquo;{query}&rdquo;
                  </span>
                )}
              </div>
            )}

            {/* Groups + Options */}
            {!loading &&
              filteredGroups.map((group, gi) => (
                <div key={gi}>
                  {/* Group label */}
                  {group.label && (
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted dark:text-secondary">
                      {group.label}
                    </div>
                  )}

                  {group.options.map((opt) => {
                    const globalIndex = filteredFlat.findIndex(
                      (o) => o.value === opt.value,
                    );
                    const selected_ = isSelected(opt.value);
                    const focused = focusedIndex === globalIndex;

                    return (
                      <div
                        key={opt.value}
                        data-option
                        role="option"
                        aria-selected={selected_}
                        aria-disabled={opt.disabled}
                        onClick={() => !opt.disabled && commit(opt.value)}
                        onMouseEnter={() => setFocusedIndex(globalIndex)}
                        className={cn(
                          // base
                          "relative flex w-full cursor-pointer select-none items-center gap-3",
                          "rounded-md px-3 py-2 text-sm transition-colors duration-100",
                          // normal
                          "text-primary dark:text-white",
                          // hover / focus
                          "hover:bg-accent-light dark:hover:bg-dark-accent-light",
                          focused &&
                            "bg-accent-light dark:bg-dark-accent-light",
                          // selected
                          selected_ &&
                            "bg-accent-light dark:bg-dark-accent-light font-medium",
                          // disabled
                          opt.disabled &&
                            "cursor-not-allowed opacity-40 hover:bg-transparent dark:hover:bg-transparent",
                        )}
                      >
                        {/* Leading icon */}
                        {opt.icon && (
                          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center text-muted dark:text-gray-400">
                            {opt.icon}
                          </span>
                        )}

                        {/* Custom render OR default */}
                        <span className="flex min-w-0 flex-1 flex-col">
                          {renderOption ? (
                            renderOption(opt)
                          ) : (
                            <>
                              <span className="truncate">
                                <Highlighted text={opt.label} query={query} />
                              </span>
                              {opt.description && (
                                <span className="truncate text-xs text-muted dark:text-gray-400">
                                  {opt.description}
                                </span>
                              )}
                            </>
                          )}
                        </span>

                        {/* Check indicator */}
                        {selected_ && (
                          <CheckIcon className="ml-auto h-4 w-4 flex-shrink-0 text-primary dark:text-white" />
                        )}
                      </div>
                    );
                  })}

                  {/* Group separator (except last) */}
                  {gi < filteredGroups.length - 1 && group.label && (
                    <div className="my-1 h-px bg-default dark:bg-dark-badge mx-1" />
                  )}
                </div>
              ))}
          </div>

          {/* ── Footer: multi count + clear all ── */}
          {multiple && Array.isArray(selected) && selected.length > 0 && (
            <div className="mt-1 flex items-center justify-between border-t border-default dark:border-dark-light px-3 pt-1.5 pb-1">
              <span className="text-xs text-muted dark:text-gray-400">
                {selected.length} selected
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-error dark:text-red-400 hover:underline transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
