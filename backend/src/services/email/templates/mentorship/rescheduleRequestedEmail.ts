import { resolveMentorPortalUrl } from '../urlHelper';
import {
  escapeHtml,
  formatBookingDate,
  formatBookingTimeRange,
  extractRecipientGreeting,
  resolveSafeTimezone,
} from './dateTimeHelper';

export interface RescheduleRequestedEmailParams {
  bookingId: string;
  mentorName: string;
  mentorEmail: string;
  studentName: string;
  studentEmail: string;
  serviceTitle: string;
  originalStart: Date | string;
  originalEnd: Date | string;
  proposedStart: Date | string;
  proposedEnd: Date | string;
  studentNotes?: string | null;
  timezone?: string | null;
  reviewUrl?: string;
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
 * Renders the Reschedule Request email dispatched to the Mentor.
 */
export function renderRescheduleRequestedMentorEmail(params: RescheduleRequestedEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const safeTimezone = resolveSafeTimezone(params.timezone);
  const origDate = formatBookingDate(params.originalStart, safeTimezone);
  const origTime = formatBookingTimeRange(params.originalStart, params.originalEnd, safeTimezone);
  const propDate = formatBookingDate(params.proposedStart, safeTimezone);
  const propTime = formatBookingTimeRange(params.proposedStart, params.proposedEnd, safeTimezone);

  const greetingName = extractRecipientGreeting(params.mentorName);
  const subject = `PATHWAY.ECO | Reschedule Request — ${params.studentName}`;

  const reviewUrl =
    params.reviewUrl && params.reviewUrl.trim().length > 0
      ? params.reviewUrl.trim()
      : `${resolveMentorPortalUrl()}/mentorship/bookings/${params.bookingId}`;

  const safeNotes = params.studentNotes && params.studentNotes.trim().length > 0
    ? escapeHtml(params.studentNotes.trim())
    : 'No additional note was provided.';

  const htmlBody = `
    <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3; letter-spacing: -0.3px;">
      A student has requested a schedule change
    </h1>

    <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0; line-height: 1.6;">
      Dear ${escapeHtml(greetingName)},
    </p>

    <p style="font-size: 14px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
      <strong>${escapeHtml(params.studentName)}</strong> has requested a change to their upcoming mentorship session for <strong>${escapeHtml(params.serviceTitle)}</strong>.
    </p>

    <div style="margin: 0 0 20px 0; padding: 18px 20px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
      <div style="font-size: 12px; font-weight: 800; color: #64748b; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
        CURRENTLY CONFIRMED
      </div>
      <p style="font-size: 14px; color: #0f172a; font-weight: 600; margin: 0 0 4px 0;">
        ${escapeHtml(origDate)}
      </p>
      <p style="font-size: 13px; color: #475569; margin: 0;">
        ${escapeHtml(origTime)} (${escapeHtml(safeTimezone)})
      </p>
    </div>

    <div style="margin: 0 0 20px 0; padding: 18px 20px; background-color: #eff6ff; border-radius: 10px; border: 1px solid #bfdbfe;">
      <div style="font-size: 12px; font-weight: 800; color: #1e40af; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
        PROPOSED REPLACEMENT
      </div>
      <p style="font-size: 14px; color: #0f172a; font-weight: 700; margin: 0 0 4px 0;">
        ${escapeHtml(propDate)}
      </p>
      <p style="font-size: 13px; color: #1e40af; margin: 0; font-weight: 600;">
        ${escapeHtml(propTime)} (${escapeHtml(safeTimezone)})
      </p>
    </div>

    <div style="margin: 0 0 24px 0; padding: 16px 20px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
      <div style="font-size: 12px; font-weight: 800; color: #64748b; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
        STUDENT&apos;S NOTE
      </div>
      <p style="font-size: 13px; color: #334155; margin: 0; line-height: 1.5; font-style: italic;">
        ${safeNotes}
      </p>
    </div>

    <div style="margin: 0 0 24px 0; padding: 14px 18px; background-color: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="font-size: 13px; color: #b45309; font-weight: 600; margin: 0 0 4px 0;">
        This request is pending your approval.
      </p>
      <p style="font-size: 13px; color: #92400e; margin: 0;">
        The proposed time is not yet confirmed. Please review the request and take the appropriate action using the link below.
      </p>
    </div>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                <a href="${reviewUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 34px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; line-height: 1;">
                  Review Reschedule Request
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0; text-align: center;">
      If the button above does not work, copy and paste this link into your browser:<br />
      <a href="${reviewUrl}" style="color: #2563eb; word-break: break-all;">${reviewUrl}</a>
    </p>

    <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">
      Thank you for your timely attention.
    </p>
  `;

  const text = `A student has requested a schedule change

Dear ${greetingName},

${params.studentName} has requested a change to their upcoming mentorship session for ${params.serviceTitle}.

CURRENTLY CONFIRMED:
${origDate} at ${origTime} (${safeTimezone})

PROPOSED REPLACEMENT:
${propDate} at ${propTime} (${safeTimezone})

STUDENT'S NOTE:
${params.studentNotes || 'No additional note was provided.'}

This request is pending your approval. The proposed time is not yet confirmed.

Please review the request and take the appropriate action using the link below:
${reviewUrl}

Thank you for your timely attention.

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
