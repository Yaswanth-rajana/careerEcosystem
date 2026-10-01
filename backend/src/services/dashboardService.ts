import { db } from '../db/client';
import { calculateProfileCompletion } from './profileCompletion';
import {
  DashboardDTO,
  CareerJourneyStage,
  CareerJourneyDTO,
  CareerJourneyStageItem,
  CareerSnapshotDTO,
  CareerReadiness,
  NextActionDTO,
  DashboardLearningDTO,
  DashboardOpportunitiesDTO,
  DashboardMentorshipDTO,
  DashboardInterviewDTO,
} from '../types/dashboard';

const JOURNEY_STAGES: Array<{
  key: CareerJourneyStage;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  { key: 'DISCOVER', label: 'Discover Direction', shortLabel: 'Discover', description: 'Explore career paths, understand industry demands, and set your target role.' },
  { key: 'LEARN', label: 'Structured Learning', shortLabel: 'Learn', description: 'Master foundational concepts and modern frameworks through structured roadmaps.' },
  { key: 'BUILD', label: 'Build Real Projects', shortLabel: 'Build', description: 'Apply your skills by designing, building, and publishing verifiable projects.' },
  { key: 'MENTOR', label: 'Get Mentored', shortLabel: 'Mentor', description: 'Receive 1-on-1 industry feedback, architecture reviews, and career guidance.' },
  { key: 'PREPARE', label: 'Interview & Resume Prep', shortLabel: 'Prepare', description: 'Sharpen technical problem-solving, behavioral answers, and portfolio presentation.' },
  { key: 'APPLY', label: 'Apply to Roles', shortLabel: 'Apply', description: 'Submit verified applications to matched roles with high confidence.' },
  { key: 'HIRED', label: 'Get Hired', shortLabel: 'Get Hired', description: 'Evaluate offers, negotiate compensation, and onboard into your new role.' },
  { key: 'GROW', label: 'Continuous Growth', shortLabel: 'Grow', description: 'Level up seniority, lead technical initiatives, and expand your career impact.' },
];

