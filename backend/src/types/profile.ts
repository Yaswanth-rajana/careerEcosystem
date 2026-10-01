export type CandidateType = 'STUDENT' | 'GRADUATE' | 'PROFESSIONAL' | 'EXPERIENCED';

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type SkillSource = 'USER' | 'RESUME' | 'ASSESSMENT' | 'COURSE' | 'MENTOR' | 'IMPORTED';

export interface PersonalProfileDTO {
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  headline: string | null;
  bio: string | null;
  candidateType: CandidateType;
  avatarUrl: string | null;
}

export interface EducationDTO {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location?: string | null;
  startYear: number;
  endYear?: number | null;
  isCurrent: boolean;
  gpa?: string | null;
  coursework?: string | null;
  achievements?: string | null;
  source: string;
}

export interface ExperienceDTO {
  id: string;
  company: string;
  roleTitle: string;
  employmentType?: string | null;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  responsibilities?: string | null;
  achievements?: string | null;
  source: string;
}

export interface SkillDTO {
  id: string;
  name: string;
  category?: string | null;
  level: SkillLevel;
  source: string;
  verified: boolean;
}

export interface ProjectDTO {
  id: string;
  title: string;
  description?: string | null;
  role?: string | null;
  technologies: string[];
  projectType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  projectUrl?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  achievements?: string | null;
  source: string;
}

export interface CareerGoalDTO {
  targetRole: string;
  careerField?: string | null;
  targetIndustry?: string | null;
  careerGoalType?: string | null;
  timeframe?: string | null;
  notes?: string | null;
}

export interface JobPreferenceDTO {
  preferredJobType?: string | null;
  preferredLocation?: string | null;
  workEnvironment?: string | null;
  willingToRelocate: boolean;
  preferredIndustries: string[];
  preferredCompanySize?: string | null;
  minExpectedSalary?: string | null;
  preferredSalaryRange?: string | null;
  noticePeriod?: string | null;
  availability?: string | null;
  learningStyle: string[];
  availableHoursPerWeek?: string | null;
  mentorshipNeeds: string[];
}

export interface ProfessionalLinkDTO {
  id: string;
  platform: string;
  url: string;
}

export interface CertificationDTO {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  source: string;
}

export interface AchievementDTO {
  id: string;
  title: string;
  description?: string | null;
  organization?: string | null;
  date?: string | null;
  url?: string | null;
  source: string;
}

export interface ProfileCompletionDTO {
  percentage: number;
  completedSections: string[];
  missingSections: string[];
  nextSection: string;
  sectionScores: Record<string, { earned: number; max: number; isComplete: boolean }>;
}

export interface AccountSettingsDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  provider: string;
  hasPassword: boolean;
  hasGoogleLinked: boolean;
  createdAt: string;
}

export interface CollectionCountsDTO {
  education: number;
  experience: number;
  skills: number;
  projects: number;
  certifications: number;
  achievements: number;
  links: number;
}

/**
 * Lightweight DTO returned on initial GET /api/profile
 */
export interface ProfileCoreDTO {
  id: string;
  userId: string;
  personal: PersonalProfileDTO;
  careerDirection: CareerGoalDTO | null;
  jobPreferences: JobPreferenceDTO | null;
  account: AccountSettingsDTO;
  completion: ProfileCompletionDTO;
  counts: CollectionCountsDTO;
}
