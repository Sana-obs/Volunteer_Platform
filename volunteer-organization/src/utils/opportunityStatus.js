
import { OPPORTUNITY_STATUS } from "../constants/opportunityStatus";

/**
 * @param {{startDate?:string, endDate?:string, registerEndAt?:string,
 *   currentVolunteers?:number, maxVolunteers?:number, registrationClosedManually?:boolean}} opportunity
 * @param {Date} [now] - محقونة كوسيط لتسهيل الاختبار، افتراضيًا الوقت الحالي
 */
export function getEffectiveOpportunityStatus(opportunity, now = new Date()) {
  const startDate = opportunity.startDate ? new Date(opportunity.startDate) : null;
  const endDate = opportunity.endDate ? new Date(opportunity.endDate) : null;
  const registerEndAt = opportunity.registerEndAt ? new Date(opportunity.registerEndAt) : null;

  // انتهت الفرصة فعليًا — أعلى أولوية، بغض النظر عن أي شي آخر
  if (endDate && now > endDate) return OPPORTUNITY_STATUS.COMPLETED;

  // بدأ العمل الفعلي بالفرصة (وصلنا start_date) لكن لسا ما انتهت
  if (startDate && now >= startDate) return OPPORTUNITY_STATUS.IN_PROGRESS;

  // قبل ما تبدأ الفرصة: إما التسجيل لسا مفتوح أو انتهى
  const isFull =
    opportunity.maxVolunteers != null &&
    (opportunity.currentVolunteers || 0) >= opportunity.maxVolunteers;
  const registrationWindowPassed = Boolean(registerEndAt && now > registerEndAt);
  const closedManually = Boolean(opportunity.registrationClosedManually);

  if (isFull || registrationWindowPassed || closedManually) {
    return OPPORTUNITY_STATUS.REGISTRATION_CLOSED;
  }

  return OPPORTUNITY_STATUS.REGISTRATION_OPEN;
}

/** اختصار شائع الاستخدام: هل المتطوع لسا يقدر يسجّل بهاي الفرصة؟ */
export function isRegistrationOpen(opportunity, now = new Date()) {
  return getEffectiveOpportunityStatus(opportunity, now) === OPPORTUNITY_STATUS.REGISTRATION_OPEN;
}

/**
 * @param {{currentVolunteers?:number, minVolunteers?:number}} opportunity
 * @param {Date} [now] - محقونة كوسيط لتسهيل الاختبار
 */
export function isSuccessfulOpportunity(opportunity, now = new Date()) {
  if (getEffectiveOpportunityStatus(opportunity, now) !== OPPORTUNITY_STATUS.COMPLETED) return false;
  // || 0 لازمة على الطرفين: minVolunteers ممكن يكون undefined ببيانات
  // قديمة/ناقصة، وبدونها X >= undefined بترجع false صامتًا لكل الفرص
  return (opportunity.currentVolunteers || 0) >= (opportunity.minVolunteers || 0);
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * @param {string} [startDate]
 * @param {Date} [now] - محقونة كوسيط لتسهيل الاختبار
 */
export function getDaysUntilStart(startDate, now = new Date()) {
  if (!startDate) return null;
  const msUntilStart = new Date(startDate) - now;
  if (msUntilStart <= 0 || msUntilStart > TWO_DAYS_MS) return null;
  return Math.max(1, Math.ceil(msUntilStart / (24 * 60 * 60 * 1000)));
}