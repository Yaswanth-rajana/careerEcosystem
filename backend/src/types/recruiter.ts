import { JobStatus, ApplicationStatus } from './jobs';

export interface AuthenticatedRecruiter {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
  };
  recruiter: {
    id: string;
    designation: string;
    phone?: string | null;
    linkedInUrl?: string | null;
    status: string;
  };
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    website: string;
    industry: string;
    size: string;
    location: string;
    verified: boolean;
    status: string;
  };
  companyRole: string; // COMPANY_ADMIN, RECRUITER, HIRING_MANAGER, INTERVIEWER
}

// ----------------------------------------------------
// Dashboard DTO
// ----------------------------------------------------
export interface RecruiterDashboardDTO {
  summary: {
    activeJobs: number;
    totalApplications: number;
    candidatesToReview: number;
    shortlisted: number;
    upcomingInterviews: number;
    activeOffers: number;
  };
  actionRequired: {
    recentApplications: Array<{
      id: string;
      candidateName: string;
      candidateEmail: string;
      jobTitle: string;
      appliedAt: string;
      status: ApplicationStatus;
    }>;
    upcomingInterviews: Array<{
      id: string;
      candidateName: string;
      jobTitle: string;
      type: string;
      scheduledAt: string;
      meetingUrl?: string | null;
    }>;
  };
  recentJobs: Array<{
    id: string;
    title: string;
    status: JobStatus;
    workMode: string;
    applicationsCount: number;
    createdAt: string;
  }>;
  pipelineDistribution: Record<ApplicationStatus, number>;
}

// ----------------------------------------------------
// Job DTOs
// ----------------------------------------------------
export interface RecruiterJobListDTO {
  id: string;
  title: string;
  status: JobStatus;
  workMode: string;
  employmentType: string;
  experienceLevel: string;
  location: string;
  skills: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  applicationsCount: number;
  shortlistedCount: number;
  interviewsCount: number;
  publishedAt?: string | null;
  createdAt: string;
}

export interface RecruiterJobDetailDTO {
  id: string;
  title: string;
  status: JobStatus;
  workMode: string;
  employmentType: string;
  experienceLevel: string;
  location: string;
  skills: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  publishedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  applicationsCount: number;
  companyId: string;
  createdById?: string | null;
}

// ----------------------------------------------------
// Candidate & Application DTOs
// ----------------------------------------------------
export interface RecruiterApplicationListDTO {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar?: string | null;
  candidateHeadline?: string | null;
  candidateLocation?: string | null;
  jobId: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
  hasResume: boolean;
  resumeUrl?: string | null;
  latestScore?: number | null;
}

export interface RecruiterApplicationDetailDTO {
  id: string;
  jobId: string;
  jobTitle: string;
  status: ApplicationStatus;
  coverNote?: string | null;
  answers?: string | null;
  resumeUrl?: string | null;
  feedback?: string | null;
  reviewedAt?: string | null;
  withdrawnAt?: string | null;
  createdAt: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    phone?: string | null;
    location?: string | null;
    headline?: string | null;
    candidateType?: string | null;
    totalExperience?: string | null;
    bio?: string | null;
    skills: Array<{ name: string; level: string; verified: boolean }>;
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
      startDate: string;
      endDate?: string | null;
      isCurrent: boolean;
      description?: string | null;
    }>;
    projects: Array<{
      id: string;
      title: string;
      description?: string | null;
      technologies: string[];
      projectUrl?: string | null;
      githubUrl?: string | null;
    }>;
    professionalLinks: Array<{ platform: string; url: string }>;
  };
  interviews: Array<{
    id: string;
    title: string;
    type: string;
    scheduledAt: string;
    durationMinutes: number;
    meetingUrl?: string | null;
    status: string;
  }>;
  offers: Array<{
    id: string;
    positionTitle: string;
    salaryOffered: number;
    currency: string;
    status: string;
    startDate?: string | null;
  }>;
  assessmentSubmissions: Array<{
    id: string;
    assessmentTitle: string;
    score: number;
    passed: boolean;
    submittedAt: string;
  }>;
}

// ----------------------------------------------------
// Assessment DTOs
// ----------------------------------------------------
export interface RecruiterAssessmentDTO {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  timeLimitMinutes: number;
  passingScore: number;
  status: string;
  jobId?: string | null;
  jobTitle?: string | null;
  questionsCount: number;
  submissionsCount: number;
  createdAt: string;
}

// ----------------------------------------------------
// Interview DTOs
// ----------------------------------------------------
export interface RecruiterInterviewDTO {
  id: string;
  companyId: string;
  jobId: string;
  jobTitle: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar?: string | null;
  title: string;
  type: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl?: string | null;
  interviewerName?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
}

// ----------------------------------------------------
// Offer DTOs
// ----------------------------------------------------
export interface RecruiterOfferDTO {
  id: string;
  companyId: string;
  jobId: string;
  jobTitle: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  positionTitle: string;
  salaryOffered: number;
  currency: string;
  salaryPeriod: string;
  startDate?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
}

// ----------------------------------------------------
// Company & Team DTOs
// ----------------------------------------------------
export interface CompanyProfileDTO {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  website: string;
  linkedIn?: string | null;
  industry: string;
  size: string;
  location: string;
  description?: string | null;
  culture?: string | null;
  benefits: string[];
  verified: boolean;
  status: string;
}

export interface CompanyTeamMemberDTO {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  title?: string | null;
  status: string;
  joinedAt: string;
}
