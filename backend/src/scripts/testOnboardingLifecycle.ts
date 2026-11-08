import { db } from '../db/client';
import { UserService } from '../services/userService';
import { OnboardingService } from '../services/onboardingService';
import { OnboardingLifecycleService } from '../services/onboardingLifecycleService';
import { EmailService } from '../services/email/emailService';

async function runOnboardingLifecycleTests() {
  console.log('\n========================================================================');
  console.log('🧪 PATHWAY.ECO Unified Onboarding Lifecycle & Transactional Email Tests');
  console.log('========================================================================\n');

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
  const emailUserEmail = `candidate_test_${testSuffix}@example.com`;
  const googleUserEmail = `candidate_google_${testSuffix}@example.com`;
  const googleId = `google_sub_${testSuffix}`;

  let emailUserId = '';
  let googleUserId = '';

  try {
    // ----------------------------------------------------
    // TEST 1: Registration via Email/Password & Welcome Email
    // ----------------------------------------------------
    console.log('\n--- PHASE 1: Email/Password Registration & Immediate Welcome Email ---');
    const emailRegResult = await UserService.registerUser({
      name: 'Sarah Connor',
      email: emailUserEmail,
      password: 'SecurePassword123!',
      role: 'CANDIDATE',
    });

    emailUserId = emailRegResult.user.id;
    assert(Boolean(emailUserId), 'User registered successfully via email/password');
    assert(emailRegResult.user.isOnboarded === false, 'User isOnboarded is initially false');

    // Verify OnboardingProgress was initialized
    const progressInitial = await db.onboardingProgress.findUnique({
      where: { userId: emailUserId },
    });
    assert(Boolean(progressInitial), 'OnboardingProgress initialized on registration');
    assert(progressInitial?.status === 'NOT_STARTED', 'Initial status is NOT_STARTED');
    assert(progressInitial?.currentStep === 1, 'Initial step is Step 1');
    assert(Boolean(progressInitial?.onboardingStartedAt), 'onboardingStartedAt timestamp is tracked');
    assert(Boolean(progressInitial?.onboardingLastActivityAt), 'onboardingLastActivityAt timestamp is tracked');

    // Verify Welcome Email delivery record
    const welcomeDelivery = await (db as any).emailDelivery.findFirst({
      where: {
        referenceId: emailUserId,
        eventType: 'ONBOARDING_WELCOME',
      },
    });
    assert(Boolean(welcomeDelivery), 'Welcome email delivery record created');
    assert(['SENT', 'SIMULATED'].includes(welcomeDelivery?.status || ''), `Welcome email status is valid: ${welcomeDelivery?.status}`);
    assert(welcomeDelivery?.recipient === emailUserEmail.toLowerCase(), 'Welcome email sent to correct recipient');

    // ----------------------------------------------------
    // TEST 2: Registration via Google & Immediate Welcome Email
    // ----------------------------------------------------
    console.log('\n--- PHASE 2: Google Registration & Immediate Welcome Email ---');
    const googleRegResult = await UserService.authenticateWithGoogle({
      googleId,
      email: googleUserEmail,
      emailVerified: true,
      name: 'David Lightman',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
    });

    googleUserId = googleRegResult.user.id;
    assert(Boolean(googleUserId), 'User registered successfully via Google OAuth');
    assert(googleRegResult.user.isOnboarded === false, 'Google user isOnboarded is initially false');

    const googleWelcomeDelivery = await (db as any).emailDelivery.findFirst({
      where: {
        referenceId: googleUserId,
        eventType: 'ONBOARDING_WELCOME',
      },
    });
    assert(Boolean(googleWelcomeDelivery), 'Google user received welcome email');
    assert(['SENT', 'SIMULATED'].includes(googleWelcomeDelivery?.status || ''), `Google welcome email status is valid: ${googleWelcomeDelivery?.status}`);

    // ----------------------------------------------------
    // TEST 3: Existing User Re-Authentication Does Not Duplicate Welcome Email
    // ----------------------------------------------------
    console.log('\n--- PHASE 3: Existing User Authentication Idempotency ---');
    const welcomeCountBefore = await (db as any).emailDelivery.count({
      where: { referenceId: emailUserId, eventType: 'ONBOARDING_WELCOME' },
    });

    // Re-authenticate existing email user
    await UserService.authenticateUser({
      email: emailUserEmail,
      password: 'SecurePassword123!',
    });

    // Re-authenticate existing Google user
    await UserService.authenticateWithGoogle({
      googleId,
      email: googleUserEmail,
      emailVerified: true,
      name: 'David Lightman',
    });

    const welcomeCountAfter = await (db as any).emailDelivery.count({
      where: { referenceId: emailUserId, eventType: 'ONBOARDING_WELCOME' },
    });
    assert(welcomeCountBefore === welcomeCountAfter, 'No duplicate welcome email dispatched on login');

    // ----------------------------------------------------
    // TEST 4: Onboarding Progress Preservation & Exact Current Step
    // ----------------------------------------------------
    console.log('\n--- PHASE 4: Server-Side Progress Preservation & Exact Resume ---');
    // Save Step 1: Personal Info
    await OnboardingService.saveStepData(emailUserId, 1, {
      aboutYou: {
        name: 'Sarah Connor',
        phone: '+91 98765 43210',
        location: 'Los Angeles, CA',
        candidateType: 'STUDENT',
        headline: 'Aspiring AI Security Engineer',
        bio: 'Passionate about cyber defense and autonomous systems.',
      },
    });

    let stateAfterStep1 = await OnboardingService.getOnboardingState(emailUserId);
    assert(stateAfterStep1.progress.currentStep === 2, 'Current step is 2 (next step to resume on) after Step 1 save');
    assert(stateAfterStep1.progress.completedSteps.includes(1), 'Step 1 recorded in completedSteps');
    assert(stateAfterStep1.progress.status === 'IN_PROGRESS', 'Progress status transitioned to IN_PROGRESS');

    // Save Step 2: Education
    await OnboardingService.saveStepData(emailUserId, 2, {
      education: [
        {
          institution: 'UCLA',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2022,
          endYear: 2026,
          isCurrent: true,
        },
      ],
    });

    let stateAfterStep2 = await OnboardingService.getOnboardingState(emailUserId);
    assert(stateAfterStep2.progress.currentStep === 3, 'Current step is 3 (next step to resume on) after Step 2 save');
    assert(stateAfterStep2.progress.completedSteps.includes(1) && stateAfterStep2.progress.completedSteps.includes(2), 'Steps 1 and 2 recorded in completedSteps');
    assert(stateAfterStep2.profile.education.length === 1, 'Education saved accurately in normalized Profile model');
    assert(Boolean(stateAfterStep2.progress.onboardingLastActivityAt), 'onboardingLastActivityAt updated on save');

    // Simulate Exit & Exact Resume
    const resumedState = await OnboardingService.getOnboardingState(emailUserId);
    assert(resumedState.progress.currentStep === 3, 'Exact current step preserved upon resume');
    assert(resumedState.profile.phone === '+919876543210', 'Preserved personal phone information upon resume');
    assert(resumedState.profile.education[0].institution === 'UCLA', 'Preserved education institution upon resume');

    // ----------------------------------------------------
    // TEST 5: Verified Summary & Step Personalization
    // ----------------------------------------------------
    console.log('\n--- PHASE 5: Verified Summary & Server-Confirmed Accuracy ---');
    const summary = await OnboardingLifecycleService.getOnboardingSummary(emailUserId);
    assert(summary.currentStep === 3, 'Summary reports current step 3 (next step to complete)');
    assert(summary.completedStepsCount === 2, 'Summary reports 2 completed steps');
    assert(summary.completedStepTitles.includes('Personal Profile'), 'Summary confirms Personal Profile completed');
    assert(summary.completedStepTitles.includes('Education & Academics'), 'Summary confirms Education completed');
    assert(!summary.completedStepTitles.includes('Work Experience'), 'Summary strictly never claims uncompleted Step 3 is completed');
    assert(summary.currentStepTitle === 'Work Experience', 'Summary correctly identifies active step title');

    // ----------------------------------------------------
    // TEST 6: Inactivity-Based Reminders (24h, 3 Days, 7 Days)
    // ----------------------------------------------------
    console.log('\n--- PHASE 6: Inactivity Reminders Timeline & Personalization ---');
    const baseActivityTime = new Date('2026-10-01T00:00:00Z');

    // Update progress activity to 12 hours ago (insufficient inactivity)
    await db.onboardingProgress.update({
      where: { userId: emailUserId },
      data: {
        onboardingLastActivityAt: new Date(baseActivityTime.getTime()),
        lastSavedAt: new Date(baseActivityTime.getTime()),
      },
    });

    // Check after 12 hours of inactivity (less than 24h threshold)
    const check12h = await OnboardingLifecycleService.evaluateUserReminder(emailUserId, {
      now: new Date(baseActivityTime.getTime() + 12 * 60 * 60 * 1000),
    });
    assert(check12h.eligible === false, 'No reminder sent at 12 hours inactivity');
    assert(check12h.reason === 'INSUFFICIENT_INACTIVITY', 'Reason is INSUFFICIENT_INACTIVITY');

    // Check after 25 hours of inactivity (Reminder 1 due)
    const check25h = await OnboardingLifecycleService.evaluateUserReminder(emailUserId, {
      now: new Date(baseActivityTime.getTime() + 25 * 60 * 60 * 1000),
    });
    assert(check25h.eligible === true, 'Reminder 1 eligible after 25 hours inactivity');
    assert(check25h.sent === true, 'Reminder 1 sent successfully');
    assert(check25h.reminderNumber === 1, 'Reminder number is 1');

    // Verify Reminder 1 recorded in EmailDelivery
    const reminder1Delivery = await (db as any).emailDelivery.findFirst({
      where: { referenceId: emailUserId, eventType: 'ONBOARDING_REMINDER_1' },
    });
    assert(Boolean(reminder1Delivery), 'Email delivery record created for ONBOARDING_REMINDER_1');
    assert(['SENT', 'SIMULATED'].includes(reminder1Delivery?.status || ''), `Reminder 1 delivery status is valid: ${reminder1Delivery?.status}`);

    // Check idempotency: Re-running at 30 hours should NOT re-send Reminder 1
    const checkDuplicate1 = await OnboardingLifecycleService.evaluateUserReminder(emailUserId, {
      now: new Date(baseActivityTime.getTime() + 30 * 60 * 60 * 1000),
    });
    assert(checkDuplicate1.eligible === false, 'Duplicate Reminder 1 prevented by idempotency check');
    assert(checkDuplicate1.reason === 'REMINDER_1_ALREADY_SENT_AWAITING_DAY_3', 'Appropriate waiting reason returned');

    const reminder1Count = await (db as any).emailDelivery.count({
      where: { referenceId: emailUserId, eventType: 'ONBOARDING_REMINDER_1' },
    });
    assert(reminder1Count === 1, 'Strictly 1 delivery record for ONBOARDING_REMINDER_1');

    // Check after 3.5 days of inactivity (84 hours -> Reminder 2 due)
    const checkDay3 = await OnboardingLifecycleService.evaluateUserReminder(emailUserId, {
      now: new Date(baseActivityTime.getTime() + 84 * 60 * 60 * 1000),
    });
    assert(checkDay3.eligible === true, 'Reminder 2 eligible after 3+ days inactivity');
    assert(checkDay3.sent === true, 'Reminder 2 sent successfully');
    assert(checkDay3.reminderNumber === 2, 'Reminder number is 2');

    const reminder2Delivery = await (db as any).emailDelivery.findFirst({
      where: { referenceId: emailUserId, eventType: 'ONBOARDING_REMINDER_2' },
    });
    assert(Boolean(reminder2Delivery), 'Email delivery record created for ONBOARDING_REMINDER_2');

    // Check after 7.5 days of inactivity (180 hours -> Reminder 3 due)
    const checkDay7 = await OnboardingLifecycleService.evaluateUserReminder(emailUserId, {
      now: new Date(baseActivityTime.getTime() + 180 * 60 * 60 * 1000),
    });
    assert(checkDay7.eligible === true, 'Reminder 3 eligible after 7+ days inactivity');
    assert(checkDay7.sent === true, 'Reminder 3 sent successfully');
    assert(checkDay7.reminderNumber === 3, 'Reminder number is 3');

    const reminder3Delivery = await (db as any).emailDelivery.findFirst({
      where: { referenceId: emailUserId, eventType: 'ONBOARDING_REMINDER_3' },
    });
    assert(Boolean(reminder3Delivery), 'Email delivery record created for ONBOARDING_REMINDER_3');

    // Beyond 7 days when all 3 reminders sent -> exhausted
    const checkExhausted = await OnboardingLifecycleService.evaluateUserReminder(emailUserId, {
      now: new Date(baseActivityTime.getTime() + 240 * 60 * 60 * 1000),
    });
    assert(checkExhausted.eligible === false, 'No further reminders after Reminder 3 sent');
    assert(checkExhausted.reason === 'ALL_REMINDERS_EXHAUSTED', 'Reason is ALL_REMINDERS_EXHAUSTED');

    // ----------------------------------------------------
    // TEST 7: Full Onboarding Completion & Reminder Cancellation
    // ----------------------------------------------------
    console.log('\n--- PHASE 7: Onboarding Completion & Strict Reminder Cancellation ---');
    const fullPayload = {
      aboutYou: {
        name: 'Sarah Connor',
        phone: '+91 98765 43210',
        location: 'Los Angeles, CA',
        candidateType: 'STUDENT' as const,
        headline: 'Cyber Systems Analyst',
      },
      education: [
        {
          institution: 'UCLA',
          degree: 'B.S.',
          fieldOfStudy: 'Computer Science',
          startYear: 2022,
          endYear: 2026,
          isCurrent: true,
          source: 'USER',
        },
      ],
      hasNoExperience: true,
      experience: [],
      skills: [
        { name: 'TypeScript', level: 'ADVANCED' as const, source: 'USER' as const, verified: true },
        { name: 'Cybersecurity', level: 'INTERMEDIATE' as const, source: 'USER' as const, verified: true },
      ],
      projects: [
        {
          title: 'Autonomous Defense Grid',
          technologies: ['TypeScript', 'Rust'],
          source: 'USER',
        },
      ],
      careerDirection: {
        targetRole: 'Cyber Defense Engineer',
        careerGoalType: 'Get my first job',
      },
      preferences: {
        preferredJobType: 'Full-time',
        workEnvironment: 'Remote',
        willingToRelocate: false,
        preferredIndustries: ['Cybersecurity'],
        learningStyle: ['Hands-on projects'],
        availableHoursPerWeek: '5–10 hours/week',
        mentorshipNeeds: ['Career direction'],
      },
      certifications: [],
      achievements: [],
      professionalLinks: [],
    };

    const completionResult = await OnboardingService.completeOnboarding(emailUserId, fullPayload);
    assert(completionResult.success === true, 'Onboarding completed successfully via atomic transaction');

    const completedUser = await db.user.findUnique({
      where: { id: emailUserId },
      include: { onboardingProgress: true },
    });
    assert(completedUser?.isOnboarded === true, 'user.isOnboarded set to true');
    assert(Boolean(completedUser?.onboardingCompletedAt), 'user.onboardingCompletedAt recorded');
    assert(completedUser?.onboardingProgress?.status === 'COMPLETED', 'OnboardingProgress status updated to COMPLETED');
    assert(completedUser?.onboardingProgress?.completedSteps.length === 8, 'All 8 steps confirmed completed');

    // Verify Profile Completed Email delivery record
    const completionDelivery = await (db as any).emailDelivery.findFirst({
      where: {
        referenceId: emailUserId,
        eventType: 'ONBOARDING_COMPLETED',
      },
    });
    assert(Boolean(completionDelivery), 'Profile completed email delivery record created upon onboarding completion');
    assert(['SENT', 'SIMULATED'].includes(completionDelivery?.status || ''), `Completion email status is valid: ${completionDelivery?.status}`);

    // CRITICAL: Cancellation check - evaluateUserReminder MUST stop all reminders
    const postCompletionReminder = await OnboardingLifecycleService.evaluateUserReminder(emailUserId, {
      now: new Date(baseActivityTime.getTime() + 300 * 60 * 60 * 1000),
    });
    assert(postCompletionReminder.eligible === false, 'Completed user is strictly ineligible for any reminders');
    assert(postCompletionReminder.reason === 'ONBOARDING_ALREADY_COMPLETED', 'Reason is ONBOARDING_ALREADY_COMPLETED');

    // Batch processor check - verify completed users are filtered out
    const batchResult = await OnboardingLifecycleService.processPendingReminders({
      now: new Date(baseActivityTime.getTime() + 300 * 60 * 60 * 1000),
    });
    const completedInBatch = batchResult.results.find((r) => r.userId === emailUserId);
    assert(!completedInBatch, 'Completed user was excluded from pending candidate scan');

  } catch (err: any) {
    assert(false, `Unexpected test execution exception: ${err.message}`, err.stack);
  } finally {
    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n--- CLEANUP ---');
    try {
      if (emailUserId) {
        await (db as any).emailDelivery.deleteMany({ where: { referenceId: emailUserId } });
        await db.user.delete({ where: { id: emailUserId } }).catch(() => null);
      }
      if (googleUserId) {
        await (db as any).emailDelivery.deleteMany({ where: { referenceId: googleUserId } });
        await db.user.delete({ where: { id: googleUserId } }).catch(() => null);
      }
      console.log('  ✓ Cleaned up test database fixtures successfully');
    } catch (cleanupErr: any) {
      console.error('  ⚠ Cleanup error:', cleanupErr.message);
    }
  }

  console.log('\n========================================================================');
  console.log(`SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runOnboardingLifecycleTests();
