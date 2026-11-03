import { CAREER_PATHS } from './career-data';
import {
  CareerPath,
  CandidateCareerContext,
  SkillGapAnalysis,
  CareerProgressMetrics,
  CandidateSkill,
  CareerSkill,
  CareerSkillLevel,
  CareerLevelId,
} from './career-types';
import { getRecommendedMentors } from '../mentors/mentor-repository';
import {
  getCareerLevelData,
  DEFAULT_CAREER_LEVELS,
  resolveInitialCareerLevel,
} from './career-levels-data';

export { getCareerLevelData, DEFAULT_CAREER_LEVELS, resolveInitialCareerLevel };

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
 * against the target career path's required skill set (personalized by selected career level if provided).
 */
export function analyzeSkillGap(
  candidate: CandidateCareerContext | null,
  careerSlug: string,
  levelId?: CareerLevelId
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

  // Use level-specific skill groups when level is specified
  const levelData = levelId ? getCareerLevelData(career, levelId) : null;
  const skillGroups = levelData ? levelData.skillGroups : career.skillGroups;

  const allRequiredSkills: CareerSkill[] = [
    ...skillGroups.mustKnow,
    ...skillGroups.goodToKnow,
    ...skillGroups.advanced,
  ];

  if (!candidate || !candidate.skills || candidate.skills.length === 0) {
    return {
      matchedSkills: [],
      developingSkills: [],
      missingSkills: allRequiredSkills,
      nextFocusSkills: skillGroups.mustKnow.slice(0, 3),
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
 * Learning, Practical Work, Practice, Mentorship, Profile.
 * Maps cleanly into the 6-stage roadmap:
 * 0: Learn, 1: Practice, 2: Get Mentored, 3: Prepare, 4: Get Job Ready, 5: Find Opportunities
 */
export function calculateCareerProgress(
  candidate: CandidateCareerContext | null,
  careerSlug: string,
  levelId?: CareerLevelId
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
      currentStageName: 'Learn',
    };
  }

  const levelData = levelId ? getCareerLevelData(career, levelId) : null;
  const gap = analyzeSkillGap(candidate, careerSlug, levelId);
  const targetSkillGroups = levelData ? levelData.skillGroups : career.skillGroups;
  const targetPractical = levelData ? levelData.practicalWork : career.projects;

  // 1. Learning Percent based on matched & developing skills for the level
  const totalSkillsCount =
    targetSkillGroups.mustKnow.length +
    targetSkillGroups.goodToKnow.length +
    targetSkillGroups.advanced.length || 1;

  const learningPercent = Math.min(
    100,
    Math.round(((gap.matchedSkills.length + gap.developingSkills.length * 0.5) / totalSkillsCount) * 100)
  );

  // 2. Practical Work Percent based on user's logged projects vs level required practical work
  const totalPracticalReq = targetPractical.length || 1;
  const userProjectsCount = candidate.projects ? candidate.projects.length : 0;
  const projectsPercent = Math.min(100, Math.round((userProjectsCount / totalPracticalReq) * 100));

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

  // 6-Stage Roadmap Milestone Mapping:
  // 0: Learn, 1: Practice, 2: Get Mentored, 3: Prepare, 4: Get Job Ready, 5: Find Opportunities
  let currentStageIndex = 0;
  let currentStageName = 'Learn';

  if (overallPathwayProgress >= 90) {
    currentStageIndex = 5;
    currentStageName = 'Find Opportunities';
  } else if (overallPathwayProgress >= 75) {
    currentStageIndex = 4;
    currentStageName = 'Get Job Ready';
  } else if (overallPathwayProgress >= 60) {
    currentStageIndex = 3;
    currentStageName = 'Prepare';
  } else if (overallPathwayProgress >= 45) {
    currentStageIndex = 2;
    currentStageName = 'Get Mentored';
  } else if (overallPathwayProgress >= 25) {
    currentStageIndex = 1;
    currentStageName = 'Practice';
  } else {
    currentStageIndex = 0;
    currentStageName = 'Learn';
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
 * Returns candidate-aware "Your Next Step" recommendation card data tailored by target level.
 */
export function getRecommendedNextStep(
  candidate: CandidateCareerContext | null,
  careerSlug: string,
  levelId?: CareerLevelId
): {
  title: string;
  actionLabel: string;
  rationale: string;
  actionUrl: string;
  focusSkill?: string;
  currentLevel?: string;
  targetLevel?: string;
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

  const levelData = levelId ? getCareerLevelData(career, levelId) : null;
  const levelLabel = levelData ? levelData.label : 'Beginner / Entry Level';

  if (!candidate) {
    return {
      title: `Sign in to personalize your ${career.title} path (${levelLabel})`,
      actionLabel: 'Sign In to Account',
      rationale: `Connect your candidate profile to calculate your exact skill gap for target level: ${levelLabel}.`,
      actionUrl: '/login',
      targetLevel: levelLabel,
    };
  }

  const gap = analyzeSkillGap(candidate, careerSlug, levelId);

  if (gap.nextFocusSkills.length > 0) {
    const focusSkill = gap.nextFocusSkills[0];
    return {
      title: `Build ${focusSkill.name} Skills for ${levelLabel}`,
      focusSkill: focusSkill.name,
      targetLevel: levelLabel,
      actionLabel: `Start ${focusSkill.name} Learning`,
      rationale: `You already have ${gap.matchedSkills.map((s) => s.name).slice(0, 2).join(' and ') || 'a baseline'}, but ${focusSkill.name} is a high-priority skill for ${levelLabel} ${career.title}.`,
      actionUrl: `#learning-roadmap`,
    };
  }

  const practicalItems = levelData ? levelData.practicalWork : career.projects;
  const practicalTitle = levelData?.practicalWorkTitle || 'Projects & Portfolio';

  if (candidate.projects.length < practicalItems.length) {
    const nextProj = practicalItems[candidate.projects.length] || practicalItems[0];
    return {
      title: `Complete Practical Work: ${nextProj.title}`,
      actionLabel: 'View Practical Brief',
      rationale: `You have strong core skills for ${levelLabel}! Demonstrate your competence by completing ${nextProj.title}.`,
      actionUrl: `#project-roadmap`,
      targetLevel: levelLabel,
    };
  }

  return {
    title: `Prepare for ${career.title} Technical & Role Interviews (${levelLabel})`,
    actionLabel: 'Start Interview Practice',
    rationale: `You are well-prepared! Practice scenario questions and review key topics tailored for ${levelLabel}.`,
    actionUrl: `#interview-prep`,
    targetLevel: levelLabel,
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
 * Candidate-aware matching jobs preview tailored by selected career level.
 */
export function getMatchingJobsForCandidate({
  candidate,
  careerSlug,
  levelId,
}: {
  candidate: CandidateCareerContext | null;
  careerSlug: string;
  levelId?: CareerLevelId;
}) {
  const career = getCareerPathBySlug(careerSlug);
  const roleName = career ? career.title : 'Software Engineer';
  const levelData = levelId && career ? getCareerLevelData(career, levelId) : null;
  const targetTitle = levelData ? levelData.roleTitle : roleName;

  // Filter or structure realistic matching jobs based on levelId
  if (levelId === 'senior') {
    return [
      {
        id: 'job-s01',
        title: `Senior ${roleName}`,
        company: 'Apex Enterprise Systems',
        location: 'Hyderabad, India (Hybrid)',
        type: 'Full-time',
        experienceLevel: 'Senior (5+ yrs)',
        salary: '₹22–34 LPA',
        skills: levelData?.skillGroups.mustKnow.map((s) => s.name).slice(0, 3) || ['System Design', 'Leadership', 'Architecture'],
        postedDate: '1 day ago',
      },
      {
        id: 'job-s02',
        title: `Lead ${roleName}`,
        company: 'CloudScale Global',
        location: 'Bengaluru, India (Hybrid)',
        type: 'Full-time',
        experienceLevel: 'Senior / Lead (6+ yrs)',
        salary: '₹28–42 LPA',
        skills: levelData?.skillGroups.mustKnow.map((s) => s.name).slice(0, 3) || ['Architecture', 'Scaling'],
        postedDate: '3 days ago',
      },
      {
        id: 'job-s03',
        title: `Staff ${roleName}`,
        company: 'NextGen Autonomous',
        location: 'Remote, India',
        type: 'Full-time',
        experienceLevel: 'Staff (7+ yrs)',
        salary: '₹35–50 LPA',
        skills: levelData?.skillGroups.goodToKnow.map((s) => s.name).slice(0, 3) || ['Distributed Systems', 'Strategy'],
        postedDate: 'Just now',
      },
    ];
  }

  if (levelId === 'mid') {
    return [
      {
        id: 'job-m01',
        title: `${roleName} II`,
        company: 'CloudScale Technologies',
        location: 'Bengaluru, India (Hybrid)',
        type: 'Full-time',
        experienceLevel: 'Mid-Level (3-5 yrs)',
        salary: '₹14–22 LPA',
        skills: levelData?.skillGroups.mustKnow.map((s) => s.name).slice(0, 3) || ['Optimization', 'APIs'],
        postedDate: '2 days ago',
      },
      {
        id: 'job-m02',
        title: `${roleName}`,
        company: 'FinPulse Systems',
        location: 'Pune, India (Hybrid)',
        type: 'Full-time',
        experienceLevel: 'Mid-Level (2-4 yrs)',
        salary: '₹12–18 LPA',
        skills: levelData?.skillGroups.mustKnow.map((s) => s.name).slice(0, 3) || ['Databases', 'Cloud'],
        postedDate: '4 days ago',
      },
      {
        id: 'job-m03',
        title: `Specialist ${roleName}`,
        company: 'Nexus Tech Labs',
        location: 'Remote, India',
        type: 'Full-time',
        experienceLevel: 'Mid-Level (3-5 yrs)',
        salary: '₹16–24 LPA',
        skills: levelData?.skillGroups.goodToKnow.map((s) => s.name).slice(0, 3) || ['Testing', 'Microservices'],
        postedDate: 'Just now',
      },
    ];
  }

  if (levelId === 'junior') {
    return [
      {
        id: 'job-j01',
        title: `Junior ${roleName}`,
        company: 'NextGen Solutions',
        location: 'Bengaluru, India',
        type: 'Full-time',
        experienceLevel: 'Junior (1-3 yrs)',
        salary: '₹8–14 LPA',
        skills: levelData?.skillGroups.mustKnow.map((s) => s.name).slice(0, 3) || ['TypeScript', 'SQL'],
        postedDate: 'Just now',
      },
      {
        id: 'job-j02',
        title: `${roleName} - Early Career`,
        company: 'Veloce Digital',
        location: 'Remote, India',
        type: 'Full-time',
        experienceLevel: 'Junior (1-2 yrs)',
        salary: '₹7–12 LPA',
        skills: levelData?.skillGroups.mustKnow.map((s) => s.name).slice(0, 3) || ['Git', 'Testing'],
        postedDate: '1 day ago',
      },
      {
        id: 'job-j03',
        title: `Associate ${roleName}`,
        company: 'InnoSpark Technologies',
        location: 'Hyderabad, India (Hybrid)',
        type: 'Full-time',
        experienceLevel: 'Junior (1-3 yrs)',
        salary: '₹9–15 LPA',
        skills: levelData?.skillGroups.goodToKnow.map((s) => s.name).slice(0, 3) || ['APIs', 'Docker'],
        postedDate: '3 days ago',
      },
    ];
  }

  // Default: Entry Level
  return [
    {
      id: 'job-e01',
      title: `Associate ${roleName}`,
      company: 'InnovateLab Tech',
      location: 'Bengaluru, India (Hybrid)',
      type: 'Full-time',
      experienceLevel: 'Entry-Level (0-1 yrs)',
      salary: '₹6–10 LPA',
      skills: levelData?.skillGroups.mustKnow.map((s) => s.name).slice(0, 3) || ['Fundamentals', 'Git'],
      postedDate: 'Just now',
    },
    {
      id: 'job-e02',
      title: `Graduate Trainee - ${roleName}`,
      company: 'TechCorp Solutions',
      location: 'Hyderabad, India (Onsite)',
      type: 'Full-time',
      experienceLevel: 'Entry-Level (0-1 yrs)',
      salary: '₹5–8 LPA',
      skills: levelData?.skillGroups.mustKnow.map((s) => s.name).slice(0, 3) || ['Core Concepts', 'Tools'],
      postedDate: '2 days ago',
    },
    {
      id: 'job-e03',
      title: `Junior / Entry ${roleName}`,
      company: 'PulseCraft Labs',
      location: 'Remote, India',
      type: 'Full-time',
      experienceLevel: 'Entry-Level (0-1 yrs)',
      salary: '₹6–9 LPA',
      skills: levelData?.skillGroups.goodToKnow.map((s) => s.name).slice(0, 3) || ['Problem Solving'],
      postedDate: '3 days ago',
    },
  ];
}

export {
  CURATED_ROLES,
  findCareerSlugByTitle,
  getSavedRoleBySlug,
  getSavedTargetRoles,
  setSavedTargetRole,
  toggleTargetRole,
  isTargetRoleSelected,
  type SavedRoleItem,
} from './saved-roles';

