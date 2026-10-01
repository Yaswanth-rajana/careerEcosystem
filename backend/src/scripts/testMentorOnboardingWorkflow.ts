import { db } from '../db/client';
import { MentorApplicationService } from '../services/mentorApplicationService';
import { PasswordSetupTokenService } from '../services/passwordSetupTokenService';
import { EmailService } from '../services/email/emailService';
import { AuthenticatedAdmin } from '../services/adminAuthService';
import { comparePassword } from '../auth/security';

async function runMentorWorkflowTests() {
  console.log('\n======================================================');
  console.log('🧪 PATHWAY.ECO Mentor Onboarding End-to-End Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      if (details) console.error('    Details:', details);
      failed++;
    }
  }

  const testSuffix = Date.now().toString().slice(-6);
  const testCandidateEmail = `candidate_test_${testSuffix}@example.com`;
  const testNewApplicantEmail = `mentor_new_${testSuffix}@example.com`;

  const mockAdmin: AuthenticatedAdmin = {
    id: '65b21490e12f8a48b1111111',
    email: 'admin@pathway.eco',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
  };

  try {
    // ----------------------------------------------------
    // TEST 1: User Pre-Existence (Existing Candidate)
    // ----------------------------------------------------
    console.log('\n--- PHASE 1: Existing Candidate Setup ---');
    const existingCandidate = await db.user.create({
      data: {
        name: 'Ananya Sharma',
        email: testCandidateEmail.toLowerCase(),
        role: 'CANDIDATE',
        status: 'ACTIVE',
        profile: {
          create: {
            candidateType: 'EXPERIENCED',
            headline: 'Senior Backend Engineer',
            currentRole: 'Senior Backend Engineer',
            totalExperience: '5 Years',
          },
        },
      },
      include: { profile: true },
    });
    assert(Boolean(existingCandidate.id), 'Candidate user account created in database');
    assert(existingCandidate.role === 'CANDIDATE', 'Candidate starts with role CANDIDATE');

    // ----------------------------------------------------
    // TEST 2: Mentor Application Submission (Existing User)
    // ----------------------------------------------------
    console.log('\n--- PHASE 2: Application Submission ---');
    const appResult1 = await MentorApplicationService.submitApplication(
      {
        fullName: 'Ananya Sharma',
        email: testCandidateEmail,
        phone: '+91 9876543210',
        location: 'Bengaluru, India',
        currentRole: 'Senior Backend Engineer',
        company: 'Stripe',
        experienceYears: 5,
        industry: 'FinTech',
        linkedIn: 'https://linkedin.com/in/ananyasharma',
        gitHub: 'https://github.com/ananyasharma',
        portfolio: 'https://ananya.dev',
        domain: 'Software Engineering',
        expertise: ['System Design', 'Backend Scalability', 'Microservices'],
        additionalExpertise: 'Go, Kafka, PostgreSQL',
        offerings: ['Career Guidance', 'Mock Interview', 'Technical Mentorship'],
        preferredSessionDuration: 45,
        startingPrice: 0,
        whyMentor: 'I want to help upcoming engineers navigate system design interviews and backend systems.',
        whoToHelp: 'Aspiring backend engineers and early-career software developers.',
        additionalInfo: 'Available weekday evenings IST.',
        confirmAccuracy: true,
      },
      { id: existingCandidate.id, email: existingCandidate.email, name: existingCandidate.name }
    );

    assert(appResult1.success === true, 'Mentor application submitted successfully');
    assert(appResult1.status === 'PENDING', 'Initial application status is strictly PENDING');
    assert(
      /^PM-\d{4}-\d{5}$/.test(appResult1.referenceId!),
      `Human-readable reference generated: ${appResult1.referenceId}`
    );

    // Verify database record
    const storedApp1 = await db.mentorApplication.findUnique({
      where: { referenceId: appResult1.referenceId! },
    });
    assert(Boolean(storedApp1), 'MentorApplication saved in database');
    assert(storedApp1?.userId === existingCandidate.id, 'Application correctly linked to authenticated User ID');

    // ----------------------------------------------------
    // TEST 3: Duplicate Application Protection
    // ----------------------------------------------------
    console.log('\n--- PHASE 3: Duplicate Application Protection ---');
    const duplicateAppResult = await MentorApplicationService.submitApplication({
      fullName: 'Ananya Sharma',
      email: testCandidateEmail,
      phone: '+91 9876543210',
      currentRole: 'Senior Backend Engineer',
      experienceYears: 5,
      domain: 'Software Engineering',
      expertise: ['System Design'],
      offerings: ['Career Guidance'],
      preferredSessionDuration: 45,
      whyMentor: 'Second attempt should be detected as duplicate.',
      whoToHelp: 'Students and engineers.',
      confirmAccuracy: true,
    });

    assert(duplicateAppResult.duplicate === true, 'Duplicate active application detected');
    assert(
      duplicateAppResult.referenceId === appResult1.referenceId,
      'Duplicate response returned existing application reference ID'
    );

    // ----------------------------------------------------
    // TEST 4: Email Delivery Tracking
    // ----------------------------------------------------
    console.log('\n--- PHASE 4: Email Delivery Audit ---');
    const appReceivedEmailDelivery = await db.emailDelivery.findFirst({
      where: {
        recipient: testCandidateEmail.toLowerCase(),
        eventType: 'MENTOR_APPLICATION_RECEIVED',
      },
    });
    assert(Boolean(appReceivedEmailDelivery), 'Email delivery record created for application received');
    assert(
      ['SENT', 'SIMULATED'].includes(appReceivedEmailDelivery?.status || ''),
      `Email delivery status is valid: ${appReceivedEmailDelivery?.status}`
    );

    // ----------------------------------------------------
    // TEST 5: Admin Application Listing & Pagination
    // ----------------------------------------------------
    console.log('\n--- PHASE 5: Admin Application Discovery & State Transition ---');
    const listResult = await MentorApplicationService.listApplications({
      page: 1,
      limit: 25,
      q: 'Ananya',
    });
    assert(listResult.items.length >= 1, 'Admin list retrieves submitted application via search');
    const foundItem = listResult.items.find((i) => i.referenceId === appResult1.referenceId);
    assert(foundItem?.status === 'PENDING', 'Application in list displays PENDING status');

    // ----------------------------------------------------
    // TEST 6: Review State Transition (PENDING -> UNDER_REVIEW)
    // ----------------------------------------------------
    const reviewedApp = await MentorApplicationService.startReview(storedApp1!.id, mockAdmin);
    assert(reviewedApp.status === 'UNDER_REVIEW', 'Application transitioned from PENDING to UNDER_REVIEW');
    assert(reviewedApp.reviewedBy === mockAdmin.name, 'Reviewer recorded server-side');

    const reviewAudit = await db.auditLog.findFirst({
      where: {
        resourceId: storedApp1!.id,
        action: 'MENTOR_APPLICATION_REVIEW_STARTED',
      },
    });
    assert(Boolean(reviewAudit), 'Audit log entry created for MENTOR_APPLICATION_REVIEW_STARTED');

    // ----------------------------------------------------
    // TEST 7: Rejection Flow
    // ----------------------------------------------------
    console.log('\n--- PHASE 7: Rejection Flow ---');
    // Submit a secondary application to test rejection
    const appToReject = await MentorApplicationService.submitApplication({
      fullName: 'Rejected Candidate',
      email: `reject_${testSuffix}@example.com`,
      phone: '+91 9999999999',
      currentRole: 'Junior Developer',
      experienceYears: 1,
      domain: 'Software Engineering',
      expertise: ['Frontend Architecture'],
      offerings: ['Career Guidance'],
      whyMentor: 'I want to mentor people even though I have only 6 months of experience.',
      whoToHelp: 'Anyone who asks.',
      confirmAccuracy: true,
    });

    const rejectedRecord = await MentorApplicationService.rejectApplication(
      appToReject.application!.id,
      'We require at least 3 years of senior industry experience for this mentor cohort.',
      mockAdmin,
      'Internal note: experience too junior for staff mentor cohort.'
    );

    assert(rejectedRecord.status === 'REJECTED', 'Application marked as REJECTED');
    assert(
      Boolean(rejectedRecord.decisionReason?.includes('at least 3 years')),
      'Public rejection reason stored'
    );
    assert(
      Boolean(rejectedRecord.internalAdminNotes?.includes('Internal note')),
      'Internal notes stored separately'
    );

    const rejectAudit = await db.auditLog.findFirst({
      where: {
        resourceId: appToReject.application!.id,
        action: 'MENTOR_APPLICATION_REJECTED',
      },
    });
    assert(Boolean(rejectAudit), 'Audit log entry created for MENTOR_APPLICATION_REJECTED');

    // ----------------------------------------------------
    // TEST 8: Approval Flow (Account Provisioning & Idempotency)
    // ----------------------------------------------------
    console.log('\n--- PHASE 8: Approval Flow & Account Provisioning ---');
    const approvalResult = await MentorApplicationService.approveApplication(
      storedApp1!.id,
      mockAdmin,
      { internalNotes: 'Strong FinTech background from Stripe.' }
    );

    assert(approvalResult.success === true, 'Mentor application approval succeeded');
    assert(approvalResult.application?.status === 'APPROVED', 'Application status updated to APPROVED');

    // Verify User Account was elevated and not destroyed
    const refreshedUser = await db.user.findUnique({
      where: { id: existingCandidate.id },
      include: { profile: true },
    });
    assert(refreshedUser?.role === 'MENTOR', 'User role elevated to MENTOR');
    assert(refreshedUser?.profile?.candidateType === 'EXPERIENCED', 'Original candidate profile data preserved');

    // Verify Mentor Profile (Mentor model) created
    const createdMentor = await db.mentor.findFirst({
      where: { email: testCandidateEmail.toLowerCase() },
    });
    assert(Boolean(createdMentor), 'Mentor profile record created');
    assert(createdMentor?.status === 'APPROVED', 'Mentor profile status is APPROVED');
    assert(createdMentor?.userId === existingCandidate.id, 'Mentor profile linked to User ID');
    assert(createdMentor?.domain === 'Software Engineering', 'Mentor profile has correct domain');

    // Verify Idempotency of approval
    const secondApproval = await MentorApplicationService.approveApplication(storedApp1!.id, mockAdmin);
    assert(secondApproval.alreadyApproved === true, 'Second approval call is idempotent');
    const mentorCountForUser = await db.mentor.count({
      where: { email: testCandidateEmail.toLowerCase() },
    });
    assert(mentorCountForUser === 1, 'Idempotency prevented duplicate mentor profiles');

    // ----------------------------------------------------
    // TEST 9: Password Setup Token Security
    // ----------------------------------------------------
    console.log('\n--- PHASE 9: Secure Password Setup Token ---');
    const tokenRecord = await db.passwordSetupToken.findFirst({
      where: { userId: existingCandidate.id },
      orderBy: { createdAt: 'desc' },
    });
    assert(Boolean(tokenRecord), 'PasswordSetupToken record created');
    assert(
      Boolean(tokenRecord?.tokenHash && tokenRecord.tokenHash.length === 64),
      'Token is securely hashed with SHA-256 (64 hex characters)'
    );
    assert(tokenRecord?.usedAt === null, 'Token is unconsumed');

    const expectedExpiryMin = new Date(Date.now() + 23 * 60 * 60 * 1000);
    assert(tokenRecord!.expiresAt > expectedExpiryMin, 'Token expires in ~24 hours');

    // ----------------------------------------------------
    // TEST 10: Resend Welcome Email Flow
    // ----------------------------------------------------
    console.log('\n--- PHASE 10: Resend Welcome Email Flow ---');
    const resendResult = await MentorApplicationService.resendWelcomeEmail(storedApp1!.id, mockAdmin);
    assert(resendResult.success === true, 'Resend welcome email succeeded');

    // Verify previous token was invalidated and new token issued
    const allTokens = await db.passwordSetupToken.findMany({
      where: { userId: existingCandidate.id },
      orderBy: { createdAt: 'desc' },
    });
    const activeTokens = allTokens.filter((t) => t.usedAt === null);
    assert(activeTokens.length === 1, 'Only one active token remains after resend (previous was invalidated)');
    assert(Boolean(activeTokens[0] && activeTokens[0].id !== tokenRecord!.id), 'New distinct token created on resend');

    // ----------------------------------------------------
    // TEST 11: Token Consumption & Password Setup
    // ----------------------------------------------------
    console.log('\n--- PHASE 11: Password Setup & Token Consumption ---');
    // Generate fresh setup token directly to simulate user clicking link
    const { rawToken } = await PasswordSetupTokenService.createSetupToken(existingCandidate.id);

    // Verify token validity
    const verification = await PasswordSetupTokenService.verifyToken(rawToken);
    assert(verification.valid === true, 'Raw token successfully verified');
    assert(verification.user?.email === testCandidateEmail.toLowerCase(), 'Token matches applicant user');

    // Consume token and set password
    const newPassword = 'SecureMentorPass2026!';
    const consumptionResult = await PasswordSetupTokenService.consumeSetupToken(rawToken, newPassword);
    assert(consumptionResult.success === true, 'Password established and token consumed');
    assert(Boolean(consumptionResult.sessionToken), 'Active session token created on setup');

    // Verify password hash in database
    const userAfterPassword = await db.user.findUnique({
      where: { id: existingCandidate.id },
    });
    assert(Boolean(userAfterPassword?.passwordHash), 'User passwordHash is populated');
    const passwordMatch = await comparePassword(newPassword, userAfterPassword!.passwordHash!);
    assert(passwordMatch === true, 'Password verified with bcrypt comparison');
    assert(userAfterPassword?.mustChangePassword === false, 'mustChangePassword set to false');

    // Verify single-use enforcement: reusing token must fail
    let reuseFailed = false;
    try {
      await PasswordSetupTokenService.consumeSetupToken(rawToken, 'AnotherPass123!');
    } catch {
      reuseFailed = true;
    }
    assert(reuseFailed === true, 'Reusing consumed token was strictly rejected (single-use enforced)');

    // ----------------------------------------------------
    // TEST 12: New User Creation on Application Approval
    // ----------------------------------------------------
    console.log('\n--- PHASE 12: Brand New User Provisioning ---');
    const newApplicantApp = await MentorApplicationService.submitApplication({
      fullName: 'Vikramaditya Roy',
      email: testNewApplicantEmail,
      phone: '+91 9123456780',
      currentRole: 'Head of Product',
      company: 'Razorpay',
      experienceYears: 10,
      domain: 'Product Management',
      expertise: ['Product Strategy', 'Roadmapping & Prioritization'],
      offerings: ['Career Guidance', 'Mock Interview'],
      whyMentor: 'Deeply passionate about mentoring PMs on product roadmaps.',
      whoToHelp: 'Associate and Senior Product Managers.',
      confirmAccuracy: true,
    });

    const newApproval = await MentorApplicationService.approveApplication(
      newApplicantApp.application!.id,
      mockAdmin
    );
    assert(newApproval.success === true, 'New applicant approved');
    const createdUser = await db.user.findUnique({
      where: { email: testNewApplicantEmail.toLowerCase() },
    });
    assert(Boolean(createdUser), 'New User account provisioned automatically upon approval');
    assert(createdUser?.role === 'MENTOR', 'Provisioned user role is MENTOR');
    assert(createdUser?.mustChangePassword === true, 'New user has mustChangePassword = true until setup');

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n--- CLEANUP ---');
    await db.mentorApplication.deleteMany({
      where: {
        email: { in: [testCandidateEmail.toLowerCase(), testNewApplicantEmail.toLowerCase(), `reject_${testSuffix}@example.com`] },
      },
    });
    await db.passwordSetupToken.deleteMany({
      where: {
        userId: { in: [existingCandidate.id, createdUser?.id || ''] },
      },
    });
    await db.mentor.deleteMany({
      where: {
        email: { in: [testCandidateEmail.toLowerCase(), testNewApplicantEmail.toLowerCase()] },
      },
    });
    await db.user.deleteMany({
      where: {
        email: { in: [testCandidateEmail.toLowerCase(), testNewApplicantEmail.toLowerCase()] },
      },
    });
    await db.emailDelivery.deleteMany({
      where: {
        recipient: { in: [testCandidateEmail.toLowerCase(), testNewApplicantEmail.toLowerCase(), `reject_${testSuffix}@example.com`] },
      },
    });
    console.log('  ✓ Test fixtures cleaned up successfully');
  } catch (err: any) {
    console.error('Fatal test error:', err);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMentorWorkflowTests();
