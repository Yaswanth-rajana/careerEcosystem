import { resolveAppUrl, resolveMentorPortalUrl } from '../urlHelper';
import {
  escapeHtml,
  formatBookingDate,
  formatBookingTimeRange,
  formatBookingDuration,
  extractRecipientGreeting,
  resolveSafeTimezone,
} from './dateTimeHelper';

export interface BookingConfirmedEmailParams {
  bookingId: string;
  studentName: string;
  studentEmail: string;
  mentorName: string;
  mentorEmail: string;
  serviceTitle: string;
  scheduledStart: Date | string;
  scheduledEnd: Date | string;
  timezone?: string | null;
  duration?: number | null;
  bookingUrl?: string;
}

/**
 * Shared HTML wrapper for mentorship booking emails.
 */
function renderEmailShell(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <div style="background-color: #f8fafc; width: 100%; padding: 40px 16px; box-sizing: border-box;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);">
      <tr>
        <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;">
          <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">PATHWAY<span style="color: #2563eb;">.ECO</span></span>
        </td>
      </tr>
      <tr>
        <td style="padding: 32px;">
          ${bodyContent}
          <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px;">
            <p style="font-size: 14px; color: #1e293b; margin: 0 0 4px 0; font-weight: 600;">Best regards,</p>
            <p style="font-size: 14px; color: #0f172a; margin: 0 0 2px 0; font-weight: 700;">PATHWAY.ECO Team</p>
            <p style="font-size: 12px; color: #64748b; margin: 0 0 16px 0;">Empowering careers. Connecting possibilities.</p>
            <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.4;">
              This is an automated transactional notification. Please do not reply directly to this message.
            </p>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * Renders the Booking Confirmed email sent to the Student.
 */
export function renderBookingConfirmedStudentEmail(params: BookingConfirmedEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const safeTimezone = resolveSafeTimezone(params.timezone);
  const formattedDate = formatBookingDate(params.scheduledStart, safeTimezone);
  const formattedTime = formatBookingTimeRange(params.scheduledStart, params.scheduledEnd, safeTimezone);
  const formattedDuration = formatBookingDuration(params.duration);

  const greetingName = extractRecipientGreeting(params.studentName);
  const subject = `PATHWAY.ECO | Mentorship Session Confirmed — ${params.mentorName}`;

  const bookingUrl =
    params.bookingUrl && params.bookingUrl.trim().length > 0
      ? params.bookingUrl.trim()
      : `${resolveAppUrl()}/mentors/bookings/${params.bookingId}`;

  const htmlBody = `
    <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3; letter-spacing: -0.3px;">
      Your mentorship session is confirmed
    </h1>

    <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0; line-height: 1.6;">
      Dear ${escapeHtml(greetingName)},
    </p>

    <p style="font-size: 14px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
      Your mentorship session has been successfully booked on PATHWAY.ECO.
    </p>

    <div style="margin: 0 0 28px 0; padding: 22px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
      <div style="font-size: 12px; font-weight: 800; color: #475569; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.6px;">
        SESSION DETAILS
      </div>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 130px;">Mentor:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${escapeHtml(params.mentorName)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Student:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${escapeHtml(params.studentName)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Service:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${escapeHtml(params.serviceTitle)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Date:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${escapeHtml(formattedDate)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Time:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${escapeHtml(formattedTime)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Timezone:</td>
          <td style="padding: 6px 0; font-weight: 500; color: #334155;">${escapeHtml(safeTimezone)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Duration:</td>
          <td style="padding: 6px 0; font-weight: 500; color: #334155;">${escapeHtml(formattedDuration)}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
      You can review the complete booking details using the button below.
    </p>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                <a href="${bookingUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 34px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; line-height: 1;">
                  View Booking
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0; text-align: center;">
      If the button above does not work, copy and paste this link into your browser:<br />
      <a href="${bookingUrl}" style="color: #2563eb; word-break: break-all;">${bookingUrl}</a>
    </p>

    <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">
      Thank you for using PATHWAY.ECO. We look forward to supporting a productive mentoring experience.
    </p>
  `;

  const text = `Your mentorship session is confirmed

Dear ${greetingName},

Your mentorship session has been successfully booked on PATHWAY.ECO.

SESSION DETAILS
- Mentor: ${params.mentorName}
- Student: ${params.studentName}
- Service: ${params.serviceTitle}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Timezone: ${safeTimezone}
- Duration: ${formattedDuration}

You can review the complete booking details using the link below:
${bookingUrl}

Thank you for using PATHWAY.ECO. We look forward to supporting a productive mentoring experience.

Best regards,

PATHWAY.ECO Team
Empowering careers. Connecting possibilities.

This is an automated transactional notification. Please do not reply directly to this message.`;

  return {
    subject,
    html: renderEmailShell(subject, htmlBody),
    text,
  };
}

/**
 * Renders the New Booking email sent to the Mentor.
 */
export function renderBookingConfirmedMentorEmail(params: BookingConfirmedEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const safeTimezone = resolveSafeTimezone(params.timezone);
  const formattedDate = formatBookingDate(params.scheduledStart, safeTimezone);
  const formattedTime = formatBookingTimeRange(params.scheduledStart, params.scheduledEnd, safeTimezone);
  const formattedDuration = formatBookingDuration(params.duration);

  const greetingName = extractRecipientGreeting(params.mentorName);
  const subject = `PATHWAY.ECO | New Mentorship Booking — ${params.studentName}`;

  const bookingUrl =
    params.bookingUrl && params.bookingUrl.trim().length > 0
      ? params.bookingUrl.trim()
      : `${resolveMentorPortalUrl()}/mentorship/bookings/${params.bookingId}`;

  const htmlBody = `
    <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3; letter-spacing: -0.3px;">
      New mentorship booking confirmed
    </h1>

    <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0; line-height: 1.6;">
      Dear ${escapeHtml(greetingName)},
    </p>

    <p style="font-size: 14px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
      A new mentorship session has been successfully booked on PATHWAY.ECO.
    </p>

    <div style="margin: 0 0 28px 0; padding: 22px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
      <div style="font-size: 12px; font-weight: 800; color: #475569; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.6px;">
        SESSION DETAILS
      </div>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 130px;">Mentor:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${escapeHtml(params.mentorName)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Student:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${escapeHtml(params.studentName)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Service:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${escapeHtml(params.serviceTitle)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Date:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${escapeHtml(formattedDate)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Time:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${escapeHtml(formattedTime)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Timezone:</td>
          <td style="padding: 6px 0; font-weight: 500; color: #334155;">${escapeHtml(safeTimezone)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Duration:</td>
          <td style="padding: 6px 0; font-weight: 500; color: #334155;">${escapeHtml(formattedDuration)}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
      You can review the complete booking details using the button below.
    </p>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                <a href="${bookingUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 34px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; line-height: 1;">
                  Review Booking
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0; text-align: center;">
      If the button above does not work, copy and paste this link into your browser:<br />
      <a href="${bookingUrl}" style="color: #2563eb; word-break: break-all;">${bookingUrl}</a>
    </p>

    <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">
      Thank you for using PATHWAY.ECO. We look forward to supporting a productive mentoring experience.
    </p>
  `;

  const text = `New mentorship booking confirmed

Dear ${greetingName},

A new mentorship session has been booked on PATHWAY.ECO.

SESSION DETAILS
- Mentor: ${params.mentorName}
- Student: ${params.studentName}
- Service: ${params.serviceTitle}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Timezone: ${safeTimezone}
- Duration: ${formattedDuration}

You can review the complete booking details using the link below:
${bookingUrl}

Thank you for using PATHWAY.ECO. We look forward to supporting a productive mentoring experience.

Best regards,

PATHWAY.ECO Team
Empowering careers. Connecting possibilities.

This is an automated transactional notification. Please do not reply directly to this message.`;

  return {
    subject,
    html: renderEmailShell(subject, htmlBody),
    text,
  };
}
