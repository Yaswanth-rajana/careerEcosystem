import { z } from 'zod';

export const RecruiterJobCreateSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters').max(150),
  department: z.string().max(100).optional().nullable(),
  employmentType: z.enum(['Full-time', 'Part-time', 'Internship', 'Contract']),
  workMode: z.enum(['Remote', 'Hybrid', 'On-site']),
  location: z.string().min(2, 'Location is required'),
  experienceLevel: z.enum(['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years']),
  salaryMin: z.number().int().nonnegative().optional().nullable(),
  salaryMax: z.number().int().nonnegative().optional().nullable(),
  salaryCurrency: z.string().default('INR'),
  salaryPeriod: z.enum(['YEAR', 'MONTH', 'HOUR']).default('YEAR'),
  description: z.string().min(20, 'Job description must be at least 20 characters'),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  niceToHave: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  skills: z.array(z.string()).min(1, 'Please provide at least one required skill'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export const RecruiterJobUpdateSchema = RecruiterJobCreateSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED']).optional(),
});

export const RecruiterApplicationStatusUpdateSchema = z.object({
  status: z.enum([
    'APPLIED',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'TASK_PENDING',
    'TASK_SUBMITTED',
    'INTERVIEW',
    'OFFER',
    'REJECTED',
    'WITHDRAWN',
  ]),
  feedback: z.string().max(2000).optional().nullable(),
});

export const RecruiterInterviewCreateSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  applicationId: z.string().min(1, 'Application ID is required'),
  candidateId: z.string().min(1, 'Candidate ID is required'),
  title: z.string().min(3, 'Interview title is required').max(150),
  type: z.enum(['TECHNICAL', 'HR', 'MANAGERIAL', 'BEHAVIORAL']).default('TECHNICAL'),
  scheduledAt: z.string().datetime({ message: 'Valid scheduled date/time is required' }),
  durationMinutes: z.number().int().min(15).max(180).default(45),
  meetingUrl: z.string().url('Invalid meeting URL').optional().or(z.literal('')).nullable(),
  interviewerName: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const RecruiterInterviewUpdateSchema = RecruiterInterviewCreateSchema.partial().extend({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
});

export const RecruiterAssessmentCreateSchema = z.object({
  jobId: z.string().optional().nullable(),
  title: z.string().min(3, 'Assessment title is required').max(150),
  description: z.string().max(1000).optional().nullable(),
  type: z.enum(['MCQ', 'TECHNICAL', 'CODING', 'CUSTOM']).default('MCQ'),
  timeLimitMinutes: z.number().int().min(5).max(180).default(30),
  passingScore: z.number().int().min(0).max(100).default(70),
  questions: z.array(
    z.object({
      question: z.string().min(5, 'Question text required'),
      type: z.enum(['MCQ', 'CODING', 'SQL', 'SHORT_ANSWER']).default('MCQ'),
      options: z.array(z.string()).default([]),
      correctAnswer: z.string().min(1, 'Correct answer required'),
      points: z.number().int().min(1).default(1),
    })
  ).default([]),
});

export const RecruiterOfferCreateSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  applicationId: z.string().min(1, 'Application ID is required'),
  candidateId: z.string().min(1, 'Candidate ID is required'),
  positionTitle: z.string().min(2, 'Position title is required').max(150),
  salaryOffered: z.number().int().positive('Salary offered must be positive'),
  currency: z.string().default('INR'),
  salaryPeriod: z.enum(['YEAR', 'MONTH', 'HOUR']).default('YEAR'),
  startDate: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const CompanyProfileUpdateSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  website: z.string().url().optional(),
  linkedIn: z.string().url().optional().or(z.literal('')).nullable(),
  industry: z.string().min(2).optional(),
  size: z.string().min(1).optional(),
  location: z.string().min(2).optional(),
  description: z.string().max(3000).optional().nullable(),
  culture: z.string().max(3000).optional().nullable(),
  benefits: z.array(z.string()).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')).nullable(),
});

export const TeamMemberInviteSchema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(2, 'Name required'),
  role: z.enum(['COMPANY_ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER']).default('RECRUITER'),
  title: z.string().max(100).optional().nullable(),
});
