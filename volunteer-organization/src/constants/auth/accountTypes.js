export const ACCOUNT_TYPES = {
  VOLUNTEER: 'volunteer',
  ORGANIZATION: 'organization',
  ADMIN: 'admin',
}

export function isAccountType(value) {
  return (
    value === ACCOUNT_TYPES.VOLUNTEER ||
    value === ACCOUNT_TYPES.ORGANIZATION ||
    value === ACCOUNT_TYPES.ADMIN
  )
}