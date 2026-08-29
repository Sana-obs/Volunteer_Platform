const iconBaseClass = 'h-5 w-5'

export default function InstagramIcon({ className = iconBaseClass }) {
  return (
    <svg aria-hidden='true' className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
      <rect x='4' y='4' width='16' height='16' rx='4' />
      <circle cx='12' cy='12' r='3.5' />
      <circle cx='17' cy='7' r='1' fill='currentColor' stroke='none' />
    </svg>
  )
}