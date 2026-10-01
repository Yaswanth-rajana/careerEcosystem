import { z } from 'zod';

export const Step1AboutYouSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  workEmail: z.string().email('Please enter a valid work email address'),
  phone: z.string().min(7, 'Please provide a valid phone number').max(20),
  designation: z.string().min(2, 'Designation / job title is required').max(100),
  linkedInUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')).nullable(),
});

export const Step2CompanySchema = z.object({
  companyName: z.string().min(2, 'Company name is required').max(150),
  companyWebsite: z.string().url('Please enter a valid company website URL'),
  companyLinkedIn: z.string().url('Invalid company LinkedIn URL').optional().or(z.literal('')).nullable(),
  industry: z.string().min(2, 'Industry is required'),
  companySize: z.string().min(1, 'Company size is required'),
  headquartersLocation: z.string().min(2, 'Headquarters location is required'),
});

export const Step3HiringSchema = z.object({
  rolesHired: z.array(z.string()).min(1, 'Please select or add at least one role commonly hired'),
  hiringVolume: z.string().optional().nullable(),
  preferredExperienceLevels: z.array(z.string()).default([]),
  hiringLocations: z.array(z.string()).default([]),
  workModes: z.array(z.string()).default([]),
});

export const Step4VerificationSchema = z.object({
  verificationNotes: z.string().max(1000).optional().nullable(),
});

export const FullEmployerApplicationSchema = Step1AboutYouSchema
  .merge(Step2CompanySchema)
  .merge(Step3HiringSchema)
  .merge(Step4VerificationSchema);

export const EmployerApplicationDecisionSchema = z.object({
  decisionReason: z.string().max(500).optional(),
  internalNotes: z.string().max(1000).optional(),
});
