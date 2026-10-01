export interface PaginatedAdminResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ----------------------------------------------------
// User DTOs
// ----------------------------------------------------
export interface UserListDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isOnboarded: boolean;
  candidateType?: string | null;
  headline?: string | null;
  createdAt: string;
}

export interface UserDetailDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isOnboarded: boolean;
  onboardingCompletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: {
    headline?: string | null;
    phone?: string | null;
    location?: string | null;
    candidateType?: string | null;
    currentRole?: string | null;
    totalExperience?: string | null;
    bio?: string | null;
    education: Array<{
      id: string;
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startYear: number;
      endYear?: number | null;
    }>;
    experience: Array<{
      id: string;
      company: string;
      roleTitle: string;
      employmentType?: string | null;
      startDate: string;
      endDate?: string | null;
      isCurrent: boolean;
    }>;
    skills: Array<{
      id: string;
      name: string;
      level: string;
      verified: boolean;
    }>;
    projects: Array<{
      id: string;
      title: string;
      technologies: string[];
      projectUrl?: string | null;
      githubUrl?: string | null;
    }>;
    careerGoal?: {
      targetRole: string;
      targetIndustry?: string | null;
    } | null;
  } | null;
  applicationsCount: number;
  savedJobsCount: number;
}

// ----------------------------------------------------
// Course DTOs
// ----------------------------------------------------
export type CourseStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'PAUSED' | 'ARCHIVED';

export interface CourseListDTO {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  instructorName: string;
  durationHours: number;
  lessonsCount: number;
  status: CourseStatus;
  isFeatured: boolean;
  publishedAt?: string | null;
  updatedAt: string;
}

export interface CourseLessonDTO {
  id: string;
  title: string;
  durationMin: number;
  type: string;
  contentUrl?: string | null;
  contentBody?: string | null;
  order: number;
}

export interface CourseModuleDTO {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  lessons: CourseLessonDTO[];
}

export interface CourseDetailDTO extends CourseListDTO {
  description: string;
  shortDescription?: string | null;
  instructorTitle?: string | null;
  instructorAvatar?: string | null;
  skills: string[];
  learningObjectives: string[];
  createdAt: string;
  modules: CourseModuleDTO[];
}

// ----------------------------------------------------
// Mentor DTOs
// ----------------------------------------------------
export type MentorStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface MentorListDTO {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  headline: string;
  domain: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  sessionCount: number;
  startingPrice: number;
  status: MentorStatus;
  createdAt: string;
}

export interface MentorDetailDTO extends MentorListDTO {
  bio: string;
  avatar?: string | null;
  company?: string | null;
  expertise: string[];
  sessionTypes: string[];
  skillsList: string[];
  rejectionReason?: string | null;
  approvedAt?: string | null;
  updatedAt: string;
}

// ----------------------------------------------------
// Mentor Application DTOs
// ----------------------------------------------------
export type MentorApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface MentorApplicationListDTO {
  id: string;
  referenceId: string;
  userId?: string | null;
  fullName: string;
  email: string;
  phone: string;
  location?: string | null;
  currentRole: string;
  company?: string | null;
  experienceYears: number;
  industry?: string | null;
  domain: string;
  status: MentorApplicationStatus;
  createdAt: string;
}

export interface MentorApplicationDetailDTO extends MentorApplicationListDTO {
  linkedIn?: string | null;
  gitHub?: string | null;
  portfolio?: string | null;
  expertise: string[];
  additionalExpertise?: string | null;
  offerings: string[];
  preferredSessionDuration: number;
  startingPrice: number;
  whyMentor: string;
  whoToHelp: string;
  additionalInfo?: string | null;
  decisionReason?: string | null;
  internalAdminNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
  } | null;
}


// ----------------------------------------------------
// Job DTOs
// ----------------------------------------------------
export type JobAdminStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';

export interface JobAdminListDTO {
  id: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  location: string;
  workMode: string;
  employmentType: string;
  experienceLevel: string;
  status: string;
  featured: boolean;
  jobVerified: boolean;
  companyVerified: boolean;
  publishedAt?: string | null;
  createdAt: string;
  applicationsCount: number;
}

export interface JobAdminDetailDTO extends JobAdminListDTO {
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  skills: string[];
  expiresAt?: string | null;
}

// ----------------------------------------------------
// Application DTOs
// ----------------------------------------------------
export interface ApplicationAdminListDTO {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar?: string | null;
  jobId: string;
  jobTitle: string;
  company: string;
  status: string;
  appliedAt: string;
  reviewedAt?: string | null;
}

export interface ApplicationAdminDetailDTO extends ApplicationAdminListDTO {
  coverNote?: string | null;
  answers?: string | null;
  resumeUrl?: string | null;
  feedback?: string | null;
}

// ----------------------------------------------------
// Audit Log DTO
// ----------------------------------------------------
export interface AuditLogDTO {
  id: string;
  actorId: string;
  actorEmail: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  createdAt: string;
}

// ----------------------------------------------------
// Admin Dashboard DTO
// ----------------------------------------------------
export interface AdminDashboardDTO {
  metrics: {
    students: { total: number; active: number; newThisWeek: number };
    mentors: { total: number; active: number; pending: number };
    courses: { total: number; published: number; draft: number };
    jobs: { total: number; published: number; pendingReview: number };
    applications: { total: number; pending: number };
  };
  pendingApprovals: {
    mentorApplications: number;
    jobReviews: number;
    courseReviews: number;
  };
  recentActivity: AuditLogDTO[];
}
