
import {
  UserPlus,
  ClipboardCheck,
  Sparkles,
  UserCheck,
  Building2,
  ShieldCheck,
  Megaphone,
  Users2,
  HelpCircle,
} from "lucide-react";

export const VOLUNTEER_STEPS = [
  { icon: UserPlus, text: "Create a free volunteer account" },
  { icon: ClipboardCheck, text: "Complete your profile: skills, city, and availability" },
  { icon: Sparkles, text: "Browse opportunities or get matches suggested for you" },
  { icon: UserCheck, text: "Apply with one click and track your request status" },
];

export const ORGANIZATION_STEPS = [
  { icon: Building2, text: "Register your organization" },
  { icon: ShieldCheck, text: "Get your organization verified" },
  { icon: Megaphone, text: "Post a cause: category, skills needed, and volunteer count" },
  { icon: Users2, text: "Review applicants and manage your causes in one place" },
];

// ميتاداتا كل فئة سؤال — نقطة واحدة (لون/أيقونة/تسمية) يستخدمها
// HomeFaqSection لتلوين الشارات والأيقونات، بدل ما يتكرر التعريف بمكانين.
// general عمدًا بدون تبويب خاص فيها (راجع FAQ_TAB_CATEGORIES تحت) — أسئلة
// تخص الطرفين سوا، إجبارها جوا "للمتطوعين" أو "للمنظمات" كان رح يكون
// تصنيف غير دقيق
export const FAQ_CATEGORY_META = {
  general: { label: "General", icon: HelpCircle, color: "gray" },
  volunteers: { label: "For Volunteers", icon: Users2, color: "primary" },
  organizations: { label: "For Organizations", icon: Building2, color: "secondary" },
};

// أي فئات من الأعلى تاخد تبويب فلترة خاص فيها بقسم الأسئلة الشائعة —
// مصفوفة منفصلة عمدًا عن FAQ_CATEGORY_META، حتى إضافة فئة جديدة مستقبلًا
// (تبويب خاص فيها أو بس ميتاداتا لشارة) ما تحتاج تعديل أي Component
export const FAQ_TAB_CATEGORIES = ["volunteers", "organizations"];

export const HOME_FAQS = [
  {
    question: "Is it free to join as a volunteer or an organization?",
    answer:
      "Yes, creating an account and using the platform is completely free for both volunteers and organizations.",
    category: "general",
  },
  {
    question: "How are opportunities matched to me?",
    answer:
      "Once your profile is complete (skills and city), you can see opportunities suggested specifically for you based on that information.",
    category: "volunteers",
  },
  {
    question: "Do I need to complete my profile before I can participate?",
    answer:
      "Yes. Volunteers must complete their profile (skills, gender, date of birth, education, and governorate) before joining any opportunity.",
    category: "volunteers",
  },
  {
    question: "Who decides if my request to join is accepted?",
    answer:
      "The organization behind the opportunity reviews each request and marks it as pending, accepted, or rejected.",
    category: "organizations",
  },
  {
    question: "What do the colored labels on opportunities mean?",
    answer:
      "Green means you can still join. Yellow means registration has closed but the opportunity hasn't started yet. Blue means it's happening right now. Gray means it has finished.",
    category: "general",
  },
  {
    question: "Does an organization need approval before posting causes?",
    answer:
      "Yes, organizations go through a verification step before they're able to publish opportunities on the platform.",
    category: "organizations",
  },
];