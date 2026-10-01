import { z } from 'zod';

const stringOrArray = z.union([z.string(), z.array(z.string())]).optional().transform((val) => {
  if (!val) return undefined;
  if (Array.isArray(val)) return val.filter(Boolean);
  return val.split(',').map((s) => s.trim()).filter(Boolean);
});

export const JobSearchQuerySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  workMode: stringOrArray,
  employmentType: stringOrArray,
  experienceLevel: stringOrArray,
  skills: stringOrArray,
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  postedWithin: z.enum(['24h', '3d', '7d', '30d']).optional(),
  sort: z.enum(['newest', 'relevance']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const JobApplySchema = z.object({
  coverNote: z.string().max(2000, 'Cover note cannot exceed 2000 characters').optional(),
  answers: z.record(z.any()).optional(),
  resumeUrl: z.string().url('Invalid resume URL').optional().or(z.literal('')),
});

export const CreateJobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  company: z.string().min(2, 'Company name is required'),
  companyLogo: z.string().url().optional(),
  location: z.string().min(2, 'Location is required'),
  workMode: z.enum(['Remote', 'Hybrid', 'On-site']),
  employmentType: z.enum(['Full-time', 'Part-time', 'Internship', 'Contract']),
  experienceLevel: z.enum(['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years']),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  salaryCurrency: z.string().default('INR'),
  salaryPeriod: z.enum(['YEAR', 'MONTH', 'HOUR']).default('YEAR'),
  description: z.string().min(20, 'Job description must be at least 20 characters'),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  niceToHave: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'ARCHIVED']).default('PUBLISHED'),
  jobVerified: z.boolean().default(false),
  companyVerified: z.boolean().default(false),
  featured: z.boolean().default(false),
});
