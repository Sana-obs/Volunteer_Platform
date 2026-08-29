import Typography from "./Typography";

// dark=true overrides the default heading colors (near-invisible on the dark
// admin surface). Needs !important — Tailwind resolves same-property conflicts
// by generation order, not JSX class order.
export default function InfoRow({ label, value, dark = false }) {
  return (
    <div className="flex justify-between items-center py-1 gap-3">
      <Typography
        variant="bodySm"
        color="muted"
        className={`whitespace-nowrap shrink-0 ${dark ? "text-adminTextLo!" : ""}`}
      >
        {label}
      </Typography>

      <Typography
        variant="bodySm"
        color="heading"
        weight="medium"
        className={`min-w-0 flex-1 truncate text-left ${dark ? "text-adminTextHi!" : ""}`}
      >
        {value || "—"}
      </Typography>
    </div>
  );
}
