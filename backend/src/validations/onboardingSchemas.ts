import { z } from 'zod';

export const CandidateTypeEnum = z.enum([
  'STUDENT',
  'GRADUATE',
  'PROFESSIONAL',
  'EXPERIENCED',
]);

export const SkillLevelEnum = z.enum([
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
]);

export const SkillSourceEnum = z.enum([
  'USER',
  'RESUME',
  'ASSESSMENT',
  'COURSE',
  'MENTOR',
  'IMPORTED',
]);

export const Step1AboutYouSchema = z.object({
  name: z.string().min(2, 'Full name is required (at least 2 characters)'),
  phone: z.string().min(5, 'Phone number is required (include country code)'),
  location: z.string().min(2, 'Current location is required (e.g. San Francisco, CA or London, UK)'),
  candidateType: CandidateTypeEnum,
  headline: z.string().optional(),
  bio: z.string().optional(),
});

export const EducationItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(2, 'Institution name is required'),
  degree: z.string().min(2, 'Degree or qualification is required'),
  fieldOfStudy: z.string().min(2, 'Field of study is required'),
  location: z.string().optional(),
  startYear: z.number().int().min(1950).max(2100),
  endYear: z.number().int().min(1950).max(2100).nullable().optional(),
  isCurrent: z.boolean().default(false),
  gpa: z.string().optional(),
  coursework: z.string().optional(),
  achievements: z.string().optional(),
  source: z.string().default('USER'),
});

export const ExperienceItemSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(2, 'Company name is required'),
  roleTitle: z.string().min(2, 'Job title is required'),
  employmentType: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().min(2, 'Start date is required'),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  achievements: z.string().optional(),
  source: z.string().default('USER'),
});

export const Step2EducationSchema = z.object({
  education: z.array(EducationItemSchema),
});

export const Step3ExperienceSchema = z.object({
  hasNoExperience: z.boolean().default(false),
  experience: z.array(ExperienceItemSchema),
});

export const UserSkillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().optional(),
  level: SkillLevelEnum.default('INTERMEDIATE'),
  source: SkillSourceEnum.default('USER'),
  verified: z.boolean().default(false),
});

export const Step4SkillsSchema = z.object({
  skills: z.array(UserSkillSchema).min(1, 'Please add at least one skill'),
});

export const ProjectItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, 'Project title is required'),
  description: z.string().optional(),
  role: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  projectType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  projectUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  achievements: z.string().optional(),
  source: z.string().default('USER'),
});

export const Step5ProjectsSchema = z.object({
  projects: z.array(ProjectItemSchema),
});

export const Step6CareerDirectionSchema = z.object({
  targetRole: z.string().min(2, 'Target job role is required'),
  careerField: z.string().optional(),
  targetIndustry: z.string().optional(),
  careerGoalType: z.string().optional(),
  timeframe: z.string().optional(),
  notes: z.string().optional(),
});

export const Step7PreferencesSchema = z.object({
  preferredJobType: z.string().optional(),
  preferredLocation: z.string().optional(),
  workEnvironment: z.string().optional(),
  willingToRelocate: z.boolean().default(false),
  preferredIndustries: z.array(z.string()).default([]),
  preferredCompanySize: z.string().optional(),
  minExpectedSalary: z.string().optional(),
  preferredSalaryRange: z.string().optional(),
  noticePeriod: z.string().optional(),
  availability: z.string().optional(),
  learningStyle: z.array(z.string()).default([]),
  availableHoursPerWeek: z.string().optional(),
  mentorshipNeeds: z.array(z.string()).default([]),
});

export const CertificationItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Certification name is required'),
  issuingOrganization: z.string().min(2, 'Issuing organization is required'),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
  source: z.string().default('USER'),
});

export const AchievementItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, 'Achievement title is required'),
  description: z.string().optional(),
  organization: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
  source: z.string().default('USER'),
});

export const ProfessionalLinkItemSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Please enter a valid URL'),
});

export const FullOnboardingPayloadSchema = z.object({
  aboutYou: Step1AboutYouSchema,
  education: z.array(EducationItemSchema),
  hasNoExperience: z.boolean().default(false),
  experience: z.array(ExperienceItemSchema),
  skills: z.array(UserSkillSchema),
  projects: z.array(ProjectItemSchema),
  careerDirection: Step6CareerDirectionSchema,
  preferences: Step7PreferencesSchema,
  certifications: z.array(CertificationItemSchema).default([]),
  achievements: z.array(AchievementItemSchema).default([]),
  professionalLinks: z.array(ProfessionalLinkItemSchema).default([]),
});

export type Step1AboutYouInput = z.infer<typeof Step1AboutYouSchema>;
export type EducationItemInput = z.infer<typeof EducationItemSchema>;
export type ExperienceItemInput = z.infer<typeof ExperienceItemSchema>;
export type UserSkillInput = z.infer<typeof UserSkillSchema>;
export type ProjectItemInput = z.infer<typeof ProjectItemSchema>;
export type Step6CareerDirectionInput = z.infer<typeof Step6CareerDirectionSchema>;
export type Step7PreferencesInput = z.infer<typeof Step7PreferencesSchema>;
export type CertificationItemInput = z.infer<typeof CertificationItemSchema>;
export type AchievementItemInput = z.infer<typeof AchievementItemSchema>;
export type ProfessionalLinkItemInput = z.infer<typeof ProfessionalLinkItemSchema>;
export type FullOnboardingPayload = z.infer<typeof FullOnboardingPayloadSchema>;
