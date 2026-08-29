
import { z } from 'zod'
import { getGovernorateSelectValueFromApiCity } from '../../services/syrianGovernorates'

const authUserSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    email: z.string().email(),
  })
  .passthrough()

export const authResponseSchema = z
  .object({
    user: authUserSchema,
    token: z.string().min(1, 'Token missing from server response'),
  })
  .passthrough()

/**
 * @returns {{success: true, data: object} | {success: false, error: string}}
 */
export function validateAuthResponse(responseData) {
  const result = authResponseSchema.safeParse(responseData)

  if (!result.success) {
    console.error('Unexpected auth API response shape:', result.error.flatten())
    return {
      success: false,
      error: 'Unexpected response from server. Please try again or contact support.',
    }
  }

  return { success: true, data: result.data }
}

const organizationProfileResponseSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    name: z.string().default(''),
    description: z.string().nullable().default(''),
    city: z
      .union([z.string(), z.object({ id: z.union([z.string(), z.number()]) }).passthrough()])
      .nullable()
      .default(''),
    website: z.string().nullable().default(''),
    contact_person: z.string().default(''),
    profile_image: z.string().nullable().default(null),
    verification_document: z.string().nullable().default(null),
    status: z.string().nullable().default(null),
    rejectionReason: z.string().nullable().optional(),
    rejection_reason: z.string().nullable().optional(),
    owner: z
      .object({
        id: z.union([z.string(), z.number()]).optional(),
        name: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough()
  .transform((data) => ({
    id: data.id ?? null,
    name: data.name,
    email: data.owner?.email || '',
    description: data.description || '',
    city: data.city,
    website: data.website || '',
    contactPerson: data.contact_person,
    imageUrl: data.profile_image,
    verificationDocumentUrl: data.verification_document,
    status: data.status || 'pending',
    rejectionReason: data.rejectionReason ?? data.rejection_reason ?? null,
    owner: data.owner || null,
  }))

/**
 * تتحقق من شكل استجابة بروفايل المنظمة الحقيقية عند الجلب.
 * @param {Array<{id:number, nameEn:string}>} [governorates] - القائمة الحقيقية
 * @returns {{success: true, data: object} | {success: false, error: string}}
 */
export function validateOrganizationProfileResponse(responseData, governorates = []) {
  const result = organizationProfileResponseSchema.safeParse(responseData)

  if (!result.success) {
    console.error('Unexpected organization profile API response shape:', result.error.flatten())
    return {
      success: false,
      error: 'Unexpected response from server while loading organization profile.',
    }
  }

  return {
    success: true,
    data: {
      ...result.data,
      city: getGovernorateSelectValueFromApiCity(result.data.city, governorates) || '',
    },
  }
}

const nestedOrganizationSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    name: z.string().default(''),
    image_url: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((data) => ({
    id: data.id ?? null,
    name: data.name,
    imageUrl: data.image_url ?? null,
    phone: data.phone ?? null,
    status: null,
  }))

/**
 * @param {object|null|undefined} rawOrganization
 */
export function normalizeOpportunityOrganization(rawOrganization) {
  if (!rawOrganization) return null

  const result = nestedOrganizationSchema.safeParse(rawOrganization)
  if (!result.success) {
    console.error('Unexpected organization shape inside opportunity response:', result.error.flatten())
    return rawOrganization
  }

  return result.data
}