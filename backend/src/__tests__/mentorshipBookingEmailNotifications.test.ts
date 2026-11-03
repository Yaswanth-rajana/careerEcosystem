import { db } from '../db/client';
import { BookingService } from '../services/mentorship/bookingService';
import { AvailabilityService } from '../services/mentorship/availabilityService';
import { EmailService } from '../services/email/emailService';
import { IEmailProvider, SendEmailOptions, EmailSendResult } from '../services/email/types';
import {
  renderBookingConfirmedStudentEmail,
  renderBookingConfirmedMentorEmail,
  renderRescheduleRequestedMentorEmail,
  renderRescheduleApprovedStudentEmail,
  renderBookingCancelledByMentorEmail,
  renderBookingCancelledByCandidateEmail,
  renderRescheduleRejectedStudentEmail,
  formatBookingDate,
  formatBookingTimeRange,
  formatBookingDuration,
  resolveSafeTimezone,
} from '../services/email/templates/mentorship';
import { escapeHtml } from '../services/email/templates/mentorship/dateTimeHelper';
import { resolveAppUrl, resolveMentorPortalUrl } from '../services/email/templates/urlHelper';

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

/**
 * Mock email provider that captures dispatched emails and supports simulated failures.
 */
class MockEmailProvider implements IEmailProvider {
  public sentEmails: SendEmailOptions[] = [];
  public shouldFail: boolean = false;
  public failErrorMessage: string = 'Simulated SMTP connection error';

  async sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
    if (this.shouldFail) {
      return {
        success: false,
        error: this.failErrorMessage,
      };
    }

