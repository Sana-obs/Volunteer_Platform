
export function isVolunteerProfileComplete(user) {
  if (!user) return false

  if (user.hasVolunteerProfile === true) return true

  const hasEducationLevel = Boolean(user.educationLevel)
  const hasDateOfBirth = Boolean(user.dateOfBirth || user.dob)
  const hasGender = Boolean(user.gender)
  const hasCity = Boolean(user.city)
  const hasSkills =
    (Array.isArray(user.skillIds) && user.skillIds.length > 0) ||
    (Array.isArray(user.skillNames) && user.skillNames.length > 0)

  // about اختياري بالـ schema فما منشترطه هون. interests ما عاد جزء من
  // الفورم/الـ schema إطلاقًا (محسوب تلقائيًا بالباك اند)
  return hasEducationLevel && hasDateOfBirth && hasGender && hasCity && hasSkills
}

export function isOrganizationProfileComplete(organization) {
  if (!organization) return false

  const hasDescription = Boolean(organization.description)
  const hasCity = Boolean(organization.city)

  return hasDescription && hasCity
}