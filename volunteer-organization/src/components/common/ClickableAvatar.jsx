// Wraps any image/avatar in a click-to-enlarge button.

import { useState } from "react";
import Modal from "../ui/Modal";

export default function ClickableAvatar({ src, alt, children, className = "" }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Same blob: guard as Avatar — skip the lightbox for a URL that will fail.
  const hasValidSrc = Boolean(src) && !src.startsWith("blob:");

  if (!hasValidSrc) return children;

  return (
    <>
      {/* Callers whose image sizes via parent w-full/h-full must pass className="h-full w-full" */}
      <button
        type="button"
        onClick={() => setIsPreviewOpen(true)}
        className={`cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
        aria-label={`View ${alt || "image"} larger`}
      >
        {children}
      </button>

      <Modal open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} dialogClassName="max-w-xl">
        <img src={src} alt={alt} className="max-h-[80vh] w-full object-contain rounded-2xl" />
      </Modal>
    </>
  );
}
