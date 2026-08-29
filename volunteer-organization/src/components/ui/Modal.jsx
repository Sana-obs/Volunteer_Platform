// Generic modal. Rendered via createPortal to document.body so a framer-motion
// transform ancestor (MainLayout) doesn't become the containing block for
// position:fixed.

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import Typography from "./Typography";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  dialogClassName = "max-w-md",
  // opt-in — only for modals whose content can exceed the viewport height
  scrollBody = false,
}) {
  const dialogRef = useRef(null);
  const generatedTitleId = useId();
  const titleId = title ? generatedTitleId : undefined;

  // Kept separate with deps:[open] only. Including onClose (rebuilt on every
  // keystroke in modals with local state) would re-run this and yank focus
  // back to the dialog after the first character.
  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    // Focus trap: keep Tab/Shift+Tab from escaping to the page behind the overlay.
    function trapFocus(event) {
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }
      trapFocus(event);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div aria-hidden="true" className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`animate-shell-in relative w-full rounded-2xl border border-heading/10 bg-field shadow-2xl focus:outline-none ${
          scrollBody ? "flex max-h-[85vh] flex-col" : "p-6"
        } ${dialogClassName}`}
      >
        {scrollBody ? (
          <>
            {title && (
              <Typography id={titleId} variant="h4" className="shrink-0 px-6 pt-6">
                {title}
              </Typography>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-sm text-body leading-relaxed">
              {children}
            </div>

            {footer && (
              <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-heading/10 px-6 py-4">
                {footer}
              </div>
            )}
          </>
        ) : (
          <>
            {title && (
              <Typography id={titleId} variant="h4" gutterBottom>
                {title}
              </Typography>
            )}

            <div className="text-sm text-body leading-relaxed">{children}</div>

            {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}