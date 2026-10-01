import { z } from 'zod';

export const AdminPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().optional().default(''),
  status: z.string().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
  domain: z.string().optional(),
  role: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const AdminCourseLessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, 'Lesson title must be at least 2 characters'),
  durationMin: z.coerce.number().int().min(1).default(10),
  type: z.enum(['VIDEO', 'ARTICLE', 'QUIZ', 'PROJECT']).default('VIDEO'),
  contentUrl: z.string().url().optional().nullable().or(z.literal('')),
  contentBody: z.string().optional().nullable().or(z.literal('')),
  order: z.coerce.number().int().default(1),
});

export const AdminCourseModuleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, 'Module title must be at least 2 characters'),
  description: z.string().optional().nullable().or(z.literal('')),
  order: z.coerce.number().int().default(1),
  lessons: z.array(AdminCourseLessonSchema).default([]),
});

export const AdminCourseCreateSchema = z.object({
  title: z.string().min(3, 'Course title must be at least 3 characters'),
  slug: z.string().min(3).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional().nullable(),
  category: z.string().min(2, 'Category is required'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  instructorName: z.string().min(2, 'Instructor name is required'),
  instructorTitle: z.string().optional().nullable(),
  instructorAvatar: z.string().optional().nullable(),
  durationHours: z.coerce.number().min(0).default(0),
  skills: z.array(z.string()).default([]),
  learningObjectives: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'PAUSED', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  modules: z.array(AdminCourseModuleSchema).default([]),
});

export const AdminCourseUpdateSchema = AdminCourseCreateSchema.partial();

export const AdminMentorApproveSchema = z.object({
  note: z.string().optional(),
});

export const AdminMentorRejectSchema = z.object({
  reason: z.string().min(5, 'Rejection reason must be at least 5 characters'),
});

export const AdminMentorStatusSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED']),
  reason: z.string().optional(),
});

export const AdminJobModerateSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'CLOSED', 'ARCHIVED']),
  featured: z.boolean().optional(),
  jobVerified: z.boolean().optional(),
  companyVerified: z.boolean().optional(),
  reason: z.string().optional(),
});

export const AdminUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']),
  reason: z.string().optional(),
});

export const AdminUserRoleSchema = z.object({
  role: z.enum(['CANDIDATE', 'MENTOR', 'RECRUITER', 'ADMIN', 'SUPER_ADMIN']),
  reason: z.string().optional(),
});
