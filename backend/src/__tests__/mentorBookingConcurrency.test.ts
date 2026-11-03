import { db } from '../db/client';
import { BookingService } from '../services/mentorship/bookingService';
import { AvailabilityService } from '../services/mentorship/availabilityService';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASSED: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAILED: ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runMentorBookingConcurrencyTests() {
  console.log('\n🔒 Running Mentor Booking Concurrency & Double-Booking Prevention Integration Tests...\n');

  let mentorAlpha: any = null;
  let mentorBeta: any = null;
  let serviceAlpha30: any = null;
  let serviceAlpha45: any = null;
  let serviceBeta30: any = null;
  let candidate1: any = null;
  let candidate2: any = null;

  const emailAlpha = `mentor.alpha.${Date.now()}@pathway.test`;
  const emailBeta = `mentor.beta.${Date.now()}@pathway.test`;
  const emailCand1 = `cand1.${Date.now()}@pathway.test`;
  const emailCand2 = `cand2.${Date.now()}@pathway.test`;

  try {
    // -------------------------------------------------------------------------
    // Setup Test Fixtures in Real MongoDB Instance
    // -------------------------------------------------------------------------
    console.log('--- Setting Up Test Fixtures in MongoDB ---');

    candidate1 = await db.user.create({
      data: {
        email: emailCand1,
        name: 'Concurrency Candidate One',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    candidate2 = await db.user.create({
      data: {
        email: emailCand2,
        name: 'Concurrency Candidate Two',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    mentorAlpha = await db.mentor.create({
      data: {
        email: emailAlpha,
        name: 'Mentor Alpha Concurrency',
        status: 'APPROVED',
        headline: 'Principal Engineer',
        bio: 'Distributed systems architect',
        domain: 'TECH',
        expertise: ['Distributed Systems', 'Databases'],
        startingPrice: 100,
      },
    });

    mentorBeta = await db.mentor.create({
      data: {
        email: emailBeta,
        name: 'Mentor Beta Concurrency',
        status: 'APPROVED',
        headline: 'Staff Engineer',
        bio: 'Cloud architecture expert',
        domain: 'TECH',
        expertise: ['Cloud Architecture'],
        startingPrice: 120,
      },
    });

    serviceAlpha30 = await db.mentorshipService.create({
      data: {
        mentorId: mentorAlpha.id,
        title: 'Alpha 30-Min Architecture Consultation',
        description: 'System design and scalability review',
        category: 'TECHNICAL_GUIDANCE',
        duration: 30,
        price: 100,
        active: true,
      },
    });

    serviceAlpha45 = await db.mentorshipService.create({
      data: {
        mentorId: mentorAlpha.id,
        title: 'Alpha 45-Min Deep Dive',
        description: 'In-depth architecture dive',
        category: 'TECHNICAL_GUIDANCE',
        duration: 45,
        price: 150,
        active: true,
      },
    });

    serviceBeta30 = await db.mentorshipService.create({
      data: {
        mentorId: mentorBeta.id,
        title: 'Beta 30-Min Cloud Consultation',
        description: 'Cloud strategy and migration',
        category: 'TECHNICAL_GUIDANCE',
        duration: 30,
        price: 120,
        active: true,
      },
    });

    // Create 7-day 09:00 - 18:00 Asia/Kolkata availability for both mentors
    for (let day = 0; day <= 6; day++) {
      await db.availabilityRule.create({
        data: {
          mentorId: mentorAlpha.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          timezone: 'Asia/Kolkata',
          active: true,
        },
      });

      await db.availabilityRule.create({
        data: {
          mentorId: mentorBeta.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          timezone: 'Asia/Kolkata',
          active: true,
        },
      });
    }

    console.log('  ✓ Test mentors, services, and availability rules initialized.\n');

    // =========================================================================
    // 1. Two simultaneous requests for the same mentor and identical slot
    // =========================================================================
    console.log('--- Phase 1: Two Simultaneous Requests for Identical Slot ---');
    // Asia/Kolkata 09:30 local = 04:00 UTC (future date: 2026-11-20)
    const identicalSlot = '2026-11-20T04:00:00.000Z';

    const p1 = BookingService.createBooking(candidate1.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha30.id,
      scheduledStart: identicalSlot,
      timezone: 'Asia/Kolkata',
    });

    const p2 = BookingService.createBooking(candidate2.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha30.id,
      scheduledStart: identicalSlot,
      timezone: 'Asia/Kolkata',
    });

    const results1 = await Promise.allSettled([p1, p2]);
    const fulfilled1 = results1.filter((r) => r.status === 'fulfilled');
    const rejected1 = results1.filter((r) => r.status === 'rejected');

    assert(
      fulfilled1.length === 1,
      '1.1 Exactly one concurrent request succeeds for identical slot',
      `Fulfilled: ${fulfilled1.length}, Rejected: ${rejected1.length}`
    );

    assert(
      rejected1.length === 1,
      '1.2 Exactly one concurrent request is rejected with conflict',
      `Rejected count: ${rejected1.length}`
    );

    const rejection1Reason = (rejected1[0] as PromiseRejectedResult).reason;
    assert(
      rejection1Reason.message.includes('This time slot was just reserved by another candidate'),
      '1.3 Rejected request returns clear conflict message to user',
      `Got message: "${rejection1Reason.message}"`
    );

    const dbBookings1 = await db.booking.findMany({
      where: {
        mentorId: mentorAlpha.id,
        scheduledStart: new Date(identicalSlot),
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    assert(
      dbBookings1.length === 1,
      '1.4 Database contains exactly 1 active booking for the slot (no double-booking)',
      `DB bookings count: ${dbBookings1.length}`
    );

    const winningSession1 = await db.mentorshipSession.findUnique({
      where: { bookingId: dbBookings1[0].id },
    });

    assert(
      winningSession1 !== null && winningSession1.status === 'SCHEDULED',
      '1.5 Winning booking has linked mentorship session atomically created'
    );

    const updatedMentorAlpha1 = await db.mentor.findUnique({
      where: { id: mentorAlpha.id },
    });

    assert(
      updatedMentorAlpha1?.sessionCount === 0,
      '1.6 Mentor sessionCount remains 0 (business metric not mutated on booking)',
      `sessionCount: ${updatedMentorAlpha1?.sessionCount}`
    );

    assert(
      (updatedMentorAlpha1?.bookingVersion ?? 0) >= 1,
      '1.7 Dedicated bookingVersion incremented atomically as concurrency lock',
      `bookingVersion: ${updatedMentorAlpha1?.bookingVersion}`
    );

    // =========================================================================
    // 2. Two simultaneous requests with partially overlapping intervals
    // =========================================================================
    console.log('\n--- Phase 2: Two Simultaneous Requests for Partially Overlapping Intervals ---');
    // ServiceAlpha45 (45 min):
    // Candidate 1: 10:00 IST -> 04:30 UTC to 05:15 UTC
    // Candidate 2: 10:30 IST -> 05:00 UTC to 05:45 UTC
    // These intervals overlap between 05:00 and 05:15 UTC!
    const slotOverlapA = '2026-11-20T04:30:00.000Z';
    const slotOverlapB = '2026-11-20T05:00:00.000Z';

    const pOverlap1 = BookingService.createBooking(candidate1.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha45.id,
      scheduledStart: slotOverlapA,
      timezone: 'Asia/Kolkata',
    });

    const pOverlap2 = BookingService.createBooking(candidate2.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha45.id,
      scheduledStart: slotOverlapB,
      timezone: 'Asia/Kolkata',
    });

    const results2 = await Promise.allSettled([pOverlap1, pOverlap2]);
    const fulfilled2 = results2.filter((r) => r.status === 'fulfilled');
    const rejected2 = results2.filter((r) => r.status === 'rejected');

    assert(
      fulfilled2.length === 1,
      '2.1 Exactly one request succeeds when intervals partially overlap',
      `Fulfilled: ${fulfilled2.length}, Rejected: ${rejected2.length}`
    );

    assert(
      rejected2.length === 1,
      '2.2 Second request rejected due to interval collision (not just identical start time)',
      `Rejected count: ${rejected2.length}`
    );

    const rejection2Reason = (rejected2[0] as PromiseRejectedResult).reason;
    assert(
      rejection2Reason.message.includes('This time slot was just reserved by another candidate'),
      '2.3 Interval collision returns informative conflict message',
      `Got message: "${rejection2Reason.message}"`
    );

    const dbOverlapBookings = await db.booking.findMany({
      where: {
        mentorId: mentorAlpha.id,
        scheduledStart: { in: [new Date(slotOverlapA), new Date(slotOverlapB)] },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    assert(
      dbOverlapBookings.length === 1,
      '2.4 Database contains exactly 1 booking across the overlapping range',
      `Count: ${dbOverlapBookings.length}`
    );

    // =========================================================================
    // 3. Two non-overlapping requests for the same mentor
    // =========================================================================
    console.log('\n--- Phase 3: Two Non-Overlapping Requests for the Same Mentor ---');
    // Slot 1: 11:30 IST -> 06:00 UTC to 06:30 UTC
    // Slot 2: 12:30 IST -> 07:00 UTC to 07:30 UTC
    const slotNonOverlap1 = '2026-11-20T06:00:00.000Z';
    const slotNonOverlap2 = '2026-11-20T07:00:00.000Z';

    const pNonOverlap1 = BookingService.createBooking(candidate1.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha30.id,
      scheduledStart: slotNonOverlap1,
      timezone: 'Asia/Kolkata',
    });

    const pNonOverlap2 = BookingService.createBooking(candidate2.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha30.id,
      scheduledStart: slotNonOverlap2,
      timezone: 'Asia/Kolkata',
    });

    const results3 = await Promise.allSettled([pNonOverlap1, pNonOverlap2]);
    const fulfilled3 = results3.filter((r) => r.status === 'fulfilled');
    const rejected3 = results3.filter((r) => r.status === 'rejected');

    assert(
      fulfilled3.length === 2 && rejected3.length === 0,
      '3.1 Both non-overlapping requests succeed concurrently for the same mentor',
      `Fulfilled: ${fulfilled3.length}, Rejected: ${rejected3.length}`
    );

    const dbNonOverlapBookings = await db.booking.findMany({
      where: {
        mentorId: mentorAlpha.id,
        scheduledStart: { in: [new Date(slotNonOverlap1), new Date(slotNonOverlap2)] },
        status: 'CONFIRMED',
      },
      include: { session: true },
    });

    assert(
      dbNonOverlapBookings.length === 2,
      '3.2 Database holds both non-overlapping bookings',
      `Count: ${dbNonOverlapBookings.length}`
    );

    assert(
      dbNonOverlapBookings.every((b) => b.session !== null),
      '3.3 Both bookings have valid associated mentorship sessions'
    );

    // =========================================================================
    // 4. Concurrent requests for different mentors
    // =========================================================================
    console.log('\n--- Phase 4: Concurrent Requests for Different Mentors ---');
    // Both request same UTC time: 08:00 UTC (13:30 IST)
    const diffMentorSlot = '2026-11-20T08:00:00.000Z';

    const pMentorAlpha = BookingService.createBooking(candidate1.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha30.id,
      scheduledStart: diffMentorSlot,
      timezone: 'Asia/Kolkata',
    });

    const pMentorBeta = BookingService.createBooking(candidate2.id, {
      mentorId: mentorBeta.id,
      serviceId: serviceBeta30.id,
      scheduledStart: diffMentorSlot,
      timezone: 'Asia/Kolkata',
    });

    const results4 = await Promise.allSettled([pMentorAlpha, pMentorBeta]);
    const fulfilled4 = results4.filter((r) => r.status === 'fulfilled');
    const rejected4 = results4.filter((r) => r.status === 'rejected');

    assert(
      fulfilled4.length === 2 && rejected4.length === 0,
      '4.1 Concurrent requests for different mentors both succeed without blocking each other',
      `Fulfilled: ${fulfilled4.length}, Rejected: ${rejected4.length}`
    );

    const bookingAlpha = await db.booking.findFirst({
      where: { mentorId: mentorAlpha.id, scheduledStart: new Date(diffMentorSlot) },
    });
    const bookingBeta = await db.booking.findFirst({
      where: { mentorId: mentorBeta.id, scheduledStart: new Date(diffMentorSlot) },
    });

    assert(
      bookingAlpha !== null && bookingBeta !== null,
      '4.2 Independent bookings recorded for both Mentor Alpha and Mentor Beta'
    );

    // =========================================================================
    // 5. Cancelled booking followed by legitimate rebooking
    // =========================================================================
    console.log('\n--- Phase 5: Cancelled Booking Followed by Legitimate Rebooking ---');
    const cancelRebookSlot = '2026-11-20T09:00:00.000Z';

    const firstBooking = await BookingService.createBooking(candidate1.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha30.id,
      scheduledStart: cancelRebookSlot,
      timezone: 'Asia/Kolkata',
    });

    assert(firstBooking.status === 'CONFIRMED', '5.1 Initial booking confirmed');

    // Cancel first booking
    await BookingService.updateBookingStatus(firstBooking.id, mentorAlpha.id, {
      status: 'CANCELLED_BY_CANDIDATE',
      reason: 'Schedule conflict',
    });

    const cancelledCheck = await db.booking.findUnique({
      where: { id: firstBooking.id },
    });
    assert(
      cancelledCheck?.status === 'CANCELLED_BY_CANDIDATE',
      '5.2 First booking marked as CANCELLED_BY_CANDIDATE'
    );

    // Legitimate rebooking by Candidate 2 for the identical slot
    const rebookedBooking = await BookingService.createBooking(candidate2.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha30.id,
      scheduledStart: cancelRebookSlot,
      timezone: 'Asia/Kolkata',
    });

    assert(
      rebookedBooking.status === 'CONFIRMED' && rebookedBooking.candidate?.id === candidate2.id,
      '5.3 Cancelled slot can be legitimately rebooked by another candidate',
      `Status: ${rebookedBooking?.status}, candidate: ${rebookedBooking?.candidate?.id}`
    );

    // =========================================================================
    // 6. Booking/session consistency when creation fails
    // =========================================================================
    console.log('\n--- Phase 6: Booking/Session Atomicity & Consistency ---');

    // Attempt booking with unapproved mentor (fails pre-transaction)
    try {
      await BookingService.createBooking(candidate1.id, {
        mentorId: candidate1.id, // Not a mentor
        serviceId: serviceAlpha30.id,
        scheduledStart: '2026-11-20T10:00:00.000Z',
        timezone: 'Asia/Kolkata',
      });
      assert(false, '6.1 Invalid mentor request should fail');
    } catch (err: any) {
      assert(
        err.message.includes('Mentor is not available for bookings'),
        '6.1 Failed booking pre-validation does not create any booking or session'
      );
    }

    // Verify all bookings in test have 1-to-1 session mapping (no orphan sessions)
    const allBookings = await db.booking.findMany({
      where: { mentorId: { in: [mentorAlpha.id, mentorBeta.id] } },
      include: { session: true },
    });

    const allSessions = await db.mentorshipSession.findMany({
      where: { mentorId: { in: [mentorAlpha.id, mentorBeta.id] } },
    });

    assert(
      allBookings.every((b) => b.session !== null),
      '6.2 Every confirmed booking has an associated MentorshipSession (no sessions missing)'
    );

    assert(
      allSessions.length === allBookings.length,
      '6.3 No orphan sessions exist (sessions count equals bookings count)',
      `Sessions: ${allSessions.length}, Bookings: ${allBookings.length}`
    );

    // =========================================================================
    // 7. Transaction conflict-retry behavior under high contention
    // =========================================================================
    console.log('\n--- Phase 7: Transaction Conflict-Retry Under Contention ---');
    // Fire 3 simultaneous requests for 3 separate non-overlapping slots
    // To trigger write contention on mentor document and prove retry succeeds
    const slotC1 = '2026-11-20T10:30:00.000Z';
    const slotC2 = '2026-11-20T11:00:00.000Z';
    const slotC3 = '2026-11-20T11:30:00.000Z';

    const pContention1 = BookingService.createBooking(candidate1.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha30.id,
      scheduledStart: slotC1,
      timezone: 'Asia/Kolkata',
    });

    const pContention2 = BookingService.createBooking(candidate2.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha30.id,
      scheduledStart: slotC2,
      timezone: 'Asia/Kolkata',
    });

    const pContention3 = BookingService.createBooking(candidate1.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha30.id,
      scheduledStart: slotC3,
      timezone: 'Asia/Kolkata',
    });

    const contentionResults = await Promise.allSettled([pContention1, pContention2, pContention3]);
    const contentionFulfilled = contentionResults.filter((r) => r.status === 'fulfilled');

    assert(
      contentionFulfilled.length === 3,
      '7.1 All 3 high-contention non-overlapping requests succeed through retry loop without 500 error',
      `Fulfilled: ${contentionFulfilled.length} / 3`
    );

    // =========================================================================
    // 8. Existing sequential conflict checks & lifecycle regressions
    // =========================================================================
    console.log('\n--- Phase 8: Sequential Conflict Checks & Booking Lifecycle ---');

    // Book a dedicated slot sequentially
    const slotSequentialOccupied = '2026-11-20T12:00:00.000Z';
    await BookingService.createBooking(candidate1.id, {
      mentorId: mentorAlpha.id,
      serviceId: serviceAlpha30.id,
      scheduledStart: slotSequentialOccupied,
      timezone: 'Asia/Kolkata',
    });

    // Sequential attempt for the occupied slot must fail
    try {
      await BookingService.createBooking(candidate2.id, {
        mentorId: mentorAlpha.id,
        serviceId: serviceAlpha30.id,
        scheduledStart: slotSequentialOccupied,
        timezone: 'Asia/Kolkata',
      });
      assert(false, '8.1 Sequential booking for occupied slot should fail');
    } catch (err: any) {
      assert(
        err.message.includes('This time slot was just reserved by another candidate'),
        '8.1 Sequential booking for occupied slot rejected with collision error'
      );
    }

    // List bookings pagination and filters
    const listRes = await BookingService.listBookings({
      mentorId: mentorAlpha.id,
      tab: 'upcoming',
      page: 1,
      limit: 10,
    });

    assert(
      listRes.items.length > 0 && listRes.total > 0,
      '8.2 listBookings returns active upcoming bookings for mentor'
    );

    // IDOR check: mentor cannot access another mentor's booking
    const betaBooking = await db.booking.findFirst({
      where: { mentorId: mentorBeta.id },
    });

    try {
      if (betaBooking) {
        await BookingService.getBookingDetail(betaBooking.id, mentorAlpha.id);
        assert(false, '8.3 IDOR check should reject unauthorized mentor access');
      }
    } catch (err: any) {
      assert(
        err.message.includes('Unauthorized access to booking'),
        '8.3 Mentor cannot view or update another mentor booking'
      );
    }

    // =========================================================================
    // 9. Fail-closed behavior when transactions are unavailable
    // =========================================================================
    console.log('\n--- Phase 9: Fail-Closed Behavior When Replica Set Transactions Unavailable ---');

    // Temporarily mock db.$transaction to simulate standalone MongoDB without replica set
    const originalTransaction = db.$transaction;
    try {
      (db as any).$transaction = async () => {
        const replicaSetError: any = new Error('A transaction requires a replica set or mongos');
        replicaSetError.code = 'P2028';
        throw replicaSetError;
      };

      try {
        await BookingService.createBooking(candidate1.id, {
          mentorId: mentorBeta.id,
          serviceId: serviceBeta30.id,
          scheduledStart: '2026-11-20T10:00:00.000Z',
          timezone: 'Asia/Kolkata',
        });
        assert(false, '9.1 Should fail closed when transactions are unsupported');
      } catch (err: any) {
        assert(
          err.message.includes('database transactions are not supported by the current database configuration') &&
          err.message.includes('MongoDB replica set is required'),
          '9.1 Booking creation fails closed with clear replica-set configuration error',
          `Got error: "${err.message}"`
        );
      }

      // Verify no booking was created under failed transaction support
      const orphanBooking = await db.booking.findFirst({
        where: {
          mentorId: mentorBeta.id,
          scheduledStart: new Date('2026-11-20T10:00:00.000Z'),
        },
      });
      assert(
        orphanBooking === null,
        '9.2 No booking record created when transactions fail closed (no silent fallback)'
      );
    } finally {
      db.$transaction = originalTransaction;
    }

  } catch (err: any) {
    console.error('Fatal test execution error:', err);
    failed++;
  } finally {
    // -------------------------------------------------------------------------
    // Cleanup Test Artifacts
    // -------------------------------------------------------------------------
    console.log('\n--- Cleanup Test Artifacts ---');
    try {
      const mentorIds = [mentorAlpha?.id, mentorBeta?.id].filter(Boolean);
      const userIds = [candidate1?.id, candidate2?.id].filter(Boolean);

      if (mentorIds.length > 0) {
        await db.mentorshipSession.deleteMany({ where: { mentorId: { in: mentorIds } } });
        await db.booking.deleteMany({ where: { mentorId: { in: mentorIds } } });
        await db.availabilityRule.deleteMany({ where: { mentorId: { in: mentorIds } } });
        await db.availabilityException.deleteMany({ where: { mentorId: { in: mentorIds } } });
        await db.mentorshipService.deleteMany({ where: { mentorId: { in: mentorIds } } });
        await db.mentor.deleteMany({ where: { id: { in: mentorIds } } });
      }

      if (userIds.length > 0) {
        await db.session.deleteMany({ where: { userId: { in: userIds } } });
        await db.user.deleteMany({ where: { id: { in: userIds } } });
      }

      console.log('  ✓ Test database artifacts cleaned up.');
    } catch (cleanupErr) {
      console.warn('  ⚠️ Cleanup warning:', cleanupErr);
    }
  }

  console.log(`\n========================================`);
  console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runMentorBookingConcurrencyTests().catch((err) => {
  console.error('Fatal error in mentor booking concurrency tests:', err);
  process.exit(1);
});
