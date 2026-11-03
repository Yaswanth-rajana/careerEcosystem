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

async function runCandidateBookingRescheduleTests() {
  console.log('\n📅 Running Real MongoDB Mentorship Rescheduling & Lifecycle Integration Tests...\n');

  let candidateAlice: any = null;
  let candidateBob: any = null;
  let candidateCharlie: any = null;
  let candidateDave: any = null;
  let mentorPriya: any = null;
  let mentorOther: any = null;
  let service45: any = null;

  const emailAlice = `cand.alice.resched.${Date.now()}@pathway.test`;
  const emailBob = `cand.bob.resched.${Date.now()}@pathway.test`;
  const emailCharlie = `cand.charlie.resched.${Date.now()}@pathway.test`;
  const emailDave = `cand.dave.resched.${Date.now()}@pathway.test`;
  const emailPriya = `mentor.priya.resched.${Date.now()}@pathway.test`;
  const emailOther = `mentor.other.resched.${Date.now()}@pathway.test`;

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

    candidateDave = await db.user.create({
      data: {
        email: emailDave,
        name: 'Dave Candidate',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    mentorPriya = await db.mentor.create({
      data: {
        email: emailPriya,
        name: 'Priya Sharma',
        headline: 'Staff Engineer & Career Coach',
        bio: 'Staff Engineer at Google with 10+ years of mentorship experience.',
        domain: 'ENGINEERING',
        company: 'Google',
        status: 'APPROVED',
        bookingVersion: 1,
      },
    });

    mentorOther = await db.mentor.create({
      data: {
        email: emailOther,
        name: 'Other Mentor',
        headline: 'Engineering Manager',
        bio: 'Engineering Manager at Meta with extensive leadership coaching experience.',
        domain: 'ENGINEERING',
        company: 'Meta',
        status: 'APPROVED',
        bookingVersion: 1,
      },
    });

    service45 = await db.mentorshipService.create({
      data: {
        mentorId: mentorPriya.id,
        title: 'System Design Mock Interview',
        description: 'Comprehensive 45-minute technical mentorship interview',
        category: 'CAREER_DIRECTION',
        duration: 45,
        price: 1500,
        currency: 'INR',
        active: true,
      },
    });

    // Configure Recurring Availability: Mon-Fri (1-5) 09:00 - 17:00 IST
    for (let day = 1; day <= 5; day++) {
      await db.availabilityRule.create({
        data: {
          mentorId: mentorPriya.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          timezone: 'Asia/Kolkata',
          active: true,
        },
      });
    }

    // Exception: Unavailable on 2028-11-10
    await db.availabilityException.create({
      data: {
        mentorId: mentorPriya.id,
        date: '2028-11-10',
        type: 'UNAVAILABLE',
        reason: 'Conference Keynote',
      },
    });

    console.log('✓ Test fixtures configured successfully in MongoDB.');

    // -------------------------------------------------------------------------
    // TEST 1: Requesting a Reschedule from a Confirmed Booking & Schedule Preservation
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Requesting a Reschedule from a Confirmed Booking ---');

    // Slot 1 (Original Confirmed): Friday Nov 3, 2028, 09:00 - 09:45 IST (03:30 - 04:15 UTC)
    const slot1StartUtc = '2028-11-03T03:30:00.000Z';
    // Slot 2 (Replacement): Friday Nov 3, 2028, 09:45 - 10:30 IST (04:15 - 05:00 UTC)
    const slot2StartUtc = '2028-11-03T04:15:00.000Z';

    const bookingAlice = await BookingService.createBooking(candidateAlice.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: slot1StartUtc,
      timezone: 'Asia/Kolkata',
      studentNotes: 'Original discussion topics',
    });

    assert(bookingAlice.status === 'CONFIRMED', 'Initial booking is CONFIRMED');

    // Alice requests reschedule to Slot 2
    const rescheduleRequest = await BookingService.rescheduleBookingByCandidate(
      bookingAlice.id,
      candidateAlice.id,
      {
        scheduledStart: slot2StartUtc,
        timezone: 'Asia/Kolkata',
        studentNotes: 'Updated topics on distributed consensus',
      }
    );

    assert(rescheduleRequest.id === bookingAlice.id, 'Booking identity preserved');
    assert(rescheduleRequest.status === 'RESCHEDULE_REQUESTED', 'Status transitioned to RESCHEDULE_REQUESTED');
    assert(
      new Date(rescheduleRequest.scheduledStart).toISOString() === slot1StartUtc,
      'Original confirmed scheduledStart is RETAINED and NOT overwritten'
    );
    assert(
      new Date(rescheduleRequest.rescheduledStart!).toISOString() === slot2StartUtc,
      'Proposed replacement slot is stored in rescheduledStart'
    );
    assert(
      new Date(rescheduleRequest.rescheduledEnd!).toISOString() === '2028-11-03T05:00:00.000Z',
      'rescheduledEnd matches requested start + service duration'
    );
    assert(rescheduleRequest.canReschedule === false, 'canReschedule is false while awaiting mentor approval');
    assert(rescheduleRequest.canCancel === true, 'canCancel remains true during pending reschedule');
    assert(rescheduleRequest.meetingUrl === null, 'Meeting link is hidden while awaiting mentor review');

    // -------------------------------------------------------------------------
    // TEST 2: Slot Integrity While Reschedule is Pending
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Slot Integrity While Reschedule is Pending (Both Held) ---');

    const slotsPending = await AvailabilityService.getAvailableSlots({
      mentorId: mentorPriya.id,
      startDate: '2028-11-03',
      endDate: '2028-11-03',
      durationMinutes: 45,
      timezone: 'Asia/Kolkata',
    });

    const slot1AvailableDuringPending = slotsPending.some((s) => s.start === slot1StartUtc);
    const slot2AvailableDuringPending = slotsPending.some((s) => s.start === slot2StartUtc);

    assert(
      slot1AvailableDuringPending === false,
      'Original slot (Slot 1) remains occupied/held in availability discovery'
    );
    assert(
      slot2AvailableDuringPending === false,
      'Requested replacement slot (Slot 2) is also occupied/held in availability discovery'
    );

    // Another candidate (Bob) attempting to book Slot 2 during pending review is rejected
    let bobConflictErr = false;
    try {
      await BookingService.createBooking(candidateBob.id, {
        mentorId: mentorPriya.id,
        serviceId: service45.id,
        scheduledStart: slot2StartUtc,
        timezone: 'Asia/Kolkata',
      });
    } catch (e: any) {
      bobConflictErr = true;
    }
    assert(bobConflictErr === true, 'Concurrent candidate cannot book the held replacement slot (Slot 2)');

    // -------------------------------------------------------------------------
    // TEST 3: Rejecting a Reschedule Request & Restoring Original Schedule
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Rejecting a Reschedule Request & Restoring Original Schedule ---');

    // Mentor Priya rejects the reschedule request (wants to keep original time)
    const rejectedBooking = await BookingService.updateBookingStatus(
      bookingAlice.id,
      mentorPriya.id,
      {
        action: 'REJECT_RESCHEDULE',
        reason: 'Unable to accommodate 09:45; keeping original 09:00 slot',
      }
    );

    assert(rejectedBooking.status === 'CONFIRMED', 'Status reverts cleanly to CONFIRMED');
    assert(
      new Date(rejectedBooking.scheduledStart).toISOString() === slot1StartUtc,
      'Original confirmed start time remains intact after rejection'
    );
    assert(
      rejectedBooking.rescheduledStart === null || rejectedBooking.rescheduledStart === undefined,
      'rescheduledStart cleared on rejection'
    );
    assert(
      rejectedBooking.session?.meetingUrl !== null,
      'Session meetingUrl is restored for original confirmed slot'
    );

    // Verify candidate view after rejection
    const candidateViewAfterReject = await BookingService.getCandidateBookingDetail(
      bookingAlice.id,
      candidateAlice.id
    );
    assert(candidateViewAfterReject?.status === 'CONFIRMED', 'Candidate view shows CONFIRMED');
    assert(
      candidateViewAfterReject?.scheduledStart === slot1StartUtc,
      'Candidate view shows original scheduledStart'
    );
    assert(
      candidateViewAfterReject?.rescheduledStart === null,
      'Candidate view shows null rescheduledStart after rejection'
    );
    assert(
      candidateViewAfterReject?.canReschedule === true,
      'canReschedule is restored to true after rejection'
    );

    // -------------------------------------------------------------------------
    // TEST 4: Slot Availability After Rejection
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Slot Availability After Rejection (Replacement Released, Original Held) ---');

    const slotsAfterReject = await AvailabilityService.getAvailableSlots({
      mentorId: mentorPriya.id,
      startDate: '2028-11-03',
      endDate: '2028-11-03',
      durationMinutes: 45,
      timezone: 'Asia/Kolkata',
    });

    const slot1AvailableAfterReject = slotsAfterReject.some((s) => s.start === slot1StartUtc);
    const slot2AvailableAfterReject = slotsAfterReject.some((s) => s.start === slot2StartUtc);

    assert(
      slot1AvailableAfterReject === false,
      'Original slot (Slot 1) remains occupied by confirmed booking'
    );
    assert(
      slot2AvailableAfterReject === true,
      'Rejected replacement slot (Slot 2) is immediately released and available again'
    );

    // Candidate Bob can now book Slot 2
    const bookingBob = await BookingService.createBooking(candidateBob.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: slot2StartUtc,
      timezone: 'Asia/Kolkata',
    });
    assert(bookingBob.status === 'CONFIRMED', 'Bob successfully booked released Slot 2');

    // -------------------------------------------------------------------------
    // TEST 5: Approving a Reschedule Request & Synchronizing Session
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Approving a Reschedule Request & Synchronizing Session ---');

    // Slot 3: Friday Nov 3, 2028, 10:30 - 11:15 IST (05:00 - 05:45 UTC)
    const slot3StartUtc = '2028-11-03T05:00:00.000Z';

    // Alice requests reschedule from Slot 1 to Slot 3
    await BookingService.rescheduleBookingByCandidate(bookingAlice.id, candidateAlice.id, {
      scheduledStart: slot3StartUtc,
      timezone: 'Asia/Kolkata',
    });

    // Mentor approves the reschedule to Slot 3
    const approvedBooking = await BookingService.updateBookingStatus(
      bookingAlice.id,
      mentorPriya.id,
      {
        action: 'APPROVE_RESCHEDULE',
      }
    );

    assert(approvedBooking.status === 'CONFIRMED', 'Status is CONFIRMED upon approval');
    assert(
      new Date(approvedBooking.scheduledStart).toISOString() === slot3StartUtc,
      'scheduledStart updated to replacement slot (Slot 3)'
    );
    assert(
      approvedBooking.rescheduledStart === null || approvedBooking.rescheduledStart === undefined,
      'rescheduledStart cleared upon approval'
    );
    assert(
      approvedBooking.session?.meetingUrl !== null,
      'Session meetingUrl is active for approved new slot'
    );

    // Verify availability after approval: Slot 1 is now released! Slot 3 is held!
    const slotsAfterApproval = await AvailabilityService.getAvailableSlots({
      mentorId: mentorPriya.id,
      startDate: '2028-11-03',
      endDate: '2028-11-03',
      durationMinutes: 45,
      timezone: 'Asia/Kolkata',
    });

    const slot1AvailableAfterApproval = slotsAfterApproval.some((s) => s.start === slot1StartUtc);
    const slot3AvailableAfterApproval = slotsAfterApproval.some((s) => s.start === slot3StartUtc);

    assert(slot1AvailableAfterApproval === true, 'Original Slot 1 is freed upon approval of Slot 3');
    assert(slot3AvailableAfterApproval === false, 'New Slot 3 is occupied by approved booking');

    // -------------------------------------------------------------------------
    // TEST 6: Repeated and Unauthorized Mentor Actions
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Repeated and Unauthorized Mentor Actions ---');

    // 6.1 Repeated approval on already-confirmed booking
    let repeatedApprovalErr = false;
    let repeatedStatusCode = 0;
    try {
      await BookingService.updateBookingStatus(bookingAlice.id, mentorPriya.id, {
        action: 'APPROVE_RESCHEDULE',
      });
    } catch (e: any) {
      repeatedApprovalErr = e.message.includes('not awaiting reschedule approval');
      repeatedStatusCode = e.statusCode;
    }
    assert(repeatedApprovalErr === true, 'Stale approval returns error');
    assert(repeatedStatusCode === 409, 'Returns HTTP 409 Conflict on repeated/stale approval');

    // 6.2 Repeated rejection on already-confirmed booking
    let repeatedRejectErr = false;
    try {
      await BookingService.updateBookingStatus(bookingAlice.id, mentorPriya.id, {
        action: 'REJECT_RESCHEDULE',
      });
    } catch (e: any) {
      repeatedRejectErr = e.message.includes('not awaiting reschedule approval');
    }
    assert(repeatedRejectErr === true, 'Stale rejection returns HTTP 409 Conflict');

    // 6.3 Unauthorized mentor attempting action on Alice's booking
    let unauthorizedMentorErr = false;
    let unauthorizedStatusCode = 0;
    try {
      await BookingService.updateBookingStatus(bookingAlice.id, mentorOther.id, {
        status: 'CONFIRMED',
      });
    } catch (e: any) {
      unauthorizedMentorErr = e.message.includes('unauthorized') || e.message.includes('not found');
      unauthorizedStatusCode = e.statusCode;
    }
    assert(unauthorizedMentorErr === true, 'Unauthorized mentor cannot modify booking');
    assert(unauthorizedStatusCode === 403, 'Returns HTTP 403 Forbidden for unauthorized mentor');

    // -------------------------------------------------------------------------
    // TEST 7: Concurrent Approval and Cancellation Racing
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Concurrent Approval and Cancellation Racing ---');

    // Create a fresh booking for Charlie at Slot 4 (11:15 - 12:00 IST / 05:45 - 06:30 UTC)
    const slot4StartUtc = '2028-11-03T05:45:00.000Z';
    // Slot 5 (Replacement): 12:00 - 12:45 IST (06:30 - 07:15 UTC)
    const slot5StartUtc = '2028-11-03T06:30:00.000Z';

    const bookingCharlie = await BookingService.createBooking(candidateCharlie.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: slot4StartUtc,
      timezone: 'Asia/Kolkata',
    });

    // Charlie requests reschedule to Slot 5
    await BookingService.rescheduleBookingByCandidate(bookingCharlie.id, candidateCharlie.id, {
      scheduledStart: slot5StartUtc,
      timezone: 'Asia/Kolkata',
    });

    // Concurrently issue: Mentor Approves vs Candidate Cancels
    const [approvalResult, cancellationResult] = await Promise.allSettled([
      BookingService.updateBookingStatus(bookingCharlie.id, mentorPriya.id, {
        action: 'APPROVE_RESCHEDULE',
      }),
      BookingService.cancelBookingByCandidate(
        bookingCharlie.id,
        candidateCharlie.id,
        'Decided to cancel while pending'
      ),
    ]);

    const finalCharlie = await db.booking.findUnique({
      where: { id: bookingCharlie.id },
      include: { session: true },
    });

    assert(
      finalCharlie!.status === 'CANCELLED_BY_CANDIDATE' || finalCharlie!.status === 'CONFIRMED',
      'Booking resolved to a deterministic final state'
    );

    if (finalCharlie!.status === 'CANCELLED_BY_CANDIDATE') {
      assert(finalCharlie!.session?.status === 'CANCELLED', 'Session status matches cancelled booking');
      assert(finalCharlie!.session?.meetingUrl === null, 'Session meeting link revoked on cancellation');
      assert(finalCharlie!.rescheduledStart === null, 'Replacement slot cleared on cancellation');
    }

    // -------------------------------------------------------------------------
    // TEST 8: Full IDOR and Ineligible Checks
    // -------------------------------------------------------------------------
    console.log('\n--- 8. IDOR & Ineligibility Checks ---');

    let idorErr = false;
    try {
      await BookingService.rescheduleBookingByCandidate(bookingAlice.id, candidateBob.id, {
        scheduledStart: slot1StartUtc,
        timezone: 'Asia/Kolkata',
      });
    } catch (e: any) {
      idorErr = e.statusCode === 403;
    }
    assert(idorErr === true, 'Bob cannot reschedule Alice booking (IDOR prevented)');

    // -------------------------------------------------------------------------
    // TEST 9: Availability Overlap Boundaries Matrix (start < existingEnd && end > existingStart)
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Availability Overlap Boundaries Matrix ---');

    // Thursday Nov 9, 2028 availability: 09:00 - 17:00 IST (03:30 - 11:30 UTC)
    // 9.1 Adjacent boundary: Slot starts exactly when existing booking ends (bEnd === slotStart)
    const slot9_1_Start = '2028-11-09T03:30:00.000Z'; // 09:00 - 09:45 IST
    const slot9_2_Start = '2028-11-09T04:15:00.000Z'; // 09:45 - 10:30 IST (starts exactly at 04:15)

    const booking9_1 = await BookingService.createBooking(candidateAlice.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: slot9_1_Start,
      timezone: 'Asia/Kolkata',
    });
    assert(booking9_1.status === 'CONFIRMED', 'Base booking for adjacent boundary test created');

    const booking9_2 = await BookingService.createBooking(candidateBob.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: slot9_2_Start,
      timezone: 'Asia/Kolkata',
    });
    assert(
      booking9_2.status === 'CONFIRMED',
      'Booking starting exactly when another booking ends is permitted (start === existingEnd is NOT an overlap)'
    );

    // 9.2 Adjacent boundary: Slot ends exactly when existing booking starts (slotEnd === bStart)
    const slot9_3_Start = '2028-11-09T05:45:00.000Z'; // 11:15 - 12:00 IST
    const slot9_4_Start = '2028-11-09T05:00:00.000Z'; // 10:30 - 11:15 IST (ends exactly at 05:45)

    const booking9_3 = await BookingService.createBooking(candidateCharlie.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: slot9_3_Start,
      timezone: 'Asia/Kolkata',
    });
    assert(booking9_3.status === 'CONFIRMED', 'Base booking 9.3 created');

    const booking9_4 = await BookingService.createBooking(candidateDave.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: slot9_4_Start,
      timezone: 'Asia/Kolkata',
    });
    assert(
      booking9_4.status === 'CONFIRMED',
      'Booking ending exactly when another booking starts is permitted (end === existingStart is NOT an overlap)'
    );

    // 9.3 Partial overlap (start < existingEnd && end > existingStart)
    // Attempting to book 11:00 - 11:45 IST (05:30 - 06:15 UTC) while 11:15 - 12:00 IST (05:45 - 06:30 UTC) exists
    let partialOverlapErr = false;
    try {
      await BookingService.createBooking(candidateAlice.id, {
        mentorId: mentorPriya.id,
        serviceId: service45.id,
        scheduledStart: '2028-11-09T05:30:00.000Z',
        timezone: 'Asia/Kolkata',
      });
    } catch {
      partialOverlapErr = true;
    }
    assert(partialOverlapErr === true, 'Partial overlap detected and rejected');

    // 9.4 Full enclosure (attempting to book a slot that is completely enclosed or encloses another)
    let enclosedErr = false;
    try {
      await BookingService.rescheduleBookingByCandidate(booking9_1.id, candidateAlice.id, {
        scheduledStart: '2028-11-09T05:45:00.000Z',
        timezone: 'Asia/Kolkata',
      });
    } catch {
      enclosedErr = true;
    }
    assert(enclosedErr === true, 'Enclosing interval overlap detected and rejected for reschedule');

    // 9.5 Cancelled bookings do NOT block availability
    await BookingService.cancelBookingByCandidate(
      booking9_2.id,
      candidateBob.id,
      'Cancelled to test slot release'
    );
    const slotsAfterCancel9_2 = await AvailabilityService.getAvailableSlots({
      mentorId: mentorPriya.id,
      startDate: '2028-11-09',
      endDate: '2028-11-09',
      durationMinutes: 45,
      timezone: 'Asia/Kolkata',
    });
    const isSlot9_2Available = slotsAfterCancel9_2.some((s) => s.start === slot9_2_Start);
    assert(isSlot9_2Available === true, 'Cancelled booking (09:45) is released and available for booking');

    // -------------------------------------------------------------------------
    // TEST 10: Meeting URL and Session Lifecycle Matrix
    // -------------------------------------------------------------------------
    console.log('\n--- 10. Meeting URL and Session Lifecycle Matrix ---');

    // 10.1 Active confirmed booking has meeting URL
    const activeBooking = await BookingService.createBooking(candidateDave.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: '2028-11-09T07:00:00.000Z', // 12:30 - 13:15 IST
      timezone: 'Asia/Kolkata',
    });
    assert(activeBooking.session?.meetingUrl !== null, 'Confirmed booking generates active meetingUrl');
    assert(activeBooking.session?.status === 'SCHEDULED', 'Confirmed booking initializes session as SCHEDULED');

    // 10.2 Reschedule request revokes meeting URL
    await BookingService.rescheduleBookingByCandidate(activeBooking.id, candidateDave.id, {
      scheduledStart: '2028-11-09T07:45:00.000Z', // 13:15 - 14:00 IST
      timezone: 'Asia/Kolkata',
    });
    const sessionDavePending = await db.mentorshipSession.findUnique({
      where: { bookingId: activeBooking.id },
    });
    assert(sessionDavePending?.meetingUrl === null, 'Session meeting link revoked while awaiting reschedule approval');
    assert(sessionDavePending?.status === 'SCHEDULED', 'Session status remains SCHEDULED while pending');

    // 10.3 Mentor rejection restores valid meeting URL for original schedule
    const rejectedDave = await BookingService.updateBookingStatus(activeBooking.id, mentorPriya.id, {
      action: 'REJECT_RESCHEDULE',
      reason: 'Schedule conflict in afternoon',
    });
    const sessionDaveAfterReject = await db.mentorshipSession.findUnique({
      where: { bookingId: activeBooking.id },
    });
    assert(sessionDaveAfterReject?.meetingUrl !== null, 'Session meeting link restored upon mentor rejection');
    assert(
      sessionDaveAfterReject?.meetingUrl?.startsWith('https://meet.pathway.eco/'),
      'Restored meetingUrl is a valid pathway meeting URL'
    );
    assert(rejectedDave.cancellationReason === 'Schedule conflict in afternoon', 'Rejection reason recorded');

    // 10.4 Candidate cancellation revokes meeting URL and sets session CANCELLED
    await BookingService.cancelBookingByCandidate(activeBooking.id, candidateDave.id, 'Candidate decided to cancel');
    const sessionDaveCancelled = await db.mentorshipSession.findUnique({
      where: { bookingId: activeBooking.id },
    });
    assert(sessionDaveCancelled?.status === 'CANCELLED', 'Session status is CANCELLED on candidate cancellation');
    assert(sessionDaveCancelled?.meetingUrl === null, 'Session meetingUrl is null on candidate cancellation');

    // -------------------------------------------------------------------------
    // TEST 11: Reschedule Request Transition to CANCELLED_BY_MENTOR
    // -------------------------------------------------------------------------
    console.log('\n--- 11. Reschedule Request Transition to CANCELLED_BY_MENTOR ---');

    const slot11_orig = '2028-11-09T08:00:00.000Z'; // 13:30 - 14:15 IST
    const slot11_target = '2028-11-09T08:45:00.000Z'; // 14:15 - 15:00 IST

    const booking11 = await BookingService.createBooking(candidateAlice.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: slot11_orig,
      timezone: 'Asia/Kolkata',
    });

    await BookingService.rescheduleBookingByCandidate(booking11.id, candidateAlice.id, {
      scheduledStart: slot11_target,
      timezone: 'Asia/Kolkata',
    });

    // Mentor cancels the booking while reschedule is pending
    const mentorCancelledBooking = await BookingService.updateBookingStatus(booking11.id, mentorPriya.id, {
      action: 'CANCEL',
      reason: 'Mentor emergency leave',
    });

    assert(mentorCancelledBooking.status === 'CANCELLED_BY_MENTOR', 'Status is CANCELLED_BY_MENTOR');
    assert(mentorCancelledBooking.rescheduledStart === null, 'rescheduledStart cleared on mentor cancellation');
    assert(mentorCancelledBooking.rescheduledEnd === null, 'rescheduledEnd cleared on mentor cancellation');

    const session11 = await db.mentorshipSession.findUnique({
      where: { bookingId: booking11.id },
    });
    assert(session11?.status === 'CANCELLED', 'Session status is CANCELLED on mentor cancellation');
    assert(session11?.meetingUrl === null, 'Session meeting link is revoked on mentor cancellation');

    // Verify both original and replacement slots are freed
    const slotsAfterMentorCancel = await AvailabilityService.getAvailableSlots({
      mentorId: mentorPriya.id,
      startDate: '2028-11-09',
      endDate: '2028-11-09',
      durationMinutes: 45,
      timezone: 'Asia/Kolkata',
    });
    assert(
      slotsAfterMentorCancel.some((s) => s.start === slot11_orig) === true,
      'Original slot is released after mentor cancellation'
    );
    assert(
      slotsAfterMentorCancel.some((s) => s.start === slot11_target) === true,
      'Proposed replacement slot is released after mentor cancellation'
    );

    // -------------------------------------------------------------------------
    // TEST 12: Race Condition: Two Candidates Requesting Same Replacement Slot
    // -------------------------------------------------------------------------
    console.log('\n--- 12. Concurrency: Two Candidates Competing for Same Replacement Slot ---');

    const slot12_target = '2028-11-17T05:00:00.000Z'; // 10:30 - 11:15 IST
    const slot12_b1 = '2028-11-17T03:30:00.000Z'; // 09:00 - 09:45 IST
    const slot12_b2 = '2028-11-17T04:15:00.000Z'; // 09:45 - 10:30 IST

    // Bob creates a booking
    const bookingBobRace = await BookingService.createBooking(candidateBob.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: slot12_b1,
      timezone: 'Asia/Kolkata',
    });

    // Charlie creates a booking
    const bookingCharlieRace = await BookingService.createBooking(candidateCharlie.id, {
      mentorId: mentorPriya.id,
      serviceId: service45.id,
      scheduledStart: slot12_b2,
      timezone: 'Asia/Kolkata',
    });

    // Bob and Charlie simultaneously request reschedule to slot12_target
    const [reschedBobResult, reschedCharlieResult] = await Promise.allSettled([
      BookingService.rescheduleBookingByCandidate(bookingBobRace.id, candidateBob.id, {
        scheduledStart: slot12_target,
        timezone: 'Asia/Kolkata',
      }),
      BookingService.rescheduleBookingByCandidate(bookingCharlieRace.id, candidateCharlie.id, {
        scheduledStart: slot12_target,
        timezone: 'Asia/Kolkata',
      }),
    ]);

    const bobFulfilled = reschedBobResult.status === 'fulfilled';
    const charlieFulfilled = reschedCharlieResult.status === 'fulfilled';

    // Exactly one must succeed, the other must be rejected due to serialization on Mentor.bookingVersion
    assert(
      (bobFulfilled && !charlieFulfilled) || (!bobFulfilled && charlieFulfilled),
      'Exactly one candidate succeeds in claiming the replacement slot under concurrency'
    );

    // -------------------------------------------------------------------------
    // TEST 13: Transaction Rollback Integrity
    // -------------------------------------------------------------------------
    console.log('\n--- 13. Transaction Rollback Integrity ---');

    const mentorBeforeVersion = (await db.mentor.findUnique({ where: { id: mentorPriya.id } }))?.bookingVersion;

    let txRollbackError = false;
    try {
      await db.$transaction(async (tx) => {
        // Step 1: Update mentor booking version
        await tx.mentor.update({
          where: { id: mentorPriya.id },
          data: { bookingVersion: { increment: 999 } },
        });

        // Step 2: Create a dummy booking record
        await tx.booking.create({
          data: {
            mentorId: mentorPriya.id,
            candidateId: candidateAlice.id,
            serviceId: service45.id,
            scheduledStart: new Date('2029-01-01T10:00:00.000Z'),
            scheduledEnd: new Date('2029-01-01T10:45:00.000Z'),
            timezone: 'Asia/Kolkata',
            status: 'CONFIRMED',
          },
        });

        // Step 3: Simulate intentional failure before completion
        throw new Error('SIMULATED_TRANSACTION_FAILURE');
      });
    } catch (err: any) {
      txRollbackError = err.message === 'SIMULATED_TRANSACTION_FAILURE';
    }

    assert(txRollbackError === true, 'Transaction failure caught');

    const mentorAfterVersion = (await db.mentor.findUnique({ where: { id: mentorPriya.id } }))?.bookingVersion;
    assert(
      mentorAfterVersion === mentorBeforeVersion,
      'Mentor bookingVersion is NOT incremented when transaction aborts (atomic rollback)'
    );

    const rollbackBookingCheck = await db.booking.findFirst({
      where: {
        mentorId: mentorPriya.id,
        scheduledStart: new Date('2029-01-01T10:00:00.000Z'),
      },
    });
    assert(rollbackBookingCheck === null, 'No phantom/uncommitted booking created on transaction failure');

    console.log('\n--- Cleaning Up Integration Test Artifacts ---');
    try {
      if (mentorPriya) {
        await db.mentorshipSession.deleteMany({ where: { mentorId: mentorPriya.id } });
        await db.booking.deleteMany({ where: { mentorId: mentorPriya.id } });
        await db.availabilityException.deleteMany({ where: { mentorId: mentorPriya.id } });
        await db.availabilityRule.deleteMany({ where: { mentorId: mentorPriya.id } });
        await db.mentorshipService.deleteMany({ where: { mentorId: mentorPriya.id } });
        await db.mentor.delete({ where: { id: mentorPriya.id } });
      }
      if (mentorOther) {
        await db.mentor.delete({ where: { id: mentorOther.id } });
      }
      if (candidateAlice) await db.user.delete({ where: { id: candidateAlice.id } });
      if (candidateBob) await db.user.delete({ where: { id: candidateBob.id } });
      if (candidateCharlie) await db.user.delete({ where: { id: candidateCharlie.id } });
      if (candidateDave) await db.user.delete({ where: { id: candidateDave.id } });
      console.log('✓ Database artifacts cleaned up.');
    } catch (e: any) {
      console.warn('Cleanup error (ignored):', e.message);
    }
  } catch (err: any) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runCandidateBookingRescheduleTests().catch((e) => {
  console.error('Unhandled failure:', e);
  process.exit(1);
});
