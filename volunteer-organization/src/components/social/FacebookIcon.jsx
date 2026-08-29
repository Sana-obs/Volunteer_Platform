const iconBaseClass = 'h-5 w-5'

export default function FacebookIcon({ className = iconBaseClass }) {
  return (
    <svg aria-hidden='true' className={className} viewBox='0 0 24 24' fill='currentColor'>
      <path d='M13.5 9H16V6h-2.5c-2 0-3.5 1.6-3.5 3.75V12H8v3h2v7h3v-7h2.4l.6-3H13v-2.1c0-.7.4-.9.5-.9Z' />
    </svg>
  )
}