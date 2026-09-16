import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { ProfileService } from '@backend/services/profileService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';
import { CandidateCareerContext, CandidateSkill, CareerSkillLevel, CareerSkillProvenance } from './career-types';

/**
 * Server-side helper for Next.js Server Components.
 * Directly inspects session cookie and queries Prisma DB via backend services
 * to fetch authenticated candidate context without external HTTP calls.
 */
export async function getCandidateContextFromSession(): Promise<CandidateCareerContext | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const user = await UserService.getSession(token);
    if (!user) return null;

    const rawProfile = await ProfileService.getProfileByUserId(user.id);
    if (!rawProfile) {
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        skills: [],
        education: [],
        experience: [],
        projects: [],
        completedCourses: [],
        completedAssessments: [],
      };
    }

    const skills: CandidateSkill[] = (rawProfile.skills || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      level: (s.level as CareerSkillLevel) || 'INTERMEDIATE',
      source: 'USER' as CareerSkillProvenance,
      verified: true,
    }));

    return {
      userId: user.id,
      name: rawProfile.user?.name || user.name,
      email: rawProfile.user?.email || user.email,
      candidateType: rawProfile.candidateType,
      currentRole: rawProfile.currentRole ?? undefined,
      skills,
      careerGoal: rawProfile.careerGoal
        ? {
            targetRole: rawProfile.careerGoal.targetRole,
            targetIndustry: rawProfile.careerGoal.targetIndustry,
            timeframe: rawProfile.careerGoal.timeframe,
            notes: rawProfile.careerGoal.notes,
          }
        : undefined,
      education: (rawProfile.education || []).map((e: any) => ({
        id: e.id,
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
        startYear: e.startYear,
        endYear: e.endYear,
        isCurrent: e.isCurrent,
      })),
      experience: (rawProfile.experience || []).map((ex: any) => ({
        id: ex.id,
        company: ex.company,
        roleTitle: ex.roleTitle,
        startDate: ex.startDate,
        endDate: ex.endDate,
        isCurrent: ex.isCurrent,
        description: ex.description,
      })),
      projects: [],
      completedCourses: [],
      completedAssessments: [],
    };
  } catch (err) {
    console.error('Error fetching candidate context from session:', err);
    return null;
  }
}
