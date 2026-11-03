import { EmailService } from '../services/email/emailService';

async function run() {
  console.log('--- Sending Polished Confirmation Email to dodoli4778@leafflip.com ---');

  const testData = {
    candidateName: 'Candidate LeafFlip',
    candidateEmail: 'dodoli4778@leafflip.com',
    jobTitle: 'Senior Full Stack Engineer',
    companyName: 'PATHWAY.ECO Technologies',
    applicationId: 'app_live_' + Math.random().toString(36).substring(2, 9),
    appliedDate: new Date(),
    applicationStatus: 'APPLIED',
  };

  console.log('Sending payload:', testData);
  const result = await EmailService.sendCandidateApplicationConfirmationEmail(testData);
  console.log('Send Result:', JSON.stringify(result, null, 2));
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
