export type MentorshipCategory =
  | 'CAREER_DIRECTION'
  | 'CAREER_GUIDANCE'
  | 'RESUME_REVIEW'
  | 'MOCK_INTERVIEW'
  | 'TECHNICAL_GUIDANCE'
  | 'CAREER_SWITCH'
  | 'LEADERSHIP'
  | 'LONG_TERM_MENTORSHIP';

export const MENTORSHIP_CATEGORIES: { value: MentorshipCategory; label: string; description: string }[] = [
  { value: 'CAREER_DIRECTION', label: 'Career Direction', description: 'Navigate career transitions, promotions, and strategic career paths.' },
  { value: 'RESUME_REVIEW', label: 'Resume Review', description: 'Deep-dive review of resume, portfolio, and positioning.' },
  { value: 'MOCK_INTERVIEW', label: 'Mock Interview', description: 'Simulated real-world technical or behavioral interview with actionable feedback.' },
  { value: 'TECHNICAL_GUIDANCE', label: 'Technical Guidance', description: 'System design, coding hurdles, frameworks, and architecture advice.' },
  { value: 'CAREER_SWITCH', label: 'Career Switch', description: 'Structured plan and guidance for changing industries or tech domains.' },
  { value: 'LEADERSHIP', label: 'Leadership', description: 'Prepare for senior engineering, tech lead, engineering manager, or executive roles.' },
  { value: 'LONG_TERM_MENTORSHIP', label: 'Long-term Growth Mentorship', description: 'Multi-week continuous mentorship for ambitious professionals.' },
  { value: 'CAREER_GUIDANCE', label: 'Career Guidance', description: 'Legacy alias for Career Direction.' },
];

/**
 * Normalizes input preference or category into matching canonical database categories.
 * For example: 'Career Direction' or 'CAREER_DIRECTION' matches ['CAREER_DIRECTION', 'CAREER_GUIDANCE'].
 */
export function normalizeMentorshipCategory(input?: string | null): string[] {
  if (!input) return [];
  const normalized = input.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (normalized === 'CAREER_DIRECTION' || normalized === 'CAREER_GUIDANCE' || normalized === 'CAREER_DIRECTION_GUIDANCE') {
    return ['CAREER_DIRECTION', 'CAREER_GUIDANCE'];
  }
  if (normalized === 'RESUME_REVIEW' || normalized === 'RESUME') {
    return ['RESUME_REVIEW'];
  }
  if (normalized === 'MOCK_INTERVIEW' || normalized === 'MOCK') {
    return ['MOCK_INTERVIEW'];
  }
  if (normalized === 'TECHNICAL_GUIDANCE' || normalized === 'TECHNICAL') {
    return ['TECHNICAL_GUIDANCE'];
  }
  if (normalized === 'CAREER_SWITCH' || normalized === 'SWITCH') {
    return ['CAREER_SWITCH'];
  }
  if (normalized === 'LEADERSHIP' || normalized === 'ENGINEERING_LEADERSHIP') {
    return ['LEADERSHIP'];
  }
  if (normalized === 'LONG_TERM_MENTORSHIP') {
    return ['LONG_TERM_MENTORSHIP'];
  }
  return [normalized];
}

/**
 * Returns human-readable display label for a category.
 */
