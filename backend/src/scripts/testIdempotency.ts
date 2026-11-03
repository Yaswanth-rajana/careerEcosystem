import { EmailService } from '../services/email/emailService';

async function run() {
  console.log('--- Testing Idempotency for app_test_kcibdv9 ---');

  const testData = {
    candidateId: 'user_live_test_candidate',
    candidateName: 'Candidate LeafFlip',
    candidateEmail: 'dodoli4778@leafflip.com',
    jobTitle: 'Senior Full Stack Engineer',
    companyName: 'PATHWAY.ECO Technologies',
    applicationId: 'app_test_kcibdv9', // Same ID as previous send!
    appliedDate: new Date(),
    applicationStatus: 'APPLIED',
  };

  const result = await EmailService.sendCandidateApplicationConfirmationEmail(testData);
  console.log('Result (should be deduplicated):', JSON.stringify(result, null, 2));
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error in idempotency test script:', err);
    process.exit(1);
  });
