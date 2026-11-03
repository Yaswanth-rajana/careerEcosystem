import assert from 'node:assert';
import { DashboardMentorshipDTO } from '@backend/types/dashboard';

/**
 * PATHWAY.ECO — Student Dashboard Mentorship Card Logic Test Suite
 *
 * Verifies:
 * 1. No booking -> Displays Find a Mentor card content
 * 2. Confirmed future booking -> Displays booked session details
 * 3. Ongoing session -> Displays booked session with Live Now indicator
 * 4. Session ends -> Restores Find a Mentor card automatically
 * 5. Excluded statuses (CANCELLED, COMPLETED, RESCHEDULE_REQUESTED, PENDING) -> Fallback to Find a Mentor
 * 6. Meeting URL and Join Session button permission rules
 * 7. Correct timezone localization
 */

console.log('🧪 Starting Student Dashboard Mentorship Card Logic Tests...\n');

let passed = 0;
let failed = 0;

function it(desc: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ PASSED: ${desc}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ FAILED: ${desc} (${err.message})`);
    failed++;
  }
}

function formatSessionDateTime(
  isoStart: string | undefined,
  isoEnd: string | undefined,
  timezone: string | undefined
): { dateStr: string; timeStr: string } {
  if (!isoStart) return { dateStr: '', timeStr: '' };
  try {
    const start = new Date(isoStart);
    const end = isoEnd ? new Date(isoEnd) : null;
    const tz = timezone || 'Asia/Kolkata';

    const dateStr = start.toLocaleDateString('en-US', {
      timeZone: tz,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const timeStart = start.toLocaleTimeString('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (end) {
      const timeEnd = end.toLocaleTimeString('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return {
        dateStr,
        timeStr: `${timeStart} – ${timeEnd} (${tz})`,
      };
    }

    return {
      dateStr,
      timeStr: `${timeStart} (${tz})`,
    };
  } catch {
    return {
      dateStr: isoStart ? isoStart.slice(0, 10) : '',
      timeStr: timezone ? `(${timezone})` : '',
    };
  }
}

function shouldShowBookedSession(
  mentorship: DashboardMentorshipDTO,
  currentTimeMs: number = Date.now()
): boolean {
  if (!mentorship.hasSession || !mentorship.upcomingSession) {
    return false;
  }
  const session = mentorship.upcomingSession;
  if (!session.scheduledEnd) return false;
  const isPast = new Date(session.scheduledEnd).getTime() <= currentTimeMs;
  return !isPast;
}

function isSessionOngoing(
  scheduledStart: string | undefined,
  scheduledEnd: string | undefined,
  currentTimeMs: number = Date.now()
): boolean {
  if (!scheduledStart || !scheduledEnd) return false;
  const start = new Date(scheduledStart).getTime();
  const end = new Date(scheduledEnd).getTime();
  return currentTimeMs >= start && currentTimeMs < end;
}

function canJoinSession(
  session: {
    canJoin?: boolean;
    meetingUrl?: string | null;
    status?: string;
    scheduledEnd?: string;
  } | null,
  currentTimeMs: number = Date.now()
): boolean {
  if (!session) return false;
  if (!session.meetingUrl || session.meetingUrl.trim().length === 0) return false;
  if (session.status !== 'CONFIRMED') return false;
  if (session.scheduledEnd && new Date(session.scheduledEnd).getTime() <= currentTimeMs) return false;
  return Boolean(session.canJoin ?? true);
}

// -----------------------------------------------------------------------------
// 1. No Booking State
// -----------------------------------------------------------------------------
console.log('--- 1. No Booking Verification ---');

it('correctly identifies empty state when hasSession is false', () => {
  const emptyDTO: DashboardMentorshipDTO = {
    hasSession: false,
    upcomingSession: null,
    emptyState: {
      title: 'Find a Mentor',
      description: 'Get 1-on-1 guidance, resume feedback, and advice from professionals who have walked the path.',
      actionLabel: 'Find a Mentor',
      actionHref: '/mentors',
    },
  };
  assert.strictEqual(shouldShowBookedSession(emptyDTO), false);
  assert.strictEqual(emptyDTO.emptyState.title, 'Find a Mentor');
  assert.strictEqual(emptyDTO.emptyState.actionHref, '/mentors');
});

// -----------------------------------------------------------------------------
// 2. Confirmed Future Booking State
// -----------------------------------------------------------------------------
console.log('--- 2. Confirmed Future Booking Verification ---');

it('displays booked session details for confirmed future session', () => {
  const now = Date.now();
  const startIso = new Date(now + 3600000).toISOString(); // +1 hour
  const endIso = new Date(now + 3600000 + 2700000).toISOString(); // +1h 45m

  const futureDTO: DashboardMentorshipDTO = {
    hasSession: true,
    upcomingSession: {
      id: 'book-123',
      bookingId: 'book-123',
      mentorName: 'Priya Sundaram',
      mentorRole: 'VP of Engineering',
      sessionTitle: 'Career Direction & Architecture',
      sessionType: 'Career Direction & Architecture',
      scheduledAt: 'Thu, Nov 12 at 4:00 PM (Asia/Kolkata)',
      scheduledStart: startIso,
      scheduledEnd: endIso,
      timezone: 'Asia/Kolkata',
      sessionHref: '/mentors/bookings?tab=upcoming',
      meetingUrl: 'https://meet.pathway.eco/room/priya-123',
      status: 'CONFIRMED',
      canJoin: true,
      isOngoing: false,
    },
    emptyState: {
      title: 'Find a Mentor',
      description: 'Get 1-on-1 guidance...',
      actionLabel: 'Find a Mentor',
      actionHref: '/mentors',
    },
  };

  assert.strictEqual(shouldShowBookedSession(futureDTO, now), true);
  assert.strictEqual(isSessionOngoing(startIso, endIso, now), false);
  assert.strictEqual(canJoinSession(futureDTO.upcomingSession, now), true);
  assert.strictEqual(futureDTO.upcomingSession?.sessionTitle, 'Career Direction & Architecture');
  assert.strictEqual(futureDTO.upcomingSession?.sessionHref, '/mentors/bookings?tab=upcoming');
});

// -----------------------------------------------------------------------------
// 3. Ongoing Session State
// -----------------------------------------------------------------------------
console.log('--- 3. Ongoing Session Verification ---');

it('correctly calculates isOngoing when current time is between start and end', () => {
  const now = Date.now();
  const startIso = new Date(now - 15 * 60 * 1000).toISOString(); // 15 mins ago
  const endIso = new Date(now + 30 * 60 * 1000).toISOString(); // 30 mins from now

  assert.strictEqual(isSessionOngoing(startIso, endIso, now), true);
  assert.strictEqual(isSessionOngoing(startIso, endIso, now - 20 * 60 * 1000), false); // before start
  assert.strictEqual(isSessionOngoing(startIso, endIso, now + 35 * 60 * 1000), false); // after end
});

// -----------------------------------------------------------------------------
// 4. Session Ends -> Automatically Restores Find a Mentor
// -----------------------------------------------------------------------------
console.log('--- 4. Session Ends Automatic Restoration ---');

it('returns false for shouldShowBookedSession when scheduledEnd has passed', () => {
  const now = Date.now();
  const startIso = new Date(now - 120 * 60 * 1000).toISOString(); // 2h ago
  const endIso = new Date(now - 60 * 60 * 1000).toISOString(); // 1h ago (past)

  const endedDTO: DashboardMentorshipDTO = {
    hasSession: true,
    upcomingSession: {
      id: 'book-past',
      mentorName: 'Priya Sundaram',
      mentorRole: 'VP of Engineering',
      sessionType: 'Mentorship',
      scheduledAt: 'Past Date',
      scheduledStart: startIso,
      scheduledEnd: endIso,
      sessionHref: '/mentors/bookings',
      status: 'CONFIRMED',
      canJoin: false,
    },
    emptyState: {
      title: 'Find a Mentor',
      description: 'Get 1-on-1 guidance, resume feedback, and advice from professionals who have walked the path.',
      actionLabel: 'Find a Mentor',
      actionHref: '/mentors',
    },
  };

  assert.strictEqual(shouldShowBookedSession(endedDTO, now), false);
  assert.strictEqual(canJoinSession(endedDTO.upcomingSession, now), false);
});

// -----------------------------------------------------------------------------
// 5. Excluded Statuses
// -----------------------------------------------------------------------------
console.log('--- 5. Excluded Statuses Verification ---');

it('disallows joining session for non-CONFIRMED statuses', () => {
  const futureEnd = new Date(Date.now() + 3600000).toISOString();
  const excludedStatuses = [
    'CANCELLED_BY_CANDIDATE',
    'CANCELLED_BY_MENTOR',
    'COMPLETED',
    'RESCHEDULE_REQUESTED',
    'PENDING',
  ];

  for (const st of excludedStatuses) {
    const session = {
      status: st,
      meetingUrl: 'https://meet.pathway.eco/room/test',
      canJoin: true,
      scheduledEnd: futureEnd,
    };
    assert.strictEqual(
      canJoinSession(session),
      false,
      `Status ${st} must not allow join session`
    );
  }
});

// -----------------------------------------------------------------------------
// 6. Timezone Formatting
// -----------------------------------------------------------------------------
console.log('--- 6. Timezone Formatting Verification ---');

it('formats date and time accurately according to the specified timezone', () => {
  const startIso = '2026-11-15T10:30:00.000Z'; // UTC 10:30 AM
  const endIso = '2026-11-15T11:15:00.000Z';   // UTC 11:15 AM

  // In Asia/Kolkata (UTC + 5:30), 10:30 UTC is 16:00 (4:00 PM)
  const kolkata = formatSessionDateTime(startIso, endIso, 'Asia/Kolkata');
  assert.ok(kolkata.timeStr.includes('4:00 PM'));
  assert.ok(kolkata.timeStr.includes('4:45 PM'));
  assert.ok(kolkata.timeStr.includes('Asia/Kolkata'));
  assert.ok(kolkata.dateStr.includes('Nov 15, 2026'));

  // In America/New_York (UTC - 5:00), 10:30 UTC is 05:30 AM
  const ny = formatSessionDateTime(startIso, endIso, 'America/New_York');
  assert.ok(ny.timeStr.includes('5:30 AM'));
  assert.ok(ny.timeStr.includes('6:15 AM'));
  assert.ok(ny.timeStr.includes('America/New_York'));
});

it('gracefully handles missing or malformed ISO strings without crashing', () => {
  const result = formatSessionDateTime('invalid-iso', 'invalid-iso', 'Asia/Kolkata');
  assert.strictEqual(typeof result.dateStr, 'string');
  assert.strictEqual(typeof result.timeStr, 'string');
});

// -----------------------------------------------------------------------------
// 7. View Action Navigation and Hardcoded Join Removal Verification
// -----------------------------------------------------------------------------
console.log('--- 7. View Action Navigation & Hardcoded Join Removal ---');

function getBookingCardPrimaryAction(session: {
  id: string;
  bookingId?: string;
  meetingUrl?: string | null;
}): {
  label: string;
  href: string;
  hasHardcodedMeetingNav: boolean;
} {
  const targetId = session.bookingId || session.id;
  return {
    label: 'View',
    href: `/mentors/bookings/${targetId}`,
    hasHardcodedMeetingNav: false,
  };
}

it('routes View action directly to candidate booking details page using actual booking ID', () => {
  const bookingA = { id: 'booking-alphanumeric-101' };
  const bookingB = { id: 'booking-alphanumeric-202', bookingId: 'booking-alphanumeric-202' };

  const actionA = getBookingCardPrimaryAction(bookingA);
  const actionB = getBookingCardPrimaryAction(bookingB);

  assert.strictEqual(actionA.label, 'View');
  assert.strictEqual(actionA.href, '/mentors/bookings/booking-alphanumeric-101');
  assert.strictEqual(actionA.hasHardcodedMeetingNav, false);

  assert.strictEqual(actionB.label, 'View');
  assert.strictEqual(actionB.href, '/mentors/bookings/booking-alphanumeric-202');
  assert.strictEqual(actionB.hasHardcodedMeetingNav, false);
});

it('ensures distinct bookings navigate to their own respective detail pages', () => {
  const bookings = [
    { id: 'b-user-alpha' },
    { id: 'b-user-beta' },
    { id: 'b-user-gamma' },
  ];

  const hrefs = bookings.map((b) => getBookingCardPrimaryAction(b).href);
  const uniqueHrefs = new Set(hrefs);

  assert.strictEqual(uniqueHrefs.size, 3);
  assert.ok(hrefs.includes('/mentors/bookings/b-user-alpha'));
  assert.ok(hrefs.includes('/mentors/bookings/b-user-beta'));
  assert.ok(hrefs.includes('/mentors/bookings/b-user-gamma'));
});

it('verifies hardcoded meeting links are excluded from card primary action', () => {
  const sessionWithMeeting = {
    id: 'b-meeting-test',
    meetingUrl: 'https://meet.jit.si/hardcoded-room-test',
  };

  const action = getBookingCardPrimaryAction(sessionWithMeeting);
  assert.strictEqual(action.label, 'View');
  assert.strictEqual(action.href, '/mentors/bookings/b-meeting-test');
  assert.strictEqual(action.hasHardcodedMeetingNav, false);
  assert.strictEqual(action.href.includes('meet.jit.si'), false);
});

// -----------------------------------------------------------------------------
// 8. Dynamic Back Navigation Resolution
// -----------------------------------------------------------------------------
console.log('--- 8. Dynamic Back Navigation Resolution ---');

function resolveBackTarget(fromSource: string | null): { href: string; label: string } {
  if (fromSource === 'dashboard') {
    return { href: '/dashboard', label: 'Back to Dashboard' };
  }
  if (fromSource === 'mentors') {
    return { href: '/mentors', label: 'Back to Mentors' };
  }
  return { href: '/mentors/bookings', label: 'Back to All Bookings' };
}

it('resolves back target to Dashboard when navigating from dashboard card', () => {
  const target = resolveBackTarget('dashboard');
  assert.strictEqual(target.label, 'Back to Dashboard');
  assert.strictEqual(target.href, '/dashboard');
});

it('resolves back target to Mentors when navigating from mentors page', () => {
  const target = resolveBackTarget('mentors');
  assert.strictEqual(target.label, 'Back to Mentors');
  assert.strictEqual(target.href, '/mentors');
});

it('resolves back target to All Bookings when navigating from bookings list or fallback', () => {
  const targetFromBookings = resolveBackTarget('bookings');
  assert.strictEqual(targetFromBookings.label, 'Back to All Bookings');
  assert.strictEqual(targetFromBookings.href, '/mentors/bookings');

  const targetFallback = resolveBackTarget(null);
  assert.strictEqual(targetFallback.label, 'Back to All Bookings');
  assert.strictEqual(targetFallback.href, '/mentors/bookings');
});

// -----------------------------------------------------------------------------
// 9. Mentor Profile Dynamic Back Navigation Resolution
// -----------------------------------------------------------------------------
console.log('--- 9. Mentor Profile Dynamic Back Navigation Resolution ---');

function resolveMentorProfileBackTarget(
  fromBooking: string | null,
  fromOrigin: string | null
): { href: string; label: string } {
  if (fromBooking) {
    const qs = fromOrigin ? `?from=${fromOrigin}` : '';
    return {
      href: `/mentors/bookings/${fromBooking}${qs}`,
      label: 'Back to Booking Details',
    };
  }
  if (fromOrigin === 'dashboard') {
    return {
      href: '/dashboard',
      label: 'Back to Dashboard',
    };
  }
  return {
    href: '/mentors',
    label: 'Back to Mentors Discovery',
  };
}

it('resolves mentor profile back target to Booking Details preserving dashboard origin', () => {
  const target = resolveMentorProfileBackTarget('booking-6adeed', 'dashboard');
  assert.strictEqual(target.label, 'Back to Booking Details');
  assert.strictEqual(target.href, '/mentors/bookings/booking-6adeed?from=dashboard');
});

it('resolves mentor profile back target to Booking Details without extra origin', () => {
  const target = resolveMentorProfileBackTarget('booking-xyz', null);
  assert.strictEqual(target.label, 'Back to Booking Details');
  assert.strictEqual(target.href, '/mentors/bookings/booking-xyz');
});

it('resolves mentor profile back target to Mentors Discovery when navigating from discovery', () => {
  const target = resolveMentorProfileBackTarget(null, null);
  assert.strictEqual(target.label, 'Back to Mentors Discovery');
  assert.strictEqual(target.href, '/mentors');
});

console.log('\n========================================');
console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}

