export type MentorExpertise =
  | 'Software Engineering'
  | 'Data Science'
  | 'AI / ML'
  | 'Cybersecurity'
  | 'Product'
  | 'Design'
  | 'Electronics'
  | 'Mechanical'
  | 'Business';

export type MentorSessionType =
  | 'Career Guidance'
  | 'Resume Review'
  | 'Mock Interview'
  | 'Technical Guidance'
  | 'Career Switch'
  | 'Leadership';

export type MentorExperienceRange = '3–5 years' | '5–10 years' | '10+ years';

export type MentorPriceRange = 'Any' | 'Under ₹500' | '₹500–₹1,000' | '₹1,000–₹2,500' | '₹2,500+';

export type MentorAvailabilityOption = 'All' | 'Available this week' | 'Next available tomorrow';

export type MentorSortOption = 'recommended' | 'rating' | 'experience' | 'price_low' | 'price_high';

export interface MentorSessionOption {
  id: string;
  title: string;
  durationMin: number;
  price: number;
  description: string;
  type: MentorSessionType;
}

export interface MentorReview {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
  sessionType: MentorSessionType;
}

export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  badgeLabel: string; // e.g. 'PATHWAY.ECO Mentor'
  role: string;
  domain: string; // e.g. 'Enterprise Technology', 'AI & Data Science'
  companyType?: string;
  experienceYears: number; // e.g. 7
  rating: number; // e.g. 4.9
  reviewCount: number; // e.g. 42
  sessionCount: number; // e.g. 86
  expertise: MentorExpertise[];
  sessionTypes: MentorSessionType[];
  startingPrice: number; // e.g. 999
  availabilityStatus: 'Available this week' | 'Next available tomorrow' | 'Limited slots';
  nextAvailableAt: string; // e.g. 'Tomorrow, 5:00 PM'
  bio: string;
  about: string[];
  skillsList: string[];
  helpTopics: string[];
  workHistory: Array<{
    role: string;
    organizationType: string;
    period: string;
  }>;
  reviews?: MentorReview[];
  sessionOptions?: MentorSessionOption[];
  matchingService?: {
    id: string;
    title: string;
    description: string;
    category: string;
    categoryLabel: string;
    duration: number;
    price: number;
    currency: string;
    active: boolean;
  } | null;
}

export interface MentorFilterParams {
  preference?: string;
  search?: string;
  expertise?: MentorExpertise[];
  experience?: MentorExperienceRange[];
  sessionTypes?: MentorSessionType[];
  priceRange?: MentorPriceRange;
  availability?: MentorAvailabilityOption;
  sort?: MentorSortOption;
  page?: number;
  limit?: number;
}

export interface MentorPaginatedResult {
  mentors: Mentor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  selectedPreference?: string | null;
}

export interface MentorMatchScore {
  score: number; // 0 to 100
  matchingPills: string[];
  breakdown: {
    goalMatch: number;
    skillMatch: number;
    needMatch: number;
    experienceMatch: number;
  };
}

export interface CandidateContext {
  targetRole?: string;
  skills?: string[];
  mentorshipNeeds?: string[];
  totalExperience?: string;
}

export interface AvailableSlot {
  start: string; // ISO string in UTC
  end: string;   // ISO string in UTC
  displayTime: string; // formatted in mentor local timezone e.g. "09:00 - 09:45"
  date: string;  // YYYY-MM-DD
}

export interface CandidateBooking {
  id: string;
  mentorId: string;
  mentor: {
    id: string;
    name: string;
    avatar: string;
    headline: string;
    company?: string | null;
  };
  service: {
    id: string;
    title: string;
    category: string;
    duration: number;
    price: number;
    currency: string;
  };
  scheduledStart: string; // ISO string in UTC
  scheduledEnd: string;   // ISO string in UTC
  rescheduledStart?: string | null;
  rescheduledEnd?: string | null;
  timezone: string;
  status: string;
  studentNotes?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  hasSession: boolean;
  sessionId?: string | null;
  sessionStatus?: string | null;
  meetingUrl?: string | null;
  canCancel: boolean;
  canReschedule?: boolean;
}
