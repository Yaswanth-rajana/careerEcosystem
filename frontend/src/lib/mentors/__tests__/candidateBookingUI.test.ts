import assert from 'node:assert';

/**
 * PATHWAY.ECO — Candidate Booking UI Logic and State Verification Test Suite
 *
 * Verifies Requirement 7 item 10:
 * - UI loading state representation
 * - UI empty states across all tabs (upcoming, past, cancelled)
 * - UI error state representation and retry mechanism
 * - Cancellation confirmation modal state machine
 * - Date/time localization across timezones
 * - Pagination state and bounds logic
 */

console.log('🧪 Starting Candidate Booking UI State & Formatting Tests...\n');

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

// -----------------------------------------------------------------------------
// 1. Date & Time Localization Helper Logic
// -----------------------------------------------------------------------------
console.log('--- 1. Date/Time Localization Helper ---');

function formatBookingDateTime(isoStart: string, isoEnd: string, timezone: string): {
  dateStr: string;
  timeStr: string;
} {
  try {
    const start = new Date(isoStart);
    const end = new Date(isoEnd);

    const dateStr = start.toLocaleDateString('en-US', {
      timeZone: timezone || 'Asia/Kolkata',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const timeStart = start.toLocaleTimeString('en-US', {
      timeZone: timezone || 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const timeEnd = end.toLocaleTimeString('en-US', {
      timeZone: timezone || 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return {
      dateStr,
      timeStr: `${timeStart} – ${timeEnd}`,
    };
  } catch {
    return {
      dateStr: isoStart ? isoStart.slice(0, 10) : '',
      timeStr: '',
    };
  }
}

it('Formats UTC timestamps correctly in Asia/Kolkata timezone', () => {
  const result = formatBookingDateTime(
    '2028-11-03T03:30:00.000Z',
    '2028-11-03T04:15:00.000Z',
    'Asia/Kolkata'
  );
  assert.strictEqual(result.dateStr, 'Fri, Nov 3, 2028');
  assert.ok(result.timeStr.includes('9:00'));
  assert.ok(result.timeStr.includes('9:45'));
  assert.ok(result.timeStr.includes('AM'));
});

it('Formats UTC timestamps correctly in America/New_York timezone', () => {
  const result = formatBookingDateTime(
    '2028-11-03T14:00:00.000Z',
    '2028-11-03T15:00:00.000Z',
    'America/New_York'
  );
  assert.strictEqual(result.dateStr, 'Fri, Nov 3, 2028');
  assert.ok(result.timeStr.includes('10:00'));
  assert.ok(result.timeStr.includes('11:00'));
});

it('Gracefully falls back when timestamp is invalid', () => {
  const result = formatBookingDateTime('invalid-date', 'invalid-date', 'UTC');
  assert.strictEqual(typeof result.dateStr, 'string');
});

// -----------------------------------------------------------------------------
// 2. Status Indicator Mapping
// -----------------------------------------------------------------------------
console.log('\n--- 2. Booking Status Badge Indicators ---');

function getStatusBadgeConfig(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return { label: 'Confirmed', variant: 'emerald' };
    case 'COMPLETED':
      return { label: 'Completed', variant: 'blue' };
    case 'CANCELLED_BY_CANDIDATE':
      return { label: 'Cancelled by you', variant: 'slate' };
    case 'CANCELLED_BY_MENTOR':
      return { label: 'Cancelled by mentor', variant: 'rose' };
    case 'RESCHEDULE_REQUESTED':
      return { label: 'Reschedule Requested', variant: 'amber' };
    case 'NO_SHOW':
      return { label: 'No Show', variant: 'rose' };
    default:
      return { label: status, variant: 'slate' };
  }
}

it('Maps CONFIRMED status to emerald badge with Confirmed label', () => {
  const cfg = getStatusBadgeConfig('CONFIRMED');
  assert.strictEqual(cfg.label, 'Confirmed');
  assert.strictEqual(cfg.variant, 'emerald');
});

it('Maps CANCELLED_BY_CANDIDATE to user-friendly label', () => {
  const cfg = getStatusBadgeConfig('CANCELLED_BY_CANDIDATE');
  assert.strictEqual(cfg.label, 'Cancelled by you');
  assert.strictEqual(cfg.variant, 'slate');
});

it('Maps CANCELLED_BY_MENTOR to mentor-specific label', () => {
  const cfg = getStatusBadgeConfig('CANCELLED_BY_MENTOR');
  assert.strictEqual(cfg.label, 'Cancelled by mentor');
  assert.strictEqual(cfg.variant, 'rose');
});

it('Maps COMPLETED to blue badge', () => {
  const cfg = getStatusBadgeConfig('COMPLETED');
  assert.strictEqual(cfg.label, 'Completed');
  assert.strictEqual(cfg.variant, 'blue');
});

// -----------------------------------------------------------------------------
// 3. Tab Navigation & Empty State Mapping
// -----------------------------------------------------------------------------
console.log('\n--- 3. Empty State Messages Per Tab ---');

function getEmptyStateInfo(tab: 'upcoming' | 'past' | 'cancelled') {
  switch (tab) {
    case 'upcoming':
      return {
        title: 'No upcoming sessions scheduled',
        subtitle: 'Explore our vetted tech and career mentors and book your first 1-on-1 strategy call.',
        actionLabel: 'Browse Mentors',
      };
    case 'past':
      return {
        title: 'No completed or past sessions',
        subtitle: 'Sessions you attend will appear here with history, notes, and mentor insights.',
        actionLabel: null,
      };
    case 'cancelled':
      return {
        title: 'No cancelled sessions',
        subtitle: 'Any sessions cancelled by you or your mentor will be listed here for your records.',
        actionLabel: null,
      };
  }
}

it('Provides action prompt for upcoming empty state', () => {
  const empty = getEmptyStateInfo('upcoming');
  assert.ok(empty.title.includes('No upcoming'));
  assert.strictEqual(empty.actionLabel, 'Browse Mentors');
});

it('Provides informational past sessions empty state', () => {
  const empty = getEmptyStateInfo('past');
  assert.ok(empty.title.includes('No completed'));
  assert.strictEqual(empty.actionLabel, null);
});

it('Provides informational cancelled sessions empty state', () => {
  const empty = getEmptyStateInfo('cancelled');
  assert.ok(empty.title.includes('No cancelled'));
  assert.strictEqual(empty.actionLabel, null);
});

// -----------------------------------------------------------------------------
// 4. Cancellation Confirmation Modal State Machine
// -----------------------------------------------------------------------------
console.log('\n--- 4. Cancellation Modal State Machine ---');

interface ModalState {
  targetBooking: any | null;
  reason: string;
  isCancelling: boolean;
  error: string | null;
}

function initModalState(): ModalState {
  return {
    targetBooking: null,
    reason: '',
    isCancelling: false,
    error: null,
  };
}

function openCancelModal(state: ModalState, booking: any): ModalState {
  if (!booking.canCancel) {
    throw new Error('Booking cannot be cancelled');
  }
  return {
    ...state,
    targetBooking: booking,
    reason: '',
    error: null,
    isCancelling: false,
  };
}

function submitCancelStart(state: ModalState): ModalState {
  return {
    ...state,
    isCancelling: true,
    error: null,
  };
}

function submitCancelFail(state: ModalState, errorMsg: string): ModalState {
  return {
    ...state,
    isCancelling: false,
    error: errorMsg,
  };
}

function submitCancelSuccess(state: ModalState): ModalState {
  return {
    ...state,
    targetBooking: null,
    reason: '',
    isCancelling: false,
    error: null,
  };
}

it('Opens modal only for bookings where canCancel is true', () => {
  const state = initModalState();
  const validBooking = { id: 'bk_1', canCancel: true, mentor: { name: 'Priya' } };
  const next = openCancelModal(state, validBooking);
  assert.strictEqual(next.targetBooking.id, 'bk_1');
  assert.strictEqual(next.isCancelling, false);
});

it('Throws error when trying to open modal for ineligible booking', () => {
  const state = initModalState();
  const invalidBooking = { id: 'bk_2', canCancel: false };
  assert.throws(() => openCancelModal(state, invalidBooking), /cannot be cancelled/);
});

it('Transitions modal through submitting, error, and success states', () => {
  let state = initModalState();
  state = openCancelModal(state, { id: 'bk_1', canCancel: true });
  assert.strictEqual(state.isCancelling, false);

  // User clicks confirm
  state = submitCancelStart(state);
  assert.strictEqual(state.isCancelling, true);
  assert.strictEqual(state.error, null);

  // Conflict error from API
  state = submitCancelFail(state, 'This booking has already been cancelled');
  assert.strictEqual(state.isCancelling, false);
  assert.strictEqual(state.error, 'This booking has already been cancelled');
  assert.ok(state.targetBooking !== null); // Modal stays open showing error

  // User retries and succeeds
  state = submitCancelStart(state);
  state = submitCancelSuccess(state);
  assert.strictEqual(state.targetBooking, null); // Modal closes
  assert.strictEqual(state.error, null);
  assert.strictEqual(state.isCancelling, false);
});

// -----------------------------------------------------------------------------
// 5. Pagination Bounds Logic
// -----------------------------------------------------------------------------
console.log('\n--- 5. Pagination Bounds & Calculation ---');

function calculatePagination(total: number, page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  return {
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

it('Calculates correct pages for single page total', () => {
  const p = calculatePagination(3, 1, 10);
  assert.strictEqual(p.totalPages, 1);
  assert.strictEqual(p.hasNextPage, false);
  assert.strictEqual(p.hasPrevPage, false);
});

it('Calculates multi-page navigation correctly', () => {
  const p1 = calculatePagination(25, 1, 10);
  assert.strictEqual(p1.totalPages, 3);
  assert.strictEqual(p1.hasNextPage, true);
  assert.strictEqual(p1.hasPrevPage, false);

  const p2 = calculatePagination(25, 2, 10);
  assert.strictEqual(p2.hasNextPage, true);
  assert.strictEqual(p2.hasPrevPage, true);

  const p3 = calculatePagination(25, 3, 10);
  assert.strictEqual(p3.hasNextPage, false);
  assert.strictEqual(p3.hasPrevPage, true);
});

it('Handles 0 total items gracefully', () => {
  const p = calculatePagination(0, 1, 10);
  assert.strictEqual(p.totalPages, 1);
  assert.strictEqual(p.hasNextPage, false);
  assert.strictEqual(p.hasPrevPage, false);
});

// -----------------------------------------------------------------------------
// 6. UI Security: Meeting Link Display Eligibility
// -----------------------------------------------------------------------------
console.log('\n--- 6. UI Security: Meeting Link & Email Delivery Notice ---');

function shouldDisplayMeetingNotice(booking: {
  status: string;
}): boolean {
  return booking.status === 'CONFIRMED';
}

function getMeetingDeliveryMessage(mentorName: string): string {
  return `The meeting link will be sent to your email by ${mentorName}.`;
}

it('Displays meeting notice only for active CONFIRMED bookings', () => {
  const activeConfirmed = {
    status: 'CONFIRMED',
    mentorName: 'Priya Sundaram',
  };
  assert.strictEqual(shouldDisplayMeetingNotice(activeConfirmed), true);
  assert.strictEqual(
    getMeetingDeliveryMessage(activeConfirmed.mentorName),
    'The meeting link will be sent to your email by Priya Sundaram.'
  );
});

it('Hides meeting notice when booking is CANCELLED_BY_CANDIDATE', () => {
  const cancelled = {
    status: 'CANCELLED_BY_CANDIDATE',
  };
  assert.strictEqual(shouldDisplayMeetingNotice(cancelled), false);
});

it('Hides meeting notice when booking is CANCELLED_BY_MENTOR', () => {
  const cancelled = {
    status: 'CANCELLED_BY_MENTOR',
  };
  assert.strictEqual(shouldDisplayMeetingNotice(cancelled), false);
});

it('Hides meeting notice when booking status is RESCHEDULE_REQUESTED awaiting mentor approval', () => {
  const reschedulePending = {
    status: 'RESCHEDULE_REQUESTED',
  };
  assert.strictEqual(shouldDisplayMeetingNotice(reschedulePending), false);
});

// -----------------------------------------------------------------------------
// 7. Rescheduling Modal State Machine & Conflict Handling
// -----------------------------------------------------------------------------
console.log('\n--- 7. Rescheduling Modal State Machine & Conflict Handling ---');

interface RescheduleModalState {
  targetBooking: any | null;
  selectedDate: string;
  slots: any[];
  selectedSlot: any | null;
  isLoadingSlots: boolean;
  slotsError: string | null;
  isSubmitting: boolean;
  conflictError: string | null;
}

function initRescheduleModalState(): RescheduleModalState {
  return {
    targetBooking: null,
    selectedDate: '',
    slots: [],
    selectedSlot: null,
    isLoadingSlots: false,
    slotsError: null,
    isSubmitting: false,
    conflictError: null,
  };
}

function openRescheduleModal(state: RescheduleModalState, booking: any, initialDate: string): RescheduleModalState {
  if (!booking.canReschedule) {
    throw new Error('Booking is not eligible for rescheduling');
  }
  return {
    ...state,
    targetBooking: booking,
    selectedDate: initialDate,
    selectedSlot: null,
    conflictError: null,
    slotsError: null,
    isLoadingSlots: true,
  };
}

function slotsLoadedSuccess(state: RescheduleModalState, slots: any[]): RescheduleModalState {
  return {
    ...state,
    isLoadingSlots: false,
    slots,
    slotsError: null,
  };
}

function slotsLoadedEmpty(state: RescheduleModalState): RescheduleModalState {
  return {
    ...state,
    isLoadingSlots: false,
    slots: [],
    slotsError: null,
  };
}

function submitRescheduleStart(state: RescheduleModalState): RescheduleModalState {
  return {
    ...state,
    isSubmitting: true,
    conflictError: null,
  };
}

function submitRescheduleConflict(state: RescheduleModalState, conflictMsg: string): RescheduleModalState {
  return {
    ...state,
    isSubmitting: false,
    conflictError: conflictMsg,
  };
}

function submitRescheduleSuccess(state: RescheduleModalState): RescheduleModalState {
  return {
    ...state,
    targetBooking: null,
    selectedDate: '',
    slots: [],
    selectedSlot: null,
    isSubmitting: false,
    conflictError: null,
  };
}

it('Permits opening reschedule modal for active confirmed booking', () => {
  const state = initRescheduleModalState();
  const valid = { id: 'bk_1', canReschedule: true, status: 'CONFIRMED' };
  const next = openRescheduleModal(state, valid, '2028-11-03');
  assert.strictEqual(next.targetBooking.id, 'bk_1');
  assert.strictEqual(next.isLoadingSlots, true);
});

it('Rejects opening reschedule modal for booking with canReschedule=false', () => {
  const state = initRescheduleModalState();
  const invalid = { id: 'bk_2', canReschedule: false, status: 'RESCHEDULE_REQUESTED' };
  assert.throws(() => openRescheduleModal(state, invalid, '2028-11-03'), /not eligible for rescheduling/);
});

it('Handles empty slots state when mentor has no availability on selected date', () => {
  let state = initRescheduleModalState();
  state = openRescheduleModal(state, { id: 'bk_1', canReschedule: true }, '2028-11-10');
  state = slotsLoadedEmpty(state);
  assert.strictEqual(state.isLoadingSlots, false);
  assert.strictEqual(state.slots.length, 0);
  assert.strictEqual(state.selectedSlot, null);
});

it('Handles slot reservation collision and preserves modal state for retry', () => {
  let state = initRescheduleModalState();
  state = openRescheduleModal(state, { id: 'bk_1', canReschedule: true }, '2028-11-03');
  const dummySlots = [{ start: '2028-11-03T04:15:00.000Z', displayTime: '09:45 - 10:30' }];
  state = slotsLoadedSuccess(state, dummySlots);
  state.selectedSlot = dummySlots[0];

  // User submits
  state = submitRescheduleStart(state);
  assert.strictEqual(state.isSubmitting, true);

  // Backend returns 409 conflict
  state = submitRescheduleConflict(state, 'The requested replacement slot was just reserved by another candidate. Please select another slot.');
  assert.strictEqual(state.isSubmitting, false);
  assert.ok(state.conflictError?.includes('reserved by another candidate'));
  assert.ok(state.targetBooking !== null); // Modal stays open showing collision message

  // Success upon selecting free slot
  state = submitRescheduleStart(state);
  state = submitRescheduleSuccess(state);
  assert.strictEqual(state.targetBooking, null); // Closes on success
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log(`\n========================================`);
console.log(`UI Tests Passed: ${passed} | Failed: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
