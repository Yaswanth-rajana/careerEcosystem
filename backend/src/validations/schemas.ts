import { z } from 'zod';

// Authentication Schemas
export const SignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['CANDIDATE', 'MENTOR', 'RECRUITER']).default('CANDIDATE'),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

// Candidate Onboarding Step Schemas
export const OnboardingStep1Schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  location: z.string().min(2, 'Location is required (e.g. San Francisco, CA / Mumbai, IN)'),
  headline: z.string().min(2, 'Professional headline is required'),
  candidateType: z.enum(['STUDENT', 'GRADUATE', 'PROFESSIONAL', 'EXPERIENCED']),
  bio: z.string().optional(),
});

export const EducationItemSchema = z.object({
  institution: z.string().min(2, 'Institution name is required'),
  degree: z.string().min(2, 'Degree title is required (e.g. B.S., M.S.)'),
  fieldOfStudy: z.string().min(2, 'Field of study is required (e.g. Computer Science)'),
  startYear: z.number().int().min(1970).max(2100),
  endYear: z.number().int().min(1970).max(2100).optional(),
  isCurrent: z.boolean().default(false),
});

export const ExperienceItemSchema = z.object({
  company: z.string().min(2, 'Company name is required'),
  roleTitle: z.string().min(2, 'Role title is required'),
  location: z.string().optional(),
  startDate: z.string().min(4, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
});

export const OnboardingStep2Schema = z.object({
  currentRole: z.string().optional(),
  totalExperience: z.string().optional(),
  education: z.array(EducationItemSchema).min(1, 'Please add at least one education entry'),
  experience: z.array(ExperienceItemSchema).optional(),
});

export const OnboardingStep3Schema = z.object({
  skills: z.array(z.object({
    name: z.string().min(1),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  })).min(1, 'Please select at least one skill'),
  interests: z.array(z.string()).min(1, 'Please select at least one career interest'),
});

export const OnboardingStep4Schema = z.object({
  targetRole: z.string().min(2, 'Target role or career goal is required'),
  targetIndustry: z.string().optional(),
  timeframe: z.string().optional(),
  notes: z.string().optional(),
});

export const FullOnboardingSchema = z.object({
  step1: OnboardingStep1Schema,
  step2: OnboardingStep2Schema,
  step3: OnboardingStep3Schema,
  step4: OnboardingStep4Schema,
});
