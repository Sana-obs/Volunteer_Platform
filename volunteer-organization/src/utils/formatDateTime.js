export function formatDateTime(value, options = { dateStyle: 'medium', timeStyle: 'short' }) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en', options).format(date)
}