import { Mentor, CandidateContext, MentorMatchScore } from './mentor-types';

/**
 * Calculates a match score between a candidate's context/profile and a mentor.
 * Scoring breakdown:
 * - Target Role / Goal match: 40%
 * - Skills overlap: 30%
 * - Mentorship Need match: 20%
 * - Experience level: 10%
 */
export function matchMentor(candidate: CandidateContext | null | undefined, mentor: Mentor): MentorMatchScore {
  if (!candidate || (!candidate.targetRole && !candidate.skills?.length && !candidate.mentorshipNeeds?.length)) {
    // Default score if candidate profile is empty / unauthenticated
    return {
      score: 85,
      matchingPills: ['✓ Highly rated mentor', `✓ ${mentor.experienceYears}+ yrs experience`],
      breakdown: { goalMatch: 35, skillMatch: 25, needMatch: 15, experienceMatch: 10 },
    };
  }

  let goalScore = 15; // default baseline
  let skillScore = 10;
  let needScore = 10;
  let expScore = 10;

  const pills: string[] = [];

  // 1. Goal / Target Role match (Max 40 points)
  if (candidate.targetRole) {
    const targetLower = candidate.targetRole.toLowerCase();
    const roleLower = mentor.role.toLowerCase();
    const domainLower = mentor.domain.toLowerCase();

    if (roleLower.includes(targetLower) || targetLower.includes(roleLower)) {
      goalScore = 40;
      pills.push(`✓ Matches your target role (${mentor.role})`);
    } else if (
      domainLower.includes(targetLower) ||
      targetLower.includes(domainLower) ||
      mentor.expertise.some((e) => targetLower.includes(e.toLowerCase()))
    ) {
      goalScore = 32;
      pills.push(`✓ Operates in your target domain (${mentor.domain})`);
    } else {
      goalScore = 20;
    }
  }

  // 2. Skill match (Max 30 points)
  if (candidate.skills && candidate.skills.length > 0) {
    const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase());
    const matchedSkills = mentor.skillsList.filter((sk) =>
      candidateSkillsLower.some((cSk) => sk.toLowerCase().includes(cSk) || cSk.includes(sk.toLowerCase()))
    );

    if (matchedSkills.length > 0) {
      const matchRatio = Math.min(matchedSkills.length / Math.min(candidate.skills.length, 3), 1);
      skillScore = Math.round(15 + matchRatio * 15);
      pills.push(`✓ Matches skills: ${matchedSkills.slice(0, 2).join(', ')}`);
    } else {
      skillScore = 12;
    }
  }

  // 3. Mentorship Need match (Max 20 points)
  if (candidate.mentorshipNeeds && candidate.mentorshipNeeds.length > 0) {
    const needsLower = candidate.mentorshipNeeds.map((n) => n.toLowerCase());
    const matchedTypes = mentor.sessionTypes.filter((st) =>
      needsLower.some((n) => st.toLowerCase().includes(n) || n.toLowerCase().includes(st.toLowerCase()))
    );

    if (matchedTypes.length > 0) {
      needScore = 20;
      pills.push(`✓ Helps with ${matchedTypes[0]}`);
    } else {
      needScore = 12;
    }
  }

  // 4. Experience match (Max 10 points)
  if (mentor.experienceYears >= 7) {
    expScore = 10;
  } else if (mentor.experienceYears >= 5) {
    expScore = 8;
  } else {
    expScore = 6;
  }

  if (pills.length === 0) {
    pills.push(`✓ Experienced in ${mentor.domain}`);
    pills.push(`✓ ${mentor.rating}★ rating from ${mentor.reviewCount} reviews`);
  }

  const totalScore = Math.min(goalScore + skillScore + needScore + expScore, 99);

  return {
    score: totalScore,
    matchingPills: pills,
    breakdown: {
      goalMatch: goalScore,
      skillMatch: skillScore,
      needMatch: needScore,
      experienceMatch: expScore,
    },
  };
}
