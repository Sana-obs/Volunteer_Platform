
import { z } from 'zod'

function toDateOnly(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export function createOpportunitySchema(createdAt = new Date()) {
  return z
    .object({
      title: z
        .string()
        .min(1, 'Title is required.')
        .min(3, 'Title must be at least 3 characters.')
        .max(255, 'Title must not exceed 255 characters.'),

      description: z
        .string()
        .min(1, 'Description is required.')
        .min(20, 'Description must be at least 20 characters.'),

      categoryId: z.string().min(1, 'Please select a category.'),

      city: z.string().min(1, 'Please select a governorate.'),

      skills: z.array(z.string()).min(1, 'Please select at least one required skill.'),

      startDate: z.string().min(1, 'Start date is required.'),
      endDate: z.string().min(1, 'End date is required.'),

      // نافذة التسجيل: من متى لمتى يقدر المتطوع يسجّل بالفرصة
      registerStartAt: z.string().min(1, 'Registration start date is required.'),
      registerEndAt: z.string().min(1, 'Registration end date is required.'),

      minHours: z.coerce
        .number({ error: 'Minimum hours must be a valid number.' })
        .min(1, 'Minimum hours must be at least 1.'),
      maxHours: z.coerce
        .number({ error: 'Maximum hours must be a valid number.' })
        .min(1, 'Maximum hours must be at least 1.'),

      totalHours: z.coerce
        .number({ error: 'Total hours must be a valid number.' })
        .min(1, 'Total hours must be at least 1.'),

      minVolunteers: z.coerce
        .number({ error: 'Minimum volunteers must be a valid number.' })
        .int('Minimum volunteers must be a whole number.')
        .min(1, 'At least 1 volunteer is required.'),

      maxVolunteers: z.coerce
        .number({ error: 'Volunteers needed must be a valid number.' })
        .int('Volunteers needed must be a whole number.')
        .min(1, 'At least 1 volunteer is required.'),

      isGroup: z.boolean().optional().default(false),
    })
    .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
      message: 'End date must be on or after the start date.',
      path: ['endDate'],
    })
    .refine((data) => data.maxHours >= data.minHours, {
      message: 'Maximum hours must be greater than or equal to minimum hours.',
      path: ['maxHours'],
    })
    .refine((data) => data.totalHours >= data.maxHours, {
      message: 'Total hours must be at least the maximum hours per volunteer.',
      path: ['totalHours'],
    })
    .refine((data) => data.maxVolunteers >= data.minVolunteers, {
      message: 'Maximum volunteers must be greater than or equal to minimum volunteers.',
      path: ['maxVolunteers'],
    })
    .refine((data) => new Date(data.registerEndAt) >= new Date(data.registerStartAt), {
      message: 'Registration end date must be on or after the registration start date.',
      path: ['registerEndAt'],
    })
    .refine((data) => new Date(data.registerEndAt) <= new Date(data.startDate), {
      message: 'Registration must close on or before the opportunity start date.',
      path: ['registerEndAt'],
    })
  
    .superRefine((data, ctx) => {
      const createdAtDateOnly = toDateOnly(createdAt)

      if (toDateOnly(data.startDate) < createdAtDateOnly) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start date cannot be earlier than the opportunity's creation date.",
          path: ['startDate'],
        })
      }

      if (toDateOnly(data.registerStartAt) < createdAtDateOnly) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Registration start date cannot be earlier than the opportunity's creation date.",
          path: ['registerStartAt'],
        })
      }
    })
}

export const opportunitySchema = createOpportunitySchema()

export function parseOpportunityForm(values, createdAt = new Date()) {
  return createOpportunitySchema(createdAt).safeParse(values)
}
