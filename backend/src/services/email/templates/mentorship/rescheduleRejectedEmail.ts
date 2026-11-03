import { resolveAppUrl } from '../urlHelper';
import {
  escapeHtml,
  formatBookingDate,
  formatBookingTimeRange,
  formatBookingDuration,
  extractRecipientGreeting,
  resolveSafeTimezone,
} from './dateTimeHelper';

export interface RescheduleRejectedEmailParams {
  bookingId: string;
  studentName: string;
  studentEmail: string;
  mentorName: string;
  mentorEmail: string;
  serviceTitle: string;
  originalStart: Date | string;
  originalEnd: Date | string;
  duration?: number | null;
  reason?: string | null;
  timezone?: string | null;
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
 * Renders the Reschedule Request Declined email sent to the Student.
 */
export function renderRescheduleRejectedStudentEmail(params: RescheduleRejectedEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const safeTimezone = resolveSafeTimezone(params.timezone);
  const formattedDate = formatBookingDate(params.originalStart, safeTimezone);
  const formattedTime = formatBookingTimeRange(params.originalStart, params.originalEnd, safeTimezone);
  const formattedDuration = formatBookingDuration(params.duration);

  const greetingName = extractRecipientGreeting(params.studentName);
  const subject = `PATHWAY.ECO | Reschedule Request Declined — ${params.mentorName}`;

  const bookingUrl =
    params.bookingUrl && params.bookingUrl.trim().length > 0
      ? params.bookingUrl.trim()
      : `${resolveAppUrl()}/mentors/bookings/${params.bookingId}`;

  const safeReason = params.reason && params.reason.trim().length > 0
    ? escapeHtml(params.reason.trim())
    : 'No additional notes provided.';

  const htmlBody = `
    <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3; letter-spacing: -0.3px;">
      Your reschedule request was declined
    </h1>

    <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0; line-height: 1.6;">
      Dear ${escapeHtml(greetingName)},
    </p>

    <p style="font-size: 14px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
      <strong>${escapeHtml(params.mentorName)}</strong> was unable to accommodate your request to reschedule your mentorship session for <strong>${escapeHtml(params.serviceTitle)}</strong>.
    </p>

    <div style="margin: 0 0 24px 0; padding: 22px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
      <div style="font-size: 12px; font-weight: 800; color: #475569; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.6px;">
        CONFIRMED SESSION DETAILS (UNCHANGED)
      </div>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 130px;">Mentor:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${escapeHtml(params.mentorName)}</td>
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

    <div style="margin: 0 0 24px 0; padding: 18px 20px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
      <div style="font-size: 12px; font-weight: 800; color: #64748b; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
        FEEDBACK FROM MENTOR
      </div>
      <p style="font-size: 14px; color: #334155; margin: 0; line-height: 1.5; font-style: italic;">
        ${safeReason}
      </p>
    </div>

    <p style="font-size: 14px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
      Your original confirmed schedule remains in effect. Please plan to attend at the originally scheduled time, or review your options using the link below.
    </p>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                <a href="${bookingUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 34px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; line-height: 1;">
                  View Booking Details
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
      Thank you for using PATHWAY.ECO.
    </p>
  `;

  const text = `Your reschedule request was declined

Dear ${greetingName},

${params.mentorName} was unable to accommodate your request to reschedule your mentorship session for ${params.serviceTitle}.

CONFIRMED SESSION DETAILS (UNCHANGED):
- Mentor: ${params.mentorName}
- Service: ${params.serviceTitle}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Timezone: ${safeTimezone}
- Duration: ${formattedDuration}

FEEDBACK FROM MENTOR:
${params.reason || 'No additional notes provided.'}

Your original confirmed schedule remains in effect. Please plan to attend at the originally scheduled time.

You can review your booking details using the link below:
${bookingUrl}

Thank you for using PATHWAY.ECO.

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
