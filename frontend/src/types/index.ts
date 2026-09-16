export type Role = 'CANDIDATE' | 'MENTOR' | 'RECRUITER' | 'ADMIN';

export type CandidateType = 'STUDENT' | 'GRADUATE' | 'PROFESSIONAL' | 'EXPERIENCED';

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  isOnboarded: boolean;
}

export interface CareerGoalData {
  targetRole: string;
  targetIndustry?: string;
  timeframe?: string;
  notes?: string;
}

export interface EducationData {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  isCurrent?: boolean;
}

export interface ExperienceData {
  id?: string;
  company: string;
  roleTitle: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface SkillData {
  id?: string;
  name: string;
  category?: string;
  level: SkillLevel;
}

export interface FullProfileData {
  id: string;
  userId: string;
  phone?: string;
  location?: string;
  headline?: string;
  candidateType: CandidateType;
  currentRole?: string;
  totalExperience?: string;
  bio?: string;
  education: EducationData[];
  experience: ExperienceData[];
  skills: SkillData[];
  interests: string[];
  careerGoal?: CareerGoalData;
}
