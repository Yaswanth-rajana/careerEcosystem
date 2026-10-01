export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'TASK_PENDING'
  | 'TASK_SUBMITTED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract';

export type ExperienceLevel = 'Fresher' | '0-1 years' | '1-3 years' | '3-5 years' | '5+ years';

export interface JobSalaryDTO {
  min: number | null;
  max: number | null;
  currency: string;
  period: string;
  formatted: string;
}

export interface JobCardDTO {
  id: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  location: string;
  workMode: string;
  employmentType: string;
  experienceLevel: string;
  skills: string[];
  salary: JobSalaryDTO | null;
  postedAt: string;
  isSaved: boolean;
  hasApplied?: boolean;
  applicationStatus?: ApplicationStatus | null;
  jobVerified?: boolean;
  companyVerified?: boolean;
  featured?: boolean;
  matchReason?: string;
}

export interface JobDetailDTO {
  id: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  companyId?: string | null;
  location: string;
  workMode: string;
  employmentType: string;
  experienceLevel: string;
  skills: string[];
  salary: JobSalaryDTO | null;
  postedAt: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  isSaved: boolean;
  hasApplied: boolean;
  applicationId?: string | null;
  applicationStatus?: ApplicationStatus | null;
  jobVerified?: boolean;
  companyVerified?: boolean;
  status: string;
}

export interface ApplicationDTO {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo?: string | null;
  location: string;
  workMode: string;
  employmentType: string;
  experienceLevel: string;
  appliedAt: string;
  status: ApplicationStatus;
  coverNote?: string | null;
  feedback?: string | null;
  reviewedAt?: string | null;
  withdrawnAt?: string | null;
}

export interface JobSearchParams {
  q?: string;
  location?: string;
  workMode?: string | string[];
  employmentType?: string | string[];
  experienceLevel?: string | string[];
  skills?: string | string[];
  salaryMin?: number;
  salaryMax?: number;
  postedWithin?: '24h' | '3d' | '7d' | '30d';
  sort?: 'newest' | 'relevance';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string = 'INR',
  period: string = 'YEAR'
): string | null {
  if (min === null && max === null) return null;

  const symbol = currency === 'USD' ? '$' : '₹';
  const formatVal = (val: number) => {
    if (currency === 'INR') {
      if (val >= 100000) {
        const lpa = val / 100000;
        return `${symbol}${lpa % 1 === 0 ? lpa : lpa.toFixed(1)} LPA`;
      }
      return `${symbol}${val.toLocaleString('en-IN')}`;
    }
    if (val >= 1000) {
      return `${symbol}${Math.round(val / 1000)}k`;
    }
    return `${symbol}${val}`;
  };

  const periodSuffix = period === 'MONTH' ? '/mo' : period === 'HOUR' ? '/hr' : '';

  if (min !== null && max !== null) {
    if (currency === 'INR' && min >= 100000 && max >= 100000) {
      const minL = min / 100000;
      const maxL = max / 100000;
      return `${symbol}${minL % 1 === 0 ? minL : minL.toFixed(1)}–${maxL % 1 === 0 ? maxL : maxL.toFixed(1)} LPA`;
    }
    return `${formatVal(min)} – ${formatVal(max)}${periodSuffix}`;
  } else if (min !== null) {
    return `From ${formatVal(min)}${periodSuffix}`;
  } else if (max !== null) {
    return `Up to ${formatVal(max)}${periodSuffix}`;
  }
  return null;
}
