import { db } from '../db/client';
import { AvailabilityService } from '../services/mentorship/availabilityService';
import { BookingService } from '../services/mentorship/bookingService';

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

async function runCandidateMentorSlotDiscoveryTests() {
  console.log('\n📅 Running Candidate Mentor Slot Discovery and Booking UI Integration Tests...\n');

  let approvedMentor: any = null;
  let pendingMentor: any = null;
  let activeService45: any = null;
  let activeService60: any = null;
  let inactiveService: any = null;
  let unrelatedMentor: any = null;
  let unrelatedService: any = null;
  let candidateUserA: any = null;
  let candidateUserB: any = null;

  const emailApproved = `approved.mentor.${Date.now()}@pathway.test`;
  const emailPending = `pending.mentor.${Date.now()}@pathway.test`;
  const emailUnrelated = `unrelated.mentor.${Date.now()}@pathway.test`;
  const emailCandA = `cand.a.${Date.now()}@pathway.test`;
  const emailCandB = `cand.b.${Date.now()}@pathway.test`;

  try {
    // -------------------------------------------------------------------------
    // Setup Test Fixtures in MongoDB
    // -------------------------------------------------------------------------
    console.log('--- Setting Up Integration Test Fixtures ---');

    candidateUserA = await db.user.create({
      data: {
        email: emailCandA,
        name: 'Candidate Alice',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    candidateUserB = await db.user.create({
      data: {
        email: emailCandB,
        name: 'Candidate Bob',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    approvedMentor = await db.mentor.create({
      data: {
        email: emailApproved,
        name: 'Approved Mentor Priya',
        headline: 'Staff Engineer & Mentor',
        bio: 'Distributed systems architect and staff engineering mentor',
        domain: 'Backend & Distributed Systems',
        expertise: ['Distributed Systems', 'System Design'],
        experienceYears: 10,
        startingPrice: 1500,
        status: 'APPROVED',
        bookingVersion: 0,
      },
    });

    pendingMentor = await db.mentor.create({
      data: {
        email: emailPending,
        name: 'Pending Mentor Rahul',
        headline: 'Junior Mentor Applicant',
        bio: 'Frontend engineer with modern web experience',
        domain: 'Frontend Engineering',
        expertise: ['React', 'Next.js'],
        experienceYears: 2,
        startingPrice: 500,
        status: 'PENDING',
        bookingVersion: 0,
      },
    });

    unrelatedMentor = await db.mentor.create({
      data: {
        email: emailUnrelated,
        name: 'Unrelated Mentor Carlos',
        headline: 'Engineering Manager',
        bio: 'Engineering manager and leadership coach',
        domain: 'Management',
        expertise: ['Engineering Management', 'Leadership'],
        experienceYears: 12,
        startingPrice: 3000,
        status: 'APPROVED',
        bookingVersion: 0,
      },
    });

    // Services
    activeService45 = await db.mentorshipService.create({
      data: {
        mentorId: approvedMentor.id,
        title: 'System Design Deep Dive (45m)',
        description: 'Comprehensive 45-minute distributed system architecture review',
        category: 'TECHNICAL_GUIDANCE',
        duration: 45,
        price: 1500,
        active: true,
      },
    });

    activeService60 = await db.mentorshipService.create({
      data: {
        mentorId: approvedMentor.id,
        title: 'Mock Interview (60m)',
        description: 'Full 1-hour behavioral and architecture simulation',
        category: 'MOCK_INTERVIEW',
        duration: 60,
        price: 2000,
        active: true,
      },
    });

    inactiveService = await db.mentorshipService.create({
      data: {
        mentorId: approvedMentor.id,
        title: 'Deprecated Career Chat',
        description: 'Inactive mentorship option',
        category: 'CAREER_DIRECTION',
        duration: 30,
        price: 500,
        active: false,
      },
    });

    unrelatedService = await db.mentorshipService.create({
      data: {
        mentorId: unrelatedMentor.id,
        title: 'Leadership Coaching',
        description: '1-on-1 executive coaching',
        category: 'LEADERSHIP',
        duration: 45,
        price: 3000,
        active: true,
      },
    });

    // Configure weekly recurring availability for approvedMentor:
    // Wednesday (3) and Thursday (4): 09:00 - 13:00 (4 hours) in Asia/Kolkata
    await db.availabilityRule.createMany({
      data: [
        {
          mentorId: approvedMentor.id,
          dayOfWeek: 3, // Wednesday
          startTime: '09:00',
          endTime: '13:00',
          timezone: 'Asia/Kolkata',
          active: true,
        },
        {
          mentorId: approvedMentor.id,
          dayOfWeek: 4, // Thursday
          startTime: '09:00',
          endTime: '13:00',
          timezone: 'Asia/Kolkata',
          active: true,
        },
      ],
    });

    console.log('✓ Test fixtures configured successfully.');

    // -------------------------------------------------------------------------
    // TEST SUITE 1: Valid Slot Discovery
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Valid Slot Discovery ---');

    // Find a future Wednesday (dayOfWeek 3) in 2028 so it's always strictly in the future
    const targetDate = '2028-10-18'; // Oct 18, 2028 is a Wednesday (dayOfWeek 3)

    const discovery = await AvailabilityService.getCandidateSlots({
      mentorId: approvedMentor.id,
      serviceId: activeService45.id,
      date: targetDate,
    });

    assert(discovery.mentorId === approvedMentor.id, 'Returns matching mentorId');
    assert(discovery.serviceId === activeService45.id, 'Returns matching serviceId');
    assert(discovery.service.duration === 45, 'Returns service duration of 45 mins');
    assert(discovery.service.price === 1500, 'Returns canonical service price from database');
    assert(discovery.timezone === 'Asia/Kolkata', 'Resolves mentor timezone Asia/Kolkata');
    assert(discovery.startDate === targetDate && discovery.endDate === targetDate, 'Returns correct date bounds');

    // In 09:00 - 13:00 (240 mins) with 45 min duration and +15 min relaxation buffer:
    // 45 min meeting + 15 min buffer = 60 mins per slot cycle.
    // 09:00 - 09:45 (buffer 09:45 - 10:00)
    // 10:00 - 10:45 (buffer 10:45 - 11:00)
    // 11:00 - 11:45 (buffer 11:45 - 12:00)
    // 12:00 - 12:45 (next slot starts 13:00, exceeding window)
    assert(discovery.slots.length === 4, 'Generates exactly 4 45-minute slots with 15-min buffer for 4-hour working window');

    const firstSlot = discovery.slots[0];
    const secondSlot = discovery.slots[1];
    assert(firstSlot.displayTime === '09:00 - 09:45', 'First slot displays 09:00 - 09:45 in mentor timezone');
    assert(secondSlot.displayTime === '10:00 - 10:45', 'Second slot starts at 10:00 with 15-min buffer after first slot');
    assert(
      new Date(secondSlot.start).getTime() - new Date(firstSlot.end).getTime() === 15 * 60 * 1000,
      'Gap between consecutive meetings is exactly 15 minutes for mentor relaxation'
    );
    assert(firstSlot.date === targetDate, 'Slot date matches target date');

    const startInstant = new Date(firstSlot.start).getTime();
    const endInstant = new Date(firstSlot.end).getTime();
    assert(
      endInstant - startInstant === 45 * 60 * 1000,
      'Slot machine-readable UTC duration is exactly 45 minutes'
    );

    // Verify 09:00 IST in UTC is 03:30 UTC
    const slotStartDate = new Date(firstSlot.start);
    assert(
      slotStartDate.toISOString() === `${targetDate}T03:30:00.000Z`,
      'Calculates accurate UTC timestamp for 09:00 AM IST (03:30 UTC)'
    );

    // Now test 60-min service on the same window:
    // 60 min session + 15 min buffer = 75 mins: 09:00-10:00, 10:15-11:15, 11:30-12:30 -> 3 slots
    const discovery60 = await AvailabilityService.getCandidateSlots({
      mentorId: approvedMentor.id,
      serviceId: activeService60.id,
      date: targetDate,
    });
    assert(discovery60.slots.length === 3, 'Generates 3 60-minute slots with 15-min buffer for 4-hour working window');
    assert(discovery60.slots[0].displayTime === '09:00 - 10:00', '60-min slot displays 09:00 - 10:00');
    assert(discovery60.slots[1].displayTime === '10:15 - 11:15', 'Second 60-min slot displays 10:15 - 11:15');

    // -------------------------------------------------------------------------
    // TEST SUITE 2: Invalid Mentor and Service IDs
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Invalid Mentor & Service IDs ---');

    let malformedMentorErr = false;
    try {
      await AvailabilityService.getCandidateSlots({
        mentorId: 'invalid-hex-id',
        serviceId: activeService45.id,
        date: targetDate,
      });
    } catch (e: any) {
      malformedMentorErr = e.message.includes('Invalid mentor ID format');
    }
    assert(malformedMentorErr, 'Rejects malformed mentor ID format');

    let nonExistentMentorErr = false;
    try {
      await AvailabilityService.getCandidateSlots({
        mentorId: '000000000000000000000000',
        serviceId: activeService45.id,
        date: targetDate,
      });
    } catch (e: any) {
      nonExistentMentorErr = e.message.includes('Mentor is not available for bookings');
    }
    assert(nonExistentMentorErr, 'Rejects non-existent mentor ID');

    let malformedServiceErr = false;
    try {
      await AvailabilityService.getCandidateSlots({
        mentorId: approvedMentor.id,
        serviceId: 'bad-service-hex',
        date: targetDate,
      });
    } catch (e: any) {
      malformedServiceErr = e.message.includes('Invalid service ID format');
    }
    assert(malformedServiceErr, 'Rejects malformed service ID format');

    let nonExistentServiceErr = false;
    try {
      await AvailabilityService.getCandidateSlots({
        mentorId: approvedMentor.id,
        serviceId: '000000000000000000000000',
        date: targetDate,
      });
    } catch (e: any) {
      nonExistentServiceErr = e.message.includes('Mentorship service is not currently active or available');
    }
    assert(nonExistentServiceErr, 'Rejects non-existent service ID');

    let wrongMentorServiceErr = false;
    try {
      // Pass unrelatedService (belongs to unrelatedMentor) with approvedMentor
      await AvailabilityService.getCandidateSlots({
        mentorId: approvedMentor.id,
        serviceId: unrelatedService.id,
        date: targetDate,
      });
    } catch (e: any) {
      wrongMentorServiceErr = e.message.includes('Mentorship service is not currently active or available');
    }
    assert(wrongMentorServiceErr, 'Rejects service that belongs to a different mentor');

    // -------------------------------------------------------------------------
    // TEST SUITE 3: Inactive Mentors and Services
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Inactive Mentors & Services ---');

    let pendingMentorErr = false;
    try {
      await AvailabilityService.getCandidateSlots({
        mentorId: pendingMentor.id,
        serviceId: activeService45.id,
        date: targetDate,
      });
    } catch (e: any) {
      pendingMentorErr = e.message.includes('Mentor is not available for bookings');
    }
    assert(pendingMentorErr, 'Rejects mentor with status PENDING');

    let inactiveServiceErr = false;
    try {
      await AvailabilityService.getCandidateSlots({
        mentorId: approvedMentor.id,
        serviceId: inactiveService.id,
        date: targetDate,
      });
    } catch (e: any) {
      inactiveServiceErr = e.message.includes('Mentorship service is not currently active or available');
    }
    assert(inactiveServiceErr, 'Rejects mentorship service with active: false');

    // -------------------------------------------------------------------------
    // TEST SUITE 4: Unavailable Dates and Custom-Hours Exceptions
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Unavailable Dates & Custom-Hours Exceptions ---');

    // Create an UNAVAILABLE exception on 2028-10-19 (Thursday)
    const blackoutDate = '2028-10-19';
    await db.availabilityException.create({
      data: {
        mentorId: approvedMentor.id,
        date: blackoutDate,
        type: 'UNAVAILABLE',
        reason: 'National Conference Keynote',
      },
    });

    const blackoutDiscovery = await AvailabilityService.getCandidateSlots({
      mentorId: approvedMentor.id,
      serviceId: activeService45.id,
      date: blackoutDate,
    });
    assert(blackoutDiscovery.slots.length === 0, 'UNAVAILABLE exception blocks all slot generation on that date');

    // Create a CUSTOM_HOURS exception on 2028-10-25 (Wednesday)
    // Working hours overridden to 10:00 - 11:30 (90 mins total)
    const customHoursDate = '2028-10-25';
    await db.availabilityException.create({
      data: {
        mentorId: approvedMentor.id,
        date: customHoursDate,
        type: 'CUSTOM_HOURS',
        startTime: '10:00',
        endTime: '12:00',
        reason: 'Morning Workshop',
      },
    });

    const customDiscovery = await AvailabilityService.getCandidateSlots({
      mentorId: approvedMentor.id,
      serviceId: activeService45.id,
      date: customHoursDate,
    });

    // 120 mins: 10:00 - 10:45, buffer 10:45 - 11:00, 11:00 - 11:45 -> 2 slots
    assert(customDiscovery.slots.length === 2, 'CUSTOM_HOURS exception limits slots to custom bounds (2 slots with 15m buffer)');
    assert(customDiscovery.slots[0].displayTime === '10:00 - 10:45', 'First custom slot is 10:00 - 10:45');
    assert(customDiscovery.slots[1].displayTime === '11:00 - 11:45', 'Second custom slot is 11:00 - 11:45');

    // -------------------------------------------------------------------------
    // TEST SUITE 5: Past Dates and Timezone Handling
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Past Dates & Non-IST Timezone Handling ---');

    // Query for a date in 2020 (definitely in the past)
    const pastDate = '2020-01-15';
    const pastDiscovery = await AvailabilityService.getCandidateSlots({
      mentorId: approvedMentor.id,
      serviceId: activeService45.id,
      date: pastDate,
    });
    assert(pastDiscovery.slots.length === 0, 'Past dates return 0 slots (past slots discarded)');

    // Non-IST Timezone Mentor: America/New_York
    const emailNy = `mentor.ny.${Date.now()}@pathway.test`;
    const nyMentor = await db.mentor.create({
      data: {
        email: emailNy,
        name: 'Mentor Sarah (NY)',
        headline: 'Principal Engineer',
        bio: 'Cloud architecture expert based in New York',
        domain: 'Cloud Architecture',
        expertise: ['Cloud Architecture', 'AWS', 'Kubernetes'],
        startingPrice: 100,
        status: 'APPROVED',
        bookingVersion: 0,
      },
    });

    const nyService = await db.mentorshipService.create({
      data: {
        mentorId: nyMentor.id,
        title: 'Cloud Architecture Review (30m)',
        description: '30m session',
        category: 'TECHNICAL_GUIDANCE',
        duration: 30,
        price: 100,
        currency: 'USD',
        active: true,
      },
    });

    // Set Monday (dayOfWeek 1) 09:00 - 11:00 in America/New_York
    await db.availabilityRule.create({
      data: {
        mentorId: nyMentor.id,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '11:00',
        timezone: 'America/New_York',
        active: true,
      },
    });

    const nyDate = '2028-10-16'; // Monday in 2028 (EDT: UTC-4)
    const nyDiscovery = await AvailabilityService.getCandidateSlots({
      mentorId: nyMentor.id,
      serviceId: nyService.id,
      date: nyDate,
    });

    assert(nyDiscovery.timezone === 'America/New_York', 'Reports mentor local timezone America/New_York');
    assert(nyDiscovery.slots.length === 3, 'Generates 3 30-minute slots with 15-min buffer for 2-hour window');
    assert(nyDiscovery.slots[0].displayTime === '09:00 - 09:30', 'Displays 09:00 - 09:30 in NY local time');
    assert(nyDiscovery.slots[1].displayTime === '09:45 - 10:15', 'Displays 09:45 - 10:15 in NY local time with 15-min buffer');

    // 09:00 EDT (UTC-4) corresponds to 13:00 UTC
    const nyStartUtc = new Date(nyDiscovery.slots[0].start);
    assert(
      nyStartUtc.toISOString() === `${nyDate}T13:00:00.000Z`,
      'Calculates accurate UTC instant for America/New_York local time (13:00 UTC)'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 6: Empty Availability on Unscheduled Days
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Empty Availability on Days Without Rules ---');

    // approvedMentor is only available on Wed (3) and Thu (4).
    // Sunday Oct 15, 2028 (dayOfWeek 0) has no rules:
    const sundayDate = '2028-10-15';
    const sundayDiscovery = await AvailabilityService.getCandidateSlots({
      mentorId: approvedMentor.id,
      serviceId: activeService45.id,
      date: sundayDate,
    });
    assert(sundayDiscovery.slots.length === 0, 'Returns 0 slots for days with no active availability rules');

    // -------------------------------------------------------------------------
    // TEST SUITE 7: Stale Slot Collision Rejected by Booking Creation
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Stale Slot Collision & Real-Time Reflection ---');

    // Candidate A and Candidate B both discover slots for targetDate
    const freshDiscovery = await AvailabilityService.getCandidateSlots({
      mentorId: approvedMentor.id,
      serviceId: activeService45.id,
      date: targetDate,
    });
    assert(freshDiscovery.slots.length === 4, 'Fresh discovery before booking has 4 slots (with 15m relaxation buffer)');

    const slotToBook = freshDiscovery.slots[0]; // 09:00 - 09:45 IST

    // Candidate A books this slot
    const bookingA = await BookingService.createBooking(candidateUserA.id, {
      mentorId: approvedMentor.id,
      serviceId: activeService45.id,
      scheduledStart: slotToBook.start,
      timezone: 'Asia/Kolkata',
      studentNotes: 'Candidate A notes',
    });
    assert(bookingA.status === 'CONFIRMED', 'Candidate A successfully books the slot');

    // Candidate B attempts to book the SAME slot (stale view)
    let staleBookingRejected = false;
    let staleErrorMsg = '';
    try {
      await BookingService.createBooking(candidateUserB.id, {
        mentorId: approvedMentor.id,
        serviceId: activeService45.id,
        scheduledStart: slotToBook.start,
        timezone: 'Asia/Kolkata',
        studentNotes: 'Candidate B notes',
      });
    } catch (e: any) {
      staleBookingRejected = true;
      staleErrorMsg = e.message;
    }
    assert(staleBookingRejected, 'Server revalidates and rejects Candidate B stale booking attempt');
    assert(
      staleErrorMsg.includes('just reserved') || staleErrorMsg.includes('conflicting'),
      `Provides clear collision message to Candidate B (${staleErrorMsg})`
    );

    // Refresh candidate slots discovery: the booked slot must now be completely gone
    const discoveryAfterBooking = await AvailabilityService.getCandidateSlots({
      mentorId: approvedMentor.id,
      serviceId: activeService45.id,
      date: targetDate,
    });

    assert(discoveryAfterBooking.slots.length === 3, 'Slot discovery now returns 3 remaining slots');
    assert(
      !discoveryAfterBooking.slots.some((s) => s.start === slotToBook.start),
      'Booked slot is removed in real time from available slots'
    );
    assert(
      discoveryAfterBooking.slots[0].displayTime === '10:00 - 10:45',
      'Next available slot is now 10:00 - 10:45 (providing 15-min buffer after 09:45)'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 8: Date Range Limits and Validation
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Date Range Limits & Validation ---');

    let invertedRangeErr = false;
    try {
      await AvailabilityService.getCandidateSlots({
        mentorId: approvedMentor.id,
        serviceId: activeService45.id,
        startDate: '2028-10-20',
        endDate: '2028-10-18',
      });
    } catch (e: any) {
      invertedRangeErr = e.message.includes('endDate cannot be before startDate');
    }
    assert(invertedRangeErr, 'Rejects inverted date ranges (endDate < startDate)');

    let windowTooLargeErr = false;
    try {
      await AvailabilityService.getCandidateSlots({
        mentorId: approvedMentor.id,
        serviceId: activeService45.id,
        startDate: '2028-10-01',
        endDate: '2028-10-25', // 25 days > 14 days
      });
    } catch (e: any) {
      windowTooLargeErr = e.message.includes('Requested availability window cannot exceed 14 days');
    }
    assert(windowTooLargeErr, 'Limits candidate availability window to at most 14 days');

    let badDateFormatErr = false;
    try {
      await AvailabilityService.getCandidateSlots({
        mentorId: approvedMentor.id,
        serviceId: activeService45.id,
        date: '18-10-2028',
      });
    } catch (e: any) {
      badDateFormatErr = e.message.includes('Dates must be in YYYY-MM-DD format');
    }
    assert(badDateFormatErr, 'Rejects non-YYYY-MM-DD formatted dates');

    // -------------------------------------------------------------------------
    // Clean up test artifacts
    // -------------------------------------------------------------------------
    console.log('\n--- Cleaning Up Integration Test Artifacts ---');
    await db.mentorshipSession.deleteMany({
      where: { mentorId: { in: [approvedMentor.id, nyMentor.id] } },
    });
    await db.booking.deleteMany({
      where: { mentorId: { in: [approvedMentor.id, nyMentor.id] } },
    });
    await db.availabilityException.deleteMany({
      where: { mentorId: approvedMentor.id },
    });
    await db.availabilityRule.deleteMany({
      where: { mentorId: { in: [approvedMentor.id, nyMentor.id] } },
    });
    await db.mentorshipService.deleteMany({
      where: { mentorId: { in: [approvedMentor.id, nyMentor.id, unrelatedMentor.id] } },
    });
    await db.mentor.deleteMany({
      where: { id: { in: [approvedMentor.id, pendingMentor.id, unrelatedMentor.id, nyMentor.id] } },
    });
    await db.user.deleteMany({
      where: { id: { in: [candidateUserA.id, candidateUserB.id] } },
    });
    console.log('✓ Test fixtures cleaned up from database.');
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

runCandidateMentorSlotDiscoveryTests();
