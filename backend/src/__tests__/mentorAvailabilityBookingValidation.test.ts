import { AsyncLocalStorage } from 'async_hooks';
(global as any).AsyncLocalStorage = AsyncLocalStorage;

import { db } from '../db/client';
import { UserService } from '../services/userService';
import { AvailabilityService, localToUtc, utcToLocalParts } from '../services/mentorship/availabilityService';
import { BookingService } from '../services/mentorship/bookingService';
import { SESSION_COOKIE_NAME } from '../auth/security';

async function runMentorAvailabilityBookingValidationTests() {
  console.log('⏰ Running Mentor Availability & Booking Validation Test Suite...\n');

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

  // Load Next.js request async storage and frontend route handler
  const { requestAsyncStorage } = require('next/dist/client/components/request-async-storage.external.js');
  const { NextRequest } = require('next/server');

  const bookRouteModule = await import('../../../frontend/src/app/api/mentors/book/route');
  const bookPOST = (bookRouteModule as any).POST || (bookRouteModule as any).default?.POST;

  async function invokeFrontendBookRoute(payload: Record<string, any>, sessionToken?: string) {
    const cookieStore = new Map<string, any>();
    if (sessionToken) {
      cookieStore.set(SESSION_COOKIE_NAME, { value: sessionToken });
    }

    const mockStorage = {
      cookies: {
        get: (name: string) => cookieStore.get(name),
        set: (name: string, value: string, opts: any) => cookieStore.set(name, { value, ...opts }),
      },
    };

    const response = await requestAsyncStorage.run(mockStorage, async () => {
      const req = new NextRequest('http://localhost:3000/api/mentors/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await bookPOST(req);
    });

    const json = await response.json();
    return { status: response.status, json };
  }

  const timestamp = Date.now();
  const candidateEmail = `candidate.avail.${timestamp}@pathway.eco`;
  const mentorEmailKolkata = `mentor.kolkata.${timestamp}@pathway.eco`;
  const mentorEmailNy = `mentor.ny.${timestamp}@pathway.eco`;
  const mentorEmailKathmandu = `mentor.kathmandu.${timestamp}@pathway.eco`;

  let testCandidate: any;
  let candidateToken: string | undefined;
  let kolkataMentor: any;
  let kolkataService30: any;
  let kolkataService60: any;
  let nyMentor: any;
  let nyService: any;
  let kathmanduMentor: any;
  let kathmanduService: any;

  try {
    // Setup test candidate
    testCandidate = await db.user.create({
      data: {
        email: candidateEmail,
        name: 'Availability Test Candidate',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });
    candidateToken = await UserService.createSession(testCandidate.id);

    // =========================================================================
    // 1. Asia/Kolkata local availability and UTC conversion
    // =========================================================================
    console.log('--- Phase 1: Asia/Kolkata Availability and Exact UTC Conversion ---');

    kolkataMentor = await db.mentor.create({
      data: {
        email: mentorEmailKolkata,
        name: 'Arjun Kolkata Mentor',
        status: 'APPROVED',
        headline: 'Lead Architect',
        bio: 'Distributed systems architect based in Bengaluru.',
        domain: 'SYSTEM_DESIGN',
        expertise: ['Distributed Systems'],
        startingPrice: 100,
      },
    });

    kolkataService30 = await db.mentorshipService.create({
      data: {
        mentorId: kolkataMentor.id,
        title: 'System Design 30min',
        description: '30-minute architecture review session',
        category: 'TECHNICAL_GUIDANCE',
        duration: 30,
        price: 50,
        active: true,
      },
    });

    kolkataService60 = await db.mentorshipService.create({
      data: {
        mentorId: kolkataMentor.id,
        title: 'Deep Dive 60min',
        description: '60-minute deep dive consultation',
        category: 'TECHNICAL_GUIDANCE',
        duration: 60,
        price: 100,
        active: true,
      },
    });

    // Configure weekly rule for Tuesday (day 2): 09:00 to 17:00 in Asia/Kolkata
    await db.availabilityRule.create({
      data: {
        mentorId: kolkataMentor.id,
        dayOfWeek: 2, // Tuesday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'Asia/Kolkata',
        active: true,
      },
    });

    // 2026-11-10 is a Tuesday
    const slotsKolkata = await AvailabilityService.getAvailableSlots({
      mentorId: kolkataMentor.id,
      startDate: '2026-11-10',
      endDate: '2026-11-10',
      durationMinutes: 30,
    });

    assert(
      slotsKolkata.length === 16,
      '1.1 Generates exact number of 30-min slots for 8-hour window (16 slots)',
      `Got ${slotsKolkata.length} slots`
    );

    // In Asia/Kolkata (UTC+5:30), 09:00 local time MUST correspond to 03:30:00.000Z UTC
    const firstSlot = slotsKolkata[0];
    assert(
      firstSlot.start === '2026-11-10T03:30:00.000Z',
      '1.2 First slot start is 03:30:00.000Z UTC (09:00 IST converted accurately)',
      `Got ${firstSlot.start}`
    );

    assert(
      firstSlot.end === '2026-11-10T04:00:00.000Z',
      '1.3 First slot end is 04:00:00.000Z UTC (09:30 IST)',
      `Got ${firstSlot.end}`
    );

    assert(
      firstSlot.displayTime === '09:00 - 09:30',
      '1.4 First slot displayTime displays in mentor local time (09:00 - 09:30)',
      `Got "${firstSlot.displayTime}"`
    );

    // Last slot (16th slot): 16:30 to 17:00 IST -> 11:00 to 11:30 UTC
    const lastSlot = slotsKolkata[slotsKolkata.length - 1];
    assert(
      lastSlot.start === '2026-11-10T11:00:00.000Z' && lastSlot.end === '2026-11-10T11:30:00.000Z',
      '1.5 Last slot finishes exactly at windowEndUtc (11:30:00.000Z UTC / 17:00 IST)',
      `Got ${lastSlot.start} -> ${lastSlot.end}`
    );

    // =========================================================================
    // 2. Non-whole-hour timezone offset (Asia/Kathmandu UTC+5:45)
    // =========================================================================
    console.log('\n--- Phase 2: Non-Whole-Hour Timezone (Asia/Kathmandu +5:45) ---');

    kathmanduMentor = await db.mentor.create({
      data: {
        email: mentorEmailKathmandu,
        name: 'Kathmandu Mentor',
        status: 'APPROVED',
        headline: 'Staff SRE',
        bio: 'SRE mentor in Kathmandu.',
        domain: 'DEVOPS',
        expertise: ['Kubernetes'],
        startingPrice: 120,
      },
    });

    kathmanduService = await db.mentorshipService.create({
      data: {
        mentorId: kathmanduMentor.id,
        title: 'Kubernetes Review',
        description: '45-min cluster architecture review',
        category: 'TECHNICAL_GUIDANCE',
        duration: 45,
        price: 80,
        active: true,
      },
    });

    // Tuesday: 10:00 to 13:00 in Asia/Kathmandu (UTC+5:45)
    // 10:00 NPT = 04:15 UTC. 13:00 NPT = 07:15 UTC.
    await db.availabilityRule.create({
      data: {
        mentorId: kathmanduMentor.id,
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '13:00',
        timezone: 'Asia/Kathmandu',
        active: true,
      },
    });

    const slotsKathmandu = await AvailabilityService.getAvailableSlots({
      mentorId: kathmanduMentor.id,
      startDate: '2026-11-10',
      endDate: '2026-11-10',
      durationMinutes: 45,
    });

    assert(
      slotsKathmandu.length === 4,
      '2.1 Generates 4 45-min slots for 3-hour window in Asia/Kathmandu',
      `Got ${slotsKathmandu.length} slots`
    );

    assert(
      slotsKathmandu[0].start === '2026-11-10T04:15:00.000Z',
      '2.2 Converts +5:45 offset correctly: 10:00 NPT is 04:15:00.000Z UTC',
      `Got ${slotsKathmandu[0].start}`
    );

    assert(
      slotsKathmandu[0].displayTime === '10:00 - 10:45',
      '2.3 displayTime formats correctly in NPT (10:00 - 10:45)',
      `Got "${slotsKathmandu[0].displayTime}"`
    );

    // =========================================================================
    // 3. Timezone with Daylight-Saving Transitions (America/New_York)
    // =========================================================================
    console.log('\n--- Phase 3: Daylight-Saving Transitions (EDT vs EST) ---');

    // Test summer (EDT, UTC-4) on 2026-07-15
    const edtUtc = localToUtc(2026, 7, 15, 9, 0, 'America/New_York');
    assert(
      edtUtc.toISOString() === '2026-07-15T13:00:00.000Z',
      '3.1 EDT local 09:00 converts to 13:00:00.000Z UTC (UTC-4)',
      `Got ${edtUtc.toISOString()}`
    );

    // Test winter (EST, UTC-5) on 2026-12-15
    const estUtc = localToUtc(2026, 12, 15, 9, 0, 'America/New_York');
    assert(
      estUtc.toISOString() === '2026-12-15T14:00:00.000Z',
      '3.2 EST local 09:00 converts to 14:00:00.000Z UTC (UTC-5, 1 hour difference from EDT)',
      `Got ${estUtc.toISOString()}`
    );

    // Nonexistent time during Spring Forward (March 8, 2026 02:30 EDT does not exist)
    const springForwardUtc = localToUtc(2026, 3, 8, 2, 30, 'America/New_York');
    const springForwardParts = utcToLocalParts(springForwardUtc, 'America/New_York');
    assert(
      springForwardParts.hour === 3 && springForwardParts.minute === 30,
      '3.3 Spring-forward gap resolves deterministically to post-transition time (03:30 EDT)',
      `Got ${springForwardParts.hour}:${springForwardParts.minute}`
    );

    // =========================================================================
    // 4. Slots near midnight and date boundaries
    // =========================================================================
    console.log('\n--- Phase 4: Slots Near Midnight and Date Boundaries ---');

    nyMentor = await db.mentor.create({
      data: {
        email: mentorEmailNy,
        name: 'New York Evening Mentor',
        status: 'APPROVED',
        headline: 'VP Engineering',
        bio: 'Engineering executive based in Manhattan.',
        domain: 'LEADERSHIP',
        expertise: ['Management'],
        startingPrice: 200,
      },
    });

    nyService = await db.mentorshipService.create({
      data: {
        mentorId: nyMentor.id,
        title: 'Executive Advisory',
        description: '45-min leadership session',
        category: 'LEADERSHIP',
        duration: 45,
        price: 150,
        active: true,
      },
    });

    // Tuesday evening: 21:00 to 23:00 in America/New_York (EST, UTC-5)
    // 21:00 EST on Tuesday 2026-11-10 is Wednesday 2026-11-11 at 02:00:00.000Z UTC!
    await db.availabilityRule.create({
      data: {
        mentorId: nyMentor.id,
        dayOfWeek: 2, // Tuesday
        startTime: '21:00',
        endTime: '23:00',
        timezone: 'America/New_York',
        active: true,
      },
    });

    const nySlots = await AvailabilityService.getAvailableSlots({
      mentorId: nyMentor.id,
      startDate: '2026-11-10',
      endDate: '2026-11-10',
      durationMinutes: 45,
    });

    assert(
      nySlots.length === 2,
      '4.1 Generates evening slots correctly',
      `Got ${nySlots.length} slots`
    );

    assert(
      nySlots[0].start === '2026-11-11T02:00:00.000Z',
      '4.2 Tuesday 21:00 EST correctly crosses UTC date boundary to Wednesday 02:00 UTC',
      `Got ${nySlots[0].start}`
    );

    assert(
      nySlots[0].date === '2026-11-10' && nySlots[0].displayTime === '21:00 - 21:45',
      '4.3 Slot is correctly labelled with local mentor date (2026-11-10) and local time (21:00 - 21:45)',
      `Got date: ${nySlots[0].date}, displayTime: ${nySlots[0].displayTime}`
    );

    // =========================================================================
    // 5. Booking validation: inside vs outside working hours
    // =========================================================================
    console.log('\n--- Phase 5: Booking Validation (Inside vs Outside Hours) ---');

    // 5.1 Valid booking inside working hours (Tuesday 10:00 IST = 04:30 UTC)
    const validBooking = await BookingService.createBooking(testCandidate.id, {
      mentorId: kolkataMentor.id,
      serviceId: kolkataService30.id,
      scheduledStart: '2026-11-10T04:30:00.000Z',
      timezone: 'Asia/Kolkata',
    });

    assert(
      validBooking.status === 'CONFIRMED' && validBooking.scheduledStart === '2026-11-10T04:30:00.000Z',
      '5.1 Booking inside working hours is confirmed',
      `Got status: ${validBooking.status}`
    );

    // 5.2 Booking too early (08:00 IST = 02:30 UTC, rule starts at 09:00 IST)
    try {
      await BookingService.createBooking(testCandidate.id, {
        mentorId: kolkataMentor.id,
        serviceId: kolkataService30.id,
        scheduledStart: '2026-11-10T02:30:00.000Z',
        timezone: 'Asia/Kolkata',
      });
      assert(false, '5.2 Booking before working hours should be rejected');
    } catch (err: any) {
      assert(
        err.message.includes('falls outside mentor\'s working hours'),
        '5.2 Booking before working hours is rejected with descriptive error',
        `Got: "${err.message}"`
      );
    }

    // 5.3 Booking too late (17:30 IST = 12:00 UTC, rule ends at 17:00 IST)
    try {
      await BookingService.createBooking(testCandidate.id, {
        mentorId: kolkataMentor.id,
        serviceId: kolkataService30.id,
        scheduledStart: '2026-11-10T12:00:00.000Z',
        timezone: 'Asia/Kolkata',
      });
      assert(false, '5.3 Booking after working hours should be rejected');
    } catch (err: any) {
      assert(
        err.message.includes('falls outside mentor\'s working hours'),
        '5.3 Booking after working hours is rejected with descriptive error',
        `Got: "${err.message}"`
      );
    }

    // 5.4 Booking on a day with no configured rules (e.g. Wednesday 2026-11-11)
    try {
      await BookingService.createBooking(testCandidate.id, {
        mentorId: kolkataMentor.id,
        serviceId: kolkataService30.id,
        scheduledStart: '2026-11-11T04:30:00.000Z',
        timezone: 'Asia/Kolkata',
      });
      assert(false, '5.4 Booking on day with no rules should be rejected');
    } catch (err: any) {
      assert(
        err.message.includes('has no configured availability on Wednesday'),
        '5.4 Booking on day without rules is rejected',
        `Got: "${err.message}"`
      );
    }

    // =========================================================================
    // 6. Booking interval extending beyond availability window
    // =========================================================================
    console.log('\n--- Phase 6: Booking Extending Beyond Availability Window ---');

    // Rule ends at 17:00 IST (11:30 UTC).
    // Start at 16:30 IST (11:00 UTC) with 60-minute service -> finishes at 17:30 IST (12:00 UTC).
    try {
      await BookingService.createBooking(testCandidate.id, {
        mentorId: kolkataMentor.id,
        serviceId: kolkataService60.id, // 60 minutes
        scheduledStart: '2026-11-10T11:00:00.000Z',
        timezone: 'Asia/Kolkata',
      });
      assert(false, '6.1 Booking extending beyond working hours should be rejected');
    } catch (err: any) {
      assert(
        err.message.includes('falls outside mentor\'s working hours'),
        '6.1 Booking extending past availability window is rejected',
        `Got: "${err.message}"`
      );
    }

    // =========================================================================
    // 7. Full-day unavailable exception
    // =========================================================================
    console.log('\n--- Phase 7: Full-Day Unavailable Exception ---');

    // Add blackout on 2026-11-17 (Tuesday)
    await AvailabilityService.addException(kolkataMentor.id, {
      date: '2026-11-17',
      type: 'UNAVAILABLE',
      reason: 'Tech Conference Keynote',
    });

    // Slots for that date must be 0
    const blackoutSlots = await AvailabilityService.getAvailableSlots({
      mentorId: kolkataMentor.id,
      startDate: '2026-11-17',
      endDate: '2026-11-17',
      durationMinutes: 30,
    });

    assert(
      blackoutSlots.length === 0,
      '7.1 No slots generated on full-day UNAVAILABLE exception date',
      `Got ${blackoutSlots.length} slots`
    );

    // Direct booking attempt on blackout date must fail
    try {
      await BookingService.createBooking(testCandidate.id, {
        mentorId: kolkataMentor.id,
        serviceId: kolkataService30.id,
        scheduledStart: '2026-11-17T04:30:00.000Z',
        timezone: 'Asia/Kolkata',
      });
      assert(false, '7.2 Booking attempt on blackout date should be rejected');
    } catch (err: any) {
      assert(
        err.message.includes('Mentor is unavailable on this date') && err.message.includes('Tech Conference Keynote'),
        '7.2 Booking on blackout date is rejected with reason',
        `Got: "${err.message}"`
      );
    }

    // =========================================================================
    // 8. Date-specific custom available hours
    // =========================================================================
    console.log('\n--- Phase 8: Date-Specific Custom Available Hours ---');

    // On 2026-11-24 (Tuesday), normal hours are 09:00 - 17:00.
    // Set custom hours: 12:00 to 14:00 IST (12:00 IST = 06:30 UTC, 14:00 IST = 08:30 UTC)
    await AvailabilityService.addException(kolkataMentor.id, {
      date: '2026-11-24',
      type: 'CUSTOM_HOURS',
      startTime: '12:00',
      endTime: '14:00',
      reason: 'Afternoon availability only',
    });

    const customSlots = await AvailabilityService.getAvailableSlots({
      mentorId: kolkataMentor.id,
      startDate: '2026-11-24',
      endDate: '2026-11-24',
      durationMinutes: 30,
    });

    assert(
      customSlots.length === 4,
      '8.1 Generates 4 30-min slots for custom hours 12:00 - 14:00',
      `Got ${customSlots.length} slots`
    );

    assert(
      customSlots[0].start === '2026-11-24T06:30:00.000Z' && customSlots[customSlots.length - 1].end === '2026-11-24T08:30:00.000Z',
      '8.2 Custom slots adhere to custom hours in UTC (06:30 - 08:30 UTC)'
    );

    // Booking outside custom hours on that day (09:00 IST = 03:30 UTC) must be rejected
    try {
      await BookingService.createBooking(testCandidate.id, {
        mentorId: kolkataMentor.id,
        serviceId: kolkataService30.id,
        scheduledStart: '2026-11-24T03:30:00.000Z',
        timezone: 'Asia/Kolkata',
      });
      assert(false, '8.3 Booking outside custom hours should be rejected');
    } catch (err: any) {
      assert(
        err.message.includes('falls outside mentor\'s custom available hours'),
        '8.3 Booking outside custom hours rejected with informative message',
        `Got: "${err.message}"`
      );
    }

    // Booking inside custom hours (12:30 IST = 07:00 UTC) succeeds
    const customBooking = await BookingService.createBooking(testCandidate.id, {
      mentorId: kolkataMentor.id,
      serviceId: kolkataService30.id,
      scheduledStart: '2026-11-24T07:00:00.000Z',
      timezone: 'Asia/Kolkata',
    });

    assert(
      customBooking.status === 'CONFIRMED',
      '8.4 Booking inside custom available hours succeeds'
    );

    // =========================================================================
    // 9. Existing bookings block overlapping slots
    // =========================================================================
    console.log('\n--- Phase 9: Existing Bookings Block Slots & Collisions ---');

    // Slot 2026-11-24 12:30-13:00 (07:00-07:30 UTC) was booked in 8.4.
    // Query available slots for 2026-11-24:
    const remainingCustomSlots = await AvailabilityService.getAvailableSlots({
      mentorId: kolkataMentor.id,
      startDate: '2026-11-24',
      endDate: '2026-11-24',
      durationMinutes: 30,
    });

    const isReservedSlotAvailable = remainingCustomSlots.some(
      (s) => s.start === '2026-11-24T07:00:00.000Z'
    );

    assert(
      !isReservedSlotAvailable,
      '9.1 Confirmed booking removes slot from getAvailableSlots'
    );

    assert(
      remainingCustomSlots.length === 3,
      '9.2 Remaining available slots count reduced from 4 to 3'
    );

    // Attempting to book the same slot again fails
    try {
      await BookingService.createBooking(testCandidate.id, {
        mentorId: kolkataMentor.id,
        serviceId: kolkataService30.id,
        scheduledStart: '2026-11-24T07:00:00.000Z',
        timezone: 'Asia/Kolkata',
      });
      assert(false, '9.3 Conflicting double booking should be rejected');
    } catch (err: any) {
      assert(
        err.message.includes('just reserved') || err.message.includes('another'),
        '9.3 Conflicting double booking rejected by concurrency check',
        `Got: "${err.message}"`
      );
    }

    // =========================================================================
    // 10. Frontend booking route validation & no silent fallback
    // =========================================================================
    console.log('\n--- Phase 10: Frontend Booking Route Strict Validation ---');

    // 10.1 Missing scheduledStart returns HTTP 400
    const missingStartRes = await invokeFrontendBookRoute(
      {
        mentorId: kolkataMentor.id,
        serviceId: kolkataService30.id,
      },
      candidateToken
    );

    assert(
      missingStartRes.status === 400 && missingStartRes.json.error === 'scheduledStart is required',
      '10.1 Missing scheduledStart returns HTTP 400 with clear message',
      `Got status ${missingStartRes.status}: ${JSON.stringify(missingStartRes.json)}`
    );

    // 10.2 Invalid date string returns HTTP 400
    const invalidDateRes = await invokeFrontendBookRoute(
      {
        mentorId: kolkataMentor.id,
        serviceId: kolkataService30.id,
        scheduledStart: 'not-a-date',
      },
      candidateToken
    );

    assert(
      invalidDateRes.status === 400 && invalidDateRes.json.error === 'scheduledStart must be a valid future datetime',
      '10.2 Invalid scheduledStart string returns HTTP 400',
      `Got status ${invalidDateRes.status}: ${JSON.stringify(invalidDateRes.json)}`
    );

    // 10.3 Past date returns HTTP 400
    const pastDateRes = await invokeFrontendBookRoute(
      {
        mentorId: kolkataMentor.id,
        serviceId: kolkataService30.id,
        scheduledStart: '2020-01-01T10:00:00.000Z',
      },
      candidateToken
    );

    assert(
      pastDateRes.status === 400 && pastDateRes.json.error === 'scheduledStart must be a valid future datetime',
      '10.3 Past scheduledStart returns HTTP 400',
      `Got status ${pastDateRes.status}: ${JSON.stringify(pastDateRes.json)}`
    );

    // 10.4 No silent fallback: check that sending no scheduledStart did NOT create a booking for tomorrow 18:00
    const candidateBookings = await db.booking.findMany({
      where: {
        candidateId: testCandidate.id,
        mentorId: kolkataMentor.id,
      },
    });

    const hasTomorrow1800Booking = candidateBookings.some((b) => {
      const d = new Date(b.scheduledStart);
      return d.getUTCHours() === 18 && d.getUTCMinutes() === 0;
    });

    assert(
      !hasTomorrow1800Booking,
      '10.4 Silent fallback completely eliminated: no automatic tomorrow 18:00 booking was created'
    );

    // 10.5 Successful booking via frontend route with valid slot
    const validFrontendRes = await invokeFrontendBookRoute(
      {
        mentorId: kolkataMentor.id,
        serviceId: kolkataService30.id,
        scheduledStart: '2026-11-24T06:30:00.000Z', // valid custom hour slot
      },
      candidateToken
    );

    assert(
      validFrontendRes.status === 200 && validFrontendRes.json.success === true,
      '10.5 Frontend booking route succeeds with valid scheduledStart slot',
      `Got status ${validFrontendRes.status}: ${JSON.stringify(validFrontendRes.json)}`
    );

  } finally {
    console.log('\n--- Cleanup Test Artifacts ---');
    try {
      if (kolkataMentor?.id) {
        await db.mentorshipSession.deleteMany({ where: { mentorId: kolkataMentor.id } });
        await db.booking.deleteMany({ where: { mentorId: kolkataMentor.id } });
        await db.availabilityRule.deleteMany({ where: { mentorId: kolkataMentor.id } });
        await db.availabilityException.deleteMany({ where: { mentorId: kolkataMentor.id } });
        await db.mentorshipService.deleteMany({ where: { mentorId: kolkataMentor.id } });
        await db.mentor.deleteMany({ where: { id: kolkataMentor.id } });
      }
      if (nyMentor?.id) {
        await db.mentorshipSession.deleteMany({ where: { mentorId: nyMentor.id } });
        await db.booking.deleteMany({ where: { mentorId: nyMentor.id } });
        await db.availabilityRule.deleteMany({ where: { mentorId: nyMentor.id } });
        await db.availabilityException.deleteMany({ where: { mentorId: nyMentor.id } });
        await db.mentorshipService.deleteMany({ where: { mentorId: nyMentor.id } });
        await db.mentor.deleteMany({ where: { id: nyMentor.id } });
      }
      if (kathmanduMentor?.id) {
        await db.availabilityRule.deleteMany({ where: { mentorId: kathmanduMentor.id } });
        await db.mentorshipService.deleteMany({ where: { mentorId: kathmanduMentor.id } });
        await db.mentor.deleteMany({ where: { id: kathmanduMentor.id } });
      }
      if (testCandidate?.id) {
        await db.session.deleteMany({ where: { userId: testCandidate.id } });
        await db.user.deleteMany({ where: { id: testCandidate.id } });
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

runMentorAvailabilityBookingValidationTests().catch((err) => {
  console.error('Fatal error in mentor availability tests:', err);
  process.exit(1);
});
