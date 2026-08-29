const iconBaseClass = 'h-5 w-5'

export default function LinkedInIcon({ className = iconBaseClass }) {
  return (
    <svg aria-hidden='true' className={className} viewBox='0 0 24 24' fill='currentColor'>
      <path d='M6.5 8.5A1.75 1.75 0 1 1 6.5 5a1.75 1.75 0 0 1 0 3.5ZM5 21V9h3v12H5Zm5 0V9h2.9v1.7h.1c.6-1 1.9-2.1 4-2.1 3 0 4 2 4 4.8V21h-3v-6.2c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V21h-3Z' />
    </svg>
  )
}