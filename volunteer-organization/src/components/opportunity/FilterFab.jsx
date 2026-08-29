// Floating button that scrolls back to the filters section once it's scrolled
// out of view. Rendered via createPortal to document.body (a framer-motion
// transform ancestor would break position:fixed — see Modal/Toast).

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal } from "lucide-react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function FilterFab({ targetRef, activeCount = 0, stickyOffset = 88 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = targetRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      // Treat the top stickyOffset px as off-screen so the button appears as the
      // filters slide behind the sticky header, not after.
      { rootMargin: `-${stickyOffset}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [targetRef, stickyOffset]);

  const scrollToFilters = () => {
    const node = targetRef.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY - stickyOffset - 16;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <button
      type="button"
      onClick={scrollToFilters}
      aria-label={activeCount > 0 ? `Jump to filters, ${activeCount} active` : "Jump to filters"}
      aria-hidden={!visible || undefined}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-200 hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <SlidersHorizontal size={20} aria-hidden="true" />

      {activeCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-primary shadow-sm">
          {activeCount}
        </span>
      ) : null}
    </button>,
    document.body,
  );
}
