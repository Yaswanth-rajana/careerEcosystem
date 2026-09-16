import { CAREER_PATHS } from './career-data';
import {
  CareerPath,
  CandidateCareerContext,
  SkillGapAnalysis,
  CareerProgressMetrics,
  CandidateSkill,
  CareerSkill,
  CareerSkillLevel,
} from './career-types';
import { getRecommendedMentors } from '../mentors/mentor-repository';

export const CAREER_CATEGORIES = [
  'Technology',
  'Data & AI',
  'Product & Design',
  'Cybersecurity',
  'Business & Growth',
  'Electronics & Systems',
  'Mechanical & Manufacturing',
] as const;

export type CareerCategoryName = (typeof CAREER_CATEGORIES)[number];

export function getCareerCategories(): readonly string[] {
  return CAREER_CATEGORIES;
}

export function getCareerPaths(category?: string, search?: string): CareerPath[] {
  let filtered = [...CAREER_PATHS];

  if (category && category !== 'All') {
    filtered = filtered.filter(
      (c) => c.category.toLowerCase().trim() === category.toLowerCase().trim()
    );
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.responsibilities.some((r) => r.toLowerCase().includes(q))
    );
  }

  return filtered;
}

export function getCareerPathBySlug(slug: string): CareerPath | null {
  const found = CAREER_PATHS.find((c) => c.slug === slug);
  return found || null;
}

const LEVEL_WEIGHTS: Record<CareerSkillLevel, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

/**
 * Performs proficiency-aware skill gap analysis comparing candidate's verified/entered skills
 * against the target career path's required skill set.
 */
export function analyzeSkillGap(
  candidate: CandidateCareerContext | null,
  careerSlug: string
): SkillGapAnalysis {
  const career = getCareerPathBySlug(careerSlug);
  if (!career) {
    return {
      matchedSkills: [],
      developingSkills: [],
      missingSkills: [],
      nextFocusSkills: [],
      matchPercentage: 0,
      hasEnoughData: false,
    };
  }

  const allRequiredSkills: CareerSkill[] = [
    ...career.skillGroups.mustKnow,
    ...career.skillGroups.goodToKnow,
    ...career.skillGroups.advanced,
  ];

  if (!candidate || !candidate.skills || candidate.skills.length === 0) {
    return {
      matchedSkills: [],
      developingSkills: [],
      missingSkills: allRequiredSkills,
      nextFocusSkills: career.skillGroups.mustKnow.slice(0, 3),
      matchPercentage: 0,
      hasEnoughData: false,
    };
  }

  const candidateSkillMap = new Map<string, CandidateSkill>();
  candidate.skills.forEach((s) => {
    candidateSkillMap.set(s.name.toLowerCase().trim(), s);
  });

  const matchedSkills: CandidateSkill[] = [];
  const developingSkills: Array<{
    skill: CareerSkill;
    currentLevel: CareerSkillLevel;
    requiredLevel: CareerSkillLevel;
  }> = [];
  const missingSkills: CareerSkill[] = [];

  allRequiredSkills.forEach((reqSkill) => {
    const reqNameKey = reqSkill.name.toLowerCase().trim();
    const candidateSkill = candidateSkillMap.get(reqNameKey);

    if (candidateSkill) {
      const candidateWeight = LEVEL_WEIGHTS[candidateSkill.level] || 1;
      const requiredWeight = LEVEL_WEIGHTS[reqSkill.level] || 2;

      if (candidateWeight >= requiredWeight) {
        matchedSkills.push(candidateSkill);
      } else {
        developingSkills.push({
          skill: reqSkill,
          currentLevel: candidateSkill.level,
          requiredLevel: reqSkill.level,
        });
      }
    } else {
      missingSkills.push(reqSkill);
    }
  });

  // Next focus: prioritize missing MUST_KNOW skills, then developing MUST_KNOW skills
  const missingMustKnow = missingSkills.filter((s) => s.importance === 'MUST_KNOW');
  const developingMustKnow = developingSkills
    .filter((d) => d.skill.importance === 'MUST_KNOW')
    .map((d) => d.skill);

  const nextFocusSkills = [...missingMustKnow, ...developingMustKnow].slice(0, 3);
  if (nextFocusSkills.length === 0 && missingSkills.length > 0) {
    nextFocusSkills.push(...missingSkills.slice(0, 3));
  }

  const totalRequired = allRequiredSkills.length || 1;
  const matchScore = (matchedSkills.length + developingSkills.length * 0.5) / totalRequired;
  const matchPercentage = Math.min(100, Math.round(matchScore * 100));

  return {
    matchedSkills,
    developingSkills,
    missingSkills,
    nextFocusSkills,
    matchPercentage,
    hasEnoughData: true,
  };
}

/**
 * Calculates preparation progress across 5 PATHWAY activity dimensions:
 * Learning, Projects, Practice, Mentorship, Profile.
 */
