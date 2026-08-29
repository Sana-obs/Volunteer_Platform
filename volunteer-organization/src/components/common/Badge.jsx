const TONE_CLASSES = {
  neutral: "bg-heading/5 text-body border-heading/10",
  primary: "bg-primary/10 text-primary border-primary/30",
  success: "bg-success/10 text-success border-success/30",
  secondary: "bg-secondary/10 text-secondary border-secondary/30",
  warning: "bg-amber-500/10 text-amber-700 border-amber-500/40",
  danger: "bg-danger/10 text-danger border-danger/40",
  header: "bg-field text-heading border-heading/10"
}

// Dark variants for the admin panel; only tones built on the light "heading" color need overriding.
const TONE_CLASSES_DARK = {
  neutral: "bg-white/5 text-adminTextLo border-adminBorder",
  primary: "bg-primary/10 text-primary border-primary/30",
  success: "bg-success/10 text-success border-success/30",
  secondary: "bg-adminAccent/15 text-adminAccentSoft border-adminAccent/30",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  header: "bg-adminBg2 text-adminTextHi border-adminBorder",
}

/**
 * @param {string} label
 * @param {'neutral'|'primary'|'secondary'|'warning'|'danger'} [tone='neutral']
 * @param {Function} [icon] - optional Lucide icon before the label
 * @param {boolean} [dark=false] - admin dark variant
 */
export default function Badge({ label, tone = "neutral", icon: Icon, dark = false, className = "" }) {
  const toneClasses = dark ? TONE_CLASSES_DARK : TONE_CLASSES

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${toneClasses[tone]} ${className}`}
    >
      {Icon && <Icon size={14} aria-hidden="true" />}
      {label}
    </span>
  )
}