export class DashboardService {
  /**
   * Aggregates all dashboard data for the authenticated user.
   * Single query with select/include to eliminate N+1 overhead.
   */
  static async getDashboardData(userId: string): Promise<DashboardDTO> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        isOnboarded: true,
        profile: {
          include: {
            careerGoal: true,
            jobPreference: true,
            userSkills: {
              take: 8,
              include: {
                skill: {
                  select: { name: true, category: true },
                },
              },
            },
            _count: {
              select: {
                education: true,
                experience: true,
                userSkills: true,
                projects: true,
                certifications: true,
                achievements: true,
                professionalLinks: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const profile = user.profile;
    const candidateType = profile?.candidateType || 'STUDENT';
    const counts = profile?._count || {
      education: 0,
      experience: 0,
      userSkills: 0,
      projects: 0,
      certifications: 0,
      achievements: 0,
      professionalLinks: 0,
    };

    // Calculate Canonical Profile Completion
    const completionPayload = {
      personal: {
        name: user.name,
        phone: profile?.phone,
        location: profile?.location,
        headline: profile?.headline,
        candidateType,
      },
      educationCount: counts.education,
      experienceCount: counts.experience,
      skillsCount: counts.userSkills,
      projectsCount: counts.projects,
      linksCount: counts.professionalLinks,
      certificationsCount: counts.certifications,
      careerGoal: profile?.careerGoal,
      jobPreference: profile?.jobPreference,
    };

    const completion = calculateProfileCompletion(completionPayload);
    const isProfileComplete = completion.percentage >= 100;

    // Career Snapshot
    const targetRole = profile?.careerGoal?.targetRole || null;
    const careerField = profile?.careerGoal?.careerField || null;
    const careerGoalType = profile?.careerGoal?.careerGoalType || null;
    const location = profile?.location || profile?.jobPreference?.preferredLocation || null;

    let experienceLevel: string | null = null;
    if (profile?.totalExperience) {
      experienceLevel = profile.totalExperience;
    } else if (candidateType === 'STUDENT' || candidateType === 'GRADUATE') {
      experienceLevel = 'Fresher / Entry Level';
    } else if (counts.experience > 0) {
      experienceLevel = `${counts.experience} Experience record${counts.experience > 1 ? 's' : ''}`;
    }

    const topSkills = (profile?.userSkills || [])
      .map((us) => us.skill.name)
      .filter(Boolean);

    // Compute Readiness
    let readiness: CareerReadiness = 'GETTING_STARTED';
    if (completion.percentage >= 80 && counts.projects > 0 && counts.userSkills >= 3) {
      readiness = 'JOB_READY';
    } else if (targetRole && (counts.userSkills > 0 || counts.projects > 0 || completion.percentage >= 45)) {
      readiness = 'IN_PROGRESS';
    }

    const careerSnapshot: CareerSnapshotDTO = {
      targetRole,
      careerField,
      experienceLevel,
      topSkills,
      location,
      careerGoalType,
      readiness,
    };

    // Deterministic Journey Stage
    const currentStage = this.determineJourneyStage({
      targetRole,
      skillsCount: counts.userSkills,
      projectsCount: counts.projects,
      readiness,
      completionPercentage: completion.percentage,
    });

    const journey = this.buildJourneyDTO(currentStage);

    // Deterministic Next Best Action
    const nextAction = this.determineNextAction({
      isOnboarded: user.isOnboarded,
      completionPercentage: completion.percentage,
      nextProfileSection: completion.nextSection,
      targetRole,
      skillsCount: counts.userSkills,
      projectsCount: counts.projects,
      readiness,
    });

    // Learning Progress (Real data representation or graceful empty state)
    const learning: DashboardLearningDTO = {
      hasActivity: false,
      items: [],
      emptyState: {
        title: 'Start your learning journey',
        description: targetRole
          ? `Explore curated, step-by-step pathways designed specifically for ${targetRole}.`
          : 'Explore structured skill pathways and industry-standard roadmaps.',
        actionLabel: 'Explore Pathways',
        actionHref: '/learn',
      },
    };

    // Opportunities Preview (Real data representation or graceful empty state)
    const opportunities: DashboardOpportunitiesDTO = {
      hasOpportunities: false,
      items: [],
      emptyState: {
        title: 'Explore opportunities for you',
        description: targetRole
          ? `Find verified roles and internships matching ${targetRole} and your skill profile.`
          : 'Discover verified jobs and internships aligned with your career direction.',
        actionLabel: 'Explore Jobs',
        actionHref: '/jobs',
      },
    };

    // Mentorship Preview (Real session or graceful empty state)
    const mentorship: DashboardMentorshipDTO = {
      hasSession: false,
      upcomingSession: null,
      emptyState: {
        title: 'Find a Mentor',
        description: 'Get 1-on-1 guidance, resume feedback, and advice from professionals who have walked the path.',
        actionLabel: 'Find a Mentor',
        actionHref: '/mentors',
      },
    };

    // Interview Preparation Preview (Real practice or graceful empty state)
    const interview: DashboardInterviewDTO = {
      hasHistory: false,
      lastPractice: null,
      emptyState: {
        title: 'Interview Preparation',
        description: targetRole
          ? `Practice technical and behavioral questions tailored to ${targetRole}.`
          : 'Sharpen your answers with guided practice sessions before your real interview.',
        actionLabel: 'Start Practice',
        actionHref: '/tools',
      },
    };

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        candidateType,
      },
      careerSnapshot,
      profileCompletionPercentage: completion.percentage,
      profileMissingCount: completion.missingSections.length,
      nextProfileSection: completion.nextSection,
      isProfileComplete,
      journey,
      nextAction,
      learning,
      opportunities,
      mentorship,
      interview,
    };
  }

  /**
   * Deterministically calculates user's current Career Journey Stage.
   */
  private static determineJourneyStage(context: {
    targetRole: string | null;
    skillsCount: number;
    projectsCount: number;
    readiness: CareerReadiness;
    completionPercentage: number;
  }): CareerJourneyStage {
    const { targetRole, skillsCount, projectsCount, readiness, completionPercentage } = context;

    if (!targetRole || completionPercentage < 35) {
      return 'DISCOVER';
    }

    if (skillsCount < 3 && projectsCount === 0) {
      return 'LEARN';
    }

    if (projectsCount === 0) {
      return 'BUILD';
    }

    if (readiness === 'JOB_READY') {
      return 'APPLY';
    }

    if (skillsCount >= 3 && projectsCount >= 1 && completionPercentage >= 70) {
      return 'PREPARE';
    }

    return 'BUILD';
  }

  /**
   * Constructs the full journey stage sequence with completed, current, and upcoming indicators.
   */
  private static buildJourneyDTO(currentStage: CareerJourneyStage): CareerJourneyDTO {
    const currentIndex = JOURNEY_STAGES.findIndex((s) => s.key === currentStage);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;

    const stages: CareerJourneyStageItem[] = JOURNEY_STAGES.map((s, idx) => {
      let status: 'COMPLETED' | 'CURRENT' | 'UPCOMING' = 'UPCOMING';
      if (idx < safeIndex) status = 'COMPLETED';
      else if (idx === safeIndex) status = 'CURRENT';

      return {
        key: s.key,
        label: s.label,
        shortLabel: s.shortLabel,
        status,
        description: s.description,
      };
    });

    const activeStageMeta = JOURNEY_STAGES[safeIndex];

    return {
      currentStage,
      currentStageLabel: activeStageMeta.label,
      currentStageDescription: activeStageMeta.description,
      stages,
    };
  }

  /**
   * Deterministically computes the single primary Next Best Action.
   */
  private static determineNextAction(context: {
    isOnboarded: boolean;
    completionPercentage: number;
    nextProfileSection: string | null;
    targetRole: string | null;
    skillsCount: number;
    projectsCount: number;
    readiness: CareerReadiness;
  }): NextActionDTO {
    const {
      isOnboarded,
      completionPercentage,
      nextProfileSection,
      targetRole,
      skillsCount,
      projectsCount,
      readiness,
    } = context;

    // 1. Incomplete Onboarding
    if (!isOnboarded) {
      return {
        id: 'action-onboarding',
        category: 'ONBOARDING',
        title: 'Finish onboarding setup',
        description: 'Complete your initial onboarding questions to unlock personalized learning paths and target role matching.',
        actionLabel: 'Complete Onboarding',
        actionHref: '/onboarding',
      };
    }

    // 2. Missing Career Direction / Target Role
    if (!targetRole || targetRole.trim().length === 0) {
      return {
        id: 'action-career-direction',
        category: 'EXPLORE',
        title: 'Define your target role',
        description: 'Choose your desired career direction to receive curated skill roadmaps, mentor matches, and job opportunities.',
        actionLabel: 'Explore Career Paths',
        actionHref: '/explore',
      };
    }

    // 3. Significant Profile Incompleteness (< 50%)
    if (completionPercentage < 50) {
      const sectionName = nextProfileSection || 'Personal Information';
      return {
        id: 'action-complete-profile',
        category: 'PROFILE',
        title: 'Complete your profile',
        description: `Your profile is ${completionPercentage}% complete. Complete your ${sectionName} to stand out and unlock higher-quality recommendations.`,
        actionLabel: 'Complete Profile',
        actionHref: '/profile',
      };
    }

    // 4. Missing Skills
    if (skillsCount === 0) {
      return {
        id: 'action-add-skills',
        category: 'PROFILE',
        title: 'Add your core skills',
        description: `Highlight your technical strengths to compare your skill gap against verified ${targetRole} requirements.`,
        actionLabel: 'Add Skills',
        actionHref: '/profile',
      };
    }

    // 5. Missing Projects
    if (projectsCount === 0) {
      return {
        id: 'action-add-projects',
        category: 'PROJECTS',
        title: 'Add your projects',
        description: `Add projects to showcase your practical abilities for ${targetRole} and prove your expertise with real code and demo links.`,
        actionLabel: 'Add Projects',
        actionHref: '/profile',
      };
    }

    // 6. Job Ready: Interview Preparation
    if (readiness === 'JOB_READY') {
      return {
        id: 'action-prepare-interview',
        category: 'PREPARE',
        title: 'Prepare for technical interviews',
        description: `Your profile and projects are ready for ${targetRole}. Practice common technical and behavioral interview questions.`,
        actionLabel: 'Start Practice',
        actionHref: '/tools',
      };
    }

    // 7. General Profile Optimization if not 100%
    if (completionPercentage < 100 && nextProfileSection) {
      return {
        id: 'action-polish-profile',
        category: 'PROFILE',
        title: `Add ${nextProfileSection}`,
        description: `Bring your profile to 100% completion by filling in your ${nextProfileSection.toLowerCase()}.`,
        actionLabel: 'Update Profile',
        actionHref: '/profile',
      };
    }

    // 8. Default: Continue Learning
    return {
      id: 'action-continue-learning',
      category: 'LEARN',
      title: 'Continue your learning pathway',
      description: `Advance your structured roadmap and master the key competencies for ${targetRole}.`,
      actionLabel: 'Continue Learning',
      actionHref: '/learn',
    };
  }
}
