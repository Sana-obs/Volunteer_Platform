export function getUserDisplayName(user) {
  if (!user || typeof user !== 'object') return 'User'

  if (typeof user.name === 'string' && user.name.trim()) {
    return user.name.trim()
  }

  const fullName = [user.first_name || user.firstName, user.last_name || user.lastName]
  .filter((part) => typeof part === 'string' && part.trim())
  .join(' ')
  .trim()

  if (fullName) return fullName

  if (typeof user.orgName === 'string' && user.orgName.trim()) {
    return user.orgName.trim()
  }

  if (typeof user.organization_name === 'string' && user.organization_name.trim()) {
    return user.organization_name.trim()
  }

  if (typeof user.organization?.name === 'string' && user.organization.name.trim()) {
    return user.organization.name.trim()
  }

  if (typeof user.email === 'string' && user.email.trim()) {
    return user.email.trim()
  }

  return 'User'
}