export default function SocialIconLink({ Icon, label, href = '#', className = '', accentClass = '', hoverClass = '' }) {
  return (
    <a
      aria-label={label}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 text-white transition-colors duration-200 ease-out ${accentClass} ${hoverClass} ${className}`}
      href={href}
    >
      {Icon ? <Icon className='h-5 w-5' /> : null}
    </a>
  )
}