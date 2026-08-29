/**
 * نقطة الاستخراج الوحيدة لمعرّف منظمة المستخدم الحالي في كامل التطبيق.
 *

 * الحقيقي اختلف لاحقًا عن المتوقع، التعديل بيصير هون بس، مش بسبع ملفات.
 *
 * @param {{organization?: {id?: string|number}, organizationId?: string|number}|null|undefined} user
 * @returns {string|number|null}
 */
export function getOrganizationId(user) {
  return user?.organization?.id ?? user?.organizationId ?? null
}