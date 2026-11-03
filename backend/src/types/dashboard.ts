export type CareerJourneyStage =
  | 'DISCOVER'
  | 'LEARN'
  | 'MENTOR'
  | 'PREPARE'
  | 'APPLY'
  | 'HIRED'
  | 'GROW';

export type StageStatus = 'COMPLETED' | 'CURRENT' | 'UPCOMING';

export type CareerReadiness = 'GETTING_STARTED' | 'IN_PROGRESS' | 'JOB_READY';

export interface CareerJourneyStageItem {
  key: CareerJourneyStage;
  label: string;
  shortLabel: string;
  status: StageStatus;
  description: string;
}

export interface CareerJourneyDTO {
  currentStage: CareerJourneyStage;
  currentStageLabel: string;
  currentStageDescription: string;
  stages: CareerJourneyStageItem[];
}

export interface CareerSnapshotDTO {
  targetRole: string | null;
  careerField: string | null;
  experienceLevel: string | null;
  topSkills: string[];
  location: string | null;
  careerGoalType: string | null;
  readiness: CareerReadiness;
}

export interface NextActionDTO {
  id: string;
  category: 'ONBOARDING' | 'PROFILE' | 'EXPLORE' | 'LEARN' | 'PROJECTS' | 'MENTOR' | 'PREPARE' | 'APPLY';
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export interface DashboardLearningItemDTO {
  id: string;
  title: string;
  category?: string;
  progressPercent: number;
  totalModules?: number;
  completedModules?: number;
  href: string;
}

export interface DashboardLearningDTO {
  hasActivity: boolean;
  items: DashboardLearningItemDTO[];
  emptyState: {
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
  };
}

export interface DashboardOpportunityItemDTO {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  skills: string[];
  href: string;
}

export interface DashboardOpportunitiesDTO {
  hasOpportunities: boolean;
  items: DashboardOpportunityItemDTO[];
  emptyState: {
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
  };
}

export interface DashboardMentorshipSessionDTO {
  id: string;
  bookingId?: string;
  mentorId?: string;
  mentorName: string;
  mentorRole: string;
  mentorAvatar?: string;
  mentorCompany?: string;
  sessionTitle?: string;
  sessionType: string;
  scheduledAt: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  timezone?: string;
  sessionHref: string;
  meetingUrl?: string | null;
  status?: string;
  canJoin?: boolean;
  isOngoing?: boolean;
}

export interface DashboardMentorshipDTO {
  hasSession: boolean;
  upcomingSession: DashboardMentorshipSessionDTO | null;
  emptyState: {
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
  };
}

export interface DashboardInterviewDTO {
  hasHistory: boolean;
  lastPractice: {
    id: string;
    roleTitle: string;
    type: string;
    date: string;
    practiceHref: string;
  } | null;
  emptyState: {
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
  };
}

export interface DashboardUserDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  candidateType: string;
}

export interface DashboardDTO {
  user: DashboardUserDTO;
  careerSnapshot: CareerSnapshotDTO;
  profileCompletionPercentage: number;
  profileMissingCount: number;
  nextProfileSection: string | null;
  isProfileComplete: boolean;
  journey: CareerJourneyDTO;
  nextAction: NextActionDTO;
  learning: DashboardLearningDTO;
  opportunities: DashboardOpportunitiesDTO;
  mentorship: DashboardMentorshipDTO;
  interview: DashboardInterviewDTO;
}
