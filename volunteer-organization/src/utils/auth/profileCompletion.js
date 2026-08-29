// utils/auth/profileCompletion.js
//
// نقطة واحدة لتحديد هل بروفايل المتطوع "مكتمل" أو لأ.
//
// ⚠️ سابقًا كنا نعتمد على علم واحد جاهز (user.profileCompleted)، بس
// هذا العلم كان يُضبط يدويًا بالفرونت بس (وضع mock)، والباك اند
// الحقيقي أصلًا ما بيرجّعه بأي استجابة (login / /volunteers/me) —
// يعني بوضع real كان بيضل undefined للأبد، وأي متطوع حقيقي كان رح
// ينحبس بصفحة البروفايل حتى لو عبّاها صح.
//
// الحل: نفحص الحقول الفعلية المطلوبة مباشرة على كائن المستخدم، بدل
// الاعتماد على علم قد لا يوصل من الباك اند أبدًا. هاد بيخلي الفحص
// شغّال بنفس الطريقة تمامًا بوضعي mock وreal معًا، بدون أي فرق سلوك.
//
// ⚠️ القائمة هون لازم تبقى مطابقة تمامًا للحقول الإجبارية بـ
// profileSchema (utils/auth/VolunteerProfileValidation.js). لو
// أضفتِ/حذفتِ حقل إجباري هناك، حدّثي هون كمان بنفس الوقت.
//
// ⚠️ تحديث (تأكيد حي 2026-08-27): ردّ POST /login (UserResource) ما
// بيتضمّن volunteer.city ولا volunteer.skills إطلاقًا — بس GET
// /volunteers/me بيرجّعهم. يعني الفحص الحقلي تحت (hasCity/hasSkills) ما
// بيقدر ينجح أبدًا من جلسة تسجيل دخول، وكل متطوع مكتمل فعليًا كان بينحبس
// بصفحة "أكمل بروفايلك" فور الدخول. الباك اند بيرجّع علم
// has_volunteer_profile بردّ /login و/register (يطبّعه normalizeUser لـ
// user.hasVolunteerProfile)، وبيصير true فقط بعد POST /volunteers يلي
// بيفرض كل الحقول الإجبارية (governorate_id/education_level/birth_date/
// skills/gender — 422 بدونهم)، فهو إشارة اكتمال موثوقة ومكافئة للفحص
// الحقلي. بوضع mock العلم غير موجود (undefined) ومنكمّل للفحص الحقلي
// نفسه، فما في أي فرق سلوك بين وضعي mock وreal.
export function isVolunteerProfileComplete(user) {
  if (!user) return false

  if (user.hasVolunteerProfile === true) return true

  const hasEducationLevel = Boolean(user.educationLevel)
  const hasDateOfBirth = Boolean(user.dateOfBirth || user.dob)
  const hasGender = Boolean(user.gender)
  const hasCity = Boolean(user.city)
  // skillNames: شكل الباك اند الحقيقي قبل ما تتوفر availableSkills لتحويلها
  // لـ IDs (راجع flattenVolunteerProfile بـ normalizeUser.js) — بدونها هون
  // متطوع حقيقي عبّى مهاراته فعليًا كان رح يفشل هالفحص لمجرد إنه skillIds
  // لسا فاضية لحظة أول تحميل، ويُحبس بصفحة "أكمل بروفايلك" رغم إنه مكتمل فعلًا
  const hasSkills =
    (Array.isArray(user.skillIds) && user.skillIds.length > 0) ||
    (Array.isArray(user.skillNames) && user.skillNames.length > 0)

  // about اختياري بالـ schema فما منشترطه هون. interests ما عاد جزء من
  // الفورم/الـ schema إطلاقًا (محسوب تلقائيًا بالباك اند)
  return hasEducationLevel && hasDateOfBirth && hasGender && hasCity && hasSkills
}

// نقطة واحدة لتحديد هل بروفايل المنظمة "مكتمل" أو لأ — تذكير غير مانع بس،
// ومش مرتبط بـ RequireCompleteProfile (هاد المكوّن خاص بالمتطوع حصرًا ولا
// يُستخدم مع المنظمة إطلاقًا).
//
// ⚠️ القائمة هون لازم تبقى مطابقة تمامًا للحقول الإجبارية بـ
// organizationProfileSchema (utils/auth/OrganizationProfileValidation.js)
// ما عدا website (اختياري بالـ schema، فما منشترطه هون).
export function isOrganizationProfileComplete(organization) {
  if (!organization) return false

  const hasDescription = Boolean(organization.description)
  const hasCity = Boolean(organization.city)

  return hasDescription && hasCity
}