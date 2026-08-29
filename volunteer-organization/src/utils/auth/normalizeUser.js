import { getUserDisplayName } from './displayName'
import { extractPhotoUrl } from '../extractPhotoUrl'
import { getGovernorateSelectValueFromApiCity } from '../../services/syrianGovernorates'

//  الباك اند الحقيقي (UserResource.php) بيرجّع صورة المتطوع/المنظمة
// متداخلة جوا user.volunteer.photo أو user.organization.profile_image —
// مش حقل مسطّح imageUrl زي وضع Mock. هالدالة بتوحّد الشكلين لحقل واحد،
// وتستخدم extractPhotoUrl المشتركة (utils/extractPhotoUrl.js) للتعامل
// الدفاعي مع باگ VolunteerResource.php المعروف (راجعي تفاصيله هناك)
function extractRealPhotoUrl(rawUser) {
  const volunteerPhoto = rawUser.volunteer?.photo
  const organizationPhoto = rawUser.organization?.profile_image
  return extractPhotoUrl(volunteerPhoto ?? organizationPhoto)
}

// الباك اند الحقيقي (UserResource.php) بيرجّع تفاصيل بروفايل المتطوع
// متداخلة جوا user.volunteer (education_level, birth_date, gender, city,
// about, skills...)، بينما كل صفحة/فورم بالمشروع (VolunteerProfile،
// isVolunteerProfileComplete...) مبنية على حقول مسطّحة على user مباشرة —
// نفس الشكل المسطّح المستخدم أصلًا بوضع mock. بدون هالتسطيح هون، أي
// متطوع حقيقي عنده بروفايل محفوظ فعليًا كان رح يوصل RequireCompleteProfile
// دايمًا "غير مكتمل" (كل الحقول المسطّحة undefined للأبد)، وصفحة
// البروفايل كانت رح تفتح فاضية بكل مرة بدل ما تعرض بياناته المحفوظة.
//
// ⚠️ skills هون بترجع كأسماء نصية فقط (["Tutoring"])، مش IDs — نخزّنها
// بمفتاح منفصل skillNames (مو skillIds) لأنه تحويلها لـ IDs الفعلية
// يحتاج قائمة المهارات الكاملة (availableSkills)، وهاي غير متوفرة هون
// (normalizeUser دالة متزامنة بلا وصول لـ React Query). صفحة البروفايل
// هي المسؤولة تعمل هالتحويل بنفسها بعد ما تجيب availableSkills.
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
 * نقطة التطبيع الوحيدة لبيانات المستخدم في كامل التطبيق.
 * تُستدعى مرة واحدة فقط، مباشرة بعد استقبال استجابة تسجيل الدخول/التسجيل
 * (داخل services/auth.js)، وتُنتج شكلًا ثابتًا يعتمد عليه AuthContext وكل الـ Components.
 *
 * ⚠️ (CRIT-3) governorates هي القائمة الحقيقية (useCitiesQuery/fetchGovernorates)،
 * لازم تُمرَّر حتى city تُحسب صح — راجع getGovernorateSelectValueFromApiCity
 * بـ syrianGovernorates.js. مُوصَّلة الآن بـ: AuthContext.updateUser،
 * وservices/auth.js login/register (عبر useCitiesQuery بصفحتي Login/Register).
 * لسا غير موصولة: services/auth.js updateAdminProfile (الأدمن ما إله city)،
 * وservices/participations.js mapApiApplicantVolunteer بمساراتها غير الموصولة
 * (راجع تعليقاتها) — بترجّع city فاضي بدل قيمة خاطئة (أأمن من القديم).
 *
 * ملاحظة (تأكيد حي 2026-08-27): ردّ /login نفسه ما بيتضمّن volunteer.city
 * ولا volunteer.skills إطلاقًا (بس GET /volunteers/me بيرجّعهم)، فتوصيل
 * governorates لمسار الدخول تطبيع صحيح ومتّسق بس ما رح يعبّي city لحاله
 * طالما الباك اند ما بيرسلها بهالردّ — صفحة البروفايل هي يلي بتجيب
 * /volunteers/me عبر useVolunteerProfileQuery وتعبّي الفورم، واكتمال
 * البروفايل بيتحدد من علم has_volunteer_profile (تحت).
 * @param {Array<{id:number, nameEn:string}>} [governorates]
 */
export function normalizeUser(rawUser, governorates = []) {
  if (!rawUser || typeof rawUser !== 'object') return null

  return {
    // rawUser بعد flattenVolunteerProfile: أي حقل مسطّح موجود أصلًا على
    // rawUser (وضع mock، أو بعد updateUser() لاحقًا بصفحة البروفايل)
    // بيغلب دايمًا على القيمة المُشتقة من volunteer المتداخل (ممكن تكون
    // قديمة لو الجلسة انبنت من دمج current.user + patch جزئي)
    ...flattenVolunteerProfile(rawUser, governorates),
    ...flattenOrganizationProfile(rawUser),
    ...rawUser,
    // اسم جاهز للعرض دائمًا، بنفس منطق getUserDisplayName لكن محسوب مرة واحدة فقط
    displayName: getUserDisplayName(rawUser),
    // صورة جاهزة للعرض. ⚠️ لازم نتحقق من *وجود* المفتاح imageUrl فعليًا
    // (!== undefined)، مش من قيمته الصح/فولسي (|| كان هون) — لما المستخدم
    // يزيل صورته، updateUser بـ AuthContext بيمرّر imageUrl: '' صراحة،
    // بس بما إنه current.user (المدموج معه بنفس الدالة) عنده أصلًا
    // avatarUrl القديم محسوب من نداء سابق، سلسلة || كانت تتجاوز '' الفارغة
    // (فولسي) وترجع avatarUrl القديم — يعني الصورة تختفي من الفورم بس
    // تضل عالقة بالـ Navbar لنفس الجلسة (تختفي بس بعد reload كامل). لو
    // imageUrl موجود كمفتاح صراحة (حتى لو فارغ)، هو الأحدث دايمًا ونستخدمه
    // كما هو؛ نطلع من avatarUrl/الشكل المتداخل الحقيقي بس لو غير موجود إطلاقًا
    avatarUrl: rawUser.imageUrl !== undefined ? rawUser.imageUrl : rawUser.avatarUrl || extractRealPhotoUrl(rawUser),

    phone: rawUser.phone_number || rawUser.phone || '',

    // (تأكيد حي 2026-08-27) ردّ POST /login وPOST /register (UserResource)
    // بيرجّع has_volunteer_profile — بيصير true فقط بعد POST /volunteers
    // يلي بيفرض كل الحقول الإجبارية للبروفايل. isVolunteerProfileComplete
    // بيعتمد عليه لأنه نفس ردّ /login ما بيتضمّن volunteer.city ولا
    // volunteer.skills إطلاقًا (بس GET /volunteers/me بيرجّعهم)، فالفحص
    // الحقلي هناك ما بيقدر ينجح من جلسة تسجيل دخول للأبد.
    // ?? للحفاظ على القيمة عند إعادة التطبيع بعد دمج patch جزئي
    // (updateUser بـ AuthContext) لما ما يجي has_volunteer_profile بالـ patch.
    // بوضع mock الحقل غير موجود إطلاقًا فبتضل undefined (والفحص الحقلي يشتغل)
    hasVolunteerProfile: rawUser.has_volunteer_profile ?? rawUser.hasVolunteerProfile,
  }
}