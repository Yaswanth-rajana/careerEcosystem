import { db } from '../db/client';
import { DashboardService } from '../services/dashboardService';

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

async function runDashboardMentorshipSessionTests() {
  console.log('\n📅 Running Dashboard Mentorship Session Integration Tests...\n');

  let candidate1: any = null;
  let candidate2: any = null;
  let mentor: any = null;
  let service: any = null;
  const createdBookingIds: string[] = [];
  const createdSessionIds: string[] = [];

  const emailCandidate1 = `cand.dash1.${Date.now()}@pathway.test`;
  const emailCandidate2 = `cand.dash2.${Date.now()}@pathway.test`;
  const emailMentor = `mentor.dash.${Date.now()}@pathway.test`;

  try {
    // -------------------------------------------------------------------------
    // Setup Test Fixtures
    // -------------------------------------------------------------------------
    console.log('--- Setting Up Test Fixtures in MongoDB ---');

    candidate1 = await db.user.create({
      data: {
        email: emailCandidate1,
        name: 'Arjun Sharma',
        role: 'CANDIDATE',
        status: 'ACTIVE',
        isOnboarded: true,
        profile: {
          create: {
            headline: 'Aspiring Cloud Architect',
            candidateType: 'STUDENT',
            careerGoal: {
              create: {
                targetRole: 'Cloud Solutions Architect',
              },
            },
          },
        },
      },
    });

    candidate2 = await db.user.create({
      data: {
        email: emailCandidate2,
        name: 'Sara Khan',
        role: 'CANDIDATE',
        status: 'ACTIVE',
        isOnboarded: true,
        profile: {
          create: {
            headline: 'Frontend Engineer',
            candidateType: 'STUDENT',
          },
        },
      },
    });

    mentor = await db.mentor.create({
      data: {
        email: emailMentor,
        name: 'Ananya Rao',
        headline: 'Principal Architect at GlobalTech',
        bio: 'Over 12 years designing hyper-scale distributed backends.',
        domain: 'TECH',
        company: 'GlobalTech',
        expertise: ['System Design', 'Cloud Architecture'],
        experienceYears: 12,
        startingPrice: 2000,
        status: 'APPROVED',
        bookingVersion: 0,
      },
    });

    service = await db.mentorshipService.create({
      data: {
        mentorId: mentor.id,
        title: 'System Architecture Review',
        description: 'Comprehensive 45-minute architectural review and roadmap.',
        category: 'TECHNICAL_GUIDANCE',
        duration: 45,
        price: 2000,
        currency: 'INR',
        active: true,
      },
    });

    console.log('✓ Test fixtures configured successfully.');

    // -------------------------------------------------------------------------
    // 1. NO BOOKING -> Shows Find a Mentor
    // -------------------------------------------------------------------------
    console.log('\n--- 1. No Booking -> Find a Mentor ---');

    const dashNoBooking = await DashboardService.getDashboardData(candidate1.id);
    assert(!dashNoBooking.mentorship.hasSession, 'hasSession is false when no bookings exist');
    assert(dashNoBooking.mentorship.upcomingSession === null, 'upcomingSession is null');
    assert(
      dashNoBooking.mentorship.emptyState.title === 'Find a Mentor',
      'emptyState title is "Find a Mentor"'
    );
    assert(
      dashNoBooking.mentorship.emptyState.actionHref === '/mentors',
      'emptyState actionHref is "/mentors"'
    );

    // -------------------------------------------------------------------------
    // 2. CONFIRMED FUTURE BOOKING -> Booked Session Details
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Confirmed Future Booking -> Booked Session ---');

    const futureStart = new Date(Date.now() + 2 * 60 * 60 * 1000); // +2 hours
    const futureEnd = new Date(futureStart.getTime() + 45 * 60 * 1000);

    const b1 = await db.booking.create({
      data: {
        mentorId: mentor.id,
        candidateId: candidate1.id,
        serviceId: service.id,
        scheduledStart: futureStart,
        scheduledEnd: futureEnd,
        timezone: 'Asia/Kolkata',
        status: 'CONFIRMED',
      },
    });
    createdBookingIds.push(b1.id);

    const s1 = await db.mentorshipSession.create({
      data: {
        bookingId: b1.id,
        mentorId: mentor.id,
        candidateId: candidate1.id,
        status: 'SCHEDULED',
        meetingUrl: 'https://meet.pathway.eco/room/ananya-future',
      },
    });
    createdSessionIds.push(s1.id);

    const dashFuture = await DashboardService.getDashboardData(candidate1.id);
    assert(dashFuture.mentorship.hasSession === true, 'hasSession is true for confirmed future booking');
    assert(dashFuture.mentorship.upcomingSession !== null, 'upcomingSession is populated');
    assert(
      dashFuture.mentorship.upcomingSession?.mentorName === 'Ananya Rao',
      'Mentor name matches Ananya Rao'
    );
    assert(
      dashFuture.mentorship.upcomingSession?.mentorCompany === 'GlobalTech',
      'Mentor company matches GlobalTech'
    );
    assert(
      dashFuture.mentorship.upcomingSession?.sessionTitle === 'System Architecture Review',
      'Session title matches service title'
    );
    assert(
      dashFuture.mentorship.upcomingSession?.status === 'CONFIRMED',
      'Session status is CONFIRMED'
    );
    assert(
      dashFuture.mentorship.upcomingSession?.isOngoing === false,
      'isOngoing is false for future booking'
    );
    assert(
      dashFuture.mentorship.upcomingSession?.canJoin === true,
      'canJoin is true when meetingUrl exists and session is active'
    );
    assert(
      dashFuture.mentorship.upcomingSession?.meetingUrl === 'https://meet.pathway.eco/room/ananya-future',
      'meetingUrl matches real session URL'
    );
    assert(
      dashFuture.mentorship.upcomingSession?.timezone === 'Asia/Kolkata',
      'timezone is Asia/Kolkata'
    );
    assert(
      dashFuture.mentorship.upcomingSession?.sessionHref === '/mentors/bookings?tab=upcoming',
      'sessionHref links to candidate bookings upcoming tab'
    );

    // -------------------------------------------------------------------------
    // 3. ONGOING SESSION -> Shows Booked Session with isOngoing: true
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Ongoing Session -> Booked Session with Live Indicator ---');

    const ongoingStart = new Date(Date.now() - 15 * 60 * 1000); // 15 mins ago
    const ongoingEnd = new Date(Date.now() + 30 * 60 * 1000); // 30 mins from now

    await db.booking.update({
      where: { id: b1.id },
      data: {
        scheduledStart: ongoingStart,
        scheduledEnd: ongoingEnd,
      },
    });

    const dashOngoing = await DashboardService.getDashboardData(candidate1.id);
    assert(dashOngoing.mentorship.hasSession === true, 'hasSession is true for ongoing session');
    assert(
      dashOngoing.mentorship.upcomingSession?.isOngoing === true,
      'isOngoing is true when current time is between start and end'
    );
    assert(
      dashOngoing.mentorship.upcomingSession?.canJoin === true,
      'canJoin is true for ongoing session'
    );

    // -------------------------------------------------------------------------
    // 4. SESSION ENDS -> Restores Find a Mentor
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Session Ends -> Restores Find a Mentor ---');

    const pastStart = new Date(Date.now() - 90 * 60 * 1000); // 90 mins ago
    const pastEnd = new Date(Date.now() - 45 * 60 * 1000); // 45 mins ago

    await db.booking.update({
      where: { id: b1.id },
      data: {
        scheduledStart: pastStart,
        scheduledEnd: pastEnd,
      },
    });

    const dashEnded = await DashboardService.getDashboardData(candidate1.id);
    assert(
      dashEnded.mentorship.hasSession === false,
      'hasSession reverts to false when session ends and no other booking exists'
    );
    assert(
      dashEnded.mentorship.upcomingSession === null,
      'upcomingSession reverts to null after session ends'
    );
    assert(
      dashEnded.mentorship.emptyState.title === 'Find a Mentor',
      'Find a Mentor card is restored'
    );

    // -------------------------------------------------------------------------
    // 5. CANCELLED, COMPLETED, RESCHEDULE_REQUESTED, PENDING -> Excluded
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Exclude Cancelled, Completed, Reschedule_Requested, Pending ---');

    const futureSlotStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const futureSlotEnd = new Date(futureSlotStart.getTime() + 45 * 60 * 1000);

    const statusesToTest = [
      'CANCELLED_BY_CANDIDATE',
      'CANCELLED_BY_MENTOR',
      'COMPLETED',
      'RESCHEDULE_REQUESTED',
      'PENDING',
    ];

    for (const testStatus of statusesToTest) {
      await db.booking.update({
        where: { id: b1.id },
        data: {
          scheduledStart: futureSlotStart,
          scheduledEnd: futureSlotEnd,
          status: testStatus,
        },
      });

      const dashStatusTest = await DashboardService.getDashboardData(candidate1.id);
      assert(
        dashStatusTest.mentorship.hasSession === false,
        `Status ${testStatus} is excluded from booked-session display`
      );
      assert(
        dashStatusTest.mentorship.emptyState.title === 'Find a Mentor',
        `Status ${testStatus} falls back to Find a Mentor card`
      );
    }

    // -------------------------------------------------------------------------
    // 6. MULTIPLE BOOKINGS -> Nearest Upcoming or Ongoing Session
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Multiple Bookings -> Nearest Eligible Session ---');

    // Create 3 bookings in future:
    // Slot 1: +5 days
    // Slot 2: +1 day (nearest)
    // Slot 3: +3 days
    const slotFar = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const slotNear = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    const slotMid = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const bFar = await db.booking.create({
      data: {
        mentorId: mentor.id,
        candidateId: candidate1.id,
        serviceId: service.id,
        scheduledStart: slotFar,
        scheduledEnd: new Date(slotFar.getTime() + 45 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });
    createdBookingIds.push(bFar.id);

    const bNear = await db.booking.create({
      data: {
        mentorId: mentor.id,
        candidateId: candidate1.id,
        serviceId: service.id,
        scheduledStart: slotNear,
        scheduledEnd: new Date(slotNear.getTime() + 45 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });
    createdBookingIds.push(bNear.id);

    const bMid = await db.booking.create({
      data: {
        mentorId: mentor.id,
        candidateId: candidate1.id,
        serviceId: service.id,
        scheduledStart: slotMid,
        scheduledEnd: new Date(slotMid.getTime() + 45 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });
    createdBookingIds.push(bMid.id);

    const dashMulti = await DashboardService.getDashboardData(candidate1.id);
    assert(dashMulti.mentorship.hasSession === true, 'hasSession is true with multiple bookings');
    assert(
      dashMulti.mentorship.upcomingSession?.id === bNear.id,
      'Nearest booking (+1 day) is selected when multiple future bookings exist'
    );

    // Now insert an ONGOING booking: it should take precedence over future bookings
    const bOngoing = await db.booking.create({
      data: {
        mentorId: mentor.id,
        candidateId: candidate1.id,
        serviceId: service.id,
        scheduledStart: new Date(Date.now() - 10 * 60 * 1000),
        scheduledEnd: new Date(Date.now() + 35 * 60 * 1000),
        status: 'CONFIRMED',
      },
    });
    createdBookingIds.push(bOngoing.id);

    const dashMultiWithOngoing = await DashboardService.getDashboardData(candidate1.id);
    assert(
      dashMultiWithOngoing.mentorship.upcomingSession?.id === bOngoing.id,
      'Ongoing session is selected as nearest active session over future sessions'
    );
    assert(
      dashMultiWithOngoing.mentorship.upcomingSession?.isOngoing === true,
      'Ongoing session is flagged isOngoing: true'
    );

    // -------------------------------------------------------------------------
    // 7. TIMEZONE DISPLAY & STUDENT OWNERSHIP ISOLATION
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Correct Timezone Display & Student Ownership ---');

    // Candidate 2 has no bookings yet
    const dashCand2Empty = await DashboardService.getDashboardData(candidate2.id);
    assert(
      dashCand2Empty.mentorship.hasSession === false,
      'Candidate 2 cannot see Candidate 1 bookings (strict student ownership)'
    );

    // Create Candidate 2 booking with America/New_York timezone
    const cand2Start = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const cand2End = new Date(cand2Start.getTime() + 45 * 60 * 1000);

    const bCand2 = await db.booking.create({
      data: {
        mentorId: mentor.id,
        candidateId: candidate2.id,
        serviceId: service.id,
        scheduledStart: cand2Start,
        scheduledEnd: cand2End,
        timezone: 'America/New_York',
        status: 'CONFIRMED',
      },
    });
    createdBookingIds.push(bCand2.id);

    const dashCand2 = await DashboardService.getDashboardData(candidate2.id);
    assert(dashCand2.mentorship.hasSession === true, 'Candidate 2 sees their own booking');
    assert(
      dashCand2.mentorship.upcomingSession?.timezone === 'America/New_York',
      'Correct timezone America/New_York is preserved'
    );
    assert(
      dashCand2.mentorship.upcomingSession?.scheduledAt.includes('America/New_York'),
      'scheduledAt includes the America/New_York timezone label'
    );

    // Clean up created booking for Candidate 2
    await db.booking.delete({ where: { id: bCand2.id } });
    const dashCand2AfterDelete = await DashboardService.getDashboardData(candidate2.id);
    assert(
      dashCand2AfterDelete.mentorship.hasSession === false,
      'Candidate 2 returns to Find a Mentor after booking removal'
    );
  } catch (error: any) {
    console.error('Test execution error:', error);
    failed++;
  } finally {
    // -------------------------------------------------------------------------
    // Cleanup Test Database Artifacts
    // -------------------------------------------------------------------------
    console.log('\n--- Cleaning Up Database Test Fixtures ---');
    try {
      if (createdSessionIds.length > 0) {
        await db.mentorshipSession.deleteMany({
          where: { id: { in: createdSessionIds } },
        });
      }
      if (createdBookingIds.length > 0) {
        await db.booking.deleteMany({
          where: { id: { in: createdBookingIds } },
        });
      }
      if (service) {
        await db.mentorshipService.delete({ where: { id: service.id } }).catch(() => {});
      }
      if (mentor) {
        await db.mentor.delete({ where: { id: mentor.id } }).catch(() => {});
      }
      if (candidate1) {
        await db.profile.deleteMany({ where: { userId: candidate1.id } }).catch(() => {});
        await db.user.delete({ where: { id: candidate1.id } }).catch(() => {});
      }
      if (candidate2) {
        await db.profile.deleteMany({ where: { userId: candidate2.id } }).catch(() => {});
        await db.user.delete({ where: { id: candidate2.id } }).catch(() => {});
      }
      console.log('✓ Database artifacts cleaned up.');
    } catch (cleanupErr) {
      console.error('Error during cleanup:', cleanupErr);
    }

    console.log('\n========================================');
    console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
    console.log('========================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runDashboardMentorshipSessionTests();
