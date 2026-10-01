import { cookies } from 'next/headers';
import { MentorAuthService, AuthenticatedMentor, MentorAuthError } from '@backend/services/mentorship/mentorAuthService';

export const MENTOR_COOKIE_NAME = 'career_mentor_session';
export const CANDIDATE_COOKIE_NAME = 'career_session';

export async function getAuthenticatedMentor(requireApprovedStatus: boolean = true): Promise<AuthenticatedMentor> {
  const cookieStore = cookies();
  const token = cookieStore.get(MENTOR_COOKIE_NAME)?.value || cookieStore.get(CANDIDATE_COOKIE_NAME)?.value;

  const mentorAuth = await MentorAuthService.verifyMentor(token);

  if (requireApprovedStatus) {
    MentorAuthService.requireApproved(mentorAuth);
  }

  return mentorAuth;
}
