import { DocumentExtractionMetadata } from './documentExtractionService';

export type VerificationStatus = 'AUTO_HIGH' | 'NEEDS_REVIEW' | 'VERIFIED' | 'LOW_CONFIDENCE';

export interface ExtractedField<T> {
  value: T;
  confidence: number; // 0.0 to 1.0
  evidence: string;   // Verbatim excerpt from resume text
  section: string;    // Source section (e.g. 'CONTACT', 'HEADER', 'EDUCATION')
  status: VerificationStatus;
}

export type EducationLevel =
  | 'DOCTORATE'
  | 'POSTGRADUATE'
  | 'UNDERGRADUATE'
  | 'INTERMEDIATE'
  | 'HIGH_SCHOOL'
  | 'DIPLOMA'
  | 'OTHER';

export interface StructuredEducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location?: string;
  startYear: number;
  endYear?: number | null;
  isCurrent: boolean;
  gpa?: string;
  educationLevel: EducationLevel;
  source: 'RESUME';
  confidence: number;
  evidence: string;
  section: string;
  status: VerificationStatus;
}

export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Internship'
  | 'Contract'
  | 'Freelance'
  | 'Self-employed';

export interface StructuredExperienceEntry {
  company: string;
  roleTitle: string;
  jobTitle?: string;
  employmentType: EmploymentType;
  location?: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string;
  bullets: string[];
  technologies: string[];
  responsibilities?: string;
  achievements?: string;
  source: 'RESUME';
  confidence: number;
  evidence: string;
  section: string;
  status: VerificationStatus;
}

export interface StructuredProjectEntry {
  title: string;
  description?: string;
  role?: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  bullets: string[];
  source: 'RESUME';
  confidence: number;
  evidence: string;
  section: string;
  status: VerificationStatus;
}

export interface StructuredCertificationEntry {
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  source: 'RESUME';
  confidence: number;
  evidence: string;
  section: string;
  status: VerificationStatus;
}

export type SkillCategory =
  | 'LANGUAGE'
  | 'FRONTEND'
  | 'BACKEND'
  | 'DATABASE'
  | 'CLOUD'
  | 'DEVOPS'
  | 'TESTING'
  | 'TOOL'
  | 'AI_ML'
  | 'MOBILE'
  | 'SECURITY'
  | 'MANAGEMENT'
  | 'SOFT_SKILL'
  | 'OTHER';

export interface StructuredSkillEntry {
  name: string;
  category: SkillCategory;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  source: 'RESUME';
  verified: false;
  confidence: number;
  evidence: string;
  status: VerificationStatus;
}

export interface StructuredAchievementEntry {
  title: string;
  description?: string;
  organization?: string;
  date?: string;
  url?: string;
  source: 'RESUME';
  confidence: number;
  evidence: string;
  section: string;
  status: VerificationStatus;
}

export interface StructuredProfessionalLinkEntry {
  platform: string;
  url: string;
  confidence: number;
  evidence: string;
  status: VerificationStatus;
}

export interface StructuredLanguageEntry {
  language: string;
  proficiency?: 'NATIVE' | 'FLUENT' | 'PROFESSIONAL' | 'CONVERSATIONAL' | 'BASIC';
  confidence: number;
  evidence: string;
  status: VerificationStatus;
}

export interface StructuredResumeData {
  rawText: string;
  extractionMetadata: DocumentExtractionMetadata;
  personalInfo: {
    name?: ExtractedField<string>;
    email?: ExtractedField<string>;
    phone?: ExtractedField<string>;
    location?: ExtractedField<string>;
    headline?: ExtractedField<string>;
    bio?: ExtractedField<string>;
  };
  education: StructuredEducationEntry[];
  experience: StructuredExperienceEntry[];
  internships: StructuredExperienceEntry[];
  projects: StructuredProjectEntry[];
  certifications: StructuredCertificationEntry[];
  technicalSkills: StructuredSkillEntry[];
  softSkills: StructuredSkillEntry[];
  skills: Array<{
    name: string;
    category?: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    source: 'RESUME';
    verified: false;
  }>; // Backward compatible adapter
  achievements: StructuredAchievementEntry[];
  professionalLinks: StructuredProfessionalLinkEntry[];
  languages: StructuredLanguageEntry[];
  qualityScore: number; // 0 - 100 overall score
}

