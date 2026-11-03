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

async function runCandidateBookingHistoryCancellationTests() {
  console.log('\n📅 Running Candidate Mentor Booking History & Cancellation Integration Tests...\n');

  let candidateAlice: any = null;
  let candidateBob: any = null;
  let candidateCharlie: any = null;
  let mentorPriya: any = null;
  let service45: any = null;
  let service60: any = null;

  const emailAlice = `cand.alice.${Date.now()}@pathway.test`;
  const emailBob = `cand.bob.${Date.now()}@pathway.test`;
  const emailCharlie = `cand.charlie.${Date.now()}@pathway.test`;
  const emailPriya = `mentor.priya.${Date.now()}@pathway.test`;

  try {
    // -------------------------------------------------------------------------
    // Setup Test Fixtures in MongoDB
    // -------------------------------------------------------------------------
    console.log('--- Setting Up Test Fixtures in MongoDB ---');

    candidateAlice = await db.user.create({
      data: {
        email: emailAlice,
        name: 'Alice Candidate',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    candidateBob = await db.user.create({
      data: {
        email: emailBob,
        name: 'Bob Candidate',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    candidateCharlie = await db.user.create({
      data: {
        email: emailCharlie,
        name: 'Charlie Candidate',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    mentorPriya = await db.mentor.create({
      data: {
        email: emailPriya,
        name: 'Priya Mentor',
        headline: 'Staff Software Engineer at CloudCorp',
        bio: 'Distributed systems architect and career mentor',
        domain: 'TECH',
        company: 'CloudCorp',
        expertise: ['Distributed Systems', 'System Design'],
        experienceYears: 10,
        startingPrice: 1500,
        status: 'APPROVED',
        bookingVersion: 0,
      },
    });

    service45 = await db.mentorshipService.create({
      data: {
        mentorId: mentorPriya.id,
        title: 'Architecture Review (45m)',
        description: 'Deep dive into system scalability and architecture',
        category: 'TECHNICAL_GUIDANCE',
        duration: 45,
        price: 1500,
        currency: 'INR',
        active: true,
      },
    });

    service60 = await db.mentorshipService.create({
      data: {
        mentorId: mentorPriya.id,
        title: 'Mock Interview (60m)',
        description: 'Comprehensive technical interview simulation',
        category: 'MOCK_INTERVIEW',
        duration: 60,
        price: 2000,
        currency: 'INR',
        active: true,
      },
    });

    // Weekly rules: Friday (dayOfWeek 5): 09:00 - 17:00 in Asia/Kolkata
    await db.availabilityRule.create({
      data: {
        mentorId: mentorPriya.id,
        dayOfWeek: 5, // Friday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'Asia/Kolkata',
        active: true,
      },
    });

    console.log('✓ Test fixtures configured successfully.');

    // -------------------------------------------------------------------------
    // TEST 1: Candidate can retrieve their own booking history
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Candidate Can Retrieve Their Own Booking History ---');

    // Create 2 future bookings for Alice (Oct 20, 2028 is a Friday)
    const bookingAlice1 = await BookingService.createBooking(candidateAlice.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: '2028-10-20T03:30:00.000Z', // 09:00 IST
      timezone: 'Asia/Kolkata',
      studentNotes: 'Microservices migration question',
    });

    const bookingAlice2 = await BookingService.createBooking(candidateAlice.id, {
      mentorId: mentorPriya.id,
      serviceId: service60.id,
      scheduledStart: '2028-10-20T05:00:00.000Z', // 10:30 IST
      timezone: 'Asia/Kolkata',
      studentNotes: 'Staff mock round',
    });

    const aliceUpcoming = await BookingService.listCandidateBookings(candidateAlice.id, {
      tab: 'upcoming',
    });

    assert(aliceUpcoming.total >= 2, 'Alice has at least 2 upcoming bookings');
    const item1 = aliceUpcoming.items.find((b) => b.id === bookingAlice1.id);
    const item2 = aliceUpcoming.items.find((b) => b.id === bookingAlice2.id);

    assert(!!item1, 'Booking 1 is present in Alice history');
    assert(!!item2, 'Booking 2 is present in Alice history');
    assert(item1?.mentor.name === 'Priya Mentor', 'Includes safe mentor name');
    assert(item1?.mentor.company === 'CloudCorp', 'Includes mentor company');
    assert(item1?.service.title === 'Architecture Review (45m)', 'Includes service title');
    assert(item1?.service.duration === 45, 'Includes service duration');
    assert(item1?.service.price === 1500, 'Includes service price');
    assert(item1?.status === 'CONFIRMED', 'Reports status CONFIRMED');
    assert(item1?.canCancel === true, 'canCancel is true for upcoming active booking');
    assert(item1?.studentNotes === 'Microservices migration question', 'Preserves candidate student notes');
    assert(item1?.meetingUrl !== null && typeof item1?.meetingUrl === 'string', 'Meeting URL is available for confirmed active booking');

    // -------------------------------------------------------------------------
    // TEST 2: Candidate cannot retrieve another candidate's bookings (Isolation)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Tenant Isolation Between Candidates ---');

    // Bob creates a booking with Priya
    const bookingBob = await BookingService.createBooking(candidateBob.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: '2028-10-20T06:30:00.000Z', // 12:00 IST
      timezone: 'Asia/Kolkata',
      studentNotes: 'Bob notes',
    });

    const aliceListAll = await BookingService.listCandidateBookings(candidateAlice.id, {
      tab: 'all',
    });
    const bobListAll = await BookingService.listCandidateBookings(candidateBob.id, {
      tab: 'all',
    });

    assert(
      !aliceListAll.items.some((b) => b.id === bookingBob.id),
      'Alice booking history does not contain Bob booking'
    );
    assert(
      bobListAll.items.some((b) => b.id === bookingBob.id),
      'Bob booking history contains his own booking'
    );
    assert(
      !bobListAll.items.some((b) => b.id === bookingAlice1.id || b.id === bookingAlice2.id),
      'Bob booking history does not contain any of Alice bookings'
    );

    // -------------------------------------------------------------------------
    // TEST 3: Pagination and Status Filtering
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Pagination & Status Filtering ---');

    // Create 3 more bookings for Charlie on consecutive future slots
    const charlieB1 = await BookingService.createBooking(candidateCharlie.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: '2028-10-27T03:30:00.000Z',
      timezone: 'Asia/Kolkata',
    });
    const charlieB2 = await BookingService.createBooking(candidateCharlie.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: '2028-10-27T04:30:00.000Z',
      timezone: 'Asia/Kolkata',
    });
    const charlieB3 = await BookingService.createBooking(candidateCharlie.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: '2028-10-27T05:30:00.000Z',
      timezone: 'Asia/Kolkata',
    });

    const page1 = await BookingService.listCandidateBookings(candidateCharlie.id, {
      tab: 'upcoming',
      page: 1,
      limit: 2,
    });
    assert(page1.items.length === 2, 'Page 1 returns exactly 2 items');
    assert(page1.total === 3, 'Total items count is 3');
    assert(page1.totalPages === 2, 'Total pages is 2');

    const page2 = await BookingService.listCandidateBookings(candidateCharlie.id, {
      tab: 'upcoming',
      page: 2,
      limit: 2,
    });
    assert(page2.items.length === 1, 'Page 2 returns remaining 1 item');
    assert(page1.items[0].id !== page2.items[0].id, 'Page 1 and Page 2 do not overlap');

    // -------------------------------------------------------------------------
    // TEST 4: Booking Details Ownership & IDOR Protection
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Booking Details Ownership & IDOR Protection ---');

    // Alice accesses her own booking
    const aliceDetail = await BookingService.getCandidateBookingDetail(
      bookingAlice1.id,
      candidateAlice.id
    );
    assert(aliceDetail !== null, 'Alice can fetch her own booking detail');
    assert(aliceDetail?.id === bookingAlice1.id, 'Fetched detail matches booking ID');

    // Bob attempts to access Alice's booking (IDOR Attack)
    let bobIdorBlocked = false;
    try {
      await BookingService.getCandidateBookingDetail(bookingAlice1.id, candidateBob.id);
    } catch (e: any) {
      bobIdorBlocked = e.message.includes('unauthorized') || e.message.includes('not found');
    }
    assert(bobIdorBlocked, 'Bob accessing Alice booking is rejected with unauthorized error (IDOR prevented)');

    // Malformed ID format
    let malformedIdBlocked = false;
    try {
      await BookingService.getCandidateBookingDetail('invalid-hex', candidateAlice.id);
    } catch (e: any) {
      malformedIdBlocked = e.message.includes('Invalid booking ID format');
    }
    assert(malformedIdBlocked, 'Rejects malformed booking ID format');

    // -------------------------------------------------------------------------
    // TEST 5: Successful Cancellation of Eligible Booking
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Successful Cancellation of Eligible Booking ---');

    const cancelled = await BookingService.cancelBookingByCandidate(
      bookingAlice1.id,
      candidateAlice.id,
      'Work schedule conflict with team demo',
      '127.0.0.1'
    );

    assert(
      cancelled.status === 'CANCELLED_BY_CANDIDATE',
      'Booking status transitioned to CANCELLED_BY_CANDIDATE'
    );
    assert(
      cancelled.cancellationReason === 'Work schedule conflict with team demo',
      'Cancellation reason recorded accurately'
    );
    assert(cancelled.canCancel === false, 'canCancel becomes false after cancellation');
    assert(cancelled.meetingUrl === null, 'Meeting URL is revoked/nullified upon cancellation');

    // Verify in database directly
    const dbCheck = await db.booking.findUnique({
      where: { id: bookingAlice1.id },
      include: { session: true },
    });
    assert(
      dbCheck?.status === 'CANCELLED_BY_CANDIDATE',
      'Database record status is CANCELLED_BY_CANDIDATE'
    );
    assert(
      dbCheck?.session?.status === 'CANCELLED',
      'Linked MentorshipSession status atomically updated to CANCELLED'
    );

    // Verify it now appears under cancelled tab
    const aliceCancelledList = await BookingService.listCandidateBookings(candidateAlice.id, {
      tab: 'cancelled',
    });
    assert(
      aliceCancelledList.items.some((b) => b.id === bookingAlice1.id),
      'Cancelled booking now appears in cancelled tab'
    );

    // -------------------------------------------------------------------------
    // TEST 6: Ineligible Cancellations Rejected
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Ineligible Cancellations Rejected ---');

    // 6.1 Completed booking cannot be cancelled
    const completedBooking = await db.booking.create({
      data: {
        mentorId: mentorPriya.id,
        candidateId: candidateAlice.id,
        serviceId: service45.id,
        scheduledStart: new Date(Date.now() + 86400000),
        scheduledEnd: new Date(Date.now() + 86400000 + 45 * 60000),
        status: 'COMPLETED',
      },
    });

    let completedErr = false;
    try {
      await BookingService.cancelBookingByCandidate(completedBooking.id, candidateAlice.id);
    } catch (e: any) {
      completedErr = e.message.includes('Completed sessions cannot be cancelled');
    }
    assert(completedErr, 'Rejects cancellation of COMPLETED booking');

    // 6.2 NO_SHOW booking cannot be cancelled
    const noShowBooking = await db.booking.create({
      data: {
        mentorId: mentorPriya.id,
        candidateId: candidateAlice.id,
        serviceId: service45.id,
        scheduledStart: new Date(Date.now() + 86400000),
        scheduledEnd: new Date(Date.now() + 86400000 + 45 * 60000),
        status: 'NO_SHOW',
      },
    });

    let noShowErr = false;
    try {
      await BookingService.cancelBookingByCandidate(noShowBooking.id, candidateAlice.id);
    } catch (e: any) {
      noShowErr = e.message.includes('no-show cannot be cancelled');
    }
    assert(noShowErr, 'Rejects cancellation of NO_SHOW booking');

    // 6.3 Past booking cannot be cancelled
    const pastBooking = await db.booking.create({
      data: {
        mentorId: mentorPriya.id,
        candidateId: candidateAlice.id,
        serviceId: service45.id,
        scheduledStart: new Date(Date.now() - 7200000),
        scheduledEnd: new Date(Date.now() - 3600000), // Ended 1 hour ago
        status: 'CONFIRMED',
      },
    });

    let pastErr = false;
    try {
      await BookingService.cancelBookingByCandidate(pastBooking.id, candidateAlice.id);
    } catch (e: any) {
      pastErr = e.message.includes('Past sessions cannot be cancelled');
    }
    assert(pastErr, 'Rejects cancellation of past booking');

    // -------------------------------------------------------------------------
    // TEST 7: Repeated & Concurrent Cancellation (Conflict Handling)
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Repeated & Concurrent Cancellation ---');

    // Repeated cancellation on already cancelled booking1
    let repeatedErr = false;
    let repeatedStatus = 0;
    try {
      await BookingService.cancelBookingByCandidate(bookingAlice1.id, candidateAlice.id);
    } catch (e: any) {
      repeatedErr = e.message.includes('already been cancelled');
      repeatedStatus = e.statusCode;
    }
    assert(repeatedErr, 'Repeated cancellation returns clear conflict error');
    assert(repeatedStatus === 409, 'Returns HTTP 409 Conflict status code');

    // Concurrent cancellation race: Two concurrent requests on same eligible booking
    const [c1, c2] = await Promise.allSettled([
      BookingService.cancelBookingByCandidate(bookingAlice2.id, candidateAlice.id, 'Race 1'),
      BookingService.cancelBookingByCandidate(bookingAlice2.id, candidateAlice.id, 'Race 2'),
    ]);

    const successes = [c1, c2].filter((r) => r.status === 'fulfilled');
    const failures = [c1, c2].filter((r) => r.status === 'rejected');

    assert(successes.length === 1, 'Exactly one concurrent cancellation request succeeds');
    assert(failures.length === 1, 'The other concurrent request is rejected with conflict');

    // -------------------------------------------------------------------------
    // TEST 8: Cancelled Slot Becomes Available Again in Availability Engine
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Cancelled Slot Released & Re-bookable ---');

    // Slot on Nov 3, 2028 (Friday) 09:00 - 09:45 IST
    const slotDate = '2028-11-03';
    const slotStartUtc = `${slotDate}T03:30:00.000Z`;

    // 1. Bob books this slot
    const slotBooking = await BookingService.createBooking(candidateBob.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: slotStartUtc,
      timezone: 'Asia/Kolkata',
    });

    // 2. Query availability: slot must NOT be present
    const slotsDuringActive = await AvailabilityService.getAvailableSlots({
      mentorId: mentorPriya.id,
      startDate: slotDate,
      endDate: slotDate,
      durationMinutes: 45,
      timezone: 'Asia/Kolkata',
    });
    assert(
      !slotsDuringActive.some((s) => s.start === slotStartUtc),
      'Slot is occupied and absent from availability discovery while booking is active'
    );

    // 3. Bob cancels the booking
    await BookingService.cancelBookingByCandidate(slotBooking.id, candidateBob.id, 'Need to free slot');

    // 4. Query availability again: slot must now be RETURNED to available slots
    const slotsAfterCancel = await AvailabilityService.getAvailableSlots({
      mentorId: mentorPriya.id,
      startDate: slotDate,
      endDate: slotDate,
      durationMinutes: 45,
      timezone: 'Asia/Kolkata',
    });
    assert(
      slotsAfterCancel.some((s) => s.start === slotStartUtc),
      'Slot is immediately released and visible in availability discovery after cancellation'
    );

    // 5. Charlie can now successfully book the released slot
    const charlieRebooked = await BookingService.createBooking(candidateCharlie.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: slotStartUtc,
      timezone: 'Asia/Kolkata',
      studentNotes: 'Booked released slot',
    });
    assert(
      charlieRebooked.status === 'CONFIRMED',
      'Another candidate can successfully book the released slot without collision'
    );

    // -------------------------------------------------------------------------
    // TEST 9: Booking & Session Consistency
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Booking & Session Consistency ---');

    const verifiedSession = await db.mentorshipSession.findFirst({
      where: { bookingId: slotBooking.id },
    });
    assert(verifiedSession?.status === 'CANCELLED', 'Session status is CANCELLED matching the booking');

    // -------------------------------------------------------------------------
    // Clean up test fixtures from database
    // -------------------------------------------------------------------------
    console.log('\n--- Cleaning Up Integration Test Artifacts ---');
    await db.mentorshipSession.deleteMany({
      where: { mentorId: mentorPriya.id },
    });
    await db.booking.deleteMany({
      where: { mentorId: mentorPriya.id },
    });
    await db.availabilityRule.deleteMany({
      where: { mentorId: mentorPriya.id },
    });
    await db.mentorshipService.deleteMany({
      where: { mentorId: mentorPriya.id },
    });
    await db.mentor.deleteMany({
      where: { id: mentorPriya.id },
    });
    await db.user.deleteMany({
      where: { id: { in: [candidateAlice.id, candidateBob.id, candidateCharlie.id] } },
    });
    console.log('✓ Database artifacts cleaned up.');
  } catch (error) {
    console.error('Unhandled test failure:', error);
    failed++;
  }

  console.log('\n========================================');
  console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCandidateBookingHistoryCancellationTests();
