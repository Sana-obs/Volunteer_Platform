import { useState } from "react";

const SIZE_CLASSES = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-lg",
  lg: "h-14 w-14 text-lg",
};

export default function Avatar({ src, name, size = "md", className = "" }) {
  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  // blob: URLs here are always stale (tied to a prior tab's memory) — treat as no image.
  const hasValidSrc = Boolean(src) && !src.startsWith("blob:");

  const [prevSrc, setPrevSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(hasValidSrc);

  // Reset load/error state when src changes so a new URL isn't stuck on the fallback.
  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
    setIsLoading(hasValidSrc);
  }

  if (!hasValidSrc || hasError) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 ${className}`}
        aria-hidden="true"
      >
        {name?.charAt(0)?.toUpperCase() || "?"}
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses} shrink-0 ${className}`}>
      {/* Circular skeleton until the image loads */}
      {isLoading && (
        <div
          className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={name || "Profile"}
        className={`h-full w-full rounded-full object-cover transition-opacity duration-200 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}