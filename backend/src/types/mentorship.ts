export type MentorshipCategory =
  | 'CAREER_GUIDANCE'
  | 'RESUME_REVIEW'
  | 'MOCK_INTERVIEW'
  | 'TECHNICAL_GUIDANCE'
  | 'CAREER_SWITCH'
  | 'LONG_TERM_MENTORSHIP';

export const MENTORSHIP_CATEGORIES: { value: MentorshipCategory; label: string; description: string }[] = [
  { value: 'CAREER_GUIDANCE', label: 'Career Guidance', description: 'Navigate career transitions, promotions, and strategic career paths.' },
  { value: 'RESUME_REVIEW', label: 'Resume & Portfolio Review', description: 'Deep-dive review of resume, portfolio, and positioning.' },
  { value: 'MOCK_INTERVIEW', label: 'Mock Technical / Behavioral Interview', description: 'Simulated real-world technical or behavioral interview with actionable feedback.' },
  { value: 'TECHNICAL_GUIDANCE', label: 'Architecture & Technical Guidance', description: 'System design, coding hurdles, frameworks, and architecture advice.' },
  { value: 'CAREER_SWITCH', label: 'Career Switch Roadmap', description: 'Structured plan and guidance for changing industries or tech domains.' },
  { value: 'LONG_TERM_MENTORSHIP', label: 'Long-term Growth Mentorship', description: 'Multi-week continuous mentorship for ambitious professionals.' },
];

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
  timezone: string;
  status: BookingStatus;
  studentNotes?: string | null;
  createdAt: string;
  hasSession: boolean;
  sessionId?: string | null;
}

export interface BookingDetailDTO extends BookingListDTO {
  cancellationReason?: string | null;
  rescheduledFromId?: string | null;
  session?: SessionDTO | null;
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
