import { ProfileCompletionDTO } from '../types/profile';

export interface ProfileCompletionRule {
  weight: number;
  label: string;
  check: (data: any) => boolean;
}

/**
 * Centrally configured rules and weights for profile scoring.
 * Can be reconfigured without changing calculation mechanics.
 */
export const PROFILE_COMPLETION_RULES: Record<string, ProfileCompletionRule> = {
  personal: {
    weight: 20,
    label: 'Personal Information',
    check: (data) => {
      const p = data.personal || data;
      return Boolean(p.name && p.phone && p.location && p.headline);
    },
  },
  education: {
    weight: 15,
    label: 'Education',
    check: (data) => {
      return Boolean(data.educationCount > 0 || (Array.isArray(data.education) && data.education.length > 0));
    },
  },
  experience: {
    weight: 15,
    label: 'Experience',
    check: (data) => {
      const isStudent = data.personal?.candidateType === 'STUDENT';
      const hasExp = data.experienceCount > 0 || (Array.isArray(data.experience) && data.experience.length > 0);
      return Boolean(hasExp || isStudent);
    },
  },
  skills: {
    weight: 15,
    label: 'Skills',
    check: (data) => {
      return Boolean(data.skillsCount > 0 || (Array.isArray(data.skills) && data.skills.length > 0));
    },
  },
  projects: {
    weight: 15,
    label: 'Projects',
    check: (data) => {
      return Boolean(data.projectsCount > 0 || (Array.isArray(data.projects) && data.projects.length > 0));
    },
  },
  careerDirection: {
    weight: 10,
    label: 'Career Direction',
    check: (data) => {
      const cd = data.careerDirection || data.careerGoal;
      return Boolean(cd && cd.targetRole && cd.targetRole.trim().length > 0);
    },
  },
  preferences: {
    weight: 5,
    label: 'Preferences',
    check: (data) => {
      const pref = data.jobPreferences || data.jobPreference;
      return Boolean(pref && (pref.workEnvironment || pref.preferredJobType || pref.preferredLocation));
    },
  },
  linksAndCertifications: {
    weight: 5,
    label: 'Links & Certifications',
    check: (data) => {
      const hasLinks = data.linksCount > 0 || (Array.isArray(data.links) && data.links.length > 0);
      const hasCerts = data.certificationsCount > 0 || (Array.isArray(data.certifications) && data.certifications.length > 0);
      return Boolean(hasLinks || hasCerts);
    },
  },
};

/**
 * Computes profile completion score, completed sections, missing sections, and next recommended action.
 */
export function calculateProfileCompletion(
  data: any,
  rules: Record<string, ProfileCompletionRule> = PROFILE_COMPLETION_RULES
): ProfileCompletionDTO {
  let earnedScore = 0;
  let maxScore = 0;
  const completedSections: string[] = [];
  const missingSections: string[] = [];
  const sectionScores: Record<string, { earned: number; max: number; isComplete: boolean }> = {};

  for (const [sectionKey, rule] of Object.entries(rules)) {
    maxScore += rule.weight;
    const isComplete = rule.check(data);
    const earned = isComplete ? rule.weight : 0;
    earnedScore += earned;

    sectionScores[sectionKey] = {
      earned,
      max: rule.weight,
      isComplete,
    };

    if (isComplete) {
      completedSections.push(sectionKey);
    } else {
      missingSections.push(sectionKey);
    }
  }

  const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;
  const nextSection = missingSections.length > 0 ? missingSections[0] : 'complete';

  return {
    percentage,
    completedSections,
    missingSections,
    nextSection,
    sectionScores,
  };
}
