import { cookies } from 'next/headers';
import {
  RecruiterAuthService,
  RecruiterAuthError,
} from '@backend/services/recruiter/recruiterAuthService';
import { AuthenticatedRecruiter } from '@backend/types/recruiter';

export const RECRUITER_COOKIE_NAME = 'career_recruiter_session';

export async function getAuthenticatedRecruiter(): Promise<AuthenticatedRecruiter> {
  const cookieStore = cookies();
  const token = cookieStore.get(RECRUITER_COOKIE_NAME)?.value;

  return RecruiterAuthService.verifyRecruiter(token);
}

export { RecruiterAuthError };
