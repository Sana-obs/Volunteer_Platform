// استثناء عرض محدد باسم منظمة واحدة فقط: شعارها أبيض/فاتح جدًا فبيضيع
// على خلفية bg-white العادية لباقي شعارات المنظمات. لا تضيفي شرطًا عامًا
// هون — فقط أسماء المنظمات يلي شعارها فاتح فعليًا تحتاج خلفية غامقة.
export const LIGHT_LOGO_ORGANIZATION_NAMES = ["Syria Trust for Development"];

export function isLightLogoOrganization(name) {
  return LIGHT_LOGO_ORGANIZATION_NAMES.includes(name);
}
