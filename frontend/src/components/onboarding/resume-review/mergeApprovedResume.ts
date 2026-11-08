import { ParsedResumeData } from '@backend/services/resumeParserService';
import { FullOnboardingPayload } from '@backend/validations/onboardingSchemas';
import { autofillResumeToPayload } from './autofillResumeToPayload';

/**
 * Backward-compatible wrapper around autofillResumeToPayload.
 * Safely merges parsed resume data directly into FullOnboardingPayload.
 */
export function mergeApprovedResume(
  existing: FullOnboardingPayload,
  approved: ParsedResumeData
): FullOnboardingPayload {
  const result = autofillResumeToPayload(existing, approved);
  return result.updatedPayload;
}
