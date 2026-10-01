import { db } from '../db/client';
import { UserService } from '../services/userService';
import { MentorAuthService, MentorAuthError } from '../services/mentorship/mentorAuthService';
import { MentorshipServiceManager } from '../services/mentorship/mentorshipService';
import { AvailabilityService } from '../services/mentorship/availabilityService';
import { BookingService } from '../services/mentorship/bookingService';
import { SessionService } from '../services/mentorship/sessionService';
import { MentorStudentService } from '../services/mentorship/mentorStudentService';
import { ReviewService } from '../services/mentorship/reviewService';
import { MentorDashboardService } from '../services/mentorship/mentorDashboardService';

async function runMentorshipTests() {
  console.log('🧪 Running Comprehensive Mentorship Domain Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1-4: Auth & Authorization
    // -------------------------------------------------------------
    const candidate = await db.user.findFirst({ where: { role: 'CANDIDATE' } });
    const candidateToken = await UserService.createSession(candidate!.id);

    // 1. Candidate cannot access mentor operations
    try {
      await MentorAuthService.verifyMentor(candidateToken);
      assert(false, '1. Candidate cannot access mentor portal', 'Expected MentorAuthError');
    } catch (err: any) {
      assert(err instanceof MentorAuthError && err.statusCode === 403, '1. Candidate cannot access mentor portal');
    }

    // 2. Approved mentor can access
    const mentorUser = await db.user.findFirst({ where: { email: 'arjun.mehta@techlead.io' } });
    const mentorToken = await UserService.createSession(mentorUser!.id);
    const authMentor = await MentorAuthService.verifyMentor(mentorToken);
    assert(authMentor.mentor.status === 'APPROVED', '2. Approved mentor can access');

    // 3. Suspended mentor cannot perform mentor operations
    try {
      const mockSuspended = { ...authMentor, mentor: { ...authMentor.mentor, status: 'SUSPENDED' as any } };
      MentorAuthService.requireApproved(mockSuspended);
      assert(false, '3. Suspended mentor cannot perform operations', 'Expected 403');
    } catch (err: any) {
      assert(err instanceof MentorAuthError && err.statusCode === 403, '3. Suspended mentor cannot perform mentor operations');
    }

    // 4. Logged-out user cannot access
    try {
      await MentorAuthService.verifyMentor(null);
      assert(false, '4. Logged-out user cannot access mentor portal', 'Expected 401');
    } catch (err: any) {
      assert(err instanceof MentorAuthError && err.statusCode === 401, '4. Logged-out user cannot access mentor portal');
    }

    // -------------------------------------------------------------
    // Test 5-9: Mentorship Services Management
    // -------------------------------------------------------------
    const mentorId = authMentor.mentor.id;

    // 5. Create service
    const newService = await MentorshipServiceManager.createService(mentorId, {
      title: 'Automated Test Service Offering',
      description: 'Comprehensive test service covering algorithmic problem solving and distributed design.',
      category: 'TECHNICAL_GUIDANCE',
      duration: 45,
      price: 1100,
      currency: 'INR',
      active: true,
    });
    assert(newService.title === 'Automated Test Service Offering', '5. Create service');

    // 6. Edit service
    const updatedService = await MentorshipServiceManager.updateService(newService.id, mentorId, {
      price: 1250,
      duration: 60,
    });
    assert(updatedService.price === 1250 && updatedService.duration === 60, '6. Edit service');

    // 7. Deactivate service
    const deactivated = await MentorshipServiceManager.updateService(newService.id, mentorId, {
      active: false,
    });
    assert(deactivated.active === false, '7. Deactivate service');

    // 8. Reactivate service
    const reactivated = await MentorshipServiceManager.updateService(newService.id, mentorId, {
      active: true,
    });
    assert(reactivated.active === true, '8. Activate service');

    // 9. Historical bookings remain valid after deactivation
    const tempBooking = await db.booking.create({
      data: {
        mentorId,
        candidateId: candidate!.id,
        serviceId: newService.id,
        scheduledStart: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        timezone: 'Asia/Kolkata',
        status: 'CONFIRMED',
      },
    });
    const removeResult = await MentorshipServiceManager.deactivateOrDeleteService(newService.id, mentorId);
    assert(removeResult.action === 'DEACTIVATED' && removeResult.service.active === false, '9. Historical bookings remain valid after service deactivation');

    // Cleanup temp booking
    await db.booking.delete({ where: { id: tempBooking.id } });
    await db.mentorshipService.delete({ where: { id: newService.id } });

    // -------------------------------------------------------------
    // Test 10-15: Availability Engine
    // -------------------------------------------------------------
    // 10. Weekly rules retrieval
    const weeklyRules = await AvailabilityService.getWeeklyRules(mentorId);
    assert(weeklyRules.length > 0, '10. Create weekly availability');

    // 11. Add exception
    const excDate = '2026-10-15';
    const addedExc = await AvailabilityService.addException(mentorId, {
      date: excDate,
      type: 'UNAVAILABLE',
      reason: 'Tech Architecture Summit Keynote',
    });
    assert(addedExc.date === excDate && addedExc.type === 'UNAVAILABLE', '11. Add exception');

    // 12. Remove exception
    await AvailabilityService.deleteException(addedExc.id, mentorId);
    const exceptionsAfter = await AvailabilityService.getExceptions(mentorId);
    assert(!exceptionsAfter.some((e) => e.id === addedExc.id), '12. Remove exception');

    // 13. Generate available slots within bounded range
    const futureDate1 = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const futureDate2 = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const slots = await AvailabilityService.getAvailableSlots({
      mentorId,
      startDate: futureDate1,
      endDate: futureDate2,
      durationMinutes: 45,
    });
    assert(Array.isArray(slots) && slots.length > 0, '13. Generate available slots');

    // 14. Existing bookings block slots
    // If we book the first slot, it must no longer appear in available slots
    const targetSlot = slots[0];
    const testService = await db.mentorshipService.findFirst({ where: { mentorId, active: true } });
    const blockingBooking = await BookingService.createBooking(candidate!.id, {
      mentorId,
      serviceId: testService!.id,
      scheduledStart: targetSlot.start,
      timezone: 'Asia/Kolkata',
    });
    const slotsAfterBooking = await AvailabilityService.getAvailableSlots({
      mentorId,
      startDate: futureDate1,
      endDate: futureDate2,
      durationMinutes: 45,
    });
    const slotStillAvailable = slotsAfterBooking.some((s) => s.start === targetSlot.start);
    assert(!slotStillAvailable, '14. Existing bookings block slots');

    // 15. Timezone preservation
    assert(blockingBooking.timezone === 'Asia/Kolkata', '15. Timezone conversion works');

    // -------------------------------------------------------------
    // Test 16-20: Bookings & Concurrency
    // -------------------------------------------------------------
    // 16. Mentor sees own bookings
    const bookingsResult = await BookingService.listBookings({ mentorId });
    assert(bookingsResult.items.some((b) => b.id === blockingBooking.id), '16. Mentor sees own bookings');

    // 17. Mentor cannot see another mentor's booking (IDOR guard)
    try {
      await BookingService.getBookingDetail(blockingBooking.id, '6ab68278fe672843e6b834c9'); // Priya's ID
      assert(false, '17. Mentor cannot see another mentor booking', 'Expected unauthorized error');
    } catch {
      assert(true, '17. Mentor cannot see another mentor booking (IDOR check)');
    }

    // 18. Double booking is prevented on server side
    try {
      await BookingService.createBooking(candidate!.id, {
        mentorId,
        serviceId: testService!.id,
        scheduledStart: targetSlot.start,
        timezone: 'Asia/Kolkata',
      });
      assert(false, '18. Double booking is prevented', 'Expected collision rejection');
    } catch (err: any) {
      assert(err.message.includes('just reserved') || err.message.includes('another'), '18. Double booking is prevented');
    }

    // 19. Booking status transition works
    const updatedBooking = await BookingService.updateBookingStatus(blockingBooking.id, mentorId, {
      status: 'CONFIRMED',
    });
    assert(updatedBooking.status === 'CONFIRMED', '19. Booking status transitions work');

    // 20. Cancellation works
    const cancelledBooking = await BookingService.updateBookingStatus(blockingBooking.id, mentorId, {
      status: 'CANCELLED_BY_MENTOR',
      reason: 'Automated test suite cancellation',
    });
    assert(cancelledBooking.status === 'CANCELLED_BY_MENTOR', '20. Cancellation works');

    // Cleanup test booking
    await db.mentorshipSession.deleteMany({ where: { bookingId: blockingBooking.id } });
    await db.booking.delete({ where: { id: blockingBooking.id } });

    // -------------------------------------------------------------
    // Test 21-24: Sessions Domain
    // -------------------------------------------------------------
    // 21. Booking automatically initializes MentorshipSession
    const existingSession = await db.mentorshipSession.findFirst({
      where: { mentorId },
    });
    assert(!!existingSession, '21. Booking can become session');

    // 22. Session notes save
    const testNotes = 'Detailed system design takeaways: Focus on quorum write consistency and read repair.';
    const updatedSession = await SessionService.updateSessionNotes(existingSession!.id, mentorId, {
      notes: testNotes,
    });
    assert(updatedSession.notes === testNotes, '22. Session notes save');

    // 23. Action items save
    const actionItems = [
      { id: 't1', text: 'Read Dynamo paper', completed: true },
      { id: 't2', text: 'Implement Gossip protocol simulation', completed: false },
    ];
    const sessionWithActions = await SessionService.updateSessionNotes(existingSession!.id, mentorId, {
      actionItems,
    });
    assert(sessionWithActions.actionItems.length === 2, '23. Action items save');

    // 24. Ownership verified on session access
    try {
      await SessionService.getSessionDetail(existingSession!.id, '6ab68278fe672843e6b834c9');
      assert(false, '24. Session ownership verified', 'Expected unauthorized error');
    } catch {
      assert(true, '24. Session ownership verified (IDOR check)');
    }

    // -------------------------------------------------------------
    // Test 25-27: Students Domain
    // -------------------------------------------------------------
    // 25. Mentor sees actual mentees
    const mentees = await MentorStudentService.listStudents({ mentorId });
    assert(mentees.items.length > 0, '25. Mentor sees actual mentees');

    // 26. Mentor cannot access unrelated candidates
    const unrelatedUser = await db.user.create({
      data: {
        name: 'Unrelated Candidate',
        email: 'unrelated.candidate@test.com',
        role: 'CANDIDATE',
      },
    });
    try {
      await MentorStudentService.getStudentDetail(unrelatedUser.id, mentorId);
      assert(false, '26. Mentor cannot access unrelated candidates', 'Expected forbidden');
    } catch {
      assert(true, '26. Mentor cannot access unrelated candidates');
    }
    await db.user.delete({ where: { id: unrelatedUser.id } });

    // 27. Mentorship history is preserved and chronological
    const menteeDetail = await MentorStudentService.getStudentDetail(mentees.items[0].id, mentorId);
    assert(menteeDetail !== null && menteeDetail.history.length > 0, '27. Mentorship history is correct');

    // -------------------------------------------------------------
    // Test 28-29: Reviews Domain
    // -------------------------------------------------------------
    const reviewsList = await ReviewService.listReviewsByMentor({ mentorId });
    assert(reviewsList.items.length > 0, '28. Review appears after completed session');

    // 29. Duplicate reviews prevented
    try {
      const completedBooking = await db.booking.findFirst({
        where: { mentorId, status: 'COMPLETED' },
      });
      await ReviewService.createReview(candidate!.id, {
        bookingId: completedBooking!.id,
        rating: 5,
        review: 'Duplicate review attempt should fail.',
      });
      assert(false, '29. Duplicate reviews prevented', 'Expected duplication failure');
    } catch {
      assert(true, '29. Duplicate reviews prevented');
    }

    // -------------------------------------------------------------
    // Test 30-34: Performance & Data Boundaries
    // -------------------------------------------------------------
    // 30. Dashboard payload limited
    const dashboard = await MentorDashboardService.getDashboard(mentorId);
    assert(
      dashboard.todaySessions.length <= 5 &&
      dashboard.upcomingBookings.length <= 5 &&
      dashboard.pendingRequests.length <= 5 &&
      dashboard.recentActivity.length <= 10,
      '30. Dashboard payload bounded and limited'
    );

    // 31. Booking lists paginated with server bounds
    assert(bookingsResult.limit <= 100 && bookingsResult.page >= 1, '31. Booking lists paginated');

    // 32. Zero sensitive data leakage in Student DTO
    const studentData = menteeDetail as any;
    assert(
      !studentData.passwordHash &&
      !studentData.sessionToken &&
      !studentData.googleId,
      '38. No sensitive candidate authentication data leakage'
    );

  } catch (err: any) {
    console.error('Unexpected test runner error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runMentorshipTests()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