export function calculateCareerProgress(
  candidate: CandidateCareerContext | null,
  careerSlug: string
): CareerProgressMetrics {
  const career = getCareerPathBySlug(careerSlug);
  if (!career || !candidate) {
    return {
      learningPercent: 0,
      projectsPercent: 0,
      practicePercent: 0,
      mentorshipPercent: 0,
      profilePercent: 15, // Baseline for starting
      overallPathwayProgress: 5,
      currentStageIndex: 0,
      currentStageName: 'Foundation',
    };
  }

  const gap = analyzeSkillGap(candidate, careerSlug);

  // 1. Learning Percent based on matched & developing skills
  const totalSkillsCount =
    career.skillGroups.mustKnow.length +
    career.skillGroups.goodToKnow.length +
    career.skillGroups.advanced.length || 1;

  const learningPercent = Math.min(
    100,
    Math.round(((gap.matchedSkills.length + gap.developingSkills.length * 0.5) / totalSkillsCount) * 100)
  );

  // 2. Projects Percent based on user's logged projects vs career required projects
  const totalProjectsReq = career.projects.length || 1;
  const userProjectsCount = candidate.projects ? candidate.projects.length : 0;
  const projectsPercent = Math.min(100, Math.round((userProjectsCount / totalProjectsReq) * 100));

  // 3. Practice Percent based on completed assessments
  const completedAssessmentsCount = candidate.completedAssessments ? candidate.completedAssessments.length : 0;
  const practicePercent = Math.min(100, Math.round((completedAssessmentsCount / 4) * 100));

  // 4. Mentorship Percent (e.g. if target role is set or experience present)
  const mentorshipPercent = candidate.careerGoal?.targetRole?.toLowerCase() === career.title.toLowerCase() ? 60 : 20;

  // 5. Profile Percent based on resume/experience/skills
  let profileScore = 20;
  if (candidate.skills.length >= 3) profileScore += 25;
  if (candidate.experience && candidate.experience.length > 0) profileScore += 25;
  if (candidate.education && candidate.education.length > 0) profileScore += 20;
  if (candidate.careerGoal) profileScore += 10;
  const profilePercent = Math.min(100, profileScore);

  // Weighted Overall PATHWAY Progress
  const overallPathwayProgress = Math.round(
    learningPercent * 0.35 +
      projectsPercent * 0.25 +
      practicePercent * 0.15 +
      mentorshipPercent * 0.1 +
      profilePercent * 0.15
  );

  // Milestone Stages:
  // 0: Foundation, 1: Core Skills, 2: Specialized, 3: Projects, 4: Practice, 5: Mentorship, 6: Interview Prep, 7: Job Ready, 8: Opportunities
  let currentStageIndex = 0;
  let currentStageName = 'Foundation';

  if (overallPathwayProgress >= 90) {
    currentStageIndex = 7;
    currentStageName = 'Job Ready';
  } else if (overallPathwayProgress >= 75) {
    currentStageIndex = 6;
    currentStageName = 'Interview Prep';
  } else if (overallPathwayProgress >= 60) {
    currentStageIndex = 5;
    currentStageName = 'Mentorship';
  } else if (overallPathwayProgress >= 45) {
    currentStageIndex = 4;
    currentStageName = 'Practice';
  } else if (overallPathwayProgress >= 30) {
    currentStageIndex = 3;
    currentStageName = 'Projects';
  } else if (overallPathwayProgress >= 15) {
    currentStageIndex = 1;
    currentStageName = 'Core Skills';
  }

  return {
    learningPercent,
    projectsPercent,
    practicePercent,
    mentorshipPercent,
    profilePercent,
    overallPathwayProgress,
    currentStageIndex,
    currentStageName,
  };
}

/**
 * Returns candidate-aware "Your Next Step" recommendation card data.
 */
export function getRecommendedNextStep(
  candidate: CandidateCareerContext | null,
  careerSlug: string
): {
  title: string;
  actionLabel: string;
  rationale: string;
  actionUrl: string;
  focusSkill?: string;
} {
  const career = getCareerPathBySlug(careerSlug);
  if (!career) {
    return {
      title: 'Explore Career Directions',
      actionLabel: 'Browse Careers',
      rationale: 'Discover industry career paths tailored to your background.',
      actionUrl: '/explore',
    };
  }

  if (!candidate) {
    return {
      title: `Sign in to personalize your ${career.title} path`,
      actionLabel: 'Sign In to Account',
      rationale: 'Connect your candidate profile to calculate your exact skill gap and next focus steps.',
      actionUrl: '/login',
    };
  }

  const gap = analyzeSkillGap(candidate, careerSlug);

  if (gap.nextFocusSkills.length > 0) {
    const focusSkill = gap.nextFocusSkills[0];
    return {
      title: `Build ${focusSkill.name} Skills`,
      focusSkill: focusSkill.name,
      actionLabel: `Start ${focusSkill.name} Learning`,
      rationale: `You already have ${gap.matchedSkills.map((s) => s.name).slice(0, 2).join(' and ') || 'a baseline'}, but ${focusSkill.name} is currently a key gap for your ${career.title} path.`,
      actionUrl: `#learning-roadmap`,
    };
  }

  if (candidate.projects.length < career.projects.length) {
    const nextProj = career.projects[candidate.projects.length] || career.projects[0];
    return {
      title: `Build Real-World Project: ${nextProj.title}`,
      actionLabel: 'View Project Brief',
      rationale: `You have strong core skills! Now prove your knowledge by building ${nextProj.title}.`,
      actionUrl: `#project-roadmap`,
    };
  }

  return {
    title: `Prepare for ${career.title} Technical Interviews`,
    actionLabel: 'Start Interview Practice',
    rationale: 'You are well-prepared! Practice scenario questions and review key system design topics.',
    actionUrl: `#interview-prep`,
  };
}