    this.sentEmails.push({ ...options });
    return {
      success: true,
      messageId: `mock_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      simulated: true,
    };
  }

  clear() {
    this.sentEmails = [];
    this.shouldFail = false;
  }
}

async function runMentorshipBookingEmailNotificationTests() {
  console.log('\n📧 Starting Mentorship Booking Email Notification Test Suite...\n');

  const mockProvider = new MockEmailProvider();
  EmailService.setProvider(mockProvider);

  let candidateUser: any = null;
  let mentorUser: any = null;
  let service60: any = null;
  const suffix = Date.now().toString(36);

  const studentEmail = `student.${suffix}@pathway.test`;
  const studentName = 'Aarav Mehta';
  const mentorEmail = `mentor.${suffix}@pathway.test`;
  const mentorName = 'Dr. Priya Sharma';

  try {
    // -------------------------------------------------------------------------
    // Setup Test Fixtures in MongoDB
    // -------------------------------------------------------------------------
    console.log('--- Setting Up Test Fixtures in MongoDB ---');

    candidateUser = await db.user.create({
      data: {
        email: studentEmail,
        name: studentName,
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    mentorUser = await db.mentor.create({
      data: {
        email: mentorEmail,
        name: mentorName,
        headline: 'Principal AI Researcher & Tech Coach',
        bio: 'Over 12 years in AI research and career mentorship.',
        domain: 'ENGINEERING',
        company: 'Google DeepMind',
        status: 'APPROVED',
        bookingVersion: 1,
      },
    });

    service60 = await db.mentorshipService.create({
      data: {
        mentorId: mentorUser.id,
        title: 'System Design & Career Strategy',
        category: 'INTERVIEW_PREP',
        description: 'Comprehensive 60-minute 1-on-1 coaching session.',
        duration: 60,
        price: 1500,
        currency: 'INR',
        active: true,
      },
    });

    // Provide availability rules for mentor: Mon-Fri, 08:00 - 22:00
    await db.availabilityRule.create({
      data: {
        mentorId: mentorUser.id,
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        endTime: '22:00',
        timezone: 'Asia/Kolkata',
      },
    });
    await db.availabilityRule.create({
      data: {
        mentorId: mentorUser.id,
        dayOfWeek: 2, // Tuesday
        startTime: '08:00',
        endTime: '22:00',
        timezone: 'Asia/Kolkata',
      },
    });
    await db.availabilityRule.create({
      data: {
        mentorId: mentorUser.id,
        dayOfWeek: 3, // Wednesday
        startTime: '08:00',
        endTime: '22:00',
        timezone: 'Asia/Kolkata',
      },
    });

    // -------------------------------------------------------------------------
    // Scenario 1: Successful booking sends the correct student & mentor notifications
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 1: Successful Booking Notifications ---');
    mockProvider.clear();

    // Pick a future Monday 10:00 - 11:00 AM Kolkata time
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + ((1 + 7 - futureDate.getDay()) % 7 || 7)); // Next Monday
    futureDate.setUTCHours(4, 30, 0, 0); // 10:00 AM IST

    const createdBooking = await BookingService.createBooking(candidateUser.id, {
      mentorId: mentorUser.id,
      serviceId: service60.id,
      scheduledStart: futureDate.toISOString(),
      studentNotes: 'Interested in distributed systems design.',
      timezone: 'Asia/Kolkata',
    });

    assert(createdBooking.status === 'CONFIRMED', 'Booking created with CONFIRMED status');
    assert(mockProvider.sentEmails.length === 2, 'Exactly 2 emails dispatched on successful booking (student & mentor)', `count=${mockProvider.sentEmails.length}`);

    const studentConfirmEmail = mockProvider.sentEmails.find((e) => e.to === studentEmail);
    const mentorConfirmEmail = mockProvider.sentEmails.find((e) => e.to === mentorEmail);

    assert(!!studentConfirmEmail, 'Student received booking confirmation email');
    assert(
      studentConfirmEmail?.subject === `PATHWAY.ECO | Mentorship Session Confirmed — ${mentorName}`,
      'Student subject matches: PATHWAY.ECO | Mentorship Session Confirmed — [Mentor Name]'
    );
    const escapedServiceTitle = escapeHtml(service60.title);
    assert(
      studentConfirmEmail?.htmlBody?.includes(mentorName) &&
      studentConfirmEmail?.htmlBody?.includes(escapedServiceTitle) &&
      studentConfirmEmail?.htmlBody?.includes('60 minutes'),
      'Student email includes mentor name, service title, and duration'
    );
    assert(
      studentConfirmEmail?.htmlBody?.includes(`${resolveAppUrl()}/mentors/bookings/${createdBooking.id}`),
      'Student email contains correct authorized student portal booking link'
    );

    assert(!!mentorConfirmEmail, 'Mentor received new booking notification email');
    assert(
      mentorConfirmEmail?.subject === `PATHWAY.ECO | New Mentorship Booking — ${studentName}`,
      'Mentor subject matches: PATHWAY.ECO | New Mentorship Booking — [Student Name]'
    );
    assert(
      mentorConfirmEmail?.htmlBody?.includes(studentName) &&
      mentorConfirmEmail?.htmlBody?.includes(escapedServiceTitle),
      'Mentor email includes student name and service title'
    );
    assert(
      mentorConfirmEmail?.htmlBody?.includes(`${resolveMentorPortalUrl()}/mentorship/bookings/${createdBooking.id}`),
      'Mentor email contains correct authorized mentor portal booking link'
    );

    // -------------------------------------------------------------------------
    // Scenario 2: Failed booking sends no confirmation emails
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 2: Failed Booking Dispatches No Emails ---');
    mockProvider.clear();

    let bookingErrorOccurred = false;
    try {
      // Attempt booking in the past
      await BookingService.createBooking(candidateUser.id, {
        mentorId: mentorUser.id,
        serviceId: service60.id,
        scheduledStart: '2020-01-01T10:00:00.000Z',
      });
    } catch {
      bookingErrorOccurred = true;
    }

    assert(bookingErrorOccurred, 'Booking with past datetime failed as expected');
    assert(mockProvider.sentEmails.length === 0, 'No emails dispatched when booking creation fails');

    // -------------------------------------------------------------------------
    // Scenario 3: Successful reschedule request notifies only the mentor
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 3: Reschedule Request Notifies Only Mentor ---');
    mockProvider.clear();

    const replacementDate = new Date(futureDate.getTime() + 24 * 60 * 60 * 1000); // Next day (Tuesday) 10:00 AM IST
    const studentRescheduleNote = 'Need to push back by 24h due to university seminar.';

    const rescheduledDTO = await BookingService.rescheduleBookingByCandidate(
      createdBooking.id,
      candidateUser.id,
      {
        scheduledStart: replacementDate.toISOString(),
        studentNotes: studentRescheduleNote,
      }
    );

    assert(rescheduledDTO.status === 'RESCHEDULE_REQUESTED', 'Booking status transitioned to RESCHEDULE_REQUESTED');
    assert(mockProvider.sentEmails.length === 1, 'Exactly 1 email sent upon reschedule request', `count=${mockProvider.sentEmails.length}`);

    const mentorReschedEmail = mockProvider.sentEmails[0];
    assert(mentorReschedEmail?.to === mentorEmail, 'Reschedule request email delivered to mentor');
    assert(
      mentorReschedEmail?.subject === `PATHWAY.ECO | Reschedule Request — ${studentName}`,
      'Reschedule request subject matches: PATHWAY.ECO | Reschedule Request — [Student Name]'
    );
    assert(
      mentorReschedEmail?.htmlBody?.includes(studentRescheduleNote),
      'Mentor email contains student reschedule note'
    );
    assert(
      mentorReschedEmail?.htmlBody?.includes('This request is pending your approval') &&
      mentorReschedEmail?.htmlBody?.includes('The proposed time is not yet confirmed'),
      'Proposed time is clearly labelled as pending approval and not confirmed'
    );
    assert(
      mentorReschedEmail?.htmlBody?.includes(`${resolveMentorPortalUrl()}/mentorship/bookings/${createdBooking.id}`),
      'Mentor email links to mentor portal review page'
    );

    // -------------------------------------------------------------------------
    // Scenario 4: Failed reschedule sends no notification
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 4: Failed Reschedule Sends No Notification ---');
    mockProvider.clear();

    let rescheduleError = false;
    try {
      // Attempt reschedule by wrong candidate (unauthorized)
      await BookingService.rescheduleBookingByCandidate(
        createdBooking.id,
        '64aed1234567890123456789', // invalid candidate id
        {
          scheduledStart: replacementDate.toISOString(),
        }
      );
    } catch {
      rescheduleError = true;
    }

    assert(rescheduleError, 'Unauthorized reschedule request correctly failed');
    assert(mockProvider.sentEmails.length === 0, 'No notification dispatched on failed reschedule attempt');

    // -------------------------------------------------------------------------
    // Scenario 5: Successful mentor approval notifies student with committed replacement schedule
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 5: Mentor Approval Notifies Student ---');
    mockProvider.clear();

    const approvedDTO = await BookingService.updateBookingStatus(
      createdBooking.id,
      mentorUser.id,
      {
        action: 'APPROVE_RESCHEDULE',
      }
    );

    assert(approvedDTO.status === 'CONFIRMED', 'Booking confirmed at approved replacement time');
    assert(mockProvider.sentEmails.length === 1, 'Exactly 1 notification sent upon mentor approval');

    const studentApprovedEmail = mockProvider.sentEmails[0];
    assert(studentApprovedEmail?.to === studentEmail, 'Reschedule approval delivered to student');
    assert(
      studentApprovedEmail?.subject === `PATHWAY.ECO | Reschedule Confirmed — ${mentorName}`,
      'Subject matches: PATHWAY.ECO | Reschedule Confirmed — [Mentor Name]'
    );
    assert(
      studentApprovedEmail?.htmlBody?.includes(mentorName) &&
      studentApprovedEmail?.htmlBody?.includes(escapedServiceTitle) &&
      studentApprovedEmail?.htmlBody?.includes('60 minutes'),
      'Approval email includes mentor name, service title, and duration'
    );
    assert(
      studentApprovedEmail?.htmlBody?.includes(`${resolveAppUrl()}/mentors/bookings/${createdBooking.id}`),
      'Approval email contains student portal booking link'
    );

    // -------------------------------------------------------------------------
    // Scenario 6: Mentor rejection preserves original schedule and notifies student
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 6: Mentor Reschedule Rejection ---');
    // Request another reschedule to Wednesday
    const wednesdayDate = new Date(futureDate.getTime() + 48 * 60 * 60 * 1000);
    await BookingService.rescheduleBookingByCandidate(
      createdBooking.id,
      candidateUser.id,
      {
        scheduledStart: wednesdayDate.toISOString(),
        studentNotes: 'Can we move to Wednesday?',
      }
    );

    mockProvider.clear();

    const rejectionReason = 'Cannot accommodate Wednesday due to research deadlines.';
    const rejectedDTO = await BookingService.updateBookingStatus(
      createdBooking.id,
      mentorUser.id,
      {
        action: 'REJECT_RESCHEDULE',
        reason: rejectionReason,
      }
    );

    assert(rejectedDTO.status === 'CONFIRMED', 'Booking status restored to CONFIRMED on rejection');
    assert(mockProvider.sentEmails.length === 1, 'Exactly 1 notification sent upon mentor rejection');

    const studentRejectionEmail = mockProvider.sentEmails[0];
    assert(studentRejectionEmail?.to === studentEmail, 'Rejection email sent to student');
    assert(
      studentRejectionEmail?.subject === `PATHWAY.ECO | Reschedule Request Declined — ${mentorName}`,
      'Subject matches: PATHWAY.ECO | Reschedule Request Declined — [Mentor Name]'
    );
    assert(
      studentRejectionEmail?.htmlBody?.includes(rejectionReason),
      'Email includes mentor decline feedback reason'
    );
    assert(
      studentRejectionEmail?.htmlBody?.includes('original confirmed schedule remains in effect'),
      'Email explicitly states original schedule remains in effect'
    );

    // -------------------------------------------------------------------------
    // Scenario 7: Mentor cancellation includes exact persisted cancellation reason
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 7: Mentor Cancellation ---');
    mockProvider.clear();

    const mentorCancelReason = 'Sudden international conference keynote travel.';
    const cancelledByMentorDTO = await BookingService.updateBookingStatus(
      createdBooking.id,
      mentorUser.id,
      {
        action: 'CANCEL',
        reason: mentorCancelReason,
      }
    );

    assert(cancelledByMentorDTO.status === 'CANCELLED_BY_MENTOR', 'Booking status set to CANCELLED_BY_MENTOR');
    assert(mockProvider.sentEmails.length === 1, 'Exactly 1 email sent upon mentor cancellation');

    const studentCancelledEmail = mockProvider.sentEmails[0];
    assert(studentCancelledEmail?.to === studentEmail, 'Cancellation email delivered to student');
    assert(
      studentCancelledEmail?.subject === `PATHWAY.ECO | Session Cancellation — ${mentorName}`,
      'Subject matches: PATHWAY.ECO | Session Cancellation — [Mentor Name]'
    );
    assert(
      studentCancelledEmail?.htmlBody?.includes(mentorCancelReason),
      'Email includes the exact persisted cancellation reason'
    );
    assert(
      studentCancelledEmail?.htmlBody?.includes(`${resolveAppUrl()}/mentors/bookings/${createdBooking.id}`),
      'Cancellation email links to student booking details'
    );

    // -------------------------------------------------------------------------
    // Scenario 8: Student cancellation notifies the mentor
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 8: Student Cancellation Notifies Mentor ---');
    mockProvider.clear();

    // Create a fresh booking for student cancellation test
    const secondMonday = new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const freshBooking = await BookingService.createBooking(candidateUser.id, {
      mentorId: mentorUser.id,
      serviceId: service60.id,
      scheduledStart: secondMonday.toISOString(),
      timezone: 'Asia/Kolkata',
    });

    mockProvider.clear();

    const studentCancelReason = 'Accepted an urgent internship offer starting this week.';
    const cancelledByStudentDTO = await BookingService.cancelBookingByCandidate(
      freshBooking.id,
      candidateUser.id,
      studentCancelReason
    );

    assert(cancelledByStudentDTO.status === 'CANCELLED_BY_CANDIDATE', 'Booking status set to CANCELLED_BY_CANDIDATE');
    assert(mockProvider.sentEmails.length === 1, 'Exactly 1 email sent upon student cancellation');

    const mentorCancelledEmail = mockProvider.sentEmails[0];
    assert(mentorCancelledEmail?.to === mentorEmail, 'Cancellation email delivered to mentor');
    assert(
      mentorCancelledEmail?.subject === `PATHWAY.ECO | Booking Cancelled by Student — ${studentName}`,
      'Subject matches: PATHWAY.ECO | Booking Cancelled by Student — [Student Name]'
    );
    assert(
      mentorCancelledEmail?.htmlBody?.includes(studentCancelReason),
      'Mentor email contains student cancellation reason'
    );
    assert(
      mentorCancelledEmail?.htmlBody?.includes('reopened for other learners'),
      'Mentor email confirms availability slot has been reopened'
    );

    // -------------------------------------------------------------------------
    // Scenario 9: Concurrent requests do not generate duplicate emails
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 9: Idempotency & Duplicate Prevention ---');
    mockProvider.clear();

    const duplicateTestBookingId = `dup_test_${Date.now()}`;
    const duplicateParams = {
      bookingId: duplicateTestBookingId,
      studentName,
      studentEmail,
      mentorName,
      mentorEmail,
      serviceTitle: service60.title,
      scheduledStart: secondMonday,
      scheduledEnd: new Date(secondMonday.getTime() + 60 * 60 * 1000),
      duration: 60,
      timezone: 'Asia/Kolkata',
    };

    // First call sends
    const firstDispatch = await EmailService.sendMentorshipBookingConfirmedStudentEmail(duplicateParams);
    assert(firstDispatch.success === true, 'First student confirmation dispatch succeeds');
    assert(mockProvider.sentEmails.length === 1, 'First dispatch sends 1 email');

    // Duplicate call skips
    const secondDispatch = await EmailService.sendMentorshipBookingConfirmedStudentEmail(duplicateParams);
    assert(secondDispatch.success === true && secondDispatch.alreadySent === true, 'Second dispatch detects existing delivery and returns alreadySent: true');
    assert(mockProvider.sentEmails.length === 1, 'Mock provider did not receive duplicate email');

    // -------------------------------------------------------------------------
    // Scenario 10: Email provider failure does not undo a committed booking
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 10: Provider Failure Does Not Undo Booking ---');
    mockProvider.clear();
    mockProvider.shouldFail = true; // Inject provider network / auth failure

    const thirdMonday = new Date(futureDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    const bookingWithProviderFailure = await BookingService.createBooking(candidateUser.id, {
      mentorId: mentorUser.id,
      serviceId: service60.id,
      scheduledStart: thirdMonday.toISOString(),
      timezone: 'Asia/Kolkata',
    });

    assert(
      bookingWithProviderFailure.status === 'CONFIRMED' && !!bookingWithProviderFailure.id,
      'Booking committed successfully despite email provider network failure'
    );

    // Verify booking is persisted in database
    const persistedBooking = await db.booking.findUnique({
      where: { id: bookingWithProviderFailure.id },
    });
    assert(!!persistedBooking, 'Committed booking exists in database');
    mockProvider.shouldFail = false;

    // -------------------------------------------------------------------------
    // Scenario 11: HTML templates escape untrusted notes and cancellation reasons
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 11: Untrusted Input Sanitization (XSS Defense) ---');
    const xssPayload = '<script>alert("xss")</script><img src=x onerror=alert(1)> & "quotes" \'apostrophe\'';

    const xssResched = renderRescheduleRequestedMentorEmail({
      bookingId: '64aed1234567890123456789',
      mentorName: 'Priya <script>',
      mentorEmail: 'priya@test.com',
      studentName: 'Aarav <img src=x>',
      studentEmail: 'aarav@test.com',
      serviceTitle: 'Architecture & Scalability',
      originalStart: new Date(),
      originalEnd: new Date(),
      proposedStart: new Date(),
      proposedEnd: new Date(),
      studentNotes: xssPayload,
      timezone: 'Asia/Kolkata',
    });

    assert(!xssResched.html.includes('<script>alert'), 'Raw <script> tag is NOT present in rendered HTML');
    assert(xssResched.html.includes('&lt;script&gt;alert'), '<script> is properly escaped to &lt;script&gt;');
    assert(!xssResched.html.includes('<img src=x onerror='), 'Raw onerror img tag is NOT present in rendered HTML');
    assert(xssResched.html.includes('&amp;'), '& character is properly escaped to &amp;');

    const xssCancelled = renderBookingCancelledByMentorEmail({
      bookingId: '64aed1234567890123456789',
      mentorName: 'Priya',
      mentorEmail: 'priya@test.com',
      studentName: 'Aarav',
      studentEmail: 'aarav@test.com',
      serviceTitle: 'Architecture',
      sessionStart: new Date(),
      sessionEnd: new Date(),
      cancellationReason: xssPayload,
    });
    assert(!xssCancelled.html.includes('<script>'), 'Cancellation reason escapes <script>');
    assert(xssCancelled.html.includes('&lt;script&gt;'), 'Cancellation reason transforms <script> to &lt;script&gt;');

    // -------------------------------------------------------------------------
    // Scenario 12: Student and mentor emails use the correct portal routes
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 12: Portal Routes & Meeting Link Policy ---');
    const studentTpl = renderBookingConfirmedStudentEmail({
      bookingId: '64aed1234567890123456789',
      studentName: 'Aarav',
      studentEmail: 'aarav@test.com',
      mentorName: 'Priya',
      mentorEmail: 'priya@test.com',
      serviceTitle: 'Test Service',
      scheduledStart: new Date(),
      scheduledEnd: new Date(),
      timezone: 'Asia/Kolkata',
    });
    assert(
      studentTpl.html.includes('/mentors/bookings/64aed1234567890123456789'),
      'Student email uses /mentors/bookings/:id path'
    );
    assert(
      !studentTpl.html.includes('https://meet.pathway.eco') &&
      !studentTpl.html.includes('https://zoom.us') &&
      !studentTpl.text.includes('https://meet.pathway.eco'),
      'Meeting room URLs are NOT hardcoded into booking emails'
    );

    const mentorTpl = renderBookingConfirmedMentorEmail({
      bookingId: '64aed1234567890123456789',
      studentName: 'Aarav',
      studentEmail: 'aarav@test.com',
      mentorName: 'Priya',
      mentorEmail: 'priya@test.com',
      serviceTitle: 'Test Service',
      scheduledStart: new Date(),
      scheduledEnd: new Date(),
      timezone: 'Asia/Kolkata',
    });
    assert(
      mentorTpl.html.includes('/mentorship/bookings/64aed1234567890123456789'),
      'Mentor email uses /mentorship/bookings/:id path'
    );

    // -------------------------------------------------------------------------
    // Scenario 13: Timezone conversion and date formatting
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 13: Timezone Formatting Accuracy ---');
    // UTC: 2026-11-05T09:00:00Z -> IST (+5:30): 14:30 (2:30 PM)
    const testUtcDate = new Date('2026-11-05T09:00:00.000Z');
    const testUtcEnd = new Date('2026-11-05T10:00:00.000Z');

    const formattedIstDate = formatBookingDate(testUtcDate, 'Asia/Kolkata');
    assert(formattedIstDate.includes('November 5, 2026') || formattedIstDate.includes('Thursday'), 'Date formats accurately in Asia/Kolkata');

    const formattedIstTime = formatBookingTimeRange(testUtcDate, testUtcEnd, 'Asia/Kolkata');
    assert(formattedIstTime.includes('14:30 – 15:30') || formattedIstTime.includes('2:30 PM'), 'Time range formats accurately in Asia/Kolkata (14:30 - 15:30)');

    // UTC: 2026-11-05T09:00:00Z -> America/New_York (UTC-5): 04:00 (4:00 AM)
    const formattedNyTime = formatBookingTimeRange(testUtcDate, testUtcEnd, 'America/New_York');
    assert(formattedNyTime.includes('04:00 – 05:00') || formattedNyTime.includes('4:00 AM'), 'Time range formats accurately in America/New_York');

    // Safe fallback for invalid timezone
    const safeTz = resolveSafeTimezone('Invalid/Nonexistent_Timezone');
    assert(safeTz === 'Asia/Kolkata', 'Invalid timezone safely falls back to Asia/Kolkata');

    // -------------------------------------------------------------------------
    // Scenario 14: Retries do not resend already delivered emails
    // -------------------------------------------------------------------------
    console.log('\n--- Scenario 14: Retry Deduplication Guarantee ---');
    mockProvider.clear();

    const retryBookingId = `retry_test_${Date.now()}`;
    const cancellationParams = {
      bookingId: retryBookingId,
      studentName,
      studentEmail,
      mentorName,
      mentorEmail,
      serviceTitle: service60.title,
      sessionStart: futureDate,
      sessionEnd: new Date(futureDate.getTime() + 60 * 60 * 1000),
      cancellationReason: 'Duplicate retry test',
      timezone: 'Asia/Kolkata',
    };

    // First send
    const firstCancelSend = await EmailService.sendMentorshipBookingCancelledByMentorEmail(cancellationParams);
    assert(firstCancelSend.success === true, 'Initial cancellation email successfully sent');
    assert(mockProvider.sentEmails.length === 1, 'Initial send delivered 1 email');

    // Second call simulates idempotent retry
    const secondCancelSend = await EmailService.sendMentorshipBookingCancelledByMentorEmail(cancellationParams);
    assert(secondCancelSend.alreadySent === true, 'Repeated call recognizes delivery record and flags alreadySent: true');
    assert(mockProvider.sentEmails.length === 1, 'Email provider was NOT invoked on retry');

  } catch (err: any) {
    console.error('Unhandled exception in test suite:', err);
    failed++;
  } finally {
    // Cleanup created test records
    try {
      if (candidateUser?.id) {
        await db.booking.deleteMany({ where: { candidateId: candidateUser.id } }).catch(() => {});
        await db.user.delete({ where: { id: candidateUser.id } }).catch(() => {});
      }
      if (mentorUser?.id) {
        await db.mentorshipService.deleteMany({ where: { mentorId: mentorUser.id } }).catch(() => {});
        await db.availabilityRule.deleteMany({ where: { mentorId: mentorUser.id } }).catch(() => {});
        await db.mentor.delete({ where: { id: mentorUser.id } }).catch(() => {});
      }
    } catch (cleanupErr) {
      console.error('Test cleanup error:', cleanupErr);
    }

    console.log('\n======================================================');
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runMentorshipBookingEmailNotificationTests();
