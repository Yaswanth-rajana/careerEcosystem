import { db } from '../db/client';
import { OnboardingService } from '../services/onboardingService';
import { ProfileService } from '../services/profileService';
import { UserService } from '../services/userService';
import { hashPassword } from '../auth/security';

async function runTests() {
  console.log('====================================================================');
  console.log('STARTING PATHWAY.ECO ONBOARDING PERSISTENCE & INTEGRITY TEST SUITE');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${detail || ''}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testEmail1 = `candidate_test_${timestamp}@example.com`;
  const testEmail2 = `candidate_unauth_${timestamp}@example.com`;
  const passwordHash = await hashPassword('SecurePass123!');

  // Cleanup any old test users
  await db.user.deleteMany({
    where: {
      email: { in: [testEmail1, testEmail2] },
    },
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: New user starts onboarding
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: New user starts onboarding ---');
    const user1 = await db.user.create({
      data: {
        email: testEmail1,
        passwordHash,
        name: 'Alex Johnson',
        role: 'CANDIDATE',
        provider: 'local',
        isOnboarded: false,
      },
    });

    const user2 = await db.user.create({
      data: {
        email: testEmail2,
        passwordHash,
        name: 'Mallory Hacker',
        role: 'CANDIDATE',
        provider: 'local',
        isOnboarded: false,
      },
    });

    const initialState = await OnboardingService.getOnboardingState(user1.id);
    assert(initialState.userId === user1.id, 'User ID matches created user');
    assert(initialState.isOnboarded === false, 'User starts with isOnboarded = false');
    assert(initialState.progress.currentStep === 1, 'Initial currentStep is 1');
    assert(initialState.progress.completedSteps.length === 0, 'Initial completedSteps is empty');
    assert(initialState.progress.status === 'NOT_STARTED', 'Initial status is NOT_STARTED');
    assert(initialState.profile.candidateType === 'STUDENT', 'Default candidateType is STUDENT');

    // -------------------------------------------------------------------------
    // TEST 2: Step 1 saves (Personal overview)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Step 1 saves (Personal overview) ---');
    const step1Payload = {
      aboutYou: {
        name: 'Alex J. Johnson',
        phone: '+91 98765 43210',
        location: 'San Francisco, CA',
        candidateType: 'STUDENT' as const,
        headline: 'Aspiring Full Stack Engineer',
        bio: 'Passionate computer science student.',
      },
    };

    const step1Res = await OnboardingService.saveStepData(user1.id, 1, step1Payload);
    assert(step1Res.success === true, 'Step 1 returns success: true');
    assert(step1Res.completed === true, 'Step 1 completed = true');
    assert(step1Res.nextStep === 2, 'Step 1 advances nextStep to 2');
    assert(step1Res.progress.completedSteps.includes(1), 'Step 1 is added to completedSteps');

    // Verify canonical database state
    const userInDbAfter1 = await db.user.findUnique({ where: { id: user1.id } });
    const profileInDbAfter1 = await db.profile.findUnique({ where: { userId: user1.id } });
    assert(userInDbAfter1?.name === 'Alex J. Johnson', 'User.name updated in database');
    assert(profileInDbAfter1?.phone === '+919876543210', 'Profile.phone persisted in MongoDB');
    assert(profileInDbAfter1?.location === 'San Francisco, CA', 'Profile.location persisted in MongoDB');
    assert(profileInDbAfter1?.headline === 'Aspiring Full Stack Engineer', 'Profile.headline persisted');

    // -------------------------------------------------------------------------
    // TEST 3: Step 2 saves (Education)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Step 2 saves (Education) ---');
    const step2Payload = {
      education: [
        {
          institution: 'UC Berkeley',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          location: 'Berkeley, CA',
          startYear: 2021,
          endYear: 2025,
          isCurrent: true,
          gpa: '3.85',
        },
      ],
    };

    const step2Res = await OnboardingService.saveStepData(user1.id, 2, step2Payload);
    assert(step2Res.success === true, 'Step 2 returns success: true');
    assert(step2Res.completed === true, 'Step 2 completed = true');
    assert(step2Res.nextStep === 3, 'Step 2 advances nextStep to 3');
    assert(step2Res.progress.completedSteps.includes(2), 'Step 2 added to completedSteps');

    const eduInDb = await db.education.findMany({ where: { profileId: profileInDbAfter1!.id } });
    assert(eduInDb.length === 1, 'Education count is 1 in database');
    assert(eduInDb[0].institution === 'UC Berkeley', 'Institution matches persisted data');
    assert(eduInDb[0].startYear === 2021, 'Start year is 2021');

    // -------------------------------------------------------------------------
    // TEST 4: Step 3 saves (Experience)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Step 3 saves (Experience) ---');
    const step3Payload = {
      hasNoExperience: false,
      experience: [
        {
          company: 'Acme Software',
          roleTitle: 'Software Engineering Intern',
          employmentType: 'Internship',
          location: 'San Francisco, CA',
          startDate: 'Jun 2024',
          endDate: 'Aug 2024',
          isCurrent: false,
          description: 'Built REST APIs and React dashboards.',
        },
      ],
    };

    const step3Res = await OnboardingService.saveStepData(user1.id, 3, step3Payload);
    assert(step3Res.success === true, 'Step 3 returns success: true');
    assert(step3Res.completed === true, 'Step 3 completed = true');
    assert(step3Res.nextStep === 4, 'Step 3 advances nextStep to 4');
    assert(step3Res.progress.completedSteps.includes(3), 'Step 3 added to completedSteps');

    const expInDb = await db.experience.findMany({ where: { profileId: profileInDbAfter1!.id } });
    assert(expInDb.length === 1, 'Experience count is 1 in database');
    assert(expInDb[0].company === 'Acme Software', 'Company name matches');

    // -------------------------------------------------------------------------
    // TEST 5 & 6 & 7: User closes browser, logs back in, progress is restored
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5, 6, 7: Session recovery and progress restoration ---');
    // Simulate user logging in from new session/device
    const restored = await OnboardingService.getOnboardingState(user1.id);
    assert(restored.progress.currentStep === 4, 'Restored currentStep is exactly 4');
    assert(
      restored.progress.completedSteps.includes(1) &&
        restored.progress.completedSteps.includes(2) &&
        restored.progress.completedSteps.includes(3),
      'completedSteps contains [1, 2, 3]'
    );
    assert(restored.profile.phone === '+919876543210', 'Phone restored from MongoDB');
    assert(restored.profile.education.length === 1, 'Education restored from MongoDB');
    assert(restored.profile.experience.length === 1, 'Experience restored from MongoDB');

    // -------------------------------------------------------------------------
    // TEST 8 & 9: Previous step can be edited; Re-saving does not duplicate relations
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8 & 9: Edit previous step & relation idempotency ---');
    // User navigates back to Step 2, updates GPA and adds high school
    const step2UpdatedPayload = {
      education: [
        {
          institution: 'UC Berkeley',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science & AI',
          location: 'Berkeley, CA',
          startYear: 2021,
          endYear: 2025,
          isCurrent: true,
          gpa: '3.90',
        },
        {
          institution: 'Lincoln High School',
          degree: 'High School Diploma',
          fieldOfStudy: 'General Studies',
          location: 'San Jose, CA',
          startYear: 2017,
          endYear: 2021,
          isCurrent: false,
          gpa: '4.0',
        },
      ],
    };

    // Save Step 2 once
    await OnboardingService.saveStepData(user1.id, 2, step2UpdatedPayload);
    // Save Step 2 a SECOND time (simulate double click / retry)
    await OnboardingService.saveStepData(user1.id, 2, step2UpdatedPayload);
    // Save Step 2 a THIRD time
    await OnboardingService.saveStepData(user1.id, 2, step2UpdatedPayload);

    const eduAfterReSave = await db.education.findMany({ where: { profileId: profileInDbAfter1!.id } });
    assert(
      eduAfterReSave.length === 2,
      'Re-saving Step 2 three times produced EXACTLY 2 records (NO DUPLICATES)',
      `Actual count: ${eduAfterReSave.length}`
    );
    const berkeley = eduAfterReSave.find((e) => e.institution === 'UC Berkeley');
    assert(berkeley?.fieldOfStudy === 'Computer Science & AI', 'Updated field of study persisted');
    assert(berkeley?.gpa === '3.90', 'Updated GPA persisted');

    // -------------------------------------------------------------------------
    // TEST 10: Invalid data is rejected and step is NOT marked completed
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 10: Server-side validation rejection & distinction of saved vs completed ---');
    // Save Step 4 with empty skills array
    const step4EmptySkills = {
      skills: [],
    };

    const step4EmptyRes = await OnboardingService.saveStepData(user1.id, 4, step4EmptySkills);
    assert(step4EmptyRes.completed === false, 'Step 4 with 0 skills completed = false');
    assert(!step4EmptyRes.progress.completedSteps.includes(4), 'Step 4 NOT in completedSteps when 0 skills');
    assert(step4EmptyRes.nextStep === 4, 'Step 4 does NOT advance nextStep when incomplete');

    // Now save with valid skills
    const step4ValidSkills = {
      skills: [
        { name: 'TypeScript', level: 'ADVANCED', source: 'USER', verified: true },
        { name: 'Node.js', level: 'INTERMEDIATE', source: 'USER', verified: false },
        { name: 'React', level: 'ADVANCED', source: 'USER', verified: true },
      ],
    };
    const step4ValidRes = await OnboardingService.saveStepData(user1.id, 4, step4ValidSkills);
    assert(step4ValidRes.completed === true, 'Step 4 with valid skills completed = true');
    assert(step4ValidRes.progress.completedSteps.includes(4), 'Step 4 added to completedSteps');

    // Check Skill uniqueness in db
    const userSkillsInDb = await db.userSkill.findMany({ where: { profileId: profileInDbAfter1!.id } });
    assert(userSkillsInDb.length === 3, 'UserSkills count is 3 in database');

    // -------------------------------------------------------------------------
    // TEST 11: Authorization - User 2 cannot modify User 1's profile
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 11: Authorization & Ownership isolation ---');
    // Ensure ProfileService scopes by authenticated userId
    const user2Profile = await db.profile.findUnique({ where: { userId: user2.id } });
    let unauthCaught = false;
    try {
      // Mallory tries to update Alex's education using Mallory's session
      if (eduAfterReSave[0]) {
        await ProfileService.updateEducation(user2.id, eduAfterReSave[0].id, {
          institution: 'Hacked University',
          degree: 'Fake Degree',
          fieldOfStudy: 'Hacking',
          startYear: 2020,
        });
      }
    } catch (err: any) {
      unauthCaught = true;
      assert(err.message.includes('Unauthorized'), 'Unauthorized access rejected with proper error');
    }
    assert(unauthCaught === true, 'Cross-user record mutation strictly blocked');

    // -------------------------------------------------------------------------
    // TEST 12: Database transaction integrity
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 12: Atomic Database Transaction Integrity ---');
    // Test that an invalid item in a step rolls back all changes in that save operation
    const currentEduCount = (await db.education.findMany({ where: { profileId: profileInDbAfter1!.id } })).length;
    let transactionErrorCaught = false;
    try {
      await OnboardingService.saveStepData(user1.id, 2, {
        education: [
          {
            institution: 'Valid University',
            degree: 'BS',
            fieldOfStudy: 'Math',
            startYear: 99999, // Fails Zod schema validation (max 2100)
          },
        ],
      });
    } catch {
      transactionErrorCaught = true;
    }
    assert(transactionErrorCaught === true, 'Zod validation error caught before or inside transaction');
    const eduCountAfterFailedTx = (
      await db.education.findMany({ where: { profileId: profileInDbAfter1!.id } })
    ).length;
    assert(
      eduCountAfterFailedTx === currentEduCount,
      'Failed step save did not corrupt or delete existing education records'
    );

    // -------------------------------------------------------------------------
    // TEST 13 & 14: Incomplete onboarding rejected; Final completion works
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 13 & 14: Completion validation & final completion ---');
    // Attempt to complete onboarding while Step 6 (Career direction) is still missing
    let incompleteCaught = false;
    try {
      await OnboardingService.completeOnboarding(user1.id);
    } catch (err: any) {
      incompleteCaught = true;
      assert(
        err.message.includes('Target job role or career goal is required') ||
          err.missingRequirements?.length > 0,
        'Completion rejected due to missing career direction'
      );
    }
    assert(incompleteCaught === true, 'Incomplete onboarding was blocked from completing');

    const user1StillNotOnboarded = await db.user.findUnique({ where: { id: user1.id } });
    assert(user1StillNotOnboarded?.isOnboarded === false, 'isOnboarded remains false when incomplete');

    // Complete remaining steps (Step 5, 6, 7)
    await OnboardingService.saveStepData(user1.id, 5, {
      projects: [
        {
          title: 'Career Ecosystem Hub',
          description: 'A comprehensive career guidance platform.',
          technologies: ['TypeScript', 'Next.js', 'MongoDB'],
        },
      ],
    });

    await OnboardingService.saveStepData(user1.id, 6, {
      careerDirection: {
        targetRole: 'Full Stack Engineer',
        careerField: 'Software Engineering',
        targetIndustry: 'Technology',
        careerGoalType: 'Get my first job',
        timeframe: 'Immediate (1-3 months)',
      },
    });

    await OnboardingService.saveStepData(user1.id, 7, {
      preferences: {
        preferredJobType: 'Full-time',
        preferredLocation: 'San Francisco, CA',
        workEnvironment: 'Hybrid',
        willingToRelocate: true,
        preferredSalaryRange: '$110,000 - $130,000',
        learningStyle: ['Hands-on projects'],
        availableHoursPerWeek: '10–20 hours/week',
        mentorshipNeeds: ['Career direction'],
      },
    });

    // Now call completeOnboarding
    const completeRes = await OnboardingService.completeOnboarding(user1.id);
    assert(completeRes.success === true, 'completeOnboarding returned success: true');
    assert(completeRes.redirectUrl === '/dashboard', 'Redirect URL is /dashboard');

    const user1AfterComplete = await db.user.findUnique({ where: { id: user1.id } });
    const progressAfterComplete = await db.onboardingProgress.findUnique({ where: { userId: user1.id } });
    assert(user1AfterComplete?.isOnboarded === true, 'User.isOnboarded is now true in database');
    assert(user1AfterComplete?.onboardingCompletedAt !== null, 'User.onboardingCompletedAt is set');
    assert(progressAfterComplete?.status === 'COMPLETED', 'OnboardingProgress.status is COMPLETED');
    assert((progressAfterComplete?.completedSteps.length ?? 0) >= 7, 'All completedSteps persisted (all 7+ steps confirmed)');

    // -------------------------------------------------------------------------
    // TEST 15 & 16: Refresh does not lose data; Idempotent completion
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 15 & 16: Refresh verification & idempotent completion ---');
    const finalState = await OnboardingService.getOnboardingState(user1.id);
    assert(finalState.isOnboarded === true, 'State fetch confirms isOnboarded: true');
    assert(finalState.profile.careerGoal?.targetRole === 'Full Stack Engineer', 'Career goal targetRole matches');
    assert(finalState.profile.jobPreference?.workEnvironment === 'Hybrid', 'Job preference matches');
    assert(finalState.profile.userSkills.length === 3, 'Skills intact (count = 3)');
    assert(finalState.profile.projects.length === 1, 'Projects intact (count = 1)');
    assert(finalState.profile.education.length === 2, 'Education intact (count = 2)');

    // Call completeOnboarding again (simulate double submit)
    const secondCompleteRes = await OnboardingService.completeOnboarding(user1.id);
    assert(secondCompleteRes.success === true, 'Second completion call succeeded idempotently');

    console.log('\n====================================================================');
    console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================================\n');
  } finally {
    // Cleanup test users
    await db.user.deleteMany({
      where: {
        email: { in: [testEmail1, testEmail2] },
      },
    });
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