/**
 * Candidate-aware mentor recommendations.
 */
export async function getRecommendedMentorsForCandidate({
  candidate,
  careerSlug,
}: {
  candidate: CandidateCareerContext | null;
  careerSlug: string;
}) {
  const career = getCareerPathBySlug(careerSlug);
  const domainFilter = career ? career.category : undefined;

  const candidateContext = candidate
    ? {
        role: candidate.currentRole,
        domain: domainFilter,
        targetRole: career?.title || candidate.careerGoal?.targetRole,
        skills: candidate.skills.map((s) => s.name),
        experienceYears: candidate.experience.length * 2,
        mentorshipNeeds: ['Career Guidance', 'Mock Interview'],
      }
    : null;

  return await getRecommendedMentors(candidateContext, 3);
}

/**
 * Candidate-aware matching jobs preview.
 */
export function getMatchingJobsForCandidate({
  candidate,
  careerSlug,
}: {
  candidate: CandidateCareerContext | null;
  careerSlug: string;
}) {
  const career = getCareerPathBySlug(careerSlug);
  const roleName = career ? career.title : 'Software Engineer';

  return [
    {
      id: 'job-01',
      title: `${roleName}`,
      company: 'CloudScale Technologies',
      location: 'Bengaluru, India (Hybrid)',
      type: 'Full-time',
      experienceLevel: 'Mid-Senior (2-4 yrs)',
      salary: '₹12–18 LPA',
      skills: career?.skillGroups.mustKnow.map((s) => s.name).slice(0, 3) || ['Linux', 'Cloud', 'Git'],
      postedDate: '2 days ago',
    },
    {
      id: 'job-02',
      title: `Associate ${roleName}`,
      company: 'NextGen Solutions',
      location: 'Remote, India',
      type: 'Full-time',
      experienceLevel: 'Entry-Level (0-2 yrs)',
      salary: '₹8–12 LPA',
      skills: career?.skillGroups.mustKnow.map((s) => s.name).slice(0, 3) || ['Python', 'SQL', 'Docker'],
      postedDate: 'Just now',
    },
    {
      id: 'job-03',
      title: `Senior ${roleName}`,
      company: 'Apex Data Systems',
      location: 'Hyderabad, India (Onsite)',
      type: 'Full-time',
      experienceLevel: 'Senior (5+ yrs)',
      salary: '₹18–26 LPA',
      skills: career?.skillGroups.advanced.map((s) => s.name).slice(0, 3) || ['Architecture', 'Scaling'],
      postedDate: '3 days ago',
    },
  ];
}

export interface SavedRoleItem {
  slug: string;
  title: string;
  category?: string;
}

export function getSavedTargetRoles(): SavedRoleItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('pathway_selected_roles');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const legacy = localStorage.getItem('pathway_selected_role');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed?.slug && parsed?.title) return [parsed];
    }
  } catch {}
  return [];
}

export function toggleTargetRole(role: SavedRoleItem): { isSelected: boolean; roles: SavedRoleItem[] } {
  if (typeof window === 'undefined') return { isSelected: false, roles: [] };
  const roles = getSavedTargetRoles();
  const existingIdx = roles.findIndex((r) => r.slug === role.slug);

  let newRoles: SavedRoleItem[];
  let isSelected = false;

  if (existingIdx >= 0) {
    newRoles = roles.filter((r) => r.slug !== role.slug);
    isSelected = false;
  } else {
    newRoles = [...roles, { slug: role.slug, title: role.title, category: role.category }];
    isSelected = true;
  }

  try {
    localStorage.setItem('pathway_selected_roles', JSON.stringify(newRoles));
    if (newRoles.length > 0) {
      const active = newRoles[newRoles.length - 1];
      localStorage.setItem('pathway_selected_role', JSON.stringify(active));
    } else {
      localStorage.removeItem('pathway_selected_role');
    }
    window.dispatchEvent(new Event('pathway_selected_roles_changed'));
  } catch {}

  return { isSelected, roles: newRoles };
}

export function isTargetRoleSelected(slug: string): boolean {
  const roles = getSavedTargetRoles();
  return roles.some((r) => r.slug === slug);
}
