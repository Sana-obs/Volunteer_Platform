import { getUserDisplayName } from './displayName'
import { extractPhotoUrl } from '../extractPhotoUrl'
import { getGovernorateSelectValueFromApiCity } from '../../services/syrianGovernorates'

function extractRealPhotoUrl(rawUser) {
  const volunteerPhoto = rawUser.volunteer?.photo
  const organizationPhoto = rawUser.organization?.profile_image
  return extractPhotoUrl(volunteerPhoto ?? organizationPhoto)
}

function flattenVolunteerProfile(rawUser, governorates = []) {
  const volunteer = rawUser.volunteer
  if (!volunteer || typeof volunteer !== 'object') return {}

  return {
    educationLevel: volunteer.education_level,
    dateOfBirth: volunteer.birth_date,
    gender: volunteer.gender,
    city: getGovernorateSelectValueFromApiCity(volunteer.city, governorates),
    about: volunteer.about,
    interests: volunteer.interests,
    skillNames: Array.isArray(volunteer.skills) ? volunteer.skills : undefined,
  }
}

// الباك اند الحقيقي (UserResource.php) بيرجّع بيانات المنظمة متداخلة جوا
// user.organization ({ name, ... }) — نفس أسلوب user.volunteer بالضبط، مش
// حقل مسطّح. بينما getUserDisplayName وأي قارئ لـ user.orgName مباشرةً
// (مثلًا createEditCause.jsx عند إنشاء فرصة) مبنيّين على orgName مسطّح —
// نفس الاسم يلي وضع mock بيخزّنه أصلًا. بدون هالتسطيح، حساب منظمة حقيقي
// كان بيظهر بالنافبار/القائمة المنسدلة بإيميله (أو باسم شخص التواصل لو
// رجّعه الباك اند) بدل اسم المنظمة. حاليًا نسطّح الاسم فقط — باقي حقول
// المنظمة (description/city/website) بتوصل صفحاتها من GET /organizations/{id}
// المستقل (useOrganizationProfileQuery)، مش من جلسة تسجيل الدخول.
function flattenOrganizationProfile(rawUser) {
  const organization = rawUser.organization
  if (!organization || typeof organization !== 'object') return {}

  return {
    orgName: organization.name,
  }
}

/**
 * @param {Array<{id:number, nameEn:string}>} [governorates]
 */
export function normalizeUser(rawUser, governorates = []) {
  if (!rawUser || typeof rawUser !== 'object') return null

  return {
    ...flattenVolunteerProfile(rawUser, governorates),
    ...flattenOrganizationProfile(rawUser),
    ...rawUser,
    // اسم جاهز للعرض دائمًا، بنفس منطق getUserDisplayName لكن محسوب مرة واحدة فقط
    displayName: getUserDisplayName(rawUser),
    avatarUrl: rawUser.imageUrl !== undefined ? rawUser.imageUrl : rawUser.avatarUrl || extractRealPhotoUrl(rawUser),

    phone: rawUser.phone_number || rawUser.phone || '',

    hasVolunteerProfile: rawUser.has_volunteer_profile ?? rawUser.hasVolunteerProfile,
  }
}