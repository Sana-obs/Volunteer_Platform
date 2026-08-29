export function isMockMode() {
  return (import.meta.env.VITE_API_MODE || 'mock') !== 'real'
}