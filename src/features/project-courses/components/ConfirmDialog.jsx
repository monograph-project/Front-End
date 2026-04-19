import { AlertTriangle } from "lucide-react";
import { useRef } from "react";
import { Panel, UiButton } from "../../../components/project-group/ProjectGroupPrimitives";
import { COURSE_SCALE } from "../design/tokens";
import { useFocusTrap } from "../hooks/useFocusTrap";

export function ConfirmDialog({
  isOpen,
  palette,
  title,
  description,
  confirmLabel = "Confirm",
  isPending,
  onCancel,
  onConfirm,
}) {
  const containerRef = useRef(null);

  useFocusTrap({
    isOpen,
    containerRef,
    onClose: onCancel,
  });

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[55] flex items-center justify-center p-4 ${palette.overlay}`}
      onClick={onCancel}
    >
      <Panel
        palette={palette}
        className={`w-full max-w-md ${palette.modalCard}`}
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        ref={containerRef}
      >
        <div className={`border-b px-5 py-4 ${palette.border}`}>
          <h2
            id="confirm-dialog-title"
            className={`inline-flex items-center gap-2 ${COURSE_SCALE.text.lg} font-semibold ${palette.text}`}
          >
            <AlertTriangle size={16} className="text-[#f85149]" />
            {title}
          </h2>
          <p id="confirm-dialog-description" className={`mt-1 ${COURSE_SCALE.text.sm} ${palette.muted}`}>
            {description}
          </p>
        </div>
        <div className={`flex justify-end gap-2 px-5 py-4`}>
          <UiButton
            palette={palette}
            variant="secondary"
            type="button"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </UiButton>
          <UiButton
            palette={palette}
            variant="danger"
            type="button"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : confirmLabel}
          </UiButton>
        </div>
      </Panel>
    </div>
  );
}
