export * from './db/client';
export * from './auth/security';
export * from './auth/googleAuth';
export * from './validations/schemas';
export {
  CandidateTypeEnum,
  SkillLevelEnum,
  SkillSourceEnum,
  Step1AboutYouSchema,
  Step2EducationSchema,
  Step3ExperienceSchema,
  UserSkillSchema,
  Step4SkillsSchema,
  ProjectItemSchema,
  Step5ProjectsSchema,
  Step6CareerDirectionSchema,
  Step7PreferencesSchema,
  CertificationItemSchema,
  AchievementItemSchema,
  ProfessionalLinkItemSchema,
  FullOnboardingPayloadSchema,
  type Step1AboutYouInput,
  type EducationItemInput,
  type ExperienceItemInput,
  type UserSkillInput,
  type ProjectItemInput,
  type Step6CareerDirectionInput,
  type Step7PreferencesInput,
  type CertificationItemInput,
  type AchievementItemInput,
  type ProfessionalLinkItemInput,
  type FullOnboardingPayload,
} from './validations/onboardingSchemas';
export * from './services/userService';
export * from './services/profileService';
export * from './services/profileCompletion';
export * from './types/profile';

// RBAC & Admin Domain Layer
export * from './types/rbac';
export * from './types/admin';
export * from './validations/adminSchemas';
export * from './services/auditService';
export * from './services/adminAuthService';
export * from './services/courseService';
export * from './services/mentorService';
export * from './services/adminJobService';
export * from './services/adminApplicationService';
export * from './services/adminUserService';
export * from './services/adminDashboardService';

// Mentorship Domain Layer
export * from './types/mentorship';
export * from './validations/mentorshipSchemas';
export * from './services/mentorship/mentorAuthService';
export * from './services/mentorship/mentorProfileService';
export * from './services/mentorship/mentorshipService';
export * from './services/mentorship/availabilityService';
export * from './services/mentorship/bookingService';
export * from './services/mentorship/sessionService';
export * from './services/mentorship/mentorStudentService';
export * from './services/mentorship/reviewService';
export * from './services/mentorship/mentorDashboardService';

// Mentor Onboarding & Email Layer
export * from './services/mentorApplicationService';
export * from './services/passwordSetupTokenService';
export * from './services/email/emailService';
export * from './services/email/zeptoMailProvider';
export * from './services/email/types';

// Employer & Recruiter Domain Layer
export * from './types/employerApplication';
export * from './types/recruiter';
export * from './validations/employerApplicationSchemas';
export * from './validations/recruiterSchemas';
export * from './services/recruiter/recruiterAuthService';
export * from './services/recruiter/employerApplicationService';
export * from './services/recruiter/recruiterJobService';
export * from './services/recruiter/recruiterApplicationService';
export * from './services/recruiter/recruiterCandidateService';
export * from './services/recruiter/recruiterInterviewService';
export * from './services/recruiter/recruiterAssessmentService';
export * from './services/recruiter/recruiterOfferService';
export * from './services/recruiter/recruiterCompanyService';
export * from './services/recruiter/recruiterTeamService';
export * from './services/recruiter/recruiterDashboardService';

