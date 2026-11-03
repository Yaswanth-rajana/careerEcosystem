import { db } from '../db/client';
import { MentorDiscoveryService } from '../services/mentorship/mentorDiscoveryService';
import { BookingService } from '../services/mentorship/bookingService';
import { hashPassword } from '../auth/security';

async function runTests() {
  console.log('🧪 Starting Mentor Discovery Matching & Service Validation Test Suite...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  const passwordHash = await hashPassword('TestPassword123!');

  // Cleanup any leftover test records from previous test runs
  const testEmails = [
    'test.mentor.a@discovery-test.io',
    'test.mentor.b@discovery-test.io',
    'test.mentor.d@discovery-test.io',
    'test.mentor.suspended@discovery-test.io',
    'test.candidate.e2e@discovery-test.io',
  ];

  await db.mentorshipService.deleteMany({
    where: {
      mentor: { email: { in: testEmails } },
    },
  });
  await db.booking.deleteMany({
    where: {
      mentor: { email: { in: testEmails } },
    },
  });
  await db.mentor.deleteMany({
    where: { email: { in: testEmails } },
  });
  await db.user.deleteMany({
    where: { email: { in: testEmails } },
  });

  // Setup Candidate User
  const candidateUser = await db.user.create({
    data: {
      name: 'Test Candidate',
      email: 'test.candidate.e2e@discovery-test.io',
      passwordHash,
      role: 'CANDIDATE',
      status: 'ACTIVE',
      isOnboarded: true,
    },
  });

  // Setup Mentor A
  const mentorA = await db.mentor.create({
    data: {
      name: 'Test Mentor Alpha',
      email: 'test.mentor.a@discovery-test.io',
      headline: 'Senior Distributed Systems Architect',
      bio: 'Test Mentor Alpha specializes in career progression and system design.',
      domain: 'Software Engineering',
      experienceYears: 10,
      rating: 4.9,
      reviewCount: 20,
      startingPrice: 1000,
      status: 'APPROVED',
      publicProfileEnabled: true,
    },
  });

  // Setup Mentor B
  const mentorB = await db.mentor.create({
    data: {
      name: 'Test Mentor Beta',
      email: 'test.mentor.b@discovery-test.io',
      headline: 'DevOps & Cloud Specialist',
      bio: 'Test Mentor Beta specializes only in technical infrastructure.',
      domain: 'Cloud Infrastructure',
      experienceYears: 6,
      rating: 4.7,
      reviewCount: 10,
      startingPrice: 800,
      status: 'APPROVED',
      publicProfileEnabled: true,
    },
  });

  // Setup Mentor D (No services)
  const mentorD = await db.mentor.create({
    data: {
      name: 'Test Mentor Delta',
      email: 'test.mentor.d@discovery-test.io',
      headline: 'Mentor With Zero Services',
      bio: 'No services offered yet.',
      domain: 'Product',
      experienceYears: 5,
      rating: 5.0,
      status: 'APPROVED',
      publicProfileEnabled: true,
    },
  });

  try {
    // ==========================================
    // TEST 1: Mentor A with ACTIVE Career Direction service appears when Career Direction is selected
    // ==========================================
    console.log('\n--- TEST 1: Active Matching Service ---');
    const serviceA_Career = await db.mentorshipService.create({
      data: {
        mentorId: mentorA.id,
        title: 'Alpha Career Direction Roadmap',
        description: 'Roadmap planning for engineers',
        category: 'CAREER_DIRECTION',
        duration: 45,
        price: 1000,
        currency: 'INR',
        active: true,
      },
    });

    const resTest1 = await MentorDiscoveryService.discoverMentors({
      preference: 'CAREER_DIRECTION',
    });
    const foundA1 = resTest1.mentors.some((m) => m.id === mentorA.id);
    assert(foundA1, 'Mentor A appears when selecting Career Direction');
    const mentorAItem = resTest1.mentors.find((m) => m.id === mentorA.id);
    assert(
      mentorAItem?.matchingService?.id === serviceA_Career.id,
      'Mentor A card includes matching service details (ID, category, title)',
      `Got matchingService ID: ${mentorAItem?.matchingService?.id}`
    );

    // ==========================================
    // TEST 2: Mentor B with ACTIVE Technical Guidance does NOT appear when Career Direction is selected
    // ==========================================
    console.log('\n--- TEST 2: Category Isolation ---');
    const serviceB_Tech = await db.mentorshipService.create({
      data: {
        mentorId: mentorB.id,
        title: 'Beta Technical Guidance Only',
        description: 'Cloud and infra debugging session',
        category: 'TECHNICAL_GUIDANCE',
        duration: 45,
        price: 800,
        currency: 'INR',
        active: true,
      },
    });

    const resTest2 = await MentorDiscoveryService.discoverMentors({
      preference: 'CAREER_DIRECTION',
    });
    const foundB2 = resTest2.mentors.some((m) => m.id === mentorB.id);
    assert(!foundB2, 'Mentor B does NOT appear when candidate selects Career Direction');

    // ==========================================
    // TEST 3: Mentor A adds Mock Interview & Tech Guidance. Candidate selects Mock Interview -> Mentor A appears
    // ==========================================
    console.log('\n--- TEST 3: Multiple Services / Cross-Category Discovery ---');
    const serviceA_Mock = await db.mentorshipService.create({
      data: {
        mentorId: mentorA.id,
        title: 'Alpha System Design Mock Interview',
        description: 'High-concurrency system design round',
        category: 'MOCK_INTERVIEW',
        duration: 60,
        price: 1500,
        currency: 'INR',
        active: true,
      },
    });
    const serviceA_Tech = await db.mentorshipService.create({
      data: {
        mentorId: mentorA.id,
        title: 'Alpha Technical Guidance',
        description: 'Distributed cache architecture',
        category: 'TECHNICAL_GUIDANCE',
        duration: 45,
        price: 1200,
        currency: 'INR',
        active: true,
      },
    });

    const resTest3 = await MentorDiscoveryService.discoverMentors({
      preference: 'MOCK_INTERVIEW',
    });
    const foundA3 = resTest3.mentors.some((m) => m.id === mentorA.id);
    assert(foundA3, 'Mentor A appears when candidate selects Mock Interview');
    const mentorAItemMock = resTest3.mentors.find((m) => m.id === mentorA.id);
    assert(
      mentorAItemMock?.matchingService?.id === serviceA_Mock.id,
      'Matching service correctly matches Mock Interview'
    );

    // ==========================================
    // TEST 4: Mentor A deactivates Career Direction service (active = false). Candidate selects Career Direction -> Mentor A disappears
    // ==========================================
    console.log('\n--- TEST 4: Inactive Service Filtering ---');
    await db.mentorshipService.update({
      where: { id: serviceA_Career.id },
      data: { active: false },
    });

    const resTest4 = await MentorDiscoveryService.discoverMentors({
      preference: 'CAREER_DIRECTION',
    });
    const foundA4 = resTest4.mentors.some((m) => m.id === mentorA.id);
    assert(!foundA4, 'Mentor A disappears when Career Direction service is set to INACTIVE');

    // ==========================================
    // TEST 5: Mentor D has no services -> Mentor D does NOT appear
    // ==========================================
    console.log('\n--- TEST 5: Mentors With No Services Excluded ---');
    const resTest5Pref = await MentorDiscoveryService.discoverMentors({
      preference: 'CAREER_DIRECTION',
    });
    assert(!resTest5Pref.mentors.some((m) => m.id === mentorD.id), 'Mentor D does NOT appear under category preference');

    const resTest5Default = await MentorDiscoveryService.discoverMentors({});
    assert(!resTest5Default.mentors.some((m) => m.id === mentorD.id), 'Mentor D does NOT appear under default discovery (no active services)');

    // ==========================================
    // TEST 6: Mentor A has two active Career Direction services -> Appears exactly ONCE (Deduplication)
    // ==========================================
    console.log('\n--- TEST 6: Deduplication Check ---');
    // Reactivate first service and create second service
    await db.mentorshipService.update({
      where: { id: serviceA_Career.id },
      data: { active: true },
    });
    const serviceA_Career2 = await db.mentorshipService.create({
      data: {
        mentorId: mentorA.id,
        title: 'Alpha Executive Career Strategy Session',
        description: 'Advanced career transitions',
        category: 'CAREER_DIRECTION',
        duration: 60,
        price: 2000,
        currency: 'INR',
        active: true,
      },
    });

    const resTest6 = await MentorDiscoveryService.discoverMentors({
      preference: 'CAREER_DIRECTION',
    });
    const countA6 = resTest6.mentors.filter((m) => m.id === mentorA.id).length;
    assert(countA6 === 1, 'Mentor A appears exactly ONCE despite having 2 active Career Direction services');

    // ==========================================
    // TEST 7: Search combined with Preference
    // ==========================================
    console.log('\n--- TEST 7: Search Query Combined with Category Preference ---');
    // Search for "Distributed" within CAREER_DIRECTION -> should find Mentor A (headline/bio mentions distributed)
    const resTest7Match = await MentorDiscoveryService.discoverMentors({
      preference: 'CAREER_DIRECTION',
      search: 'Distributed',
    });
    assert(
      resTest7Match.mentors.some((m) => m.id === mentorA.id),
      'Search matches mentor within selected preference'
    );

    // Search for "NonExistentTermXYZ" within CAREER_DIRECTION -> 0 results
    const resTest7NoMatch = await MentorDiscoveryService.discoverMentors({
      preference: 'CAREER_DIRECTION',
      search: 'NonExistentTermXYZ',
    });
    assert(resTest7NoMatch.mentors.length === 0, 'Search respects query and returns 0 when no match');

    // ==========================================
    // TEST 8: Suspended Mentor Protection
    // ==========================================
    console.log('\n--- TEST 8: Ineligible / Suspended Mentor Check ---');
    const mentorSuspended = await db.mentor.create({
      data: {
        name: 'Suspended Mentor',
        email: 'test.mentor.suspended@discovery-test.io',
        headline: 'Suspended Lead',
        bio: 'Suspended account',
        domain: 'Software Engineering',
        experienceYears: 8,
        rating: 4.8,
        status: 'SUSPENDED', // NOT APPROVED
        publicProfileEnabled: true,
      },
    });
    await db.mentorshipService.create({
      data: {
        mentorId: mentorSuspended.id,
        title: 'Suspended Active Service',
        description: 'Should not show up',
        category: 'CAREER_DIRECTION',
        duration: 45,
        price: 500,
        currency: 'INR',
        active: true,
      },
    });

    const resTest8 = await MentorDiscoveryService.discoverMentors({
      preference: 'CAREER_DIRECTION',
    });
    assert(
      !resTest8.mentors.some((m) => m.id === mentorSuspended.id),
      'Suspended mentor does NOT appear even with an ACTIVE service'
    );

    // ==========================================
    // TEST 9: Booking Flow Receives and Validates Correct serviceId & mentorId
    // ==========================================
    console.log('\n--- TEST 9: Booking Flow Verification ---');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(15, 0, 0, 0);

    const booking = await BookingService.createBooking(candidateUser.id, {
      mentorId: mentorA.id,
      serviceId: serviceA_Career.id,
      scheduledStart: tomorrow.toISOString(),
      timezone: 'Asia/Kolkata',
      studentNotes: 'Pre-session career questions',
    });

    assert(booking.id !== undefined, 'Booking created successfully with valid serviceId and mentorId');
    assert(booking.service.id === serviceA_Career.id, 'Booking holds reference to exact serviceId');
    assert(booking.mentorId === mentorA.id, 'Booking holds reference to exact mentorId');

    // Attempt to book an inactive service -> Must fail!
    let inactiveBookingFailed = false;
    const inactiveService = await db.mentorshipService.create({
      data: {
        mentorId: mentorA.id,
        title: 'Archived Service Offering',
        description: 'Should reject bookings',
        category: 'RESUME_REVIEW',
        duration: 30,
        price: 500,
        currency: 'INR',
        active: false,
      },
    });

    try {
      await BookingService.createBooking(candidateUser.id, {
        mentorId: mentorA.id,
        serviceId: inactiveService.id,
        scheduledStart: tomorrow.toISOString(),
        timezone: 'Asia/Kolkata',
      });
    } catch {
      inactiveBookingFailed = true;
    }
    assert(inactiveBookingFailed, 'Booking service successfully rejects booking for INACTIVE service');

    // Attempt to book for SUSPENDED mentor -> Must fail!
    let suspendedBookingFailed = false;
    try {
      await BookingService.createBooking(candidateUser.id, {
        mentorId: mentorSuspended.id,
        serviceId: serviceA_Career.id,
        scheduledStart: tomorrow.toISOString(),
        timezone: 'Asia/Kolkata',
      });
    } catch {
      suspendedBookingFailed = true;
    }
    assert(suspendedBookingFailed, 'Booking service successfully rejects booking for SUSPENDED mentor');

    console.log(`\n==========================================`);
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`==========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    // Cleanup created test records
    await db.mentorshipSession.deleteMany({
      where: { mentor: { email: { in: testEmails } } },
    });
    await db.booking.deleteMany({
      where: { mentor: { email: { in: testEmails } } },
    });
    await db.mentorshipService.deleteMany({
      where: { mentor: { email: { in: testEmails } } },
    });
    await db.mentor.deleteMany({
      where: { email: { in: testEmails } },
    });
    await db.user.deleteMany({
      where: { email: { in: testEmails } },
    });
  }
}

runTests()
  .catch(console.error)
  .finally(() => db.$disconnect());
