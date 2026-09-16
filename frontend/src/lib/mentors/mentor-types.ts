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
}

export interface MentorFilterParams {
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
