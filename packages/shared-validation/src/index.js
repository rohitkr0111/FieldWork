import { z } from 'zod';

const indiaPhone = /^\+91[6-9]\d{9}$/;
const websiteUrl = z.string().url().refine((value) => ['https:', 'http:'].includes(new URL(value).protocol), 'Must be an HTTP(S) URL');

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254),
  phone: z.string().trim().regex(indiaPhone, 'Use +91 followed by a valid 10-digit Indian mobile number'),
  businessName: z.string().trim().max(160).optional(), city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(), addressLine1: z.string().trim().max(180).optional(),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid six-digit Indian PIN code').optional(), industryId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(), projectId: z.string().uuid().optional(),
  budgetRange: z.string().max(80).optional(), message: z.string().trim().min(10).max(5000),
  contactConsent: z.literal(true), website: z.string().max(0).optional()
});

export const projectSchema = z.object({
  name: z.string().trim().min(2).max(160), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  clientId: z.string().uuid().nullable().optional(), industryId: z.string().uuid(), categoryId: z.string().uuid().nullable().optional(),
  shortDescription: z.string().trim().min(10).max(320), fullDescription: z.string().max(12000).optional(),
  liveUrl: websiteUrl, thumbnailId: z.string().uuid().nullable().optional(), status: z.enum(['DRAFT','PUBLISHED','ARCHIVED']).optional(),
  featured: z.boolean().optional(), displayOrder: z.number().int().min(0).max(100000).optional(), seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(180).optional(), features: z.array(z.string().trim().min(1).max(120)).max(40).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).optional()
});

export const loginSchema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(256), otp: z.string().regex(/^\d{6}$/).optional() });
export const paginationSchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), sort: z.string().max(40).optional(), order: z.enum(['asc','desc']).default('desc'), q: z.string().trim().max(120).optional() });
