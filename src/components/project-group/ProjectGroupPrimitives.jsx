import { forwardRef } from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export function UiButton({
  type = "button",
  variant = "secondary",
  size = "md",
  className = "",
  palette,
  icon: Icon,
  iconSize = 14,
  children,
  ...props
}) {
  const sizeClass = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm";
  const variantClass = {
    primary: palette.primaryBtn,
    secondary: palette.secondaryBtn,
    danger: palette.redBtn,
    ghost: palette.ghostBtn,
  }[variant];

  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1f6feb] disabled:cursor-not-allowed disabled:opacity-60",
        sizeClass,
        variantClass,
        className
      )}
      {...props}
    >
      {Icon ? <Icon size={iconSize} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export const UiInput = forwardRef(function UiInput(
  { palette, icon: Icon, className = "", ...props },
  ref
) {
  if (Icon) {
    return (
      <div className="relative">
        <Icon
          size={15}
          aria-hidden="true"
          className={cx("pointer-events-none absolute left-3 top-1/2 -translate-y-1/2", palette.muted)}
        />
        <input
          ref={ref}
          className={cx(
            "w-full rounded-md border py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#1f6feb]",
            palette.input,
            className
          )}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      ref={ref}
      className={cx(
        "w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#1f6feb]",
        palette.input,
        className
      )}
      {...props}
    />
  );
});

export function Panel({ palette, className = "", children, ...props }) {
  return (
    <section
      className={cx("rounded-md border shadow-sm", palette.border, palette.panel, className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function CounterBadge({ palette, className = "", children }) {
  return (
    <span className={cx("rounded-full px-2 py-0.5 text-xs", palette.badge, className)}>{children}</span>
  );
}

export function EmptyState({
  palette,
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center",
        palette.border,
        className
      )}
    >
      {Icon ? <Icon size={20} className={palette.muted} aria-hidden="true" /> : null}
      <p className={cx("text-sm font-semibold", palette.text)}>{title}</p>
      <p className={cx("max-w-md text-sm", palette.muted)}>{description}</p>
      {actionLabel && onAction ? (
        <UiButton palette={palette} variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </UiButton>
      ) : null}
    </div>
  );
}

export function InlineAlert({
  palette,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      role="alert"
      className={cx(
        "rounded-md border px-4 py-3",
        "border-[#da3633]/40 bg-[#da3633]/10 text-[#f85149]",
        className
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs">{description}</p>
      {actionLabel && onAction ? (
        <UiButton palette={palette} variant="secondary" size="sm" onClick={onAction} className="mt-3">
          {actionLabel}
        </UiButton>
      ) : null}
    </div>
  );
}

export function ToastStack({ toasts, palette, onDismiss }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className={cx(
            "pointer-events-auto rounded-md border px-3 py-2 shadow-lg",
            palette.border,
            palette.panel,
            toast.type === "error"
              ? "border-[#da3633]/60 bg-[#da3633]/15"
              : toast.type === "success"
              ? "border-[#2ea043]/60 bg-[#2ea043]/10"
              : ""
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={cx("text-sm font-semibold", palette.text)}>{toast.title}</p>
              {toast.message ? <p className={cx("mt-0.5 text-xs", palette.muted)}>{toast.message}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className={cx(
                "rounded border px-2 py-0.5 text-xs transition",
                palette.border,
                palette.secondaryBtn
              )}
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
