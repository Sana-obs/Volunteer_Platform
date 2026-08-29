import { z } from 'zod'
import { ACCOUNT_TYPES } from '../../constants/auth/accountTypes'

const requiredText = (message) => z.string().trim().min(1, message)
const requiredFile = (message) =>
  z.any().refine((value) => {
    if (typeof FileList !== 'undefined' && value instanceof FileList) {
      return value.length > 0
    }

    return Boolean(value)
  }, message)

// الـ schemas نفسها مُصدَّرة مباشرة (بدل دوال parse يدوية) عشان تصير
// قابلة للاستخدام مباشرة مع zodResolver من react-hook-form، بدل تكرار
// منطق "safeParse + مطابقة الأخطاء يدويًا" بكل صفحة على حدة.
export const loginSchema = z.object({
  email: requiredText('Email address is required.').email('Please enter a valid email address.'),
  password: requiredText('Password is required.'),
})

export const forgotPasswordSchema = z.object({
  email: requiredText('Email address is required.').email('Please enter a valid email address.'),
})

export const resetPasswordSchema = z
  .object({
    password: requiredText('Password is required.').min(8, 'Password must be at least 8 characters long.'),
    confirmPassword: requiredText('Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

const registerBaseSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  orgName: z.string().optional(),
  contactPerson: z.string().optional(),
  email: requiredText('Email address is required.').email('Please enter a valid email address.'),
  // الهاتف مطلوب دائمًا عند التسجيل (متطوع أو منظمة على حد سواء)، فحطيناه
  // هون مرة وحدة بدل تكرار "required" برسالتين مختلفتين بكل extend() تحت
  phone: requiredText('Phone number is required.'),
  password: requiredText('Password is required.').min(8, 'Password must be at least 8 characters long.'),
})

/**
 * يبني schema التسجيل حسب نوع الحساب (متطوع/منظمة) — تُستخدم كـ resolver
 * ديناميكي بـ Register.jsx، فتُعاد حسابها تلقائيًا كل مرة يتغيّر فيها
 * accountType (بدون إعادة تركيب useForm نفسه).
 * @param {string} accountType
 */
export function getRegisterSchema(accountType) {
  if (accountType === ACCOUNT_TYPES.VOLUNTEER) {
    return registerBaseSchema.extend({
      firstName: requiredText('First name is required.'),
      lastName: requiredText('Last name is required.'),
    })
  }

  return registerBaseSchema.extend({
    orgName: requiredText('Organization name is required.'),
    contactPerson: requiredText('Contact person is required.'),
    verificationImage: requiredFile('Organization verification image is required.'),
  })
}