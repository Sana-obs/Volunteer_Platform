// Base skeleton box. Shape comes from className. Pulse honors prefers-reduced-motion (index.css).

export default function Skeleton({ className = "", dark = false }) {
  // dark=true: light tint for the dark admin background
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`animate-pulse rounded-xl ${dark ? "bg-white/8" : "bg-heading/10"} ${className}`}
    />
  );
}