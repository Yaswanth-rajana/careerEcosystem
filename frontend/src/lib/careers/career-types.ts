export type CareerSkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type CareerSkillProvenance = 'USER' | 'RESUME' | 'ASSESSMENT' | 'COURSE' | 'MENTOR' | 'IMPORTED';

export interface CareerSkill {
  name: string;
  category?: string;
  level: CareerSkillLevel;
  importance: 'MUST_KNOW' | 'GOOD_TO_KNOW' | 'ADVANCED';
  description?: string;
}

export interface CareerSkillGroup {
  mustKnow: CareerSkill[];
  goodToKnow: CareerSkill[];
  advanced: CareerSkill[];
}

export interface CareerLearningPhase {
  phaseNumber: string;
  title: string;
  subtitle: string;
  description?: string;
  topics: string[];
  skills: string[];
  estimatedHours?: number;
  recommendedCourse?: {
    id: string;
    title: string;
    provider: string;
    level: string;
    available: boolean;
    url?: string;
  };
}

export interface CareerProject {
  id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours?: number;
  expectedOutcome: string;
}

export interface CareerCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  level: 'Foundation' | 'Intermediate' | 'Advanced';
  url?: string;
}

export interface CareerPracticeArea {
  id: string;
  title: string;
  category: 'Technical Challenges' | 'Portfolio Challenges' | 'Scenario Questions' | 'Interview Questions';
  description: string;
  questionCount: number;
}

export interface CareerInterviewTopic {
  id: string;
  topic: string;
  category: 'Technical' | 'System Design' | 'Role Specific' | 'Behavioral';
  questionCount: number;
  keyQuestions: string[];
}

export interface SalaryRange {
  min?: number;
  max?: number;
  currency: string;
  period?: string; // e.g. 'LPA'
  formatted?: string; // e.g. '₹10–15 LPA'
  source?: string;
  updatedAt?: string;
}

export interface RoleOverviewBlocks {
  whatYouDo: string | string[];
  youWillWorkOn: string[];
  whereCanYouWork: string[];
}

export interface CareerPath {
  id: string;
  slug: string;
  title: string;
  category: 'Technology' | 'Data & AI' | 'Product & Design' | 'Cybersecurity' | 'Business & Growth' | 'Electronics & Systems' | 'Mechanical & Manufacturing';
  tagline: string;
  shortDescription: string;
  typicalTrajectory: string[]; // e.g. ['Beginner', 'Junior Developer', 'Mid-Level Software Engineer', 'Senior Engineer']
  roleOverview: RoleOverviewBlocks;
  salaryRange?: SalaryRange;
  responsibilities: string[];
  commonIndustries: string[];
  skillGroups: CareerSkillGroup;
  learningPhases: CareerLearningPhase[];
  projects: CareerProject[];
  certifications: CareerCertification[];
  practiceAreas: CareerPracticeArea[];
  interviewTopics: CareerInterviewTopic[];
}

/* Candidate State & Context Types */
export interface CandidateSkill {
  id?: string;
  name: string;
  level: CareerSkillLevel;
  source: CareerSkillProvenance;
  verified: boolean;
}

export interface CandidateCareerGoal {
  targetRole: string;
  targetIndustry?: string;
  timeframe?: string;
  notes?: string;
}

export interface CandidateEducation {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  isCurrent: boolean;
}

export interface CandidateExperience {
  id?: string;
  company: string;
  roleTitle: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface CandidateProjectRecord {
  id?: string;
  title: string;
  description?: string;
  technologies: string[];
  githubUrl?: string;
}

export interface CandidateCareerContext {
  userId: string;
  name: string;
  email: string;
  candidateType?: string; // STUDENT, GRADUATE, PROFESSIONAL, EXPERIENCED
  currentRole?: string;
  skills: CandidateSkill[];
  careerGoal?: CandidateCareerGoal;
  education: CandidateEducation[];
  experience: CandidateExperience[];
  projects: CandidateProjectRecord[];
  completedCourses: string[];
  completedAssessments: string[];
}

export interface SkillGapAnalysis {
  matchedSkills: CandidateSkill[];
  developingSkills: Array<{
    skill: CareerSkill;
    currentLevel: CareerSkillLevel;
    requiredLevel: CareerSkillLevel;
  }>;
  missingSkills: CareerSkill[];
  nextFocusSkills: CareerSkill[];
  matchPercentage: number;
  hasEnoughData: boolean;
}

export interface CareerProgressMetrics {
  learningPercent: number;
  projectsPercent: number;
  practicePercent: number;
  mentorshipPercent: number;
  profilePercent: number;
  overallPathwayProgress: number;
  currentStageIndex: number;
  currentStageName: string;
}