export function getCategoryLabel(category?: string | null): string {
  if (!category) return '';
  const match = MENTORSHIP_CATEGORIES.find((c) => c.value === category);
  if (match) return match.label;
  if (category === 'CAREER_GUIDANCE') return 'Career Direction';
  return category
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RESCHEDULE_REQUESTED'
  | 'RESCHEDULED'
  | 'CANCELLED_BY_CANDIDATE'
  | 'CANCELLED_BY_MENTOR'
  | 'COMPLETED'
  | 'NO_SHOW';

export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

import type { MentorStatus } from './admin';

export interface ActionItemDTO {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export interface MentorServiceDTO {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  category: MentorshipCategory;
  duration: number; // in minutes
  price: number;
  currency: string;
  active: boolean;
  bookingSettings?: {
    maxBookingsPerWeek?: number;
    bufferMinutes?: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityRuleDTO {
  id: string;
  mentorId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
  active: boolean;
}

export interface AvailabilityExceptionDTO {
  id: string;
  mentorId: string;
  date: string; // YYYY-MM-DD
  type: 'UNAVAILABLE' | 'CUSTOM_HOURS';
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}

export interface AvailableSlotDTO {
  start: string; // ISO UTC string
  end: string;   // ISO UTC string
  displayTime: string; // formatted in requested timezone
  date: string;  // YYYY-MM-DD
}

export interface CandidateAvailableSlotsResponseDTO {
  mentorId: string;
  serviceId: string;
  service: {
    id: string;
    title: string;
    duration: number;
    price: number;
  };
  timezone: string;
  startDate: string;
  endDate: string;
  bufferMinutes?: number;
  slots: AvailableSlotDTO[];
}

export interface StudentSummaryDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  headline?: string | null;
  candidateType?: string | null;
}

export interface BookingListDTO {
  id: string;
  mentorId: string;
  candidate: StudentSummaryDTO;
  service: {
    id: string;
    title: string;
    category: MentorshipCategory;
    duration: number;
    price: number;
    currency: string;
  };
  scheduledStart: string; // ISO string
  scheduledEnd: string;   // ISO string
  rescheduledStart?: string | null;
  rescheduledEnd?: string | null;
  timezone: string;
  status: BookingStatus;
  studentNotes?: string | null;
  createdAt: string;
  hasSession: boolean;
  sessionId?: string | null;
  meetingUrl?: string | null;
}

export interface BookingDetailDTO extends BookingListDTO {
  cancellationReason?: string | null;
  rescheduledFromId?: string | null;
  session?: SessionDTO | null;
}

export interface CandidateBookingDTO {
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
    category: MentorshipCategory;
    duration: number;
    price: number;
    currency: string;
  };
  scheduledStart: string; // ISO string in UTC
  scheduledEnd: string;   // ISO string in UTC
  rescheduledStart?: string | null; // ISO string in UTC if awaiting reschedule approval
  rescheduledEnd?: string | null;   // ISO string in UTC if awaiting reschedule approval
  timezone: string;
  status: BookingStatus;
  studentNotes?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  hasSession: boolean;
  sessionId?: string | null;
  sessionStatus?: SessionStatus | null;
  meetingUrl?: string | null;
  canCancel: boolean;
  canReschedule: boolean;
}

export interface ListCandidateBookingsParams {
  candidateId: string;
  tab?: 'upcoming' | 'past' | 'cancelled' | 'all';
  status?: string;
  page?: number;
  limit?: number;
}

export interface SessionDTO {
  id: string;
  bookingId: string;
  mentorId: string;
  candidateId: string;
  startedAt?: string | null;
  endedAt?: string | null;
  meetingUrl?: string | null;
  notes?: string | null;
  actionItems: ActionItemDTO[];
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MentorStudentDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  headline?: string | null;
  candidateType?: string | null;
  location?: string | null;
  careerGoal?: {
    targetRole?: string;
    careerField?: string;
    timeframe?: string;
    notes?: string;
  } | null;
  skills: Array<{ name: string; level: string }>;
  experienceSummary?: string | null;
  recentProjects: Array<{
    title: string;
    description?: string | null;
    role?: string | null;
    technologies: string[];
  }>;
  mentorshipStats: {
    totalSessions: number;
    completedSessions: number;
    lastSessionDate?: string | null;
    firstSessionDate: string;
  };
  history: Array<{
    bookingId: string;
    sessionId?: string | null;
    serviceTitle: string;
    serviceCategory: MentorshipCategory;
    scheduledStart: string;
    status: BookingStatus;
    notes?: string | null;
    actionItems?: ActionItemDTO[];
  }>;
}

export interface ReviewDTO {
  id: string;
  bookingId: string;
  rating: number;
  review: string;
  createdAt: string;
  serviceTitle: string;
  candidateName: string;
  candidateAvatar?: string | null;
}

export interface MentorProfileDTO {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  avatar?: string | null;
  headline: string;
  bio: string;
  domain: string;
  company?: string | null;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  sessionCount: number;
  startingPrice: number;
  expertise: string[];
  sessionTypes: string[];
  skillsList: string[];
  status: MentorStatus;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MentorDashboardDTO {
  mentor: MentorProfileDTO;
  summary: {
    todaySessionCount: number;
    upcomingBookingsCount: number;
    pendingRequestsCount: number;
    activeMenteesCount: number;
    completedMentorshipsCount: number;
    averageRating: number;
    totalReviews: number;
  };
  todaySessions: BookingListDTO[];
  upcomingBookings: BookingListDTO[];
  pendingRequests: BookingListDTO[];
  servicesPreview: MentorServiceDTO[];
  availabilitySummary: {
    activeRulesCount: number;
    weeklyAvailableHours: number;
    timezone: string;
    rules: AvailabilityRuleDTO[];
  };
  recentActivity: Array<{
    id: string;
    type: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'SESSION_COMPLETED' | 'REVIEW_RECEIVED';
    title: string;
    description: string;
    timestamp: string;
  }>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MatchingServiceDTO {
  id: string;
  title: string;
  description: string;
  category: MentorshipCategory;
  categoryLabel: string;
  duration: number;
  price: number;
  currency: string;
  active: boolean;
}

export interface MentorSessionOptionDTO {
  id: string;
  title: string;
  durationMin: number;
  price: number;
  description: string;
  type: string;
  category: string;
}

export interface MentorDiscoveryItemDTO {
  id: string;
  name: string;
  avatar: string;
  badgeLabel: string;
  role: string;
  headline?: string;
  domain: string;
  company?: string | null;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  sessionCount: number;
  expertise: string[];
  sessionTypes: string[];
  startingPrice: number;
  availabilityStatus: string;
  nextAvailableAt?: string | null;
  bio: string;
  about: string[];
  skillsList: string[];
  helpTopics: string[];
  workHistory: Array<{
    role: string;
    organizationType: string;
    period: string;
  }>;
  matchingService?: MatchingServiceDTO | null;
  sessionOptions?: MentorSessionOptionDTO[];
  isVerified?: boolean;
  reviews?: ReviewDTO[];
}

export interface MentorDiscoveryResultDTO {
  mentors: MentorDiscoveryItemDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  selectedPreference?: string | null;
}